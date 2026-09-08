import { conAuth } from "@/lib/api";
import { consultar } from "@/lib/db";

/**
 * Lo que ve el agente de WhatsApp. El stock es del depósito, no del pedido:
 * el agente no lo recibe, así no puede contárselo al cliente ni decidir con
 * él. Si falta algo, la orden entra igual y lo resuelve el equipo.
 */
export const GET = conAuth(async (_request, ctx: { params: Promise<{ clientId: string }> }) =>
  consultar(
    `SELECT bp.product_id, bp.precio, p.nombre, p.codigo_prod, p.unidad
       FROM clients c
       JOIN business_products bp ON bp.business_id = tupack_stock_owner(c.business_id)
       JOIN products p ON p.id = bp.product_id
      WHERE c.id = $1 AND bp.activo AND p.activo
      ORDER BY p.nombre`,
    [Number((await ctx.params).clientId)]
  )
);
