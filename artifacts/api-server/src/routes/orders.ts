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
    // Lo eliminado no aparece en las listas, pero sigue estando: se ve con el
    // filtro "Eliminadas" y desde ahí se restaura.
    let baseWhere = status === "eliminadas" ? "WHERE o.eliminada" : "WHERE NOT o.eliminada";
    const params: unknown[] = [];
    let idx = 1;

    if (status && status !== "all" && status !== "eliminadas") {
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
      SELECT o.id, o.negocio, o.status, o.total, o.created_at, o.client_id, o.eliminada,
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
    const [{ rows: movimientos }, { rows: catalogo }] = await Promise.all([
      pool.query(
        `SELECT sm.delta, sm.stock_result, sm.motivo, sm.created_at, p.nombre
           FROM stock_movements sm JOIN products p ON p.id = sm.product_id
          WHERE sm.order_id = $1 ORDER BY sm.id`,
        [req.params.id]
      ),
      pool.query(
        `SELECT bp.product_id, bp.precio, bp.stock, p.nombre, p.codigo_prod
           FROM business_products bp JOIN products p ON p.id = bp.product_id
          WHERE bp.business_id = tupack_stock_owner($1)
            AND bp.activo AND p.activo
          ORDER BY p.nombre`,
        [rows[0].business_id]
      ),
    ]);
    res.render("orders/detail", {
      order: rows[0],
      movimientos,
      catalogo,
      nombre: req.session.nombre,
      success: req.query.success || null,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/orders");
  }
});

/**
 * Reescribe las líneas de una orden. El nombre y el código salen del catálogo
 * (no de lo que mande el navegador) y el total se recalcula acá: la base se
 * encarga sola de rehacer el stock y el cargo en la cuenta.
 */
async function guardarItems(
  orderId: string, itemsJson: string | undefined
): Promise<string | null> {
  let crudo: unknown;
  try {
    crudo = JSON.parse(itemsJson || "[]");
  } catch {
    return "No se pudieron leer las líneas del pedido.";
  }
  if (!Array.isArray(crudo) || !crudo.length) {
    return "La orden tiene que tener al menos una línea.";
  }

  const lineas = crudo.map((l) => {
    const x = l as Record<string, unknown>;
    return {
      product_id: parseInt(String(x.product_id), 10),
      cantidad: Math.max(0, Math.round(Number(x.cantidad))),
      precio_unitario: Number(x.precio_unitario),
    };
  });
  if (lineas.some((l) => !l.product_id || !l.cantidad || Number.isNaN(l.precio_unitario))) {
    return "Todas las líneas necesitan producto, cantidad y precio.";
  }

  const { rows: productos } = await pool.query(
    "SELECT id, nombre, codigo_prod FROM products WHERE id = ANY($1::int[])",
    [lineas.map((l) => l.product_id)]
  );
  const porId = new Map(productos.map((p) => [p.id as number, p]));
  if (lineas.some((l) => !porId.has(l.product_id))) {
    return "Alguna línea apunta a un producto que ya no existe.";
  }

  const items = lineas.map((l) => ({
    product_id: l.product_id,
    codigo_prod: porId.get(l.product_id)!.codigo_prod || "",
    nombre_catalogo: porId.get(l.product_id)!.nombre,
    cantidad: l.cantidad,
    precio_unitario: l.precio_unitario,
    subtotal: Math.round(l.cantidad * l.precio_unitario * 100) / 100,
  }));
  const total = items.reduce((suma, i) => suma + i.subtotal, 0);

  await pool.query(
    "UPDATE orders SET items = $1::jsonb, total = $2, updated_at = NOW() WHERE id = $3",
    [JSON.stringify(items), total, orderId]
  );
  return null;
}

router.post("/:id", async (req, res) => {
  const { action, total, items } = req.body as Record<string, string>;

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
        catalogo: [],
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
      "SELECT status, business_id, eliminada FROM orders WHERE id = $1",
      [req.params.id]
    );
    if (!current.length) return res.redirect("/orders");
    const currentStatus = current[0].status as string;

    // Una orden eliminada está congelada: primero se restaura, después se toca.
    if (current[0].eliminada && action !== "restore") {
      return renderError("La orden está eliminada. Restaurala primero para poder editarla.");
    }

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
    } else if (action === "save_items") {
      const resultado = await guardarItems(req.params.id, items);
      if (resultado) return renderError(resultado);

    } else if (action === "delete") {
      // Eliminar = sacarla de las listas y cancelarla, así devuelve el stock
      // y deja de pesar en la cuenta del cliente. Los datos quedan.
      await pool.query(
        `UPDATE orders
            SET status = 'cancelado', eliminada = true, eliminada_at = NOW(),
                eliminada_por = $2, updated_at = NOW()
          WHERE id = $1`,
        [req.params.id, req.session.nombre ?? null]
      );
      return res.redirect("/orders?status=eliminadas");

    } else if (action === "restore") {
      // Vuelve como cancelada: si hay que reactivarla se usa "Volver a pendiente",
      // que es lo que descuenta el stock de nuevo.
      await pool.query(
        `UPDATE orders SET eliminada = false, eliminada_at = NULL, eliminada_por = NULL,
                updated_at = NOW()
          WHERE id = $1`,
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
