import "server-only";
import { NextResponse } from "next/server";
import { autorizarApi } from "./auth";
import { consultar } from "./db";

/** Error con código HTTP, para cortar un handler con 403 en vez de 500. */
export class ErrorHttp extends Error {
  constructor(public status: number, mensaje: string) {
    super(mensaje);
  }
}

/**
 * Envoltorio de /api/*: acepta la sesión del panel (lo usan las pantallas) o
 * la API key del agente de WhatsApp. Cualquier otra cosa es 401.
 */
export function conAuth<T extends unknown[]>(
  handler: (request: Request, ...resto: T) => Promise<unknown>
) {
  return async (request: Request, ...resto: T) => {
    if (!(await autorizarApi(request))) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    try {
      return NextResponse.json(await handler(request, ...resto));
    } catch (e) {
      if (e instanceof ErrorHttp) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      console.error(e);
      const mensaje = e instanceof Error ? e.message : "Error inesperado.";
      return NextResponse.json({ error: mensaje }, { status: 500 });
    }
  };
}

export const idDe = async (ctx: { params: Promise<{ id: string }> }) =>
  Number((await ctx.params).id);

/**
 * El agente de WhatsApp manda en cada llamada el teléfono desde el que le
 * escriben (lo pone el flujo de n8n, no el modelo). Con eso la API limita lo
 * que puede leer: solo los datos del cliente dueño de ese número. Sin este
 * cerco, alguien podía decirle al bot que era otro negocio y hacerle cantar
 * precios y saldos ajenos. El panel no manda el header y no queda limitado.
 */
const HEADER_TELEFONO = "x-tupack-telefono";

export const soloDigitos = (valor: string) => valor.replace(/\D/g, "");

export function telefonoDe(request: Request): string | null {
  const digitos = soloDigitos(request.headers.get(HEADER_TELEFONO) ?? "");
  return digitos.length >= 8 ? digitos : null;
}

export type SucursalDelTelefono = {
  client_id: number; business_id: number; negocio: string; sucursal: string | null;
  direccion_entrega: string | null; horario_entrega: string | null;
};

/** Sucursales registradas a ese número (se compara por los últimos 8 dígitos). */
export function sucursalesDelTelefono(telefono: string) {
  return consultar<SucursalDelTelefono>(
    `SELECT c.id AS client_id, c.business_id, b.nombre AS negocio, c.sucursal,
            c.direccion_entrega, c.horario_entrega
       FROM client_phones ph
       JOIN clients c    ON c.id = ph.client_id
       JOIN businesses b ON b.id = c.business_id
      WHERE ph.activo AND c.activo AND b.activo
        AND right(regexp_replace(ph.phone, '\\D', '', 'g'), 8) = right($1, 8)
      ORDER BY b.nombre, c.sucursal NULLS FIRST`,
    [telefono]
  );
}

/** Corta con 403 si el número que escribe no es dueño de esa cuenta. */
export async function exigirPropiedad(
  request: Request, quiere: { clientId?: number; businessId?: number }
) {
  const telefono = telefonoDe(request);
  if (!telefono) return;                          // el panel: sin restricción

  const propias = await sucursalesDelTelefono(telefono);
  const permitido = quiere.clientId
    ? propias.some((s) => s.client_id === quiere.clientId)
    : propias.some((s) => s.business_id === quiere.businessId);

  if (!permitido) {
    throw new ErrorHttp(
      403,
      "Ese número no está registrado en esa cuenta. No se pueden dar precios, stock ni saldos."
    );
  }
}
