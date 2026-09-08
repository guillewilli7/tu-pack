import { conAuth, idDe } from "@/lib/api";
import { unaFila } from "@/lib/db";

/** "Lo de siempre": el último pedido vivo de esa sucursal. */
export const GET = conAuth(async (_request, ctx: { params: Promise<{ id: string }> }) => {
  const orden = await unaFila(
    `SELECT id, created_at, status, total, items FROM orders
      WHERE client_id = $1 AND status <> 'cancelado' AND NOT eliminada
      ORDER BY created_at DESC LIMIT 1`,
    [await idDe(ctx)]
  );
  return orden ? { hay_pedido: true, ...orden } : { hay_pedido: false };
});
