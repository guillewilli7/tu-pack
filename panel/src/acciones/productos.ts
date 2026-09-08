"use server";

import { revalidatePath } from "next/cache";
import { consultar } from "@/lib/db";
import { pedirSesion } from "@/lib/auth";

export async function crearProducto(datos: FormData) {
  await pedirSesion();
  const t = (c: string) => String(datos.get(c) ?? "").trim();
  await consultar(
    `INSERT INTO products (codigo_prod, nombre, descripcion, unidad, costo, activo)
     VALUES ($1,$2,$3,$4,$5,true)`,
    [t("codigo_prod") || null, t("nombre"), t("descripcion") || null,
     t("unidad") || "unidad", parseFloat(t("costo")) || 0]
  );
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
}

/** Dar de baja no borra: el producto deja de ofrecerse y se puede reactivar. */
export async function cambiarEstadoProducto(id: number, activo: boolean) {
  await pedirSesion();
  await consultar("UPDATE products SET activo=$1 WHERE id=$2", [activo, id]);
  revalidatePath("/productos");
}
