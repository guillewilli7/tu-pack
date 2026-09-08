-- ============================================================================
-- Ajuste con el Excel "FINAL base de conocimiento Agente TuPack" (2026-09-08).
--
--   · Seis productos cambiaron de nombre en el Excel: se renombran (no se
--     crean de nuevo) para no perder precio, stock ni historial.
--   · El stock queda como dice el Excel. Cada corrección pasa por
--     tupack_ajustar_stock, así deja su movimiento y se puede auditar.
--   · Los precios no cambiaron: el Excel coincide con lo cargado.
--   · Alertas: avisar por debajo de 1000 unidades, salvo las bolsas 23x33,
--     que avisan por debajo de 2000.
--
--   bash scripts/migrar.sh 007_ajuste_excel.sql
-- ============================================================================

BEGIN;

-- Los nombres se comparan sin acentos, en mayúsculas y con los espacios
-- colapsados: así "TEQUEÑOS" o "Vaso de café" matchean igual que en el Excel.
CREATE OR REPLACE FUNCTION tupack_clave(t TEXT) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(translate(upper(trim(t)), 'ÁÉÍÓÚÜÑ', 'AEIOUUN'), '\s+', ' ', 'g');
$$;

-- 1. Productos que cambiaron de nombre ---------------------------------------
UPDATE products SET nombre = 'PAPEL ANTIGRASA AMARILLO LA BURGUERIA' WHERE tupack_clave(nombre) = tupack_clave('PAPEL ANTIGRASA LA BURGUERIA');
UPDATE products SET nombre = 'PAPEL ANTIGRASA ROJO LA BURGUERIA' WHERE tupack_clave(nombre) = tupack_clave('PAPEL ANTIGRASA ROJO');
UPDATE products SET nombre = 'POTE BOWL GRANDE 1300 ML 300 GR MANZANAR' WHERE tupack_clave(nombre) = tupack_clave('BOWL，1300ML 300G，MANZANAR');
UPDATE products SET nombre = 'POTE BOWL MEDIANO 1100 ML 300 GR MANZANAR' WHERE tupack_clave(nombre) = tupack_clave('BOWL，1100ML 300G，MANZANAR');
UPDATE products SET nombre = 'POTE BOWL CHICO 750 ML 280 GR MANZANAR' WHERE tupack_clave(nombre) = tupack_clave('BOWL，750ML 280G，MANZANAR');
UPDATE products SET nombre = 'BOLSA TERMICA VIOLETA DE DELIVERY HDP' WHERE tupack_clave(nombre) = tupack_clave('BOLSA TERMICA DE DELIVERY HDP');

