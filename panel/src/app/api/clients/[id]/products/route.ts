import { conAuth, idDe } from "@/lib/api";
import { catalogoDeSucursal } from "@/lib/consultas";

export const GET = conAuth(async (_request, ctx: { params: Promise<{ id: string }> }) => {
  const filas = await catalogoDeSucursal(await idDe(ctx));
  // precio_cliente se mantiene por compatibilidad con el agente de WhatsApp.
  return filas.map((f) => ({ ...f, precio_cliente: f.precio }));
});
