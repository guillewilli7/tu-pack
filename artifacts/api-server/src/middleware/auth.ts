import type { Request, Response, NextFunction } from "express";

/** Panel: sin sesión no se ve nada, y se redirige al login. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

/**
 * API: entra la sesión del panel (para los buscadores de las pantallas) o una
 * API key en el header, que es como se conecta el agente de WhatsApp desde
 * n8n. Sin TUPACK_API_KEY configurada, la puerta por header queda cerrada.
 */
export function requireApiAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    return next();
  }
  const esperada = process.env.TUPACK_API_KEY;
  const recibida = req.get("x-api-key") ?? "";
  if (esperada && recibida && recibida === esperada) {
    return next();
  }
  res.status(401).json({ error: "No autorizado." });
}
