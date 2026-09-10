import { conAuth, idDe } from "@/lib/api";
import { consultar, unaFila } from "@/lib/db";
import { notificarPedidoModificado } from "@/lib/pedidos";

type ItemAgente = {
  product_id: number;
  cantidad: number;
  precio_unitario: number;
};

export const PUT = conAuth(async (request, ctx: { params: Promise<{ id: string }> }) => {
  const ordenId = await idDe(ctx);
  const body = (await request.json()) as { items: ItemAgente[]; notas?: string };

  const orden = await unaFila<{ status: string; eliminada: boolean }>(
    "SELECT status, eliminada FROM orders WHERE id = $1",
    [ordenId],
  );
  if (!orden) throw new Error("La orden no existe.");
  if (orden.eliminada) throw new Error("La orden fue eliminada.");
  if (orden.status === "cancelado") throw new Error("La orden está cancelada, no se puede modificar.");
  if (orden.status === "completada") throw new Error("La orden ya fue completada, no se puede modificar.");

  const lineas = (body.items ?? [])
    .map((l) => ({
      product_id: Number(l.product_id),
      cantidad: Math.max(0, Math.round(Number(l.cantidad))),
      precio_unitario: Number(l.precio_unitario),
    }))
    .filter((l) => l.product_id && l.cantidad > 0);

  if (!lineas.length) throw new Error("La orden necesita al menos un producto.");

  const productos = await consultar<{ id: number; nombre: string; codigo_prod: string | null }>(
    "SELECT id, nombre, codigo_prod FROM products WHERE id = ANY($1::int[])",
    [lineas.map((l) => l.product_id)],
  );
  const porId = new Map(productos.map((p) => [p.id, p]));
  if (lineas.some((l) => !porId.has(l.product_id)))
    throw new Error("Algún producto no existe.");

  const items = lineas.map((l) => ({
    product_id: l.product_id,
    codigo_prod: porId.get(l.product_id)!.codigo_prod ?? "",
    nombre_catalogo: porId.get(l.product_id)!.nombre,
    cantidad: l.cantidad,
    precio_unitario: l.precio_unitario,
    subtotal: Math.round(l.cantidad * l.precio_unitario * 100) / 100,
  }));
  const total = items.reduce((s, i) => s + i.subtotal, 0);

  await consultar(
    `UPDATE orders SET items = $1::jsonb, total = $2, updated_at = NOW() WHERE id = $3`,
    [JSON.stringify(items), total, ordenId],
  );

  notificarPedidoModificado(ordenId);
  return { id: ordenId, estado: orden.status, items, total };
});
