"use server";

import { revalidatePath } from "next/cache";
import { consultar, unaFila } from "@/lib/db";
import { pedirSesion } from "@/lib/auth";
import { avisar } from "@/lib/avisos";

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
  await avisar("Stock actualizado.");
}

/**
 * Asigna un producto del catálogo a un cliente y le deja el stock inicial.
 * Es la salida para los productos recién creados, que no aparecen en Stock
 * hasta que tienen cliente.
 */
export async function asignarProducto(datos: FormData) {
  await pedirSesion();
  const productId = Number(datos.get("product_id"));
  const businessId = Number(datos.get("business_id"));
  if (!productId || !businessId) {
    await avisar("Elegí un cliente para asignar el producto.", "peligro");
    return;
  }

  const precio = String(datos.get("precio") ?? "").trim();
  await consultar(
    `INSERT INTO business_products (business_id, product_id, precio, stock)
     VALUES (tupack_stock_owner($1), $2, $3, $4)
     ON CONFLICT (business_id, product_id) DO UPDATE
        SET activo = true, precio = COALESCE(EXCLUDED.precio, business_products.precio),
            updated_at = NOW()`,
    [businessId, productId, precio === "" ? null : parseFloat(precio),
     parseInt(String(datos.get("stock") ?? "0"), 10) || 0]
  );

  const info = await unaFila<{ producto: string; dueno: string; locales: string }>(
    `SELECT p.nombre AS producto, d.nombre AS dueno,
            (SELECT count(*) FROM businesses o
              WHERE o.stock_owner_id = d.id AND o.id <> d.id AND o.activo) AS locales
       FROM products p, businesses d
      WHERE p.id = $1 AND d.id = tupack_stock_owner($2)`,
    [productId, businessId]
  );

  revalidatePath("/stock");
  revalidatePath(`/clientes/${businessId}`);
  const locales = Number(info?.locales ?? 0);
  await avisar(
    `"${info?.producto ?? "Producto"}" asignado a ${info?.dueno ?? "el cliente"}` +
    (locales > 0 ? `, y queda para sus ${locales + 1} locales.` : ".")
  );
}
