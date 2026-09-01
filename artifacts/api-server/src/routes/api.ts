import { Router } from "express";
import { pool } from "../db";

/**
 * API interna del panel (la usan los buscadores de "Nueva orden") y la vía por
 * la que el agente puede cargar pedidos. Los "clientes" que devuelve son
 * sucursales: cada una trae el negocio al que pertenece, que es quien tiene el
 * stock y los precios.
 */
const router = Router();

router.get("/products", async (req, res) => {
  const { search } = req.query as Record<string, string>;
  try {
    let query = "SELECT id, nombre, codigo_prod FROM products WHERE activo = true";
    const params: unknown[] = [];
    if (search) {
      query += " AND (nombre ILIKE $1 OR codigo_prod ILIKE $1)";
      params.push(`%${search}%`);
    }
    query += " ORDER BY nombre LIMIT 30";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar productos." });
  }
});

/** Negocios (el cliente comercial), con su stock resumido. */
router.get("/businesses", async (req, res) => {
  const { search } = req.query as Record<string, string>;
  try {
    const params: unknown[] = [];
    let where = "WHERE b.activo = true";
    if (search) {
      params.push(`%${search}%`);
      where += " AND b.nombre ILIKE $1";
    }
    const { rows } = await pool.query(
      `SELECT b.id, b.nombre,
              (SELECT count(*) FROM clients c WHERE c.business_id = b.id) AS sucursales
         FROM businesses b ${where} ORDER BY b.nombre LIMIT 30`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar negocios." });
  }
});

/** Sucursales: es lo que elige el operador al cargar una orden. */
router.get("/clients", async (req, res) => {
  const { search } = req.query as Record<string, string>;
  try {
    const params: unknown[] = [];
    let where = "WHERE c.activo = true AND b.activo = true";
    if (search) {
      params.push(`%${search}%`);
      where += " AND b.nombre ILIKE $1";
    }
    const { rows } = await pool.query(
      `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal,
              c.direccion_entrega, c.horario_entrega
         FROM clients c JOIN businesses b ON b.id = c.business_id
         ${where} ORDER BY b.nombre, c.sucursal NULLS FIRST LIMIT 20`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar clientes." });
  }
});

router.get("/clients/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal, c.codigo_cliente,
              c.razon_social, c.rut, c.direccion_facturacion,
              c.direccion_entrega, c.horario_entrega
         FROM clients c JOIN businesses b ON b.id = c.business_id
        WHERE c.id = $1`,
      [req.params.id]
    );
    if (!rows.length) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar el cliente." });
  }
});

router.get("/clients/:id/phones", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT phone, label FROM client_phones
        WHERE client_id = $1 AND activo = true ORDER BY id`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar teléfonos del cliente." });
  }
});

/** Productos del negocio dueño de esa sucursal, con precio y stock. */
router.get("/clients/:id/products", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT bp.product_id, bp.precio AS precio_cliente, bp.precio, bp.stock,
              p.nombre, p.codigo_prod, p.unidad
         FROM clients c
         JOIN business_products bp ON bp.business_id = c.business_id
         JOIN products p ON p.id = bp.product_id
        WHERE c.id = $1 AND bp.activo = true AND p.activo = true
        ORDER BY p.nombre`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar productos del cliente." });
  }
});

router.get("/businesses/:id/products", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT bp.product_id, bp.precio, bp.stock, bp.stock_minimo,
              p.nombre, p.codigo_prod, p.unidad
         FROM business_products bp JOIN products p ON p.id = bp.product_id
        WHERE bp.business_id = $1 AND bp.activo = true
        ORDER BY p.nombre`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar productos del negocio." });
  }
});

