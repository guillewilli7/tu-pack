/** Formateos que se repiten en todas las pantallas. */

export function pesos(valor: unknown, moneda: "UYU" | "USD" = "UYU") {
  const n = Number(valor ?? 0);
  const simbolo = moneda === "USD" ? "US$ " : "$ ";
  return (
    simbolo +
    n.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export function numero(valor: unknown) {
  return Number(valor ?? 0).toLocaleString("es-UY");
}

export function fecha(valor: unknown) {
  if (!valor) return "—";
  return new Date(valor as string).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fechaHora(valor: unknown) {
  if (!valor) return "—";
  return new Date(valor as string).toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ESTADOS_ORDEN = {
  pendiente: { texto: "Pendiente", tono: "alerta" },
  en_proceso: { texto: "En proceso", tono: "marca" },
  completada: { texto: "Completada", tono: "ok" },
  confirmado: { texto: "Completada", tono: "ok" },
  cancelado: { texto: "Cancelada", tono: "peligro" },
} as const;

export type EstadoOrden = keyof typeof ESTADOS_ORDEN;
