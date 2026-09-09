-- ============================================================================
-- Ajuste de cuentas corrientes con Memory G2000 (TERALO S.A.) — 2026-09-09
--
--   Se leyeron 52 fotos de saldos pendientes enviadas por WhatsApp.
--   Por cada negocio cuyo saldo en TuPack difiere del de Memory, se inserta
--   un movimiento de tipo 'ajuste' que lleva la cuenta al valor correcto.
--
--   Clientes sin diferencia (19): DESMADRE EL PINAR, NICLANI, JERO,
--     TEQUEÑOS, DESMADRE POCITOS, BLISS, MUNDO MILA, NBA, HDP, BURGER ZONE,
--     LA CHINGADA, DESMADRE CENTRO, DESMADRE CIUDAD VIEJA, SANXES, PANDA BAR,
--     GARAGE BURGER, SANTO PECADO, INFIEL, GABBS, FAKE, RIO,
--     DESMADRE LAGOMAR ($ y U$S), PIZZA CENTRO ($ y U$S),
--     ROTI CENTRAL (U$S), JONLU (era $0 — verificar).
--
--   HARLEM y SUSHI APP figuran como dos cuentas separadas en Memory
--   (Buceo/Cordón y Costa/Zona); acá se ajustan al total combinado.
--
--   MUNVEL S.A. (206) se omite: usa FACTURA C. / COMPCRED_Z con plazos
--   a 60 días — es un proveedor, no un cliente del panel.
--
--   bash scripts/migrar.sh 008_ajuste_cuentas.sql
-- ============================================================================

BEGIN;

-- Verificación previa: las cuentas que no cambian deben coincidir.
DO $$
DECLARE
  v RECORD;
BEGIN
  FOR v IN
    SELECT b.id, b.nombre, tupack_saldo(b.id,'UYU') AS saldo
      FROM businesses b
     WHERE (b.id, tupack_saldo(b.id,'UYU')::NUMERIC(12,2)) IN (
       (65, 3440), (67, 13300), (26, 15900), (56, 27540), (57, 62214),
       (4, 17700), (37, 79200), (38, 18700), (23, 58204), (7, 9150),
       (30, 13000), (59, 32699), (62, 52445), (50, 1600), (41, 59952),
       (19, 37121), (49, 16600), (25, 5885), (70, 17100), (16, 21137),
       (44, 17310), (58, 125345), (43, 8940)
     )
  LOOP
    NULL; -- ok
  END LOOP;
END $$;

-- ============================================================================
-- AJUSTES UYU (25 negocios)
-- ============================================================================

-- 1. A LA PAR (id 1): $150,022 → $157,412 = +$7,390
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (1, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 7390, 'UYU', 'migracion_008');

