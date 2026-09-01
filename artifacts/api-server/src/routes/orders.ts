import { Router } from "express";
import { pool } from "../db";

const router = Router();
const PAGE_SIZE = 25;

const NEXT_STATUS: Record<string, string> = {
  pendiente: "en_proceso",
  en_proceso: "completada",
};

const ALLOWED_CANCEL = new Set(["pendiente", "en_proceso", "completada", "confirmado"]);

router.get("/", async (req, res) => {
  const { status, from, to, page } = req.query as Record<string, string>;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  try {
    let baseWhere = "WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (status && status !== "all") {
      if (status === "completada") {
        baseWhere += ` AND o.status IN ($${idx++}, $${idx++})`;
        params.push("completada", "confirmado");
      } else {
        baseWhere += ` AND o.status = $${idx++}`;
        params.push(status);
      }
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
             b.nombre AS client_negocio, c.sucursal
      FROM orders o
      LEFT JOIN clients c    ON c.id = o.client_id
      LEFT JOIN businesses b ON b.id = COALESCE(o.business_id, c.business_id)
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

router.get("/new", (req, res) => {
  res.render("orders/new", { nombre: req.session.nombre });
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, b.nombre AS client_negocio, c.sucursal, c.codigo_cliente,
              c.direccion_entrega, c.horario_entrega
         FROM orders o
         LEFT JOIN clients c    ON c.id = o.client_id
         LEFT JOIN businesses b ON b.id = COALESCE(o.business_id, c.business_id)
        WHERE o.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.redirect("/orders");
    const { rows: movimientos } = await pool.query(
      `SELECT sm.delta, sm.stock_result, sm.motivo, sm.created_at, p.nombre
         FROM stock_movements sm JOIN products p ON p.id = sm.product_id
        WHERE sm.order_id = $1 ORDER BY sm.id`,
      [req.params.id]
    );
    res.render("orders/detail", {
      order: rows[0],
      movimientos,
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
  const { action, total } = req.body as Record<string, string>;

  const renderError = async (msg: string) => {
    try {
      const { rows } = await pool.query(
        `SELECT o.*, b.nombre AS client_negocio, c.sucursal, c.codigo_cliente,
                c.direccion_entrega, c.horario_entrega
           FROM orders o
           LEFT JOIN clients c    ON c.id = o.client_id
           LEFT JOIN businesses b ON b.id = COALESCE(o.business_id, c.business_id)
          WHERE o.id = $1`,
        [req.params.id]
      );
      res.render("orders/detail", {
        order: rows[0] || {},
        movimientos: [],
        nombre: req.session.nombre,
        success: null,
        error: msg,
      });
    } catch {
      res.redirect("/orders");
    }
  };

  try {
    const { rows: current } = await pool.query(
      "SELECT status FROM orders WHERE id = $1",
      [req.params.id]
    );
    if (!current.length) return res.redirect("/orders");
    const currentStatus = current[0].status as string;

    if (action === "advance") {
      const next = NEXT_STATUS[currentStatus];
      if (!next) return renderError(`No se puede avanzar desde el estado "${currentStatus}".`);
      await pool.query(
        "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
        [next, req.params.id]
      );
    } else if (action === "cancel") {
      if (!ALLOWED_CANCEL.has(currentStatus)) {
        return renderError("La orden ya está cancelada.");
      }
      await pool.query(
        "UPDATE orders SET status = 'cancelado', updated_at = NOW() WHERE id = $1",
        [req.params.id]
      );
    } else if (action === "reopen") {
      if (currentStatus !== "cancelado") {
        return renderError("Solo se puede reabrir una orden cancelada.");
      }
      await pool.query(
        "UPDATE orders SET status = 'pendiente', updated_at = NOW() WHERE id = $1",
        [req.params.id]
      );
    } else if (action === "update_total") {
      await pool.query(
        "UPDATE orders SET total = $1, updated_at = NOW() WHERE id = $2",
        [parseFloat(total) || 0, req.params.id]
      );
    } else {
      return renderError("Acción no reconocida.");
    }

    res.redirect(`/orders/${req.params.id}?success=1`);
  } catch (err) {
    console.error(err);
    renderError("Error al guardar cambios.");
  }
});

export default router;
