import { Router } from "express";
import { pool } from "../db";

/**
 * Sección "Clientes" = negocios. El negocio es el dueño del stock y de los
 * precios; sus sucursales guardan los datos de facturación y de entrega.
 */
const router = Router();

router.get("/", async (req, res) => {
  const { search, success, error: qErr } = req.query as Record<string, string>;
  try {
    const params: unknown[] = [];
    let filtro = "";
    if (search) {
      params.push(`%${search}%`);
      filtro = ` WHERE b.nombre ILIKE $1`;
    }
    const { rows } = await pool.query(
      `SELECT b.id, b.nombre, b.activo,
              (SELECT count(*) FROM clients c WHERE c.business_id = b.id)            AS sucursales,
              (SELECT count(*) FROM business_products bp WHERE bp.business_id = b.id) AS productos,
              (SELECT count(*) FROM business_products bp
                WHERE bp.business_id = tupack_stock_owner(b.id) AND bp.stock <= 0)     AS sin_stock,
              tupack_saldo(b.id, 'UYU')                                               AS saldo,
              tupack_saldo(b.id, 'USD')                                               AS saldo_usd
         FROM businesses b${filtro}
        ORDER BY b.nombre`,
      params
    );
    res.render("clients/index", {
      clients: rows,
      search: search || "",
      nombre: req.session.nombre,
      success: success || null,
      error: qErr || null,
    });
  } catch (err) {
    console.error(err);
    res.render("clients/index", {
      clients: [], search: "", nombre: req.session.nombre,
      success: null, error: "Error al cargar los clientes.",
    });
  }
});

router.get("/new", (req, res) => {
  res.render("clients/new", { nombre: req.session.nombre, error: null });
});

router.post("/new", async (req, res) => {
  const { nombre, notas } = req.body as Record<string, string>;
  if (!nombre?.trim()) {
    return res.render("clients/new", {
      nombre: req.session.nombre, error: "El nombre del cliente es obligatorio.",
    });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO businesses (nombre, notas) VALUES ($1, $2) RETURNING id",
      [nombre.trim(), notas || null]
    );
    // Un negocio siempre tiene al menos una sucursal (la principal).
    await pool.query("INSERT INTO clients (business_id) VALUES ($1)", [rows[0].id]);
    res.redirect(`/clients/${rows[0].id}?success=1`);
  } catch (err) {
    const duplicado = (err as { code?: string }).code === "23505";
    res.render("clients/new", {
      nombre: req.session.nombre,
      error: duplicado ? "Ya existe un cliente con ese nombre." : "Error al crear el cliente.",
    });
  }
});

