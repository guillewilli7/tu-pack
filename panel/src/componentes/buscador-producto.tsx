"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ItemCatalogo = { id: number; nombre: string; codigo_prod: string | null };

/**
 * Buscador para elegir un producto del catálogo. El catálogo entero ya viene
 * del servidor, así que filtra en el navegador: no hay espera entre tecla y
 * resultado. Deja el id en un input oculto para que el form siga siendo el
 * mismo de siempre.
 */
export function BuscadorProducto({
  catalogo, name = "product_id", etiqueta = "Agregar producto",
}: {
  catalogo: ItemCatalogo[];
  name?: string;
  etiqueta?: string;
}) {
  const [texto, setTexto] = useState("");
  const [elegido, setElegido] = useState<ItemCatalogo | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(0);
  const caja = useRef<HTMLDivElement>(null);

  const coincidencias = useMemo(() => {
    const q = texto.trim().toLowerCase();
    if (!q) return [];
    return catalogo
      .filter((p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.codigo_prod ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [texto, catalogo]);

  const limpiar = () => { setTexto(""); setElegido(null); setAbierto(false); setResaltado(0); };

  // El form se resetea solo cuando la acción del servidor termina bien; el
  // estado de acá no se entera, así que lo limpiamos con el mismo evento.
  useEffect(() => {
    const form = caja.current?.closest("form");
    form?.addEventListener("reset", limpiar);
    return () => form?.removeEventListener("reset", limpiar);
  }, []);

  useEffect(() => {
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, []);

  const elegir = (p: ItemCatalogo) => {
    setElegido(p);
    setTexto(p.nombre);
    setAbierto(false);
    setResaltado(0);
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (!abierto || !coincidencias.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setResaltado((i) => (i + 1) % coincidencias.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltado((i) => (i - 1 + coincidencias.length) % coincidencias.length);
    } else if (e.key === "Enter") {
      // Sin esto, Enter enviaría el form con el producto todavía sin elegir.
      e.preventDefault();
      elegir(coincidencias[resaltado]);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  };

  return (
    <div className="relative" ref={caja}>
      <input type="hidden" name={name} value={elegido?.id ?? ""} />
      <label className="block">
        <span className="block mb-1.5 text-[13px] font-medium text-texto-suave">{etiqueta}</span>
        <input
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setElegido(null);
            setAbierto(true);
            setResaltado(0);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={teclas}
          placeholder="Escribí el nombre o el código…"
          autoComplete="off"
          className={`w-full h-10 rounded-xl border bg-superficie px-3.5 text-sm outline-none transition
            focus:border-marca focus:ring-2 focus:ring-marca/20
            ${elegido ? "border-marca" : "border-borde"}`}
        />
      </label>

      {abierto && !!coincidencias.length && (
        <ul className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-borde
          bg-superficie shadow-lg">
          {coincidencias.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onMouseEnter={() => setResaltado(i)}
                onClick={() => elegir(p)}
                className={`w-full px-3.5 py-2.5 text-left text-sm transition cursor-pointer
                  ${i === resaltado ? "bg-superficie-2" : "hover:bg-superficie-2"}`}
              >
                <span className="font-medium">{p.nombre}</span>
                {p.codigo_prod && (
                  <span className="ml-2 text-xs text-texto-suave num">{p.codigo_prod}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {abierto && texto.trim() && !coincidencias.length && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-borde bg-superficie
          shadow-lg px-3.5 py-2.5 text-sm text-texto-suave">
          Ningún producto coincide con “{texto.trim()}”.
        </div>
      )}
    </div>
  );
}
