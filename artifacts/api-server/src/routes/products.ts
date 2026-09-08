import { Router } from "express";
import { pool } from "../db";

const router = Router();

/** Los productos dados de baja no se borran: dejan de listarse acá y de
 *  ofrecerse en los pedidos, pero siguen en las órdenes viejas. */
const ESTADOS: Record<string, string> = {
  activos: "activo",
  inactivos: "NOT activo",
  todos: "true",
};

router.get("/", async (req, res) => {
  const { search, success, error: qErr, estado } = req.query as Record<string, string>;
  const clave = estado && ESTADOS[estado] ? estado : "activos";
  try {
    let query = `SELECT id, codigo_prod, nombre, descripcion, unidad, costo, activo
                   FROM products WHERE ${ESTADOS[clave]}`;
    const params: unknown[] = [];
    if (search) {
      query += ` AND (nombre ILIKE $1 OR codigo_prod ILIKE $1)`;
      params.push(`%${search}%`);
    }
    query += " ORDER BY nombre";
    const { rows } = await pool.query(query, params);
    res.render("products/index", {
      products: rows,
      search: search || "",
      estado: clave,
      nombre: req.session.nombre,
      success: success ? "Producto guardado correctamente." : null,
      error: qErr ? "Error al guardar el producto. Verifique los datos e intente nuevamente." : null,
    });
  } catch (err) {
    console.error(err);
    res.render("products/index", {
      products: [],
      search: "",
      estado: "activos",
      nombre: req.session.nombre,
      success: null,
      error: "Error al cargar productos.",
    });
  }
});

router.post("/add", async (req, res) => {
  const { codigo_prod, nombre, descripcion, unidad, costo } = req.body as Record<string, string>;
  try {
    await pool.query(
      "INSERT INTO products (codigo_prod, nombre, descripcion, unidad, costo, activo, created_at) VALUES ($1,$2,$3,$4,$5,true,NOW())",
      [codigo_prod, nombre, descripcion, unidad, parseFloat(costo) || 0]
    );
    res.redirect("/products?success=1");
  } catch (err) {
    console.error(err);
    res.redirect("/products?error=1");
  }
});

router.post("/:id/update", async (req, res) => {
  const { nombre, descripcion, unidad, costo, activo } = req.body as Record<string, string>;
  try {
    await pool.query(
      "UPDATE products SET nombre=$1, descripcion=$2, unidad=$3, costo=$4, activo=$5 WHERE id=$6",
      [nombre, descripcion, unidad, parseFloat(costo) || 0, activo === "true", req.params.id]
    );
    res.redirect("/products?success=1");
  } catch (err) {
    console.error(err);
    res.redirect("/products?error=1");
  }
});

router.post("/:id/deactivate", async (req, res) => {
  try {
    await pool.query("UPDATE products SET activo=false WHERE id=$1", [req.params.id]);
    res.redirect("/products?success=1");
  } catch (err) {
    console.error(err);
    res.redirect("/products?error=1");
  }
});

router.post("/:id/restore", async (req, res) => {
  try {
    await pool.query("UPDATE products SET activo=true WHERE id=$1", [req.params.id]);
    res.redirect("/products?success=1&estado=activos");
  } catch (err) {
    console.error(err);
    res.redirect("/products?error=1");
  }
});

export default router;
