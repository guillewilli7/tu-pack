import { Router } from "express";
import { pool } from "../db";

/**
 * Vista transversal del stock: todos los productos de todos los negocios, con
 * los filtros que importan en el depósito (faltantes, bajo mínimo, sin precio)
 * y edición en la misma fila.
 */
const router = Router();

const FILTROS: Record<string, string> = {
  todos: "1=1",
  faltante: "bp.stock <= 0",
  bajo: "bp.stock_minimo IS NOT NULL AND bp.stock <= bp.stock_minimo",
  sin_precio: "bp.precio IS NULL",
};

router.get("/", async (req, res) => {
  const { q, filtro, success, error: qErr } = req.query as Record<string, string>;
  const clave = filtro && FILTROS[filtro] ? filtro : "todos";

  try {
    const params: unknown[] = [];
    let where = `WHERE ${FILTROS[clave]}`;
    if (q) {
      params.push(`%${q}%`);
      where += ` AND (b.nombre ILIKE $1 OR p.nombre ILIKE $1)`;
    }

    const [lista, totales] = await Promise.all([
      pool.query(
        `SELECT bp.id AS bp_id, bp.stock, bp.stock_minimo, bp.precio, bp.notas,
                b.id AS business_id, b.nombre AS negocio,
                p.id AS product_id, p.nombre AS producto, p.unidad
           FROM business_products bp
           JOIN businesses b ON b.id = bp.business_id
           JOIN products   p ON p.id = bp.product_id
          ${where}
          ORDER BY b.nombre, p.nombre
          LIMIT 400`,
        params
      ),
      pool.query(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE bp.stock <= 0)::int AS faltante,
                count(*) FILTER (WHERE bp.stock_minimo IS NOT NULL
                                   AND bp.stock <= bp.stock_minimo)::int AS bajo,
                count(*) FILTER (WHERE bp.precio IS NULL)::int AS sin_precio
           FROM business_products bp`
      ),
    ]);

    res.render("stock/index", {
      filas: lista.rows,
      totales: totales.rows[0],
      q: q || "",
      filtro: clave,
      nombre: req.session.nombre,
      success: success ? "Stock actualizado." : null,
      error: qErr || null,
    });
  } catch (err) {
    console.error(err);
    res.render("stock/index", {
      filas: [], totales: { total: 0, faltante: 0, bajo: 0, sin_precio: 0 },
      q: "", filtro: "todos", nombre: req.session.nombre,
      success: null, error: "Error al cargar el stock.",
    });
  }
});

router.post("/update", async (req, res) => {
  const { business_id, product_id, stock, stock_minimo, volver_a } = req.body as Record<string, string>;
  try {
    await pool.query("SELECT tupack_ajustar_stock($1, $2, $3, $4)", [
      business_id, product_id, parseInt(stock, 10) || 0,
      `Ajuste desde el panel (${req.session.nombre ?? "?"})`,
    ]);
    await pool.query(
      "UPDATE business_products SET stock_minimo=$1, updated_at=NOW() WHERE business_id=$2 AND product_id=$3",
      [stock_minimo === "" || stock_minimo === undefined ? null : parseInt(stock_minimo, 10),
       business_id, product_id]
    );
    res.redirect(`${volver_a || "/stock"}${(volver_a || "/stock").includes("?") ? "&" : "?"}success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`${volver_a || "/stock"}?error=No se pudo actualizar el stock.`);
  }
});

export default router;
