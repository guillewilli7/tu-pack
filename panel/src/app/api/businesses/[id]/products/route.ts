import { conAuth, idDe } from "@/lib/api";
import { consultar } from "@/lib/db";

export const GET = conAuth(async (_request, ctx: { params: Promise<{ id: string }> }) =>
  consultar(
    `SELECT bp.product_id, bp.precio, bp.stock, bp.stock_minimo, p.nombre, p.codigo_prod, p.unidad
       FROM business_products bp JOIN products p ON p.id = bp.product_id
      WHERE bp.business_id = tupack_stock_owner($1) AND bp.activo AND p.activo
      ORDER BY p.nombre`,
    [await idDe(ctx)]
  )
);
