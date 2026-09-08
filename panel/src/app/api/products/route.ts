import { conAuth } from "@/lib/api";
import { consultar } from "@/lib/db";

export const GET = conAuth(async (request) => {
  const search = new URL(request.url).searchParams.get("search") ?? "";
  return consultar(
    `SELECT id, nombre, codigo_prod FROM products
      WHERE activo ${search ? "AND (nombre ILIKE $1 OR codigo_prod ILIKE $1)" : ""}
      ORDER BY nombre LIMIT 30`,
    search ? [`%${search}%`] : []
  );
});
