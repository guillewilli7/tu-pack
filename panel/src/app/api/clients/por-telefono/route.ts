import { conAuth, soloDigitos, sucursalesDelTelefono, telefonoDe } from "@/lib/api";

/** Quién es el que escribe. El agente no elige cliente: sale del teléfono. */
export const GET = conAuth(async (request) => {
  const telefono =
    telefonoDe(request) ?? soloDigitos(new URL(request.url).searchParams.get("phone") ?? "");
  if (telefono.length < 8) return { registrado: false, sucursales: [] };

  const sucursales = await sucursalesDelTelefono(telefono);
  return { registrado: sucursales.length > 0, sucursales };
});