-- 2. Stock según el Excel -----------------------------------------------------
SELECT tupack_ajustar_stock(b.id, p.id, 3500, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'AMORE PASTAS' AND tupack_clave(p.nombre) = 'BOLSA 28X28 AMORE PASTAS'
   AND bp.stock <> 3500;
SELECT tupack_ajustar_stock(b.id, p.id, 6300, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'DESMADRE' AND tupack_clave(p.nombre) = 'BOLSA 23X33 (GRANDE DELIVERY) DESMADRE'
   AND bp.stock <> 6300;
SELECT tupack_ajustar_stock(b.id, p.id, 26804, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'DESMADRE' AND tupack_clave(p.nombre) = 'BOLSA DE BIZCOCHO (MEDIANA) DESMADRE'
   AND bp.stock <> 26804;
SELECT tupack_ajustar_stock(b.id, p.id, 8050, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'DESMADRE' AND tupack_clave(p.nombre) = 'VASO DE CAFE 12 OZ DESMADRE'
   AND bp.stock <> 8050;
SELECT tupack_ajustar_stock(b.id, p.id, 450, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'DESMADRE' AND tupack_clave(p.nombre) = 'VASO DE CAFE 8 OZ DESMADRE'
   AND bp.stock <> 450;
SELECT tupack_ajustar_stock(b.id, p.id, 32500, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'HDP' AND tupack_clave(p.nombre) = 'BOLSA TERMICA VIOLETA DE DELIVERY HDP'
   AND bp.stock <> 32500;
SELECT tupack_ajustar_stock(b.id, p.id, 5000, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'JONLU' AND tupack_clave(p.nombre) = 'BOLSA DE BIZCOCHO'
   AND bp.stock <> 5000;
SELECT tupack_ajustar_stock(b.id, p.id, 4100, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'LA BURGERIA' AND tupack_clave(p.nombre) = 'BOLSA RAVIOLERA (GRANDES)'
   AND bp.stock <> 4100;
SELECT tupack_ajustar_stock(b.id, p.id, 10000, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'LA BURGERIA' AND tupack_clave(p.nombre) = 'PAPEL ANTIGRASA AMARILLO LA BURGUERIA'
   AND bp.stock <> 10000;
SELECT tupack_ajustar_stock(b.id, p.id, 3500, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'LA BURGERIA' AND tupack_clave(p.nombre) = 'PAPEL ANTIGRASA ROJO LA BURGUERIA'
   AND bp.stock <> 3500;
SELECT tupack_ajustar_stock(b.id, p.id, 1000, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'LARRYS' AND tupack_clave(p.nombre) = 'CAJA DE MILANESA LARRYS'
   AND bp.stock <> 1000;
SELECT tupack_ajustar_stock(b.id, p.id, 9088, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'MANZANAR' AND tupack_clave(p.nombre) = 'BOLSA DE BIZCOCHO'
   AND bp.stock <> 9088;
SELECT tupack_ajustar_stock(b.id, p.id, 2600, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'MANZANAR' AND tupack_clave(p.nombre) = 'CAJA DE PIZZA MANZANAR'
   AND bp.stock <> 2600;
SELECT tupack_ajustar_stock(b.id, p.id, 210, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'MANZANAR' AND tupack_clave(p.nombre) = 'CAJA DE TORTA MANZANAR'
   AND bp.stock <> 210;
SELECT tupack_ajustar_stock(b.id, p.id, 6000, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'MANZANAR' AND tupack_clave(p.nombre) = 'PAPEL ANTIGRASA'
   AND bp.stock <> 6000;
SELECT tupack_ajustar_stock(b.id, p.id, 7200, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'MANZANAR' AND tupack_clave(p.nombre) = 'POTE BOWL CHICO 750 ML 280 GR MANZANAR'
   AND bp.stock <> 7200;
SELECT tupack_ajustar_stock(b.id, p.id, 7800, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'MANZANAR' AND tupack_clave(p.nombre) = 'POTE BOWL GRANDE 1300 ML 300 GR MANZANAR'
   AND bp.stock <> 7800;
SELECT tupack_ajustar_stock(b.id, p.id, 9000, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'MANZANAR' AND tupack_clave(p.nombre) = 'POTE BOWL MEDIANO 1100 ML 300 GR MANZANAR'
   AND bp.stock <> 9000;
SELECT tupack_ajustar_stock(b.id, p.id, 10572, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'PIZZA BURGER' AND tupack_clave(p.nombre) = 'BOLSA DE BIZCOCHO'
   AND bp.stock <> 10572;
SELECT tupack_ajustar_stock(b.id, p.id, 7200, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'SANGUCHE' AND tupack_clave(p.nombre) = 'CAJA DE PAPAS 1/4 AMARILLAS SANGUCHE'
   AND bp.stock <> 7200;
SELECT tupack_ajustar_stock(b.id, p.id, 2000, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'SANGUCHE' AND tupack_clave(p.nombre) = 'PAPEL ANTIGRASA 40X30 SANGUCHE'
   AND bp.stock <> 2000;
SELECT tupack_ajustar_stock(b.id, p.id, 5000, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'SUSHI APP' AND tupack_clave(p.nombre) = 'ESTUCHE 15 PIEZAS SUSHI APP'
   AND bp.stock <> 5000;
SELECT tupack_ajustar_stock(b.id, p.id, 6000, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'TEQUENOS' AND tupack_clave(p.nombre) = 'ESTUCHE 14X12 TEQUENOS'
   AND bp.stock <> 6000;
SELECT tupack_ajustar_stock(b.id, p.id, 5400, 'Ajuste con el Excel del 08/09/2026')
  FROM businesses b
  JOIN business_products bp ON bp.business_id = b.id
  JOIN products p ON p.id = bp.product_id
 WHERE tupack_clave(b.nombre) = 'TEQUENOS' AND tupack_clave(p.nombre) = 'ESTUCHE 18X22 TEQUENOS'
   AND bp.stock <> 5400;

-- 3. Alertas de stock ---------------------------------------------------------
-- Regla de TuPack: avisar cuando queden menos de 1000 unidades. Las bolsas
-- 23x33 son las que más rotan, así que avisan antes, por debajo de 2000.
UPDATE business_products bp
   SET stock_minimo = 1000, updated_at = NOW()
  FROM products p
 WHERE p.id = bp.product_id AND bp.activo AND p.activo;

UPDATE business_products bp
   SET stock_minimo = 2000, updated_at = NOW()
  FROM products p
 WHERE p.id = bp.product_id AND bp.activo AND p.activo
   AND (p.nombre ILIKE '%23x33%' OR p.nombre ILIKE '%23 x 33%');

COMMIT;
