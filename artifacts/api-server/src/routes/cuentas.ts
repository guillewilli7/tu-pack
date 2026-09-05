import { Router } from "express";
import { pool } from "../db";

/**
 * Cuentas: el estado de cuenta de todos los clientes en una sola pantalla,
 * para saber a quién hay que cobrarle sin entrar cliente por cliente.
 */
const router = Router();

const FILTROS: Record<string, string> = {
  deudores: "saldo > 0 OR saldo_usd > 0",
  a_favor: "saldo < 0 OR saldo_usd < 0",
  en_cero: "saldo = 0 AND saldo_usd = 0",
  todos: "1=1",
};

router.get("/", async (req, res) => {
  const { q, filtro } = req.query as Record<string, string>;
  const clave = filtro && FILTROS[filtro] ? filtro : "deudores";

  try {
    const params: unknown[] = [];
    let where = "";
    if (q) {
      params.push(`%${q}%`);
      where = " AND b.nombre ILIKE $1";
    }

    const { rows } = await pool.query(
      `WITH cuentas AS (
         SELECT b.id, b.nombre, tupack_saldo(b.id, 'UYU') AS saldo,
                tupack_saldo(b.id, 'USD') AS saldo_usd,
                (SELECT max(m.fecha) FROM account_movements m WHERE m.business_id = b.id) AS ultimo_movimiento,
                (SELECT count(*)    FROM account_movements m WHERE m.business_id = b.id) AS movimientos
           FROM businesses b
          WHERE b.activo = true${where}
       )
       SELECT * FROM cuentas WHERE ${FILTROS[clave]} ORDER BY saldo DESC, nombre`,
      params
    );

    const { rows: totales } = await pool.query(
      `SELECT COALESCE(SUM(saldo) FILTER (WHERE saldo > 0), 0)::numeric(12,2) AS por_cobrar,
              COALESCE(SUM(saldo) FILTER (WHERE saldo < 0), 0)::numeric(12,2) AS a_favor,
              count(*) FILTER (WHERE saldo > 0) AS deudores,
              COALESCE(SUM(usd) FILTER (WHERE usd > 0), 0)::numeric(12,2) AS por_cobrar_usd
         FROM (SELECT b.id, tupack_saldo(b.id, 'UYU') AS saldo, tupack_saldo(b.id, 'USD') AS usd
                 FROM businesses b WHERE b.activo = true) x`
    );

    res.render("cuentas/index", {
      cuentas: rows,
      totales: totales[0],
      q: q || "",
      filtro: clave,
      nombre: req.session.nombre,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.render("cuentas/index", {
      cuentas: [], totales: { por_cobrar: 0, a_favor: 0, deudores: 0, por_cobrar_usd: 0 },
      q: "", filtro: "deudores", nombre: req.session.nombre,
      error: "Error al cargar las cuentas.",
    });
  }
});

export default router;