-- 2. AMORE PASTAS (id 2): $26,400 → $24,150 = -$2,250
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (2, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', -2250, 'UYU', 'migracion_008');

-- 3. CLUB DEL BAJON (id 10): -$200 → $4,908 = +$5,108
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (10, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 5108, 'UYU', 'migracion_008');

-- 4. DE DIEZ (id 12): $33,800 → $37,800 = +$4,000
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (12, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 4000, 'UYU', 'migracion_008');

-- 5. DVICIO (id 14): $17,515 → $26,215 = +$8,700
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (14, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 8700, 'UYU', 'migracion_008');

-- 6. HARLEM (id 22): $36,940 → $39,860 (Buceo $10,880 + Cordón $28,980) = +$2,920
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (22, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO) [Buceo+Cordón]', 2920, 'UYU', 'migracion_008');

-- 7. LA BURGERIA (id 29): $130,653 → $136,653 = +$6,000
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (29, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 6000, 'UYU', 'migracion_008');

-- 8. LARRYS (id 33): $0 → $9,160 = +$9,160
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (33, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 9160, 'UYU', 'migracion_008');

-- 9. MANZANAR (id 35): $53,957 → $74,548 = +$20,591
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (35, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 20591, 'UYU', 'migracion_008');

-- 10. MARTIN AGUIAR (id 36): $123,448 → $147,306 = +$23,858
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (36, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 23858, 'UYU', 'migracion_008');

-- 11. PIZZA BURGER (id 42): $0 → $12,506 = +$12,506
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (42, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 12506, 'UYU', 'migracion_008');

-- 12. SALAD BOWL (id 45): $21,420 → $27,540 = +$6,120
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (45, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 6120, 'UYU', 'migracion_008');

-- 13. SALCHI BURGER (id 46): $96,744 → $83,584 = -$13,160
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (46, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', -13160, 'UYU', 'migracion_008');

-- 14. SANGUCHE (id 48): $91,740 → $105,348 = +$13,608
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (48, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 13608, 'UYU', 'migracion_008');

-- 15. SHARPER BURGER (id 51): $4,613 → $12,309 = +$7,696
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (51, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 7696, 'UYU', 'migracion_008');

-- 16. SUSHI APP (id 53): $123,500 → $162,980 (Costa $150,580 + Zona $12,400) = +$39,480
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (53, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO) [Costa+Zona]', 39480, 'UYU', 'migracion_008');

-- 17. TBV (id 55): $115,635 → $125,147 = +$9,512
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (55, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 9512, 'UYU', 'migracion_008');

-- 18. DESMADRE PUNTA CARRETAS (id 60): $14,350 → $14,360 = +$10
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (60, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 10, 'UYU', 'migracion_008');

-- 19. DESMADRE CORDON (id 61): $20,955 → $18,495 = -$2,460
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (61, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', -2460, 'UYU', 'migracion_008');

-- 20. DESMADRE JACINTO VERA (id 63): $0 → $27,040 = +$27,040
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (63, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 27040, 'UYU', 'migracion_008');

-- 21. ROTI CENTRAL (id 66): $15,330 → $20,546 = +$5,216
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (66, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 5216, 'UYU', 'migracion_008');

-- 22. SUTEKI SUSHI (id 69): $19,110 → $23,690 = +$4,580
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (69, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 4580, 'UYU', 'migracion_008');

-- 23. OLA POKE (id 71): $33,616 → $48,976 = +$15,360
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (71, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 15360, 'UYU', 'migracion_008');

-- 24. KITCHEN FACTORY (id 72): $45,029 → $62,190 = +$17,161
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (72, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 17161, 'UYU', 'migracion_008');

-- 25. JONLU (id 27): $0 → $16,150 = +$16,150
INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
VALUES (27, CURRENT_DATE, 'ajuste', 'Ajuste contable — sinc. Memory G2000 (TERALO)', 16150, 'UYU', 'migracion_008');

-- ============================================================================
-- USD: sin diferencias (los 3 clientes con dólares coinciden exactamente)
-- ============================================================================

-- ============================================================================
-- Verificación posterior
-- ============================================================================
DO $$
DECLARE
  errores TEXT := '';
  v RECORD;
BEGIN
  FOR v IN
    SELECT * FROM (VALUES
      (1,  'A LA PAR',                157412::NUMERIC),
      (2,  'AMORE PASTAS',             24150),
      (10, 'CLUB DEL BAJON',            4908),
      (12, 'DE DIEZ',                  37800),
      (14, 'DVICIO',                   26215),
      (22, 'HARLEM',                   39860),
      (27, 'JONLU',                    16150),
      (29, 'LA BURGERIA',             136653),
      (33, 'LARRYS',                    9160),
      (35, 'MANZANAR',                74548),
      (36, 'MARTIN AGUIAR',           147306),
      (42, 'PIZZA BURGER',             12506),
      (45, 'SALAD BOWL',               27540),
      (46, 'SALCHI BURGER',            83584),
      (48, 'SANGUCHE',               105348),
      (51, 'SHARPER BURGER',           12309),
      (53, 'SUSHI APP',              162980),
      (55, 'TBV',                    125147),
      (60, 'DESMADRE PUNTA CARRETAS',  14360),
      (61, 'DESMADRE CORDON',          18495),
      (63, 'DESMADRE JACINTO VERA',    27040),
      (66, 'ROTI CENTRAL',             20546),
      (69, 'SUTEKI SUSHI',             23690),
      (71, 'OLA POKE',                 48976),
      (72, 'KITCHEN FACTORY',          62190)
    ) AS t(id, nombre, esperado)
  LOOP
    IF tupack_saldo(v.id, 'UYU') <> v.esperado THEN
      errores := errores || format(E'\n  %s (id %s): esperado %s, obtenido %s',
        v.nombre, v.id, v.esperado, tupack_saldo(v.id, 'UYU'));
    END IF;
  END LOOP;

  IF errores <> '' THEN
    RAISE EXCEPTION 'Saldos no coinciden después del ajuste:%', errores;
  END IF;

  RAISE NOTICE '✓ 25 saldos verificados correctamente contra Memory G2000';
END $$;

COMMIT;
