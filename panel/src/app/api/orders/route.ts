import { conAuth } from "@/lib/api";
import { consultar } from "@/lib/db";
import { altaDeOrden, type CuerpoOrden } from "@/lib/pedidos";

/**
 * Alta de orden por API. Se guarda tal cual viene (la base resuelve los ítems
 * por product_id, código o nombre) y se devuelve cómo quedó el stock, para que
 * el panel pueda avisar faltantes.
 */
export const POST = conAuth(async (request) => {
  const id = await altaDeOrden((await request.json()) as CuerpoOrden);

  const stock = await consultar<{ nombre: string; delta: number; stock_result: number }>(
    `SELECT p.nombre, sm.delta, sm.stock_result
       FROM stock_movements sm JOIN products p ON p.id = sm.product_id
      WHERE sm.order_id = $1 ORDER BY sm.id`,
    [id]
  );

  return { id, stock, faltantes: stock.filter((m) => m.stock_result < 0) };
});
