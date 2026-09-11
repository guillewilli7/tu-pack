"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { consultar, unaFila } from "@/lib/db";
import { pedirSesion } from "@/lib/auth";
import { notificarPedidoNuevo } from "@/lib/pedidos";
import { avisar } from "@/lib/avisos";

export type LineaPedido = { product_id: number; cantidad: number; precio_unitario: number };

/**
 * Arma los ítems desde el catálogo (el nombre y el código no se toman del
 * navegador) y devuelve el total. Es lo que usan alta y edición.
 */
async function armarItems(lineas: LineaPedido[]) {
  const limpias = lineas
    .map((l) => ({
      product_id: Number(l.product_id),
      cantidad: Math.max(0, Math.round(Number(l.cantidad))),
      precio_unitario: Number(l.precio_unitario),
    }))
    .filter((l) => l.product_id && l.cantidad > 0);

  if (!limpias.length) throw new Error("La orden necesita al menos una línea con producto y cantidad.");
  if (limpias.some((l) => Number.isNaN(l.precio_unitario))) throw new Error("Hay líneas sin precio.");

  const productos = await consultar<{ id: number; nombre: string; codigo_prod: string | null }>(
    "SELECT id, nombre, codigo_prod FROM products WHERE id = ANY($1::int[])",
    [limpias.map((l) => l.product_id)]
  );
  const porId = new Map(productos.map((p) => [p.id, p]));
  if (limpias.some((l) => !porId.has(l.product_id))) throw new Error("Alguna línea apunta a un producto que no existe.");

  const items = limpias.map((l) => ({
    product_id: l.product_id,
    codigo_prod: porId.get(l.product_id)!.codigo_prod ?? "",
    nombre_catalogo: porId.get(l.product_id)!.nombre,
    cantidad: l.cantidad,
    precio_unitario: l.precio_unitario,
    subtotal: Math.round(l.cantidad * l.precio_unitario * 100) / 100,
  }));
  return { items, total: items.reduce((s, i) => s + i.subtotal, 0) };
}

export async function crearOrden(datos: {
  client_id: number; phone?: string; notas?: string; lineas: LineaPedido[];
}) {
  await pedirSesion();
  const { items, total } = await armarItems(datos.lineas);

  const negocio = await unaFila<{ business_id: number; nombre: string }>(
    `SELECT c.business_id, b.nombre FROM clients c JOIN businesses b ON b.id = c.business_id WHERE c.id = $1`,
    [datos.client_id]
  );
  if (!negocio) throw new Error("La sucursal no existe.");

  const fila = await unaFila<{ id: number }>(
    `INSERT INTO orders (business_id, client_id, negocio, phone, status, items, total, raw_data)
     VALUES ($1,$2,$3,$4,'pendiente',$5::jsonb,$6,$7::jsonb) RETURNING id`,
    [negocio.business_id, datos.client_id, negocio.nombre, datos.phone ?? "",
     JSON.stringify(items), total, datos.notas ? JSON.stringify({ notas: datos.notas }) : null]
  );

  notificarPedidoNuevo(fila!.id);
  revalidatePath("/ordenes");
  await avisar(`Orden #${fila!.id} creada.`);
  redirect(`/ordenes/${fila!.id}`);
}

export async function guardarLineas(ordenId: number, lineas: LineaPedido[]) {
  await pedirSesion();
  const estado = await unaFila<{ eliminada: boolean }>("SELECT eliminada FROM orders WHERE id = $1", [ordenId]);
  if (!estado) throw new Error("La orden no existe.");
  if (estado.eliminada) throw new Error("La orden está eliminada: restaurala antes de editarla.");

  const { items, total } = await armarItems(lineas);
  await consultar(
    "UPDATE orders SET items = $1::jsonb, total = $2, updated_at = NOW() WHERE id = $3",
    [JSON.stringify(items), total, ordenId]
  );
  revalidatePath(`/ordenes/${ordenId}`);
  revalidatePath("/ordenes");
  await avisar("Líneas de la orden guardadas.");
}

const SIGUIENTE: Record<string, string> = { pendiente: "en_proceso", en_proceso: "completada" };
// El estado también se puede volver atrás: marcar completada de más pasa, y
// no hay razón para tener que cancelar la orden para corregirlo. Ninguno de
// estos pasos toca el stock ni la cuenta (eso solo lo mueve "cancelado").
const ANTERIOR: Record<string, string> = {
  completada: "en_proceso", confirmado: "en_proceso", en_proceso: "pendiente",
};

export async function accionOrden(ordenId: number, accion: string, valor?: string) {
  const sesion = await pedirSesion();
  const actual = await unaFila<{ status: string; eliminada: boolean }>(
    "SELECT status, eliminada FROM orders WHERE id = $1", [ordenId]
  );
  if (!actual) throw new Error("La orden no existe.");
  if (actual.eliminada && accion !== "restaurar") {
    throw new Error("La orden está eliminada: restaurala primero.");
  }

  let mensaje: string;

  if (accion === "avanzar") {
    const proximo = SIGUIENTE[actual.status];
    if (!proximo) throw new Error(`No se puede avanzar desde "${actual.status}".`);
    await consultar("UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2", [proximo, ordenId]);
    mensaje = `Orden #${ordenId} pasó a ${proximo.replace("_", " ")}.`;

  } else if (accion === "retroceder") {
    const previo = ANTERIOR[actual.status];
    if (!previo) throw new Error(`No se puede volver atrás desde "${actual.status}".`);
    await consultar("UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2", [previo, ordenId]);
    mensaje = `Orden #${ordenId} volvió a ${previo.replace("_", " ")}.`;

  } else if (accion === "cancelar") {
    await consultar("UPDATE orders SET status='cancelado', updated_at=NOW() WHERE id=$1", [ordenId]);
    mensaje = `Orden #${ordenId} cancelada.`;

  } else if (accion === "reabrir") {
    await consultar("UPDATE orders SET status='pendiente', updated_at=NOW() WHERE id=$1", [ordenId]);
    mensaje = `Orden #${ordenId} reabierta.`;

  } else if (accion === "total") {
    await consultar("UPDATE orders SET total=$1, updated_at=NOW() WHERE id=$2",
      [parseFloat(valor ?? "0") || 0, ordenId]);
    mensaje = "Total actualizado.";

  } else if (accion === "eliminar") {
    // Eliminar = cancelar (devuelve stock y saca la deuda) + esconder.
    await consultar(
      `UPDATE orders SET status='cancelado', eliminada=true, eliminada_at=NOW(),
              eliminada_por=$2, updated_at=NOW() WHERE id=$1`,
      [ordenId, sesion.nombre || sesion.email]
    );
    revalidatePath("/ordenes");
    await avisar(`Orden #${ordenId} eliminada.`);
    redirect("/ordenes?estado=eliminadas");

  } else if (accion === "restaurar") {
    await consultar(
      `UPDATE orders SET eliminada=false, eliminada_at=NULL, eliminada_por=NULL,
              updated_at=NOW() WHERE id=$1`, [ordenId]
    );
    mensaje = `Orden #${ordenId} restaurada.`;
  } else {
    throw new Error("Acción desconocida.");
  }

  revalidatePath("/ordenes");
  revalidatePath(`/ordenes/${ordenId}`);
  await avisar(mensaje);
}
