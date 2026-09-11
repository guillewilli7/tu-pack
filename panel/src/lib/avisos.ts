import "server-only";
import { cookies } from "next/headers";

export type TonoAviso = "ok" | "peligro";

/**
 * Deja un mensaje para la pantalla que viene. Lo pinta el layout del panel y
 * lo borra el navegador apenas lo muestra, así no reaparece al navegar.
 * Va sin httpOnly a propósito: el cliente tiene que poder limpiarlo.
 */
export async function avisar(mensaje: string, tono: TonoAviso = "ok") {
  const almacen = await cookies();
  almacen.set("aviso", encodeURIComponent(`${tono}|${mensaje}`), {
    path: "/",
    maxAge: 15,
    sameSite: "lax",
  });
}
