import { conAuth, idDe } from "@/lib/api";
import { consultar } from "@/lib/db";

export const GET = conAuth(async (_request, ctx: { params: Promise<{ id: string }> }) =>
  consultar(
    "SELECT phone, label FROM client_phones WHERE client_id = $1 AND activo ORDER BY id",
    [await idDe(ctx)]
  )
);

export const POST = conAuth(async (request, ctx: { params: Promise<{ id: string }> }) => {
  const { phone, label } = (await request.json()) as { phone?: string; label?: string };
  if (!phone) throw new Error("Falta el teléfono.");
  await consultar(
    "INSERT INTO client_phones (client_id, phone, label) VALUES ($1,$2,$3)",
    [await idDe(ctx), phone, label ?? null]
  );
  return { ok: true };
});
