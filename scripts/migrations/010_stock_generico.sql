-- Stock de los productos genéricos.
--
-- Un genérico no es de ningún cliente, así que no tenía dónde guardar su
-- stock: no aparecía en la pantalla de Stock ni se podía editar. Peor, si
-- alguien lo pedía, la base le creaba una fila al cliente que pidió y ese
-- quedaba en negativo mientras el pozo real de TuPack nunca bajaba.
--
-- Acá el stock de un genérico pasa a ser UNO SOLO, de TuPack, en products.
-- Los productos asignados a un cliente siguen igual, en business_products.
--
-- Aplicar con: bash scripts/migrar.sh 010_stock_generico.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_general INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_minimo_general INTEGER;

COMMENT ON COLUMN products.stock_general IS
  'Stock de TuPack para un producto genérico. Los asignados usan business_products.';
COMMENT ON COLUMN products.stock_minimo_general IS
  'Mínimo del genérico: por debajo entra en la alerta diaria.';

-- Un movimiento del pozo general no es de ningún negocio.
ALTER TABLE stock_movements ALTER COLUMN business_id DROP NOT NULL;

COMMENT ON COLUMN stock_movements.business_id IS
  'Negocio dueño del stock. NULL = pozo general de un producto genérico.';

-- Ajuste a mano del stock general, equivalente a tupack_ajustar_stock.
CREATE OR REPLACE FUNCTION tupack_ajustar_stock_general(
  p_product_id INTEGER, p_nuevo_stock INTEGER, p_detalle TEXT
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE v_anterior INTEGER;
BEGIN
  SELECT stock_general INTO v_anterior FROM products
   WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El producto % no existe', p_product_id;
  END IF;

  UPDATE products SET stock_general = p_nuevo_stock WHERE id = p_product_id;

  INSERT INTO stock_movements (business_id, product_id, delta, stock_result, motivo, detalle)
  VALUES (NULL, p_product_id, p_nuevo_stock - v_anterior, p_nuevo_stock, 'ajuste', p_detalle);

  RETURN p_nuevo_stock;
END;
$$;

-- Al mover el stock de una orden, un genérico descuenta del pozo general y no
-- de una fila del cliente. El resto queda exactamente como estaba.
CREATE OR REPLACE FUNCTION tupack_mover_stock_orden(
  p_order_id INTEGER, p_business_id INTEGER, p_items JSONB, p_signo INTEGER, p_motivo TEXT
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  fila RECORD;
  v_delta INTEGER;
  v_stock INTEGER;
  v_generico BOOLEAN;
BEGIN
  IF p_business_id IS NULL THEN RETURN; END IF;

  FOR fila IN SELECT * FROM tupack_items_orden(p_items) LOOP
    -- Idempotente: la misma orden no descuenta ni repone dos veces.
    IF EXISTS (
      SELECT 1 FROM stock_movements
       WHERE order_id = p_order_id AND product_id = fila.product_id AND motivo = p_motivo
    ) THEN CONTINUE; END IF;

    v_delta := p_signo * fila.cantidad;
    SELECT generico INTO v_generico FROM products WHERE id = fila.product_id;

    IF v_generico THEN
      UPDATE products SET stock_general = stock_general + v_delta
       WHERE id = fila.product_id
      RETURNING stock_general INTO v_stock;

      INSERT INTO stock_movements (business_id, product_id, order_id, delta, stock_result, motivo)
      VALUES (NULL, fila.product_id, p_order_id, v_delta, v_stock, p_motivo);
    ELSE
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
    END IF;
  END LOOP;
END;
$$;

-- Al cambiar los items de una orden se revierte lo viejo antes de aplicar lo
-- nuevo. Esa reversión iba siempre contra business_products, así que con un
-- genérico (business_id NULL) no encontraba la fila y el pozo general quedaba
-- descontado de más.
CREATE OR REPLACE FUNCTION tupack_orden_items() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE fila RECORD;
BEGIN
  IF NEW.items IS NOT DISTINCT FROM OLD.items THEN RETURN NULL; END IF;
  IF NEW.status = 'cancelado' THEN RETURN NULL; END IF;

  FOR fila IN
    SELECT business_id, product_id, delta
      FROM stock_movements
     WHERE order_id = NEW.id AND motivo = 'orden'
  LOOP
    IF fila.business_id IS NULL THEN
      UPDATE products SET stock_general = stock_general - fila.delta
       WHERE id = fila.product_id;
    ELSE
      UPDATE business_products
         SET stock = stock - fila.delta, updated_at = NOW()
       WHERE business_id = fila.business_id AND product_id = fila.product_id;
    END IF;
  END LOOP;

  DELETE FROM stock_movements WHERE order_id = NEW.id AND motivo = 'orden';

  PERFORM tupack_mover_stock_orden(
    NEW.id, tupack_stock_owner(NEW.business_id), NEW.items, -1, 'orden');
  RETURN NULL;
END;
$$;
