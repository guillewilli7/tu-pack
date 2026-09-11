"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { consultar, unaFila } from "@/lib/db";
import { pedirSesion } from "@/lib/auth";
import { avisar } from "@/lib/avisos";

const refrescar = (id: number | string) => {
  revalidatePath(`/clientes/${id}`);
  revalidatePath("/clientes");
};

export async function crearNegocio(datos: FormData) {
  await pedirSesion();
  const nombre = String(datos.get("nombre") ?? "").trim();
  const notas = String(datos.get("notas") ?? "").trim();
  if (!nombre) redirect("/clientes/nuevo?error=El+nombre+es+obligatorio");

  let id: number;
  try {
    const fila = await unaFila<{ id: number }>(
      "INSERT INTO businesses (nombre, notas) VALUES ($1,$2) RETURNING id",
      [nombre, notas || null]
    );
    id = fila!.id;
  } catch (e) {
    const duplicado = (e as { code?: string }).code === "23505";
    redirect(`/clientes/nuevo?error=${encodeURIComponent(
      duplicado ? "Ya existe un cliente con ese nombre." : "No se pudo crear el cliente."
    )}`);
  }
  // Todo negocio arranca con su sucursal principal.
  await consultar("INSERT INTO clients (business_id) VALUES ($1)", [id]);
  revalidatePath("/clientes");
  await avisar(`Cliente "${nombre}" creado.`);
  redirect(`/clientes/${id}`);
}

export async function guardarNegocio(id: number, datos: FormData) {
  await pedirSesion();
  await consultar(
    "UPDATE businesses SET nombre=$1, notas=$2, updated_at=NOW() WHERE id=$3",
    [String(datos.get("nombre") ?? "").trim(), String(datos.get("notas") ?? "").trim() || null, id]
  );
  refrescar(id);
  await avisar("Cliente guardado.");
}

export async function cambiarEstadoNegocio(id: number, activo: boolean) {
  await pedirSesion();
  await consultar("UPDATE businesses SET activo=$1, updated_at=NOW() WHERE id=$2", [activo, id]);
  refrescar(id);
  await avisar(activo ? "Cliente reactivado." : "Cliente dado de baja.");
}

/* ── Sucursales ─────────────────────────────────────────────────────────── */

export async function agregarSucursal(businessId: number, datos: FormData) {
  await pedirSesion();
  await consultar("INSERT INTO clients (business_id, sucursal) VALUES ($1,$2)", [
    businessId, String(datos.get("sucursal") ?? "").trim() || null,
  ]);
  refrescar(businessId);
  await avisar("Sucursal agregada.");
}

export async function guardarSucursal(businessId: number, sucursalId: number, datos: FormData) {
  await pedirSesion();
  const t = (campo: string) => String(datos.get(campo) ?? "").trim() || null;
  await consultar(
    `UPDATE clients SET sucursal=$1, razon_social=$2, rut=$3, direccion_facturacion=$4,
            direccion_entrega=$5, horario_entrega=$6, info_cliente=$7, activo=$8, updated_at=NOW()
      WHERE id=$9 AND business_id=$10`,
    [t("sucursal"), t("razon_social"), t("rut"), t("direccion_facturacion"), t("direccion_entrega"),
     t("horario_entrega"), t("info_cliente"), datos.get("activo") === "true", sucursalId, businessId]
  );
  refrescar(businessId);
  revalidatePath("/stock");
  await avisar("Sucursal guardada.");
}

export async function agregarTelefono(businessId: number, sucursalId: number, datos: FormData) {
  await pedirSesion();
  const phone = String(datos.get("phone") ?? "").trim();
  if (!phone) return;
  await consultar("INSERT INTO client_phones (client_id, phone, label) VALUES ($1,$2,$3)", [
    sucursalId, phone, String(datos.get("label") ?? "").trim() || null,
  ]);
  refrescar(businessId);
  await avisar("Teléfono agregado.");
}

export async function bajaTelefono(businessId: number, telefonoId: number) {
  await pedirSesion();
  await consultar("UPDATE client_phones SET activo=false WHERE id=$1", [telefonoId]);
  refrescar(businessId);
  await avisar("Teléfono dado de baja.");
}

/* ── Productos del negocio (precio y stock) ─────────────────────────────── */

