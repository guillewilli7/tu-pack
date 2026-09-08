"use server";

import { revalidatePath } from "next/cache";
import { consultar } from "@/lib/db";
import { pedirSesion } from "@/lib/auth";

/** Ajuste de stock desde la pantalla transversal. Deja movimiento en la base. */
export async function ajustarStock(
  businessId: number, productId: number, stock: string, stockMinimo: string
) {
  const sesion = await pedirSesion();
  await consultar(
    `UPDATE business_products SET stock_minimo=$1, updated_at=NOW()
      WHERE business_id=$2 AND product_id=$3`,
    [stockMinimo === "" ? null : parseInt(stockMinimo, 10), businessId, productId]
  );
  await consultar("SELECT tupack_ajustar_stock($1,$2,$3,$4)", [
    businessId, productId, parseInt(stock, 10) || 0,
    `Ajuste desde el panel (${sesion.nombre || sesion.email})`,
  ]);
  revalidatePath("/stock");
  revalidatePath(`/clientes/${businessId}`);
}
