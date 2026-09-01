-- ============================================================================
-- Modelo nuevo: negocio (dueño del stock) → sucursales (facturación y entrega)
--
-- DESTRUCTIVO: borra clientes, productos, precios, órdenes y sesiones.
-- Correr una sola vez, con backup hecho. Los usuarios del panel NO se tocan.
--
--   psql "$TUPACK_DATABASE_URL" -f scripts/migrations/001_modelo_stock.sql
-- ============================================================================

BEGIN;

-- 1. Fuera lo viejo (users queda intacto: son las cuentas del panel) -----------
DROP TABLE IF EXISTS client_products CASCADE;
DROP TABLE IF EXISTS client_phones   CASCADE;
DROP TABLE IF EXISTS orders          CASCADE;
DROP TABLE IF EXISTS clients         CASCADE;
DROP TABLE IF EXISTS products        CASCADE;
-- La tabla de sesiones del bot (si existe) se vacía: arrancamos de cero.
-- OJO: esto corta las conversaciones que el agente tenga a medio camino.
-- No se toca "session" (singular), que es la del panel: borrarla desloguea a todos.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name = 'sessions') THEN
    EXECUTE 'DELETE FROM sessions';
  END IF;
END $$;

-- 2. Negocio: la unidad comercial. El stock y los precios cuelgan de acá ------
CREATE TABLE businesses (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL UNIQUE,
  notas       TEXT,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Sucursal: dónde se entrega y cómo se factura ----------------------------
--    Un negocio sin sucursales tiene una sola fila con sucursal = NULL.
--    Dos sucursales del mismo negocio pueden repetir los datos de facturación.
CREATE TABLE clients (
  id                    SERIAL PRIMARY KEY,
  business_id           INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  codigo_cliente        TEXT,
  sucursal              TEXT,
  razon_social          TEXT,
  rut                   TEXT,
  direccion_facturacion TEXT,
  direccion_entrega     TEXT,
  horario_entrega       TEXT,
  -- Lo que vino del Excel tal cual, para no perder nada al normalizar:
  datos_facturacion     TEXT,
  info_cliente          TEXT,
  activo                BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX clients_business_idx ON clients (business_id);

CREATE TABLE client_phones (
  id          SERIAL PRIMARY KEY,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phone       TEXT NOT NULL,
  label       TEXT,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX client_phones_client_idx ON client_phones (client_id);

-- 4. Catálogo de productos ----------------------------------------------------
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  codigo_prod TEXT UNIQUE,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  unidad      TEXT NOT NULL DEFAULT 'unidad',
  costo       NUMERIC(12,4),
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Producto del negocio: precio y STOCK ------------------------------------
CREATE TABLE business_products (
  id            SERIAL PRIMARY KEY,
  business_id   INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  precio        NUMERIC(12,4),          -- NULL = precio a definir
  stock         INTEGER NOT NULL DEFAULT 0,
  stock_minimo  INTEGER,                -- avisa cuando el stock baja de acá
  notas         TEXT,
  activo        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, product_id)
);
CREATE INDEX business_products_business_idx ON business_products (business_id);

-- 6. Órdenes ------------------------------------------------------------------
--    items: [{ "product_id": 1, "codigo_prod": "P-100", "nombre": "...",
--              "cantidad": 10, "precio_unitario": 17, "subtotal": 170 }]
CREATE TABLE orders (
  id           SERIAL PRIMARY KEY,
  business_id  INTEGER REFERENCES businesses(id) ON DELETE SET NULL,
  client_id    INTEGER REFERENCES clients(id)    ON DELETE SET NULL,
  negocio      TEXT,
  phone        TEXT,
  status       TEXT NOT NULL DEFAULT 'pendiente',
  items        JSONB NOT NULL DEFAULT '[]'::jsonb,
  total        NUMERIC(12,2) NOT NULL DEFAULT 0,
  raw_data     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX orders_business_idx ON orders (business_id);
CREATE INDEX orders_created_idx  ON orders (created_at DESC);

-- 7. Movimientos de stock: toda variación deja rastro -------------------------
--    motivo: 'orden' (descuento) · 'reposicion' (cancelación) · 'ajuste' (panel)
CREATE TABLE stock_movements (
  id           SERIAL PRIMARY KEY,
  business_id  INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  order_id     INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  delta        INTEGER NOT NULL,        -- negativo descuenta, positivo repone
  stock_result INTEGER NOT NULL,        -- cómo quedó, para auditar
  motivo       TEXT NOT NULL,
  detalle      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX stock_movements_bp_idx    ON stock_movements (business_id, product_id);
CREATE INDEX stock_movements_order_idx ON stock_movements (order_id);
-- Idempotencia: una orden descuenta (y repone) una sola vez por producto.
CREATE UNIQUE INDEX stock_movements_orden_unico
  ON stock_movements (order_id, product_id, motivo)
  WHERE order_id IS NOT NULL;

COMMIT;
