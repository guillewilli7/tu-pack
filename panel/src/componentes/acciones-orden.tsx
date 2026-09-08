"use client";

import { useState, useTransition } from "react";
import { Boton, Aviso } from "./ui";

type Ejecutar = (accion: string, valor?: string) => Promise<void>;

export function AccionesOrden({
  ejecutar, estado, eliminada, total,
}: {
  ejecutar: Ejecutar; estado: string; eliminada: boolean; total: number;
}) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [importe, setImporte] = useState(String(total));

  const correr = (accion: string, valor?: string, confirmar?: string) => {
    if (confirmar && !window.confirm(confirmar)) return;
    iniciar(async () => {
      setError(null);
      try { await ejecutar(accion, valor); }
      catch (e) { setError(e instanceof Error ? e.message : "No se pudo completar la acción."); }
    });
  };

  const cancelada = estado === "cancelado";
  const completada = estado === "completada" || estado === "confirmado";
  const puedeAvanzar = !eliminada && (estado === "pendiente" || estado === "en_proceso");
  // Volver atrás es tan común como avanzar: se marca completada de más y hay
  // que poder corregirlo sin cancelar la orden.
  const atras = eliminada ? null
    : completada ? { texto: "◀ Volver a en proceso" }
    : estado === "en_proceso" ? { texto: "◀ Volver a pendiente" }
    : null;

  return (
    <div className="flex flex-col gap-3">
      {error && <Aviso tono="peligro">{error}</Aviso>}

      {eliminada ? (
        <>
          <Boton variante="primario" disabled={pendiente} onClick={() => correr("restaurar")}>
            ↺ Restaurar orden
          </Boton>
          <p className="text-xs text-texto-suave">
            Vuelve como cancelada; para reactivarla usá “Volver a pendiente”.
          </p>
        </>
      ) : (
        <>
          {puedeAvanzar && (
            <Boton variante="primario" disabled={pendiente} onClick={() => correr("avanzar")}>
              {estado === "pendiente" ? "▶ Marcar en proceso" : "▶ Marcar completada"}
            </Boton>
          )}
          {atras && (
            <Boton disabled={pendiente} onClick={() => correr("retroceder")}>
              {atras.texto}
            </Boton>
          )}
          {!cancelada && (
            <Boton
              variante="peligro" disabled={pendiente}
              onClick={() => correr("cancelar", undefined,
                "¿Cancelar la orden? Vuelve el stock y se saca el cargo de la cuenta.")}
            >
              ✕ Cancelar orden
            </Boton>
          )}
          {cancelada && (
            <Boton disabled={pendiente} onClick={() => correr("reabrir")}>↺ Volver a pendiente</Boton>
          )}

          <div className="border-t border-borde pt-3">
            <span className="block mb-1.5 text-[13px] font-medium text-texto-suave">Total ($)</span>
            <div className="flex gap-2">
              <input
                type="number" step="0.01" value={importe}
                onChange={(e) => setImporte(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-borde bg-superficie px-3 text-sm num
                  outline-none focus:border-marca focus:ring-2 focus:ring-marca/20"
              />
              <Boton disabled={pendiente} onClick={() => correr("total", importe)}>Guardar</Boton>
            </div>
            <p className="mt-1.5 text-xs text-texto-suave">
              Si editás las líneas el total se recalcula solo.
            </p>
          </div>

          <div className="border-t border-borde pt-3">
            <Boton
              variante="peligro" className="w-full" disabled={pendiente}
              onClick={() => correr("eliminar", undefined,
                "¿Eliminar la orden? Se devuelve el stock y sale de la cuenta del cliente, pero queda guardada y se puede restaurar.")}
            >
              🗑 Eliminar orden
            </Boton>
          </div>
        </>
      )}

    </div>
  );
}
