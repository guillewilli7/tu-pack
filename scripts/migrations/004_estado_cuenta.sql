-- ============================================================================
-- Estado de cuenta por cliente (negocio).
--
-- Un único libro de movimientos: cada orden deja su cargo automático y a mano
-- se registran pagos, notas de crédito y ajustes. El saldo es la suma de todo.
--
-- Signo: POSITIVO = el cliente debe (cargo). NEGATIVO = baja la deuda (pago).
-- Saldo positivo = nos debe. Saldo negativo = tiene saldo a favor.
--
--   psql "$TUPACK_DATABASE_URL" -f scripts/migrations/004_estado_cuenta.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS account_movements (
  id           SERIAL PRIMARY KEY,
  business_id  INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_id     INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo         TEXT NOT NULL DEFAULT 'ajuste',   -- orden · pago · cargo · ajuste
  descripcion  TEXT NOT NULL,
  monto        NUMERIC(12,2) NOT NULL,
  creado_por   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS account_movements_business_idx
  ON account_movements (business_id, fecha DESC, id DESC);
-- Una orden aporta un solo cargo, siempre sincronizado con su total.
CREATE UNIQUE INDEX IF NOT EXISTS account_movements_orden_unico
  ON account_movements (order_id) WHERE order_id IS NOT NULL;

-- Saldo de un negocio -------------------------------------------------------
CREATE OR REPLACE FUNCTION tupack_saldo(p_business_id INTEGER)
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(monto), 0)::NUMERIC(12,2)
    FROM account_movements WHERE business_id = p_business_id;
$$;

-- La orden mantiene su cargo al día -----------------------------------------
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

  -- Una orden cancelada no debe nada: se le saca el cargo.
  IF v_business IS NULL OR NEW.status = 'cancelado' OR COALESCE(NEW.total, 0) = 0 THEN
    DELETE FROM account_movements WHERE order_id = NEW.id;
    RETURN NULL;
  END IF;

  SELECT 'Orden #' || NEW.id ||
         COALESCE(' — ' || NULLIF(c.sucursal, ''), '')
    INTO v_detalle
    FROM (SELECT NEW.client_id AS id) o
    LEFT JOIN clients c ON c.id = o.id;

  INSERT INTO account_movements (business_id, order_id, fecha, tipo, descripcion, monto, creado_por)
  VALUES (v_business, NEW.id, NEW.created_at::DATE, 'orden',
          COALESCE(v_detalle, 'Orden #' || NEW.id), NEW.total, 'automático')
  ON CONFLICT (order_id) WHERE order_id IS NOT NULL DO UPDATE
     SET monto = EXCLUDED.monto,
         business_id = EXCLUDED.business_id,
         descripcion = EXCLUDED.descripcion;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS orders_cuenta_insert ON orders;
CREATE TRIGGER orders_cuenta_insert
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION tupack_cargo_orden();

DROP TRIGGER IF EXISTS orders_cuenta_update ON orders;
CREATE TRIGGER orders_cuenta_update
AFTER UPDATE OF status, total, business_id, client_id ON orders
FOR EACH ROW EXECUTE FUNCTION tupack_cargo_orden();

DROP TRIGGER IF EXISTS orders_cuenta_delete ON orders;
CREATE TRIGGER orders_cuenta_delete
AFTER DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION tupack_cargo_orden();

-- Las órdenes que ya existían también entran al libro ------------------------
INSERT INTO account_movements (business_id, order_id, fecha, tipo, descripcion, monto, creado_por)
SELECT COALESCE(o.business_id, c.business_id), o.id, o.created_at::DATE, 'orden',
       'Orden #' || o.id, o.total, 'automático'
  FROM orders o LEFT JOIN clients c ON c.id = o.client_id
 WHERE o.status <> 'cancelado' AND COALESCE(o.total, 0) <> 0
   AND COALESCE(o.business_id, c.business_id) IS NOT NULL
ON CONFLICT (order_id) WHERE order_id IS NOT NULL DO NOTHING;

COMMIT;