/** Alta de sucursal. Si el negocio no existe, se crea. */
router.post("/clients", async (req, res) => {
  const b = req.body as Record<string, string>;
  if (!b.negocio) {
    res.status(400).json({ error: "El campo negocio es requerido." });
    return;
  }
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const negocio = await cliente.query(
      `INSERT INTO businesses (nombre) VALUES ($1)
       ON CONFLICT (nombre) DO UPDATE SET updated_at = NOW() RETURNING id`,
      [b.negocio.trim()]
    );
    const { rows } = await cliente.query(
      `INSERT INTO clients (business_id, codigo_cliente, sucursal, razon_social, rut,
                            direccion_facturacion, direccion_entrega, horario_entrega, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [negocio.rows[0].id, b.codigo_cliente || null, b.sucursal || null, b.razon_social || null,
       b.rut || null, b.direccion_facturacion || null, b.direccion_entrega || null,
       b.horario_entrega || null, b.activo !== "false"]
    );
    await cliente.query("COMMIT");
    res.json({ id: rows[0].id, business_id: negocio.rows[0].id });
  } catch (err) {
    await cliente.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al crear el cliente." });
  } finally {
    cliente.release();
  }
});

router.post("/clients/:id/phones", async (req, res) => {
  const { phone, label } = req.body as Record<string, string>;
  if (!phone) {
    res.status(400).json({ error: "El campo phone es requerido." });
    return;
  }
  try {
    await pool.query("INSERT INTO client_phones (client_id, phone, label) VALUES ($1,$2,$3)",
      [req.params.id, phone, label || null]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el teléfono." });
  }
});

/** Asigna un producto al negocio de esa sucursal (con precio y stock inicial). */
router.post("/clients/:id/products", async (req, res) => {
  const { product_id, precio, precio_cliente, stock } = req.body as Record<string, string>;
  if (!product_id) {
    res.status(400).json({ error: "El campo product_id es requerido." });
    return;
  }
  try {
    await pool.query(
      `INSERT INTO business_products (business_id, product_id, precio, stock)
       SELECT c.business_id, $2, $3, $4 FROM clients c WHERE c.id = $1
       ON CONFLICT (business_id, product_id) DO NOTHING`,
      [req.params.id, product_id,
       precio ?? precio_cliente ? parseFloat(String(precio ?? precio_cliente)) : null,
       parseInt(stock || "0", 10) || 0]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el producto." });
  }
});

/**
 * Alta de orden. El descuento de stock lo hace el trigger de la base, así que
 * también aplica si el pedido se inserta por fuera de esta API.
 *
 * items: [{ product_id | codigo_prod | nombre, cantidad, precio_unitario }]
 */
router.post("/orders", async (req, res) => {
  const { client_id, business_id, negocio, phone, status, items, total, notas } = req.body as {
    client_id?: number; business_id?: number; negocio?: string; phone?: string | null;
    status?: string; items?: unknown; total?: number; notas?: string;
  };
  try {
    let negocioId = business_id ?? null;
    if (!negocioId && client_id) {
      const { rows } = await pool.query("SELECT business_id FROM clients WHERE id = $1", [client_id]);
      negocioId = rows[0]?.business_id ?? null;
    }
    if (!negocioId && negocio) {
      const { rows } = await pool.query("SELECT id FROM businesses WHERE nombre ILIKE $1", [negocio]);
      negocioId = rows[0]?.id ?? null;
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (business_id, client_id, negocio, phone, status, items, total, raw_data)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8::jsonb) RETURNING id`,
      [negocioId, client_id || null, negocio || null, phone || "",
       status || "pendiente", JSON.stringify(items || []),
       parseFloat(String(total)) || 0, notas ? JSON.stringify({ notas }) : null]
    );

    // Devolvemos cómo quedó el stock: si algo entró en negativo, el que llama
    // se entera en la misma respuesta.
    const { rows: movimientos } = await pool.query(
      `SELECT p.nombre, sm.delta, sm.stock_result
         FROM stock_movements sm JOIN products p ON p.id = sm.product_id
        WHERE sm.order_id = $1 ORDER BY sm.id`,
      [rows[0].id]
    );
    res.json({
      id: rows[0].id,
      stock: movimientos,
      faltantes: movimientos.filter((m: { stock_result: number }) => m.stock_result < 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la orden." });
  }
});

export default router;
