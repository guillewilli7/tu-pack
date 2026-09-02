#!/bin/bash
# Aplica las migraciones de TuPack contra la base indicada, en orden y con
# backup previo. Al final imprime los conteos para verificar la carga.
#
#   TUPACK_DATABASE_URL=postgres://... bash scripts/migrar.sh
#
# Si la variable no está en el entorno, se lee del archivo que se le pase por
# TUPACK_ENV_FILE. Es DESTRUCTIVO: 001 borra clientes, productos y órdenes.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "${TUPACK_DATABASE_URL:-}" ] && [ -n "${TUPACK_ENV_FILE:-}" ] && [ -f "$TUPACK_ENV_FILE" ]; then
  set -a; . "$TUPACK_ENV_FILE"; set +a
fi
if [ -z "${TUPACK_DATABASE_URL:-}" ]; then
  echo "Falta TUPACK_DATABASE_URL (o TUPACK_ENV_FILE apuntando a un archivo que la defina)." >&2
  exit 1
fi

# Modo solo lectura: `bash scripts/migrar.sh verificar` no toca nada.
if [ "${1:-}" = "verificar" ]; then
  psql "$TUPACK_DATABASE_URL" -c "
  SELECT (SELECT count(*) FROM businesses)        AS negocios,
         (SELECT count(*) FROM clients)           AS sucursales,
         (SELECT count(*) FROM products)          AS productos,
         (SELECT count(*) FROM business_products) AS precio_stock,
         (SELECT count(*) FROM orders)            AS ordenes;"
  psql "$TUPACK_DATABASE_URL" -c "
  SELECT tgname AS trigger, tgrelid::regclass AS tabla, tgenabled AS estado
    FROM pg_trigger WHERE NOT tgisinternal ORDER BY tgname;"
  psql "$TUPACK_DATABASE_URL" -c "
  SELECT proname AS funcion FROM pg_proc
   WHERE proname LIKE 'tupack%' ORDER BY proname;"
  exit 0
fi

# Una sola migración: `bash scripts/migrar.sh 004_estado_cuenta.sql`.
# Útil para las que agregan cosas sin borrar nada.
if [[ "${1:-}" == *.sql ]]; then
  ARCHIVO="$REPO/scripts/migrations/$1"
  [ -f "$ARCHIVO" ] || { echo "No existe $ARCHIVO" >&2; exit 1; }
  mkdir -p "$REPO/backups"
  BACKUP="$REPO/backups/backup-$(date +%Y%m%d-%H%M%S).sql"
  pg_dump "$TUPACK_DATABASE_URL" > "$BACKUP"
  echo "Backup: $BACKUP"
  psql -q -v ON_ERROR_STOP=1 "$TUPACK_DATABASE_URL" -f "$ARCHIVO" 2>&1 | grep -v '^NOTICE' || true
  echo "Aplicada: $1"
  exit 0
fi

echo "== Backup =="
mkdir -p "$REPO/backups"
BACKUP="$REPO/backups/backup-$(date +%Y%m%d-%H%M%S).sql"
pg_dump "$TUPACK_DATABASE_URL" > "$BACKUP"
echo "   $BACKUP ($(du -h "$BACKUP" | cut -f1))"

echo
echo "== Migraciones =="
for f in "$REPO"/scripts/migrations/00*.sql; do
  echo "-- $(basename "$f")"
  psql -q -v ON_ERROR_STOP=1 "$TUPACK_DATABASE_URL" -f "$f" 2>&1 | grep -v '^NOTICE' || true
done

echo
echo "== Verificación =="
psql "$TUPACK_DATABASE_URL" -c "
SELECT (SELECT count(*) FROM businesses)        AS negocios,
       (SELECT count(*) FROM clients)           AS sucursales,
       (SELECT count(*) FROM products)          AS productos,
       (SELECT count(*) FROM business_products) AS precio_stock,
       (SELECT count(*) FROM orders)            AS ordenes,
       (SELECT count(*) FROM users)             AS usuarios;"
