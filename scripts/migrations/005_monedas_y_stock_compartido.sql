-- ============================================================================
-- 1. La cuenta corriente pasa a llevar pesos y dólares por separado.
-- 2. Un negocio puede consumir el stock de otro (locales de una misma marca
--    que comparten el mismo depósito de packaging).
--
--   psql "$TUPACK_DATABASE_URL" -f scripts/migrations/005_monedas_y_stock_compartido.sql
-- ============================================================================

BEGIN;

-- ── Monedas ─────────────────────────────────────────────────────────────────
ALTER TABLE account_movements
  ADD COLUMN IF NOT EXISTS moneda TEXT NOT NULL DEFAULT 'UYU';
ALTER TABLE account_movements
  DROP CONSTRAINT IF EXISTS account_movements_moneda_check;
ALTER TABLE account_movements
  ADD CONSTRAINT account_movements_moneda_check CHECK (moneda IN ('UYU', 'USD'));

-- El saldo ahora se pide por moneda. Se mantiene la firma vieja (solo pesos)
-- para no romper lo que ya la usa.
CREATE OR REPLACE FUNCTION tupack_saldo(p_business_id INTEGER, p_moneda TEXT)
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(monto), 0)::NUMERIC(12,2)
    FROM account_movements
   WHERE business_id = p_business_id AND moneda = p_moneda;
$$;

CREATE OR REPLACE FUNCTION tupack_saldo(p_business_id INTEGER)
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
  SELECT tupack_saldo(p_business_id, 'UYU');
$$;

-- Las órdenes se facturan en pesos.
CREATE OR REPLACE FUNCTION tupack_cargo_orden() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_business INTEGER;
  v_detalle  TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM account_movements WHERE order_id = OLD.id;
    RETURN NULL;
  END IF;

  v_business := NEW.business_id;
  IF v_business IS NULL AND NEW.client_id IS NOT NULL THEN
    SELECT business_id INTO v_business FROM clients WHERE id = NEW.client_id;
  END IF;

  IF v_business IS NULL OR NEW.status = 'cancelado' OR COALESCE(NEW.total, 0) = 0 THEN
    DELETE FROM account_movements WHERE order_id = NEW.id;
    RETURN NULL;
  END IF;

  SELECT 'Orden #' || NEW.id || COALESCE(' — ' || NULLIF(c.sucursal, ''), '')
    INTO v_detalle
    FROM (SELECT NEW.client_id AS id) o
    LEFT JOIN clients c ON c.id = o.id;

  INSERT INTO account_movements
      (business_id, order_id, fecha, tipo, descripcion, monto, moneda, creado_por)
  VALUES (v_business, NEW.id, NEW.created_at::DATE, 'orden',
          COALESCE(v_detalle, 'Orden #' || NEW.id), NEW.total, 'UYU', 'automático')
  ON CONFLICT (order_id) WHERE order_id IS NOT NULL DO UPDATE
     SET monto = EXCLUDED.monto,
         business_id = EXCLUDED.business_id,
         descripcion = EXCLUDED.descripcion;
  RETURN NULL;
END;
$$;

-- ── Stock compartido ────────────────────────────────────────────────────────
-- stock_owner_id apunta al negocio dueño del depósito. Por defecto es uno
-- mismo; varios locales de una marca apuntan al mismo dueño y así comparten
-- el pozo de packaging, aunque cada uno lleve su cuenta corriente aparte.
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS stock_owner_id INTEGER REFERENCES businesses(id);
UPDATE businesses SET stock_owner_id = id WHERE stock_owner_id IS NULL;

CREATE OR REPLACE FUNCTION tupack_stock_owner(p_business_id INTEGER)
RETURNS INTEGER
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(stock_owner_id, id) FROM businesses WHERE id = p_business_id;
$$;

-- El descuento de una orden va contra el dueño del stock, no contra quien la pidió.
CREATE OR REPLACE FUNCTION tupack_orden_insert() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE v_business INTEGER;
BEGIN
  v_business := NEW.business_id;
  IF v_business IS NULL AND NEW.client_id IS NOT NULL THEN
    SELECT business_id INTO v_business FROM clients WHERE id = NEW.client_id;
    UPDATE orders SET business_id = v_business WHERE id = NEW.id;
  END IF;

  IF NEW.status IS DISTINCT FROM 'cancelado' THEN
    PERFORM tupack_mover_stock_orden(NEW.id, tupack_stock_owner(v_business), NEW.items, -1, 'orden');
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION tupack_orden_update() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE v_owner INTEGER;
BEGIN
  v_owner := tupack_stock_owner(NEW.business_id);
  IF NEW.status = 'cancelado' AND OLD.status IS DISTINCT FROM 'cancelado' THEN
    PERFORM tupack_mover_stock_orden(NEW.id, v_owner, NEW.items, 1, 'reposicion');
  ELSIF OLD.status = 'cancelado' AND NEW.status IS DISTINCT FROM 'cancelado' THEN
    DELETE FROM stock_movements WHERE order_id = NEW.id;
    PERFORM tupack_mover_stock_orden(NEW.id, v_owner, NEW.items, -1, 'orden');
  END IF;
  RETURN NULL;
END;
$$;

COMMIT;
