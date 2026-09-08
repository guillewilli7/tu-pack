import { conAuth } from "@/lib/api";
import { altaDeOrden, type CuerpoOrden } from "@/lib/pedidos";

/** Alta de pedido para el agente: confirma el número de orden y nada más. */
export const POST = conAuth(async (request) => {
  const id = await altaDeOrden((await request.json()) as CuerpoOrden);
  return { id, estado: "pendiente" };
});
