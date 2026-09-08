import { conAuth, ErrorHttp, exigirPropiedad, telefonoDe } from "@/lib/api";
import { consultar, unaFila } from "@/lib/db";

/**
 * Alta de orden por API: la usa el agente de WhatsApp. Se guarda tal cual
 * viene (la base resuelve los ítems por product_id, código o nombre) y se
 * devuelve cómo quedó el stock, para que el agente pueda avisar faltantes.
 */
export const POST = conAuth(async (request) => {
  const b = (await request.json()) as {
    client_id?: number; business_id?: number; negocio?: string; phone?: string;
    status?: string; items?: unknown; total?: number | string; notas?: string;
  };

  // Nadie carga un pedido a nombre de otro: si escribe un WhatsApp, la
  // sucursal tiene que ser suya.
  if (b.client_id) await exigirPropiedad(request, { clientId: Number(b.client_id) });
  else if (b.business_id) await exigirPropiedad(request, { businessId: Number(b.business_id) });
  else if (telefonoDe(request)) throw new ErrorHttp(403, "Falta la sucursal del pedido.");

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

  const stock = await consultar<{ nombre: string; delta: number; stock_result: number }>(
    `SELECT p.nombre, sm.delta, sm.stock_result
       FROM stock_movements sm JOIN products p ON p.id = sm.product_id
      WHERE sm.order_id = $1 ORDER BY sm.id`,
    [creada!.id]
  );

  return { id: creada!.id, stock, faltantes: stock.filter((m) => m.stock_result < 0) };
});
