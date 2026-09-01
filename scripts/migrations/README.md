# Migraciones

Se aplican en orden, una sola vez, contra la base de TuPack.

| Archivo | Qué hace |
|---|---|
| `001_modelo_stock.sql` | **Destructivo.** Borra clientes, productos, precios y órdenes, y crea el modelo nuevo: `businesses` (el negocio, dueño del stock) → `clients` (sucursales, con facturación y entrega), `products`, `business_products` (precio + stock por negocio), `orders`, `stock_movements`. Las cuentas del panel (`users`) no se tocan. |
| `002_stock_triggers.sql` | El descuento de stock. La orden descuenta al crearse y repone si se cancela. Vive en la base para que aplique también cuando el agente inserta el pedido directo en Postgres. Falta de stock no frena la orden: queda en negativo y el panel lo marca. |
| `003_carga_excel.sql` | Carga inicial desde el Excel de base de conocimiento. Lo genera `scripts/generar-carga-excel.py`; volver a generarlo si el Excel cambia. |

## Cómo aplicarlas

```bash
# 1. Backup primero, siempre
pg_dump "$TUPACK_DATABASE_URL" > backup-$(date +%Y%m%d-%H%M).sql

# 2. Migraciones
for f in scripts/migrations/00*.sql; do
  psql -v ON_ERROR_STOP=1 "$TUPACK_DATABASE_URL" -f "$f"
done
```

## Regenerar la carga desde un Excel nuevo

```bash
python3 scripts/generar-carga-excel.py "ruta/al/archivo.xlsx" > scripts/migrations/003_carga_excel.sql
```

El script imprime en pantalla un resumen: cuántos negocios, sucursales y productos
salieron, cuántas filas quedaron sin precio y cuáles no se pudieron cargar.
