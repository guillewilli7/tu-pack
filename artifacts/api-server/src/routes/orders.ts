import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  const { status, from, to } = req.query as Record<string, string>;
  try {
    let query = `
      SELECT o.id, o.negocio, o.status, o.total, o.created_at, o.client_id,
             c.negocio AS client_negocio
      FROM orders o
      LEFT JOIN clients c ON c.id = o.client_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;
    if (status && status !== "all") {
      query += ` AND o.status = $${idx++}`;
      params.push(status);
    }
    if (from) {
      query += ` AND o.created_at >= $${idx++}`;
      params.push(from);
    }
    if (to) {
      query += ` AND o.created_at <= $${idx++}`;
      params.push(to + "T23:59:59");
    }
    query += " ORDER BY o.created_at DESC";
    const { rows } = await pool.query(query, params);
    res.render("orders/index", {
      orders: rows,
      filter: { status: status || "all", from: from || "", to: to || "" },
      nombre: (req.session as any).nombre,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.render("orders/index", {
      orders: [],
      filter: { status: "all", from: "", to: "" },
      nombre: (req.session as any).nombre,
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
      nombre: (req.session as any).nombre,
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
      nombre: (req.session as any).nombre,
      success: null,
      error: "Error al guardar cambios.",
    });
  }
});

export default router;
