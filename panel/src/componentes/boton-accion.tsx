"use client";

import { useTransition } from "react";
import { Boton } from "./ui";

/** Botón que dispara una acción del servidor, con confirmación opcional. */
export function BotonAccion({
  accion, confirmar, children, variante = "neutro", medida = "md", className,
}: {
  accion: () => Promise<void>;
  confirmar?: string;
  children: React.ReactNode;
  variante?: "primario" | "neutro" | "peligro" | "fantasma";
  medida?: "sm" | "md";
  className?: string;
}) {
  const [pendiente, iniciar] = useTransition();
  return (
    <Boton
      variante={variante}
      medida={medida}
      className={className}
      disabled={pendiente}
      onClick={() => {
        if (confirmar && !window.confirm(confirmar)) return;
        iniciar(async () => { await accion(); });
      }}
    >
      {pendiente ? "…" : children}
    </Boton>
  );
}
