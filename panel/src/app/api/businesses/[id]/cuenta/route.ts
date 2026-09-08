import { conAuth, exigirPropiedad, idDe } from "@/lib/api";
import { consultar } from "@/lib/db";
import { saldosDeNegocio } from "@/lib/consultas";

export const GET = conAuth(async (request, ctx: { params: Promise<{ id: string }> }) => {
  const id = await idDe(ctx);
  await exigirPropiedad(request, { businessId: id });
  const [saldos, movimientos] = await Promise.all([
    saldosDeNegocio(id),
    consultar(
      `SELECT fecha, tipo, descripcion, monto, moneda, order_id
         FROM account_movements WHERE business_id = $1 AND NOT anulado
        ORDER BY fecha DESC, id DESC LIMIT 50`,
      [id]
    ),
  ]);
  return { saldo: saldos.uyu, saldo_usd: saldos.usd, movimientos };
});
