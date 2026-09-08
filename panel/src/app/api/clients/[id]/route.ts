import { conAuth, exigirPropiedad, idDe } from "@/lib/api";
import { unaFila } from "@/lib/db";

export const GET = conAuth(async (request, ctx: { params: Promise<{ id: string }> }) => {
  await exigirPropiedad(request, { clientId: await idDe(ctx) });
  return unaFila(
    `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal, c.codigo_cliente,
            c.razon_social, c.rut, c.direccion_facturacion, c.direccion_entrega, c.horario_entrega
       FROM clients c JOIN businesses b ON b.id = c.business_id
      WHERE c.id = $1`,
    [await idDe(ctx)]
  );
});
