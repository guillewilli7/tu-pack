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

export default router;
