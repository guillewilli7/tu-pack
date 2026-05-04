import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/products", async (req, res) => {
  const { search } = req.query as Record<string, string>;
  try {
    let query = "SELECT id, nombre, codigo_prod FROM products WHERE activo = true";
    const params: unknown[] = [];
    if (search) {
      query += " AND (nombre ILIKE $1 OR CAST(codigo_prod AS TEXT) ILIKE $1)";
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

router.get("/clients", async (req, res) => {
  const { search } = req.query as Record<string, string>;
  try {
    let query = `SELECT id, negocio, sucursal, direccion_entrega, horario_entrega
                 FROM clients WHERE activo = true`;
    const params: unknown[] = [];
    if (search) {
      query += " AND negocio ILIKE $1";
      params.push(`%${search}%`);
    }
    query += " ORDER BY negocio LIMIT 10";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar clientes." });
  }
});

router.get("/clients/:id/products", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cp.product_id, cp.precio_cliente, p.nombre, p.codigo_prod
       FROM client_products cp
       JOIN products p ON p.id = cp.product_id
       WHERE cp.client_id = $1 AND cp.activo = true AND p.activo = true
       ORDER BY p.nombre`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar productos del cliente." });
  }
});

router.get("/clients/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, negocio, sucursal, direccion_entrega, horario_entrega,
              codigo_cliente, razon_social, rut, direccion_facturacion
       FROM clients WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Cliente no encontrado." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar el cliente." });
  }
});

router.post("/clients", async (req, res) => {
  const { codigo_cliente, negocio, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, activo } =
    req.body as Record<string, string>;
  if (!negocio) {
    return res.status(400).json({ error: "El campo negocio es requerido." });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO clients
         (codigo_cliente, negocio, sucursal, razon_social, rut,
          direccion_facturacion, direccion_entrega, horario_entrega, activo, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
       RETURNING id`,
      [
        codigo_cliente || null,
        negocio,
        sucursal || null,
        razon_social || null,
        rut || null,
        direccion_facturacion || null,
        direccion_entrega || null,
        horario_entrega || null,
        activo !== "false",
      ]
    );
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el cliente." });
  }
});

router.post("/clients/:id/phones", async (req, res) => {
  const { phone, label } = req.body as Record<string, string>;
  if (!phone) return res.status(400).json({ error: "El campo phone es requerido." });
  try {
    await pool.query(
      "INSERT INTO client_phones (client_id, phone, label, activo, created_at) VALUES ($1,$2,$3,true,NOW())",
      [req.params.id, phone, label || null]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el teléfono." });
  }
});

router.post("/clients/:id/products", async (req, res) => {
  const { product_id, precio_cliente } = req.body as Record<string, string>;
  if (!product_id) return res.status(400).json({ error: "El campo product_id es requerido." });
  try {
    await pool.query(
      `INSERT INTO client_products (client_id, product_id, precio_cliente, activo, created_at, updated_at)
       VALUES ($1,$2,$3,true,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      [req.params.id, product_id, parseFloat(precio_cliente) || 0]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el producto." });
  }
});

router.post("/orders", async (req, res) => {
  const { client_id, negocio, phone, status, items, total, notas } = req.body as {
    client_id?: number;
    negocio?: string;
    phone?: string | null;
    status?: string;
    items?: unknown;
    total?: number;
    notas?: string;
  };
  try {
    const rawData = notas ? JSON.stringify({ notas }) : null;
    const { rows } = await pool.query(
      `INSERT INTO orders (client_id, negocio, phone, status, items, total, raw_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, NOW(), NOW())
       RETURNING id`,
      [
        client_id || null,
        negocio || null,
        phone || null,
        status || "pendiente",
        JSON.stringify(items || []),
        parseFloat(String(total)) || 0,
        rawData,
      ]
    );
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la orden." });
  }
});

export default router;
