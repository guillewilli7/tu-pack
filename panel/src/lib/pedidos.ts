import "server-only";
import { unaFila } from "./db";

export type CuerpoOrden = {
  client_id?: number; business_id?: number; negocio?: string; phone?: string;
  status?: string; items?: unknown; total?: number | string; notas?: string;
};

const WEBHOOK_PEDIDO = "https://personal-n8n.zampow.easypanel.host/webhook/tupack-mail-pedido";

export async function notificarPedidoNuevo(orderId: number) {
  try {
    await fetch(WEBHOOK_PEDIDO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
  } catch { /* el mail no frena el pedido */ }
}

export async function notificarPedidoCancelado(orderId: number) {
  try {
    await fetch(WEBHOOK_PEDIDO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, evento: "cancelado" }),
    });
  } catch { /* el mail no frena la cancelación */ }
}

export async function notificarPedidoModificado(orderId: number) {
  try {
    await fetch(WEBHOOK_PEDIDO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, evento: "modificado" }),
    });
  } catch { /* el mail no frena la modificación */ }
}

/** Inserta la orden. El stock y el cargo en cuenta los aplica la base. */
export async function altaDeOrden(b: CuerpoOrden): Promise<number> {
  let negocioId = b.business_id ?? null;
  if (!negocioId && b.client_id) {
    const fila = await unaFila<{ business_id: number }>(
      "SELECT business_id FROM clients WHERE id = $1", [b.client_id]
    );
    negocioId = fila?.business_id ?? null;
  }
  if (!negocioId && b.negocio) {
    const fila = await unaFila<{ id: number }>(
      "SELECT id FROM businesses WHERE nombre ILIKE $1", [b.negocio]
    );
    negocioId = fila?.id ?? null;
  }

  const creada = await unaFila<{ id: number }>(
    `INSERT INTO orders (business_id, client_id, negocio, phone, status, items, total, raw_data)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8::jsonb) RETURNING id`,
    [negocioId, b.client_id ?? null, b.negocio ?? null, b.phone ?? "",
     b.status || "pendiente", JSON.stringify(b.items ?? []),
     parseFloat(String(b.total)) || 0, b.notas ? JSON.stringify({ notas: b.notas }) : null]
  );
  const id = creada!.id;
  notificarPedidoNuevo(id);
  return id;
}
