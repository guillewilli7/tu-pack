import { conAuth } from "@/lib/api";
import { consultar } from "@/lib/db";

/** Sucursales activas: es lo que elige el operador (y el agente) al pedir. */
export const GET = conAuth(async (request) => {
  const search = new URL(request.url).searchParams.get("search") ?? "";
  return consultar(
    `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal,
            c.direccion_entrega, c.horario_entrega
       FROM clients c JOIN businesses b ON b.id = c.business_id
      WHERE c.activo AND b.activo
        ${search ? "AND (b.nombre ILIKE $1 OR c.sucursal ILIKE $1 OR b.nombre || ' ' || COALESCE(c.sucursal,'') ILIKE $1)" : ""}
      ORDER BY b.nombre, c.sucursal NULLS FIRST LIMIT 20`,
    search ? [`%${search}%`] : []
  );
});
