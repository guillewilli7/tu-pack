#!/bin/bash
# Deploy del panel. EasyPanel construye la imagen desde este repo (rama main)
# con el Dockerfile de la raíz, así que deployar es: pushear y avisarle.
#
#   bash scripts/deploy.sh
#
# El aviso se puede automatizar con el "Deployment Trigger" del servicio
# (Deployments → Deployment Trigger). Si guardás esa URL en TUPACK_DEPLOY_HOOK,
# el script la llama solo; si no, hay que apretar Deploy en el panel.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
URL="${TUPACK_URL:-https://personal-tupack-app.zampow.easypanel.host}"

echo "== Subiendo main =="
git -C "$REPO" push origin main

if [ -n "${TUPACK_DEPLOY_HOOK:-}" ]; then
  echo "== Disparando el deploy =="
  curl -fsS "$TUPACK_DEPLOY_HOOK" >/dev/null && echo "   pedido enviado"
  echo "== Esperando a que levante =="
  for _ in $(seq 1 60); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$URL/login")" = "200" ]; then
      echo "   $URL responde"
      exit 0
    fi
    sleep 5
  done
  echo "   sigue sin responder: revisá los logs en EasyPanel" >&2
  exit 1
else
  echo
  echo "Falta apretar Deploy en EasyPanel:"
  echo "  https://panel.ninetysix.cloud/projects/personal/app/tupack-app"
fi
