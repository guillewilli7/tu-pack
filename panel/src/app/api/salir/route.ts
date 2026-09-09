import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { cerrarSesion } from "@/lib/auth";

export async function POST() {
  await cerrarSesion();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return NextResponse.redirect(new URL("/login", `${proto}://${host}`), 303);
}
