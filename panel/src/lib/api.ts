import "server-only";
import { NextResponse } from "next/server";
import { autorizarApi } from "./auth";

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
      console.error(e);
      const mensaje = e instanceof Error ? e.message : "Error inesperado.";
      return NextResponse.json({ error: mensaje }, { status: 500 });
    }
  };
}

export const idDe = async (ctx: { params: Promise<{ id: string }> }) =>
  Number((await ctx.params).id);
