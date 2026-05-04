import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  const { search } = req.query as Record<string, string>;
  try {
    let query = `SELECT id, codigo_cliente, negocio, sucursal, activo FROM clients WHERE 1=1`;
    const params: unknown[] = [];
    if (search) {
      query += ` AND (negocio ILIKE $1 OR codigo_cliente ILIKE $1)`;
      params.push(`%${search}%`);
    }
    query += " ORDER BY negocio";
    const { rows } = await pool.query(query, params);
    res.render("clients/index", {
      clients: rows,
      search: search || "",
      nombre: req.session.nombre,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.render("clients/index", {
      clients: [],
      search: "",
      nombre: req.session.nombre,
      error: "Error al cargar clientes.",
    });
  }
});

router.get("/new", (req, res) => {
  res.render("clients/new", { nombre: req.session.nombre, error: null });
});

router.get("/:id", async (req, res) => {
  const { success, error: qErr } = req.query as Record<string, string>;
  try {
    const [clientRes, productsRes, allProductsRes, phonesRes] = await Promise.all([
      pool.query("SELECT * FROM clients WHERE id = $1", [req.params.id]),
      pool.query(
        `SELECT cp.id AS cp_id, cp.precio_cliente, cp.activo AS cp_activo,
                p.id AS product_id, p.nombre, p.costo, p.codigo_prod, p.unidad
         FROM client_products cp
         JOIN products p ON p.id = cp.product_id
         WHERE cp.client_id = $1
         ORDER BY p.nombre`,
        [req.params.id]
      ),
      pool.query("SELECT id, nombre, codigo_prod FROM products WHERE activo = true ORDER BY nombre"),
      pool.query("SELECT * FROM client_phones WHERE client_id = $1 ORDER BY id", [req.params.id]),
    ]);
    if (!clientRes.rows.length) return res.redirect("/clients");
    res.render("clients/detail", {
      client: clientRes.rows[0],
      clientProducts: productsRes.rows,
      allProducts: allProductsRes.rows,
      phones: phonesRes.rows,
      nombre: req.session.nombre,
      success: success ? "Cambios guardados correctamente." : null,
      error: qErr ? "Error al guardar los cambios. Intente nuevamente." : null,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/clients");
  }
});

router.post("/:id/update", async (req, res) => {
  const { negocio, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, activo } =
    req.body as Record<string, string>;
  try {
    await pool.query(
      `UPDATE clients SET negocio=$1, sucursal=$2, razon_social=$3, rut=$4,
       direccion_facturacion=$5, direccion_entrega=$6, horario_entrega=$7,
       activo=$8, updated_at=NOW() WHERE id=$9`,
      [negocio, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, activo === "true", req.params.id]
    );
    res.redirect(`/clients/${req.params.id}?success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`/clients/${req.params.id}?error=1`);
  }
});

router.post("/:id/products/update-price", async (req, res) => {
  const { cp_id, precio_cliente } = req.body as Record<string, string>;
  try {
    await pool.query(
      "UPDATE client_products SET precio_cliente=$1, updated_at=NOW() WHERE id=$2 AND client_id=$3",
      [parseFloat(precio_cliente), cp_id, req.params.id]
    );
    res.redirect(`/clients/${req.params.id}?success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`/clients/${req.params.id}?error=1`);
  }
});

router.post("/:id/products/add", async (req, res) => {
  const { product_id, precio_cliente } = req.body as Record<string, string>;
  try {
    await pool.query(
      `INSERT INTO client_products (client_id, product_id, precio_cliente, activo, created_at, updated_at)
       VALUES ($1, $2, $3, true, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [req.params.id, product_id, parseFloat(precio_cliente) || 0]
    );
    res.redirect(`/clients/${req.params.id}?success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`/clients/${req.params.id}?error=1`);
  }
});

router.post("/:id/products/:cpId/remove", async (req, res) => {
  try {
    await pool.query("DELETE FROM client_products WHERE id=$1 AND client_id=$2", [
      req.params.cpId,
      req.params.id,
    ]);
    res.redirect(`/clients/${req.params.id}?success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`/clients/${req.params.id}?error=1`);
  }
});

router.post("/:id/phones/add", async (req, res) => {
  const { phone, label } = req.body as Record<string, string>;
  try {
    await pool.query(
      "INSERT INTO client_phones (client_id, phone, label, activo, created_at) VALUES ($1, $2, $3, true, NOW())",
      [req.params.id, phone, label]
    );
    res.redirect(`/clients/${req.params.id}?success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`/clients/${req.params.id}?error=1`);
  }
});

router.post("/:id/phones/:phoneId/deactivate", async (req, res) => {
  try {
    await pool.query("UPDATE client_phones SET activo=false WHERE id=$1 AND client_id=$2", [
      req.params.phoneId,
      req.params.id,
    ]);
    res.redirect(`/clients/${req.params.id}?success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`/clients/${req.params.id}?error=1`);
  }
});

export default router;
