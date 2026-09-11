"use server";

import { revalidatePath } from "next/cache";
import { consultar, unaFila } from "@/lib/db";
import { pedirSesion } from "@/lib/auth";
import { avisar } from "@/lib/avisos";

export async function crearProducto(datos: FormData) {
  await pedirSesion();
  const t = (c: string) => String(datos.get(c) ?? "").trim();
  const nombre = t("nombre");

  const creado = await unaFila<{ id: number }>(
    `INSERT INTO products (codigo_prod, nombre, descripcion, unidad, costo, activo)
     VALUES ($1,$2,$3,$4,$5,true) RETURNING id`,
    [t("codigo_prod") || null, nombre, t("descripcion") || null,
     t("unidad") || "unidad", parseFloat(t("costo")) || 0]
  );

  // Un producto sin cliente no aparece en Stock: si eligieron uno acá, se lo
  // asignamos en el mismo paso para que quede listo para cargarle stock.
  const businessId = Number(datos.get("business_id"));
  if (businessId) {
    const precio = t("precio");
    const minimo = t("stock_minimo");
    await consultar(
      `INSERT INTO business_products (business_id, product_id, precio, stock, stock_minimo)
       VALUES (tupack_stock_owner($1), $2, $3, $4, $5)
       ON CONFLICT (business_id, product_id) DO UPDATE
          SET activo = true, precio = COALESCE(EXCLUDED.precio, business_products.precio),
              stock_minimo = COALESCE(EXCLUDED.stock_minimo, business_products.stock_minimo),
              updated_at = NOW()`,
      [businessId, creado!.id, precio === "" ? null : parseFloat(precio),
       parseInt(t("stock"), 10) || 0, minimo === "" ? null : parseInt(minimo, 10)]
    );
    const dueno = await unaFila<{ nombre: string; locales: string }>(
      `SELECT d.nombre,
              (SELECT count(*) FROM businesses o
                WHERE o.stock_owner_id = d.id AND o.id <> d.id AND o.activo) AS locales
         FROM businesses d WHERE d.id = tupack_stock_owner($1)`,
      [businessId]
    );
    revalidatePath("/stock");
    revalidatePath(`/clientes/${businessId}`);
    const locales = Number(dueno?.locales ?? 0);
    await avisar(
      `"${nombre}" creado y asignado a ${dueno?.nombre ?? "el cliente"}` +
      (locales > 0 ? `, y queda para sus ${locales + 1} locales.` : ".")
    );
  } else {
    await avisar(`"${nombre}" creado. Asignalo a un cliente para poder cargarle stock.`);
  }

  revalidatePath("/productos");
}

export async function guardarProducto(id: number, datos: FormData) {
  await pedirSesion();
  const t = (c: string) => String(datos.get(c) ?? "").trim();
  await consultar(
    "UPDATE products SET nombre=$1, descripcion=$2, unidad=$3, costo=$4 WHERE id=$5",
    [t("nombre"), t("descripcion") || null, t("unidad") || "unidad", parseFloat(t("costo")) || 0, id]
  );
  revalidatePath("/productos");
  revalidatePath("/stock");
  await avisar(`"${t("nombre")}" guardado.`);
}

/** Dar de baja no borra: el producto deja de ofrecerse y se puede reactivar. */
export async function cambiarEstadoProducto(id: number, activo: boolean) {
  await pedirSesion();
  await consultar("UPDATE products SET activo=$1 WHERE id=$2", [activo, id]);
  revalidatePath("/productos");
  revalidatePath("/stock");
  await avisar(activo ? "Producto reactivado." : "Producto dado de baja.");
}
