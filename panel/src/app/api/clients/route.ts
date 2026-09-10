import { conAuth } from "@/lib/api";
import { consultar } from "@/lib/db";

/** Sucursales activas: es lo que elige el operador (y el agente) al pedir. */
export const GET = conAuth(async (request) => {
  const search = new URL(request.url).searchParams.get("search") ?? "";
  if (!search) {
    return consultar(
      `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal,
              c.direccion_entrega, c.horario_entrega
         FROM clients c JOIN businesses b ON b.id = c.business_id
        WHERE c.activo AND b.activo
        ORDER BY b.nombre, c.sucursal NULLS FIRST LIMIT 20`,
    );
  }

  const exactos = await consultar(
    `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal,
            c.direccion_entrega, c.horario_entrega
       FROM clients c JOIN businesses b ON b.id = c.business_id
      WHERE c.activo AND b.activo
        AND (b.nombre ILIKE $1 OR c.sucursal ILIKE $1
             OR b.nombre || ' ' || COALESCE(c.sucursal,'') ILIKE $1)
      ORDER BY b.nombre, c.sucursal NULLS FIRST LIMIT 20`,
    [`%${search}%`],
  );
  if (exactos.length) return exactos;

  return consultar(
    `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal,
            c.direccion_entrega, c.horario_entrega,
            'aproximado' AS tipo_match
       FROM clients c JOIN businesses b ON b.id = c.business_id
      WHERE c.activo AND b.activo
        AND similarity(b.nombre || ' ' || COALESCE(c.sucursal,''), $1) > 0.2
      ORDER BY similarity(b.nombre || ' ' || COALESCE(c.sucursal,''), $1) DESC
      LIMIT 5`,
    [search],
  );
});