router.get("/:id", async (req, res) => {
  const { success, error: qErr } = req.query as Record<string, string>;
  try {
    const [negocio, sucursales, productos, catalogo, ordenes, telefonos, cuenta, saldos] =
      await Promise.all([
      pool.query(
        `SELECT b.*, d.id AS deposito_id, d.nombre AS deposito_nombre,
                (SELECT count(*) FROM businesses o WHERE o.stock_owner_id = b.id AND o.id <> b.id) AS locales
           FROM businesses b
           LEFT JOIN businesses d ON d.id = b.stock_owner_id AND d.id <> b.id
          WHERE b.id = $1`,
        [req.params.id]
      ),
      pool.query("SELECT * FROM clients WHERE business_id = $1 ORDER BY sucursal NULLS FIRST, id", [req.params.id]),
      pool.query(
        `SELECT bp.id AS bp_id, bp.precio, bp.stock, bp.stock_minimo, bp.notas, bp.activo,
                p.id AS product_id, p.nombre, p.codigo_prod, p.unidad
           FROM business_products bp
           JOIN products p ON p.id = bp.product_id
          WHERE bp.business_id = tupack_stock_owner($1)
          ORDER BY p.nombre`,
        [req.params.id]
      ),
      pool.query("SELECT id, nombre, codigo_prod FROM products WHERE activo = true ORDER BY nombre"),
      pool.query(
        `SELECT o.id, o.created_at, o.status, o.total, c.sucursal
           FROM orders o LEFT JOIN clients c ON c.id = o.client_id
          WHERE o.business_id = $1 ORDER BY o.created_at DESC LIMIT 10`,
        [req.params.id]
      ),
      pool.query(
        `SELECT ph.*, c.sucursal FROM client_phones ph
           JOIN clients c ON c.id = ph.client_id
          WHERE c.business_id = $1 ORDER BY ph.id`,
        [req.params.id]
      ),
      // Estado de cuenta: los movimientos más recientes primero, con el saldo
      // acumulado hasta cada uno para poder leer la evolución de la deuda.
      pool.query(
        `SELECT m.*, SUM(m.monto) OVER (PARTITION BY m.moneda ORDER BY m.fecha, m.id) AS saldo_acumulado
           FROM account_movements m
          WHERE m.business_id = $1
          ORDER BY m.fecha DESC, m.id DESC
          LIMIT 100`,
        [req.params.id]
      ),
      pool.query(
        `SELECT tupack_saldo($1, 'UYU') AS uyu, tupack_saldo($1, 'USD') AS usd`,
        [req.params.id]
      ),
    ]);
    if (!negocio.rows.length) return res.redirect("/clients");

    res.render("clients/detail", {
      client: negocio.rows[0],
      branches: sucursales.rows,
      clientProducts: productos.rows,
      allProducts: catalogo.rows,
      orders: ordenes.rows,
      phones: telefonos.rows,
      movimientos: cuenta.rows,
      saldo: Number(saldos.rows[0].uyu),
      saldoUsd: Number(saldos.rows[0].usd),
      nombre: req.session.nombre,
      success: success ? "Cambios guardados correctamente." : null,
      error: qErr ? "Error al guardar los cambios. Intentá de nuevo." : null,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/clients");
  }
});

const volver = (res: import("express").Response, id: string, ok = true) =>
  res.redirect(`/clients/${id}?${ok ? "success=1" : "error=1"}`);

router.post("/:id/update", async (req, res) => {
  const { nombre, notas, activo } = req.body as Record<string, string>;
  try {
    await pool.query(
      "UPDATE businesses SET nombre=$1, notas=$2, activo=$3, updated_at=NOW() WHERE id=$4",
      [nombre, notas || null, activo === "true", req.params.id]
    );
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

// ── Sucursales ──────────────────────────────────────────────────────────────
router.post("/:id/branches/add", async (req, res) => {
  const { sucursal } = req.body as Record<string, string>;
  try {
    await pool.query("INSERT INTO clients (business_id, sucursal) VALUES ($1, $2)", [
      req.params.id, sucursal || null,
    ]);
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

router.post("/:id/branches/:branchId/update", async (req, res) => {
  const b = req.body as Record<string, string>;
  try {
    await pool.query(
      `UPDATE clients SET sucursal=$1, razon_social=$2, rut=$3, direccion_facturacion=$4,
              direccion_entrega=$5, horario_entrega=$6, info_cliente=$7, activo=$8, updated_at=NOW()
        WHERE id=$9 AND business_id=$10`,
      [b.sucursal || null, b.razon_social || null, b.rut || null, b.direccion_facturacion || null,
       b.direccion_entrega || null, b.horario_entrega || null, b.info_cliente || null,
       b.activo === "true", req.params.branchId, req.params.id]
    );
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

// ── Productos, precio y stock ───────────────────────────────────────────────
router.post("/:id/products/add", async (req, res) => {
  const { product_id, precio, stock } = req.body as Record<string, string>;
  try {
    await pool.query(
      `INSERT INTO business_products (business_id, product_id, precio, stock)
       VALUES (tupack_stock_owner($1), $2, $3, $4)
       ON CONFLICT (business_id, product_id) DO NOTHING`,
      [req.params.id, product_id, precio ? parseFloat(precio) : null, parseInt(stock || "0", 10) || 0]
    );
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

router.post("/:id/products/update-price", async (req, res) => {
  const { bp_id, precio } = req.body as Record<string, string>;
  try {
    await pool.query(
      "UPDATE business_products SET precio=$1, updated_at=NOW() WHERE id=$2 AND business_id=$3",
      [precio === "" ? null : parseFloat(precio), bp_id, req.params.id]
    );
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

/** El stock se ajusta con la función de la base para que quede el movimiento. */
router.post("/:id/products/update-stock", async (req, res) => {
  const { product_id, stock, stock_minimo } = req.body as Record<string, string>;
  try {
    await pool.query(
      "SELECT tupack_ajustar_stock(tupack_stock_owner($1), $2, $3, $4)",
      [req.params.id, product_id, parseInt(stock, 10) || 0,
       `Ajuste desde el panel (${req.session.nombre ?? "?"})`]
    );
    if (stock_minimo !== undefined) {
      await pool.query(
        `UPDATE business_products SET stock_minimo=$1, updated_at=NOW()
          WHERE business_id = tupack_stock_owner($2) AND product_id=$3`,
        [stock_minimo === "" ? null : parseInt(stock_minimo, 10), req.params.id, product_id]
      );
    }
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

router.post("/:id/products/:bpId/remove", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM business_products WHERE id=$1 AND business_id = tupack_stock_owner($2)",
      [req.params.bpId, req.params.id]);
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

// ── Estado de cuenta ────────────────────────────────────────────────────────
router.post("/:id/cuenta", async (req, res) => {
  const { fecha, tipo, descripcion, monto, moneda } = req.body as Record<string, string>;
  const valor = parseFloat(monto);
  if (!descripcion?.trim() || Number.isNaN(valor) || valor === 0) {
    return volver(res, req.params.id, false);
  }
  try {
    // Un pago siempre resta y un cargo siempre suma, sin importar cómo venga
    // escrito el número: así nadie carga un pago en positivo por error.
    const signo = tipo === "pago" ? -1 : tipo === "cargo" ? 1 : 0;
    const final = signo === 0 ? valor : signo * Math.abs(valor);

    await pool.query(
      `INSERT INTO account_movements
         (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
       VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3, $4, $5, $6, $7)`,
      [req.params.id, fecha || null, tipo || "ajuste", descripcion.trim(), final,
       moneda === "USD" ? "USD" : "UYU", req.session.nombre ?? null]
    );
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

/** Solo se borran los movimientos cargados a mano: el de una orden lo maneja
 *  la propia orden (cambiale el total o cancelala). */
router.post("/:id/cuenta/:movId/delete", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM account_movements WHERE id=$1 AND business_id=$2 AND order_id IS NULL",
      [req.params.movId, req.params.id]
    );
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

// ── Teléfonos (cuelgan de la sucursal) ──────────────────────────────────────
router.post("/:id/phones/add", async (req, res) => {
  const { client_id, phone, label } = req.body as Record<string, string>;
  try {
    await pool.query(
      "INSERT INTO client_phones (client_id, phone, label) VALUES ($1, $2, $3)",
      [client_id, phone, label || null]
    );
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

router.post("/:id/phones/:phoneId/deactivate", async (req, res) => {
  try {
    await pool.query("UPDATE client_phones SET activo=false WHERE id=$1", [req.params.phoneId]);
    volver(res, req.params.id);
  } catch (err) {
    console.error(err);
    volver(res, req.params.id, false);
  }
});

router.post("/:id/deactivate", async (req, res) => {
  try {
    await pool.query("UPDATE businesses SET activo=false, updated_at=NOW() WHERE id=$1", [req.params.id]);
    res.redirect("/clients?success=deactivated");
  } catch (err) {
    console.error(err);
    res.redirect("/clients?error=deactivate");
  }
});

export default router;
