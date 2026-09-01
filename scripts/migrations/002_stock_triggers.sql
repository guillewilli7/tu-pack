-- ============================================================================
-- Consumo de stock: la orden descuenta al crearse y repone si se cancela.
--
-- Vive en la base a propósito: así descuenta tanto si la orden entra por el
-- panel/API como si el agente hace el INSERT directo contra Postgres.
--
-- Falta de stock NO frena la orden: el stock queda en negativo y el panel lo
-- muestra en rojo (decisión del negocio: nunca perder un pedido).
--
--   psql "$TUPACK_DATABASE_URL" -f scripts/migrations/002_stock_triggers.sql
-- ============================================================================

BEGIN;

-- Normaliza los ítems de una orden a (product_id, cantidad) ------------------
-- Acepta el ítem con product_id, o con codigo_prod, o solo con el nombre.
CREATE OR REPLACE FUNCTION tupack_items_orden(p_items JSONB)
RETURNS TABLE (product_id INTEGER, cantidad INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
  item JSONB;
  v_pid INTEGER;
  v_cant NUMERIC;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) NOT IN ('array', 'object') THEN
    RETURN;
  END IF;

  FOR item IN
    SELECT CASE WHEN jsonb_typeof(p_items) = 'array'
                THEN value
                ELSE value END
    FROM (
      SELECT value FROM jsonb_array_elements(CASE WHEN jsonb_typeof(p_items) = 'array'
                                                  THEN p_items ELSE '[]'::jsonb END)
      UNION ALL
      SELECT value FROM jsonb_each(CASE WHEN jsonb_typeof(p_items) = 'object'
                                        THEN p_items ELSE '{}'::jsonb END)
    ) AS elementos
  LOOP
    v_cant := NULLIF(COALESCE(item->>'cantidad', item->>'qty', item->>'quantity'), '')::NUMERIC;
    IF v_cant IS NULL OR v_cant <= 0 THEN CONTINUE; END IF;

    v_pid := NULLIF(item->>'product_id', '')::INTEGER;

    IF v_pid IS NULL AND NULLIF(item->>'codigo_prod', '') IS NOT NULL THEN
      SELECT p.id INTO v_pid FROM products p
       WHERE p.codigo_prod = item->>'codigo_prod' LIMIT 1;
    END IF;

    IF v_pid IS NULL AND NULLIF(item->>'nombre', '') IS NOT NULL THEN
      SELECT p.id INTO v_pid FROM products p
       WHERE LOWER(TRIM(p.nombre)) = LOWER(TRIM(item->>'nombre')) LIMIT 1;
    END IF;

    IF v_pid IS NULL THEN CONTINUE; END IF;   -- ítem suelto: no mueve stock

    product_id := v_pid;
    cantidad   := CEIL(v_cant)::INTEGER;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Aplica el movimiento de una orden: signo -1 descuenta, +1 repone ------------
CREATE OR REPLACE FUNCTION tupack_mover_stock_orden(
  p_order_id INTEGER, p_business_id INTEGER, p_items JSONB,
  p_signo INTEGER, p_motivo TEXT
) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  fila RECORD;
  v_delta INTEGER;
  v_stock INTEGER;
BEGIN
  IF p_business_id IS NULL THEN RETURN; END IF;

  FOR fila IN SELECT * FROM tupack_items_orden(p_items) LOOP
    -- Idempotente: la misma orden no descuenta ni repone dos veces.
    IF EXISTS (
      SELECT 1 FROM stock_movements
       WHERE order_id = p_order_id AND product_id = fila.product_id AND motivo = p_motivo
    ) THEN CONTINUE; END IF;

    v_delta := p_signo * fila.cantidad;

    -- Si el producto no estaba asignado al negocio, se crea la fila para que
    -- el faltante quede a la vista en vez de perderse.
    INSERT INTO business_products (business_id, product_id, stock, notas)
    VALUES (p_business_id, fila.product_id, 0, 'Alta automática por una orden')
    ON CONFLICT (business_id, product_id) DO NOTHING;

    UPDATE business_products
       SET stock = stock + v_delta, updated_at = NOW()
     WHERE business_id = p_business_id AND product_id = fila.product_id
    RETURNING stock INTO v_stock;

    INSERT INTO stock_movements (business_id, product_id, order_id, delta, stock_result, motivo)
    VALUES (p_business_id, fila.product_id, p_order_id, v_delta, v_stock, p_motivo);
  END LOOP;
END;
$$;

-- Trigger: alta de orden ------------------------------------------------------
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
    PERFORM tupack_mover_stock_orden(NEW.id, v_business, NEW.items, -1, 'orden');
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS orders_stock_insert ON orders;
CREATE TRIGGER orders_stock_insert
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION tupack_orden_insert();

-- Trigger: cambio de estado ---------------------------------------------------
CREATE OR REPLACE FUNCTION tupack_orden_update() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'cancelado' AND OLD.status IS DISTINCT FROM 'cancelado' THEN
    PERFORM tupack_mover_stock_orden(NEW.id, NEW.business_id, NEW.items, 1, 'reposicion');

  ELSIF OLD.status = 'cancelado' AND NEW.status IS DISTINCT FROM 'cancelado' THEN
    -- Se reabrió: se borra la reposición para poder volver a descontar.
    DELETE FROM stock_movements WHERE order_id = NEW.id AND motivo = 'reposicion';
    DELETE FROM stock_movements WHERE order_id = NEW.id AND motivo = 'orden';
    PERFORM tupack_mover_stock_orden(NEW.id, NEW.business_id, NEW.items, -1, 'orden');
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS orders_stock_update ON orders;
CREATE TRIGGER orders_stock_update
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION tupack_orden_update();

-- Ajuste manual desde el panel ------------------------------------------------
CREATE OR REPLACE FUNCTION tupack_ajustar_stock(
  p_business_id INTEGER, p_product_id INTEGER, p_nuevo_stock INTEGER, p_detalle TEXT
) RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE v_anterior INTEGER;
BEGIN
  SELECT stock INTO v_anterior FROM business_products
   WHERE business_id = p_business_id AND product_id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El producto % no está asignado al negocio %', p_product_id, p_business_id;
  END IF;

  UPDATE business_products SET stock = p_nuevo_stock, updated_at = NOW()
   WHERE business_id = p_business_id AND product_id = p_product_id;

  INSERT INTO stock_movements (business_id, product_id, delta, stock_result, motivo, detalle)
  VALUES (p_business_id, p_product_id, p_nuevo_stock - v_anterior, p_nuevo_stock, 'ajuste', p_detalle);

  RETURN p_nuevo_stock;
END;
$$;

COMMIT;
