"use client";

import { useEffect, useState } from "react";

/** El `%` no aparece en los mensajes, así que decodificar de más es inocuo. */
const leer = (v: string) => {
  try { return decodeURIComponent(v); } catch { return v; }
};

export function Avisos({ aviso }: { aviso: string | null }) {
  const [visible, setVisible] = useState<string | null>(null);

  useEffect(() => {
    if (!aviso) return;
    document.cookie = "aviso=; path=/; max-age=0";
    setVisible(leer(aviso));
    const t = setTimeout(() => setVisible(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!visible) return null;

  const corte = visible.indexOf("|");
  const tono = visible.slice(0, corte);
  const mensaje = visible.slice(corte + 1);
  const malo = tono === "peligro";

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div
        role="status"
        onClick={() => setVisible(null)}
        className={`pointer-events-auto cursor-pointer flex items-center gap-2.5 rounded-xl px-4 py-3
          text-sm font-medium shadow-lg border aparece
          ${malo
            ? "bg-peligro-suave text-peligro border-peligro/20"
            : "bg-ok-suave text-ok border-ok/20"}`}
      >
        {malo ? (
          <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {mensaje}
      </div>
    </div>
  );
}
