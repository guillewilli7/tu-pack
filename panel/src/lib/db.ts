import "server-only";
import { Pool } from "pg";

/**
 * Una sola pool para todo el panel. La base es la misma que ya usa el resto
 * de TuPack: el stock y la cuenta corriente los mantienen los triggers, así
 * que desde acá alcanza con insertar y leer.
 */
const url = process.env.TUPACK_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("Falta TUPACK_DATABASE_URL");

declare global {
  var __tupackPool: Pool | undefined;
}

export const pool =
  global.__tupackPool ??
  new Pool({
    connectionString: url,
    ssl: url.includes("sslmode=disable") ? false : undefined,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") global.__tupackPool = pool;

export async function consultar<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}

export async function unaFila<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const filas = await consultar<T>(sql, params);
  return filas[0] ?? null;
}
