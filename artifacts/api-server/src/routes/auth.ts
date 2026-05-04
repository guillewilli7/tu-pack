import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db";

const router = Router();

router.get("/login", (req, res) => {
  if ((req.session as any).userId) return res.redirect("/orders");
  res.render("login", { error: null });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const { rows } = await pool.query(
      "SELECT id, password, nombre FROM users WHERE email = $1 AND activo = true",
      [email]
    );
    if (!rows.length) {
      return res.render("login", { error: "Credenciales incorrectas." });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("login", { error: "Credenciales incorrectas." });
    }
    (req.session as any).userId = user.id;
    (req.session as any).nombre = user.nombre;
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Error de servidor. Intente nuevamente." });
  }
});

router.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

export default router;
