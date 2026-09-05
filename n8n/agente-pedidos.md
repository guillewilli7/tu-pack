# Agente de pedidos por WhatsApp

Reemplaza el flujo `TuPack - WhatsApp Bot v1`, que era una máquina de estados
(router por estado, cuatro agentes encadenados, confirmación paso a paso) y
que además nunca llegó a funcionar: las URLs de Evolution API quedaron con los
placeholders literales `EVOLUTION_API_URL` / `EVOLUTION_INSTANCE`.

La forma nueva es la del agente de locadores de ATIS: **un solo agente con
herramientas**, que decide qué consultar y cuándo tiene todo para cerrar.

## Herramientas

| Herramienta | Endpoint del panel | Para qué |
|---|---|---|
| `buscar_cliente` | `GET /api/clients?search=` | Encontrar la sucursal por como la nombra el cliente |
| `productos_del_cliente` | `GET /api/clients/:id/products` | Qué compra ese cliente, a qué precio y con cuánto stock |
| `ultimo_pedido` | `GET /api/clients/:id/ultimo-pedido` | Resolver "mandame lo de siempre" |
| `estado_de_cuenta` | `GET /api/businesses/:id/cuenta` | Responder "cuánto debo" |
| `crear_pedido` | `POST /api/orders` | Cerrar el pedido |

La API se autentica con el header `x-api-key` (variable `TUPACK_API_KEY` del
servicio en EasyPanel).

## Datos que necesita un pedido

Son los mismos que pedía el flujo viejo:

- **Sucursal** (`client_id`): de ahí salen el negocio, el precio y el stock.
- **Productos con cantidad**: el agente los resuelve contra el catálogo del
  cliente; si el nombre no coincide, pregunta en vez de inventar.
- **Confirmación explícita** antes de crear la orden.
- Opcionales: notas, horario de entrega.

El total lo calcula el agente con el precio de cada producto y lo manda en
`total`; el descuento de stock y el cargo en la cuenta corriente los hace sola
la base (triggers), así que el agente no tiene que preocuparse por eso.

## Lo que queda por configurar

1. **Credencial de Kapso para la línea de TuPack** (header `X-API-Key` de
   api.kapso.ai). El workflow la referencia como `TuPack Kapso`.
2. **Credencial del panel**: header `x-api-key` con el valor de `TUPACK_API_KEY`.
3. Apuntar el webhook de la línea de WhatsApp a la URL del workflow.

## Estado

Creado en n8n (instancia general) como **TuPack - Agente de Pedidos**:
`rCn6IAUPRouUx1K7` — https://personal-n8n.zampow.easypanel.host/workflow/rCn6IAUPRouUx1K7

Queda **inactivo** a propósito hasta que estén las dos credenciales. El bot v1
sigue en su lugar, también inactivo (su respaldo está en `respaldo-bot-v1.json`).

Webhook: `POST https://personal-n8n.zampow.easypanel.host/webhook/tupack-pedidos`
