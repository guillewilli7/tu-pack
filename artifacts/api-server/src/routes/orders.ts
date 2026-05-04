import { Router } from "express";
import { pool } from "../db";

const router = Router();
const PAGE_SIZE = 25;

router.get("/", async (req, res) => {
  const { status, from, to, page } = req.query as Record<string, string>;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  try {
    let baseWhere = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (status && status !== "all") {
      baseWhere += ` AND o.status = $${idx++}`;
      params.push(status);
    }
    if (from) {
      baseWhere += ` AND o.created_at >= $${idx++}`;
      params.push(from);
    }
    if (to) {
      baseWhere += ` AND o.created_at <= $${idx++}`;
      params.push(to + "T23:59:59");
    }

    const countQuery = `SELECT COUNT(*) FROM orders o ${baseWhere}`;
    const dataQuery = `
      SELECT o.id, o.negocio, o.status, o.total, o.created_at, o.client_id,
             c.negocio AS client_negocio
      FROM orders o
      LEFT JOIN clients c ON c.id = o.client_id
      ${baseWhere}
      ORDER BY o.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const [countRes, dataRes] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(dataQuery, [...params, PAGE_SIZE, offset]),
    ]);

    const totalCount = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    res.render("orders/index", {
      orders: dataRes.rows,
      filter: { status: status || "all", from: from || "", to: to || "" },
      nombre: req.session.nombre,
      pagination: { currentPage, totalPages, totalCount, pageSize: PAGE_SIZE },
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.render("orders/index", {
      orders: [],
      filter: { status: "all", from: "", to: "" },
      nombre: req.session.nombre,
      pagination: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: PAGE_SIZE },
      error: "Error al cargar órdenes.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, c.negocio AS client_negocio, c.codigo_cliente
       FROM orders o LEFT JOIN clients c ON c.id = o.client_id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.redirect("/orders");
    res.render("orders/detail", {
      order: rows[0],
      nombre: req.session.nombre,
      success: req.query.success || null,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/orders");
  }
});

router.post("/:id", async (req, res) => {
  const { action, status, total } = req.body as Record<string, string>;
  try {
    if (action === "cancel") {
      await pool.query("UPDATE orders SET status = 'cancelado', updated_at = NOW() WHERE id = $1", [req.params.id]);
    } else {
      await pool.query(
        "UPDATE orders SET status = $1, total = $2, updated_at = NOW() WHERE id = $3",
        [status, parseFloat(total) || 0, req.params.id]
      );
    }
    res.redirect(`/orders/${req.params.id}?success=1`);
  } catch (err) {
    console.error(err);
    const { rows } = await pool.query(
      `SELECT o.*, c.negocio AS client_negocio, c.codigo_cliente
       FROM orders o LEFT JOIN clients c ON c.id = o.client_id
       WHERE o.id = $1`,
      [req.params.id]
    );
    res.render("orders/detail", {
      order: rows[0] || {},
      nombre: req.session.nombre,
      success: null,
      error: "Error al guardar cambios.",
    });
  }
});

export default router;
