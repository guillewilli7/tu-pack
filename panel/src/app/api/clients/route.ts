import { conAuth, sucursalesDelTelefono, telefonoDe } from "@/lib/api";
import { consultar } from "@/lib/db";

/** Sucursales activas: es lo que elige el operador al cargar un pedido. */
export const GET = conAuth(async (request) => {
  // Buscar clientes por nombre es del panel. Desde WhatsApp se responde solo
  // con las sucursales de ese número.
  const telefono = telefonoDe(request);
  if (telefono) return sucursalesDelTelefono(telefono);

  const search = new URL(request.url).searchParams.get("search") ?? "";
  return consultar(
    `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal,
            c.direccion_entrega, c.horario_entrega
       FROM clients c JOIN businesses b ON b.id = c.business_id
      WHERE c.activo AND b.activo ${search ? "AND b.nombre ILIKE $1" : ""}
      ORDER BY b.nombre, c.sucursal NULLS FIRST LIMIT 20`,
    search ? [`%${search}%`] : []
  );
});
