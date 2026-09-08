-- ============================================================================
-- Borrado lógico y edición de órdenes.
--
-- Nada se borra de verdad: lo eliminado queda marcado y se puede restaurar.
--   · orders.eliminada           → la orden sale de las listas (y se cancela,
--                                  así devuelve el stock y no deja deuda).
--   · account_movements.anulado  → el movimiento no suma al saldo pero queda.
--   · business_products.activo   → el producto sale del catálogo del negocio.
--
-- Además: si se editan los ítems de una orden, el stock se recalcula solo.
--
--   psql "$TUPACK_DATABASE_URL" -f scripts/migrations/006_borrado_logico.sql
-- ============================================================================

BEGIN;

-- ── 1. Órdenes eliminadas ───────────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eliminada     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eliminada_at  TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eliminada_por TEXT;
CREATE INDEX IF NOT EXISTS orders_eliminada_idx ON orders (eliminada) WHERE eliminada;

-- ── 2. Movimientos de cuenta anulados ───────────────────────────────────────
ALTER TABLE account_movements ADD COLUMN IF NOT EXISTS anulado     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE account_movements ADD COLUMN IF NOT EXISTS anulado_at  TIMESTAMPTZ;
ALTER TABLE account_movements ADD COLUMN IF NOT EXISTS anulado_por TEXT;

-- El saldo deja de contar lo anulado.
CREATE OR REPLACE FUNCTION tupack_saldo(p_business_id INTEGER, p_moneda TEXT)
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(monto), 0)::NUMERIC(12,2)
    FROM account_movements
   WHERE business_id = p_business_id AND moneda = p_moneda AND NOT anulado;
$$;

-- ── 3. Editar los ítems de una orden recalcula el stock ─────────────────────
-- Se revierte exactamente lo que la orden había descontado (según sus propios
-- movimientos, no según los ítems viejos) y se vuelve a descontar con los
-- ítems nuevos. Una orden cancelada no toca nada: su neto ya es cero y al
-- reabrirla el trigger de estado rehace todo desde los ítems actuales.
CREATE OR REPLACE FUNCTION tupack_orden_items() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  fila RECORD;
BEGIN
  IF NEW.items IS NOT DISTINCT FROM OLD.items THEN RETURN NULL; END IF;
  IF NEW.status = 'cancelado' THEN RETURN NULL; END IF;

  FOR fila IN
    SELECT business_id, product_id, delta
      FROM stock_movements
     WHERE order_id = NEW.id AND motivo = 'orden'
  LOOP
    UPDATE business_products
       SET stock = stock - fila.delta, updated_at = NOW()
     WHERE business_id = fila.business_id AND product_id = fila.product_id;
  END LOOP;

  DELETE FROM stock_movements WHERE order_id = NEW.id AND motivo = 'orden';

  PERFORM tupack_mover_stock_orden(
    NEW.id, tupack_stock_owner(NEW.business_id), NEW.items, -1, 'orden');
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS orders_stock_items ON orders;
CREATE TRIGGER orders_stock_items
AFTER UPDATE OF items ON orders
FOR EACH ROW EXECUTE FUNCTION tupack_orden_items();

COMMIT;
