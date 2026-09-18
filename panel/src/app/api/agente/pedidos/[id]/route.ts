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
  const body = (await request.json()) as { items?: ItemAgente[]; notas?: string };

  const orden = await unaFila<{ status: string; eliminada: boolean; items: unknown; total: string }>(
    "SELECT status, eliminada, items, total FROM orders WHERE id = $1",
    [ordenId],
  );
  if (!orden) throw new Error("La orden no existe.");
  if (orden.eliminada) throw new Error("La orden fue eliminada.");
  if (orden.status === "cancelado") throw new Error("La orden está cancelada, no se puede modificar.");
  if (orden.status === "completada") throw new Error("La orden ya fue completada, no se puede modificar.");

  const notas = body.notas?.trim();
  const lineas = (body.items ?? [])
    .map((l) => ({
      product_id: Number(l.product_id),
      cantidad: Math.max(0, Math.round(Number(l.cantidad))),
      precio_unitario: Number(l.precio_unitario),
    }))
    .filter((l) => l.product_id && l.cantidad > 0);

  if (!lineas.length && !notas) {
    throw new Error("Nada para cambiar: mandá los items, la nota, o las dos cosas.");
  }

  // Cambiar solo la nota es un pedido legítimo ("agregar nota X"): en ese caso
  // los items quedan como están en vez de exigir que se reenvíen.
  let items = orden.items as unknown[];
  let total = Number(orden.total);

  if (lineas.length) {
    const productos = await consultar<{ id: number; nombre: string; codigo_prod: string | null }>(
      "SELECT id, nombre, codigo_prod FROM products WHERE id = ANY($1::int[])",
      [lineas.map((l) => l.product_id)],
    );
    const porId = new Map(productos.map((p) => [p.id, p]));
    if (lineas.some((l) => !porId.has(l.product_id)))
      throw new Error("Algún producto no existe.");

    const nuevos = lineas.map((l) => ({
      product_id: l.product_id,
      codigo_prod: porId.get(l.product_id)!.codigo_prod ?? "",
      nombre_catalogo: porId.get(l.product_id)!.nombre,
      cantidad: l.cantidad,
      precio_unitario: l.precio_unitario,
      subtotal: Math.round(l.cantidad * l.precio_unitario * 100) / 100,
    }));
    items = nuevos;
    total = nuevos.reduce((s, i) => s + i.subtotal, 0);

    await consultar(
      "UPDATE orders SET items = $1::jsonb, total = $2, updated_at = NOW() WHERE id = $3",
      [JSON.stringify(nuevos), total, ordenId],
    );
  }

  if (notas) {
    // Merge sobre raw_data para no pisar lo que haya guardado ahí.
    await consultar(
      `UPDATE orders
          SET raw_data = COALESCE(raw_data, '{}'::jsonb) || jsonb_build_object('notas', $1::text),
              updated_at = NOW()
        WHERE id = $2`,
      [notas, ordenId],
    );
  }

  notificarPedidoModificado(ordenId);
  return { id: ordenId, estado: orden.status, items, total, notas: notas ?? null };
});
