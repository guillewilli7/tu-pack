-- Productos genéricos y código automático.
--
-- Hasta acá un producto solo se podía pedir si estaba asignado al cliente, así
-- que algo como el papel film había que cargarlo en las 90 sucursales una por
-- una. Un producto marcado como genérico lo puede pedir cualquiera.
--
-- El precio de un producto asignado sigue viviendo en business_products; el de
-- un genérico vive acá, en precio_lista. Si un cliente tiene su propio precio
-- para un genérico, ese manda.
--
-- Aplicar con: bash scripts/migrar.sh 009_productos_genericos.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS generico BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS precio_lista NUMERIC(12,4);

COMMENT ON COLUMN products.generico IS
  'Lo puede pedir cualquier cliente sin estar asignado; usa precio_lista.';
COMMENT ON COLUMN products.precio_lista IS
  'Precio del producto genérico. El precio propio del cliente, si existe, manda.';

-- Los códigos son P-NNNN y el alta los asigna sola tomando el mayor + 1.
-- Esta función es la única fuente de ese número, para que el panel muestre
-- exactamente el mismo que va a terminar guardando.
CREATE OR REPLACE FUNCTION tupack_siguiente_codigo_prod()
RETURNS TEXT LANGUAGE SQL STABLE AS $$
  SELECT 'P-' || LPAD(
    (COALESCE(MAX(SUBSTRING(codigo_prod FROM 3)::INT), 0) + 1)::TEXT, 4, '0')
    FROM products
   WHERE codigo_prod ~ '^P-[0-9]{4}$';
$$;
