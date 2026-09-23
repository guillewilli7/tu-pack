import { conAuth } from "@/lib/api";
import { consultar } from "@/lib/db";

/**
 * Lo que ve el agente de WhatsApp: los productos del cliente más los genéricos,
 * que cualquiera puede pedir sin tenerlos asignados. El stock es del depósito,
 * no del pedido: el agente no lo recibe, así no puede contárselo al cliente ni
 * decidir con él. Si falta algo, la orden entra igual y lo resuelve el equipo.
 *
 * Si el cliente tiene precio propio para un genérico, ese manda sobre el de lista.
 */
export const GET = conAuth(async (_request, ctx: { params: Promise<{ clientId: string }> }) =>
  consultar(
    `SELECT p.id AS product_id,
            COALESCE(bp.precio, p.precio_lista) AS precio,
            p.nombre, p.codigo_prod, p.unidad
       FROM clients c
       CROSS JOIN products p
       LEFT JOIN business_products bp
              ON bp.product_id = p.id
             AND bp.business_id = tupack_stock_owner(c.business_id)
             AND bp.activo
      WHERE c.id = $1
        AND p.activo
        AND (bp.id IS NOT NULL OR p.generico)
      ORDER BY p.nombre`,
    [Number((await ctx.params).clientId)]
  )
);
