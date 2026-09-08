import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { unaFila } from "./db";

const COOKIE = "tupack_sesion";
const DIAS = 30;

const secreto = () =>
  process.env.SESSION_SECRET ?? process.env.TUPACK_SESSION_SECRET ?? "";

export type Sesion = { id: number; email: string; nombre: string };

/**
 * La sesión viaja firmada en la cookie: no hace falta tabla ni consulta por
 * request. Si alguien cambia el payload, la firma no valida y se lo trata
 * como deslogueado.
 */
function firmar(payload: string) {
  return createHmac("sha256", secreto()).update(payload).digest("base64url");
}

function armarToken(sesion: Sesion) {
  const cuerpo = Buffer.from(
    JSON.stringify({ ...sesion, exp: Date.now() + DIAS * 864e5 })
  ).toString("base64url");
  return `${cuerpo}.${firmar(cuerpo)}`;
}

function leerToken(token: string | undefined): Sesion | null {
  if (!token || !secreto()) return null;
  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma) return null;

  const esperada = Buffer.from(firmar(cuerpo));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;

  try {
    const datos = JSON.parse(Buffer.from(cuerpo, "base64url").toString());
    if (!datos.exp || datos.exp < Date.now()) return null;
    return { id: datos.id, email: datos.email, nombre: datos.nombre };
  } catch {
    return null;
  }
}

export async function iniciarSesion(email: string, password: string): Promise<string | null> {
  const usuario = await unaFila<{ id: number; email: string; nombre: string | null; password: string; activo: boolean }>(
    "SELECT id, email, nombre, password, activo FROM users WHERE lower(email) = lower($1)",
    [email.trim()]
  );
  // Se compara igual contra un hash falso si el usuario no existe, para que
  // el tiempo de respuesta no delate qué correos están dados de alta.
  const hash = usuario?.password ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const coincide = await bcrypt.compare(password, hash);
  if (!usuario || !coincide || usuario.activo === false) return "Usuario o contraseña incorrectos.";

  const store = await cookies();
  store.set(COOKIE, armarToken({ id: usuario.id, email: usuario.email, nombre: usuario.nombre ?? "" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DIAS * 24 * 60 * 60,
    path: "/",
  });
  return null;
}

export async function cerrarSesion() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function sesionActual(): Promise<Sesion | null> {
  const store = await cookies();
  return leerToken(store.get(COOKIE)?.value);
}

/** Para las pantallas: si no hay sesión, al login. */
export async function pedirSesion(): Promise<Sesion> {
  const sesion = await sesionActual();
  if (!sesion) redirect("/login");
  return sesion;
}

/**
 * Para /api/*: acepta la sesión del panel o la API key que usa el agente de
 * WhatsApp. Devuelve null si no está autorizado.
 */
export async function autorizarApi(request: Request): Promise<Sesion | { agente: true } | null> {
  const clave = process.env.TUPACK_API_KEY;
  const enviada = request.headers.get("x-api-key");
  if (clave && enviada && enviada === clave) return { agente: true };
  return await sesionActual();
}