export async function agregarProductoANegocio(businessId: number, datos: FormData) {
  await pedirSesion();
  const productId = Number(datos.get("product_id"));
  if (!productId) {
    await avisar("Elegí un producto para agregar.", "peligro");
    return;
  }
  const precio = String(datos.get("precio") ?? "").trim();
  await consultar(
    `INSERT INTO business_products (business_id, product_id, precio, stock)
     VALUES (tupack_stock_owner($1), $2, $3, $4)
     ON CONFLICT (business_id, product_id) DO UPDATE
        SET activo = true,
            precio = COALESCE(EXCLUDED.precio, business_products.precio),
            updated_at = NOW()`,
    [businessId, productId, precio === "" ? null : parseFloat(precio),
     parseInt(String(datos.get("stock") ?? "0"), 10) || 0]
  );
  refrescar(businessId);
  revalidatePath("/stock");
  await avisar("Producto agregado al cliente.");
}

export async function guardarPrecioYStock(
  businessId: number, productId: number, precio: string, stock: string, stockMinimo: string
) {
  const sesion = await pedirSesion();
  await consultar(
    `UPDATE business_products SET precio=$1, stock_minimo=$2, updated_at=NOW()
      WHERE business_id = tupack_stock_owner($3) AND product_id = $4`,
    [precio === "" ? null : parseFloat(precio),
     stockMinimo === "" ? null : parseInt(stockMinimo, 10), businessId, productId]
  );
  // El stock se mueve por la función de la base para que quede el movimiento.
  await consultar("SELECT tupack_ajustar_stock(tupack_stock_owner($1), $2, $3, $4)", [
    businessId, productId, parseInt(stock, 10) || 0, `Ajuste desde el panel (${sesion.nombre || sesion.email})`,
  ]);
  refrescar(businessId);
  revalidatePath("/stock");
  await avisar("Precio y stock guardados.");
}

export async function cambiarEstadoProductoDeNegocio(businessId: number, bpId: number, activo: boolean) {
  await pedirSesion();
  await consultar(
    `UPDATE business_products SET activo=$1, updated_at=NOW()
      WHERE id=$2 AND business_id = tupack_stock_owner($3)`,
    [activo, bpId, businessId]
  );
  refrescar(businessId);
  revalidatePath("/stock");
  await avisar(activo ? "Producto reactivado en el cliente." : "Producto quitado del cliente.");
}

/* ── Cuenta corriente ───────────────────────────────────────────────────── */

export async function agregarMovimiento(businessId: number, datos: FormData) {
  const sesion = await pedirSesion();
  const descripcion = String(datos.get("descripcion") ?? "").trim();
  const monto = parseFloat(String(datos.get("monto") ?? ""));
  if (!descripcion || Number.isNaN(monto) || monto === 0) {
    await avisar("El movimiento necesita descripción y un monto distinto de cero.", "peligro");
    return;
  }

  const tipo = String(datos.get("tipo") ?? "ajuste");
  // Un pago siempre resta y un cargo siempre suma, sin importar cómo venga
  // escrito el número: así nadie carga un pago en positivo por error.
  const signo = tipo === "pago" ? -1 : tipo === "cargo" ? 1 : 0;
  const final = signo === 0 ? monto : signo * Math.abs(monto);
  const fecha = String(datos.get("fecha") ?? "").trim();

  await consultar(
    `INSERT INTO account_movements (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
     VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3, $4, $5, $6, $7)`,
    [businessId, fecha || null, tipo, descripcion, final,
     datos.get("moneda") === "USD" ? "USD" : "UYU", sesion.nombre || sesion.email]
  );
  refrescar(businessId);
  revalidatePath("/cuentas");
  await avisar("Movimiento registrado.");
}

export async function anularMovimiento(businessId: number, movimientoId: number, anular: boolean) {
  const sesion = await pedirSesion();
  await consultar(
    `UPDATE account_movements
        SET anulado=$1, anulado_at=CASE WHEN $1 THEN NOW() END, anulado_por=CASE WHEN $1 THEN $4 END
      WHERE id=$2 AND business_id=$3 AND order_id IS NULL`,
    [anular, movimientoId, businessId, sesion.nombre || sesion.email]
  );
  refrescar(businessId);
  revalidatePath("/cuentas");
  await avisar(anular ? "Movimiento anulado." : "Movimiento restaurado.");
}
