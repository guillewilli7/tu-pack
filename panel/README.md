# Panel de TuPack (Next 16)

Reemplazo del panel viejo de Express + EJS (`artifacts/api-server`). Misma base
de datos y los mismos triggers: el stock y la cuenta corriente los mantiene
Postgres, acá solo se lee y se carga.

## Correr local

```bash
npm install
cp .env.example .env.local   # y completar
npm run dev                  # http://localhost:3000
```

Variables:

- `TUPACK_DATABASE_URL` — la base de TuPack.
- `SESSION_SECRET` — firma la cookie de sesión (cualquier cadena larga).
- `TUPACK_API_KEY` — la clave que usa el agente de WhatsApp contra `/api/*`.

## Estructura

- `src/app/(panel)` — pantallas: órdenes, clientes, productos, stock, cuentas.
- `src/app/api` — la misma API que consume el agente de n8n (acepta sesión o `x-api-key`).
- `src/acciones` — server actions (todo lo que escribe).
- `src/lib` — base, sesión, consultas y formateo.
- `src/componentes` — UI.

## Deploy

Imagen Docker con el `Dockerfile` de esta carpeta (build `output: standalone`).
