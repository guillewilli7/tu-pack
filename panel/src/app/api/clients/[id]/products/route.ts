import { conAuth, exigirPropiedad, idDe } from "@/lib/api";
import { catalogoDeSucursal } from "@/lib/consultas";

export const GET = conAuth(async (request, ctx: { params: Promise<{ id: string }> }) => {
  const id = await idDe(ctx);
  await exigirPropiedad(request, { clientId: id });
  const filas = await catalogoDeSucursal(id);
  // precio_cliente se mantiene por compatibilidad con el agente de WhatsApp.
  return filas.map((f) => ({ ...f, precio_cliente: f.precio }));
});
