import { conAuth, idDe } from "@/lib/api";
import { consultar, unaFila } from "@/lib/db";
import { notificarPedidoCancelado } from "@/lib/pedidos";

export const POST = conAuth(async (_request, ctx: { params: Promise<{ id: string }> }) => {
  const ordenId = await idDe(ctx);

  const orden = await unaFila<{ status: string; eliminada: boolean }>(
    "SELECT status, eliminada FROM orders WHERE id = $1",
    [ordenId],
  );
  if (!orden) throw new Error("La orden no existe.");
  if (orden.eliminada) throw new Error("La orden ya fue eliminada.");
  if (orden.status === "cancelado") throw new Error("La orden ya está cancelada.");

  await consultar(
    "UPDATE orders SET status = 'cancelado', updated_at = NOW() WHERE id = $1",
    [ordenId],
  );

  notificarPedidoCancelado(ordenId);
  return { id: ordenId, estado: "cancelado" };
});
