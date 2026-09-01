#!/bin/bash
# Deploy del panel al VPS (EasyPanel, Docker Swarm). No hay auto-deploy por push:
# esto arma el tarball del HEAD, lo compila en el servidor y actualiza el servicio.
#
#   bash scripts/deploy.sh
#
# Variables (con estos valores por defecto):
#   VPS=root@173.212.192.54
#   IMAGEN=easypanel/personal/tupack-app:latest
#   SERVICIO=personal_tupack-app
set -euo pipefail

VPS="${VPS:-root@173.212.192.54}"
IMAGEN="${IMAGEN:-easypanel/personal/tupack-app:latest}"
SERVICIO="${SERVICIO:-personal_tupack-app}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Empaquetando HEAD =="
git -C "$REPO" archive --format=tar.gz HEAD -o /tmp/tupack.tar.gz
scp -q /tmp/tupack.tar.gz "$VPS:/tmp/tupack.tar.gz"

echo "== Build en el servidor =="
ssh "$VPS" "rm -rf /tmp/tupack-build && mkdir -p /tmp/tupack-build \
  && tar xzf /tmp/tupack.tar.gz -C /tmp/tupack-build \
  && cd /tmp/tupack-build && docker build -q -t '$IMAGEN' ."

echo "== Actualizando el servicio =="
if ssh "$VPS" "docker service inspect '$SERVICIO' >/dev/null 2>&1"; then
  ssh "$VPS" "docker service update --force --image '$IMAGEN' '$SERVICIO'" | tail -2
  echo "Listo."
else
  echo "El servicio '$SERVICIO' todavía no existe en EasyPanel."
  echo "Creá la app una vez desde la UI (imagen $IMAGEN, puerto 3000) y volvé a correr esto."
  exit 1
fi
