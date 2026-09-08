"use client";

import { useMemo, useState, useTransition } from "react";
import type { CatalogoItem } from "@/lib/consultas";
import type { LineaPedido } from "@/acciones/ordenes";
import { Boton, Etiqueta, Tabla, Td, Th, Aviso } from "./ui";

const plata = (n: number) =>
  "$ " + n.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export type Linea = LineaPedido & { clave: number };

/**
 * Editor de líneas de un pedido. Muestra el stock que va a quedar después de
 * guardar (contando lo que la orden ya tenía descontado, si se está editando)
 * y avisa cuando no alcanza, pero nunca frena: TuPack no pierde un pedido por
 * falta de stock.
 */
export function EditorLineas({
  catalogo, iniciales, cantidadesOriginales = {}, textoGuardar = "Guardar",
  onGuardar, onCancelar, extra,
}: {
  catalogo: CatalogoItem[];
  iniciales: LineaPedido[];
  cantidadesOriginales?: Record<number, number>;
  textoGuardar?: string;
  onGuardar: (lineas: LineaPedido[]) => Promise<void>;
  onCancelar?: () => void;
  extra?: React.ReactNode;
}) {
  const [lineas, setLineas] = useState<Linea[]>(
    iniciales.length
      ? iniciales.map((l, i) => ({ ...l, clave: i }))
      : [{ product_id: 0, cantidad: 1, precio_unitario: 0, clave: 0 }]
  );
  const [guardando, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const porId = useMemo(() => new Map(catalogo.map((p) => [p.product_id, p])), [catalogo]);

  const quedaria = (l: Linea) => {
    const p = porId.get(l.product_id);
    if (!p) return null;
    return Number(p.stock) + (cantidadesOriginales[l.product_id] ?? 0) - (l.cantidad || 0);
  };

  const total = lineas.reduce((s, l) => s + (l.cantidad || 0) * (l.precio_unitario || 0), 0);
  const faltantes = lineas
    .map((l) => ({ l, queda: quedaria(l) }))
    .filter((x) => x.l.product_id && x.queda !== null && x.queda < 0);

  const cambiar = (clave: number, campo: keyof LineaPedido, valor: number) =>
    setLineas((prev) =>
      prev.map((l) => {
        if (l.clave !== clave) return l;
        const nueva = { ...l, [campo]: valor };
        // Al elegir producto se trae su precio si la línea todavía no tenía uno.
        if (campo === "product_id" && !l.precio_unitario) {
          nueva.precio_unitario = Number(porId.get(valor)?.precio ?? 0);
        }
        return nueva;
      })
    );

  const guardar = () =>
    iniciar(async () => {
      setError(null);
      try {
        await onGuardar(lineas.filter((l) => l.product_id && l.cantidad > 0));
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });

  return (
    <div>
      <Tabla>
        <thead>
          <tr>
            <Th className="min-w-[240px]">Producto</Th>
            <Th className="w-24 text-right">Cantidad</Th>
            <Th className="w-32 text-right">Precio unit.</Th>
            <Th className="w-32 text-right">Subtotal</Th>
            <Th className="w-32">Stock queda</Th>
            <Th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {lineas.map((l) => {
            const queda = quedaria(l);
            return (
              <tr key={l.clave}>
                <Td>
                  <select
                    value={l.product_id || ""}
                    onChange={(e) => cambiar(l.clave, "product_id", Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-borde bg-superficie px-2 text-sm
                      outline-none focus:border-marca focus:ring-2 focus:ring-marca/20"
                  >
                    <option value="">— Elegir producto —</option>
                    {catalogo.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.nombre}{p.codigo_prod ? ` (${p.codigo_prod})` : ""} · stock {p.stock}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <input
                    type="number" min={0} step={1} value={l.cantidad}
                    onChange={(e) => cambiar(l.clave, "cantidad", Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-borde bg-superficie px-2 text-sm text-right num
                      outline-none focus:border-marca focus:ring-2 focus:ring-marca/20"
                  />
                </Td>
                <Td>
                  <input
                    type="number" min={0} step={0.01} value={l.precio_unitario}
                    onChange={(e) => cambiar(l.clave, "precio_unitario", Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-borde bg-superficie px-2 text-sm text-right num
                      outline-none focus:border-marca focus:ring-2 focus:ring-marca/20"
                  />
                </Td>
                <Td className="text-right num font-medium">
                  {plata((l.cantidad || 0) * (l.precio_unitario || 0))}
                </Td>
                <Td className="num">
                  {queda === null ? (
                    <span className="text-texto-suave">—</span>
                  ) : queda < 0 ? (
                    <Etiqueta tono="peligro">{queda}</Etiqueta>
                  ) : (
                    <span className="text-texto-suave">{queda}</span>
                  )}
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => setLineas((prev) => prev.filter((x) => x.clave !== l.clave))}
                    className="size-7 grid place-items-center rounded-md text-texto-suave
                      hover:bg-peligro-suave hover:text-peligro transition cursor-pointer"
                    aria-label="Quitar línea"
                  >
                    ✕
                  </button>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Tabla>

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Boton
            medida="sm"
            type="button"
            onClick={() =>
              setLineas((prev) => [
                ...prev,
                { product_id: 0, cantidad: 1, precio_unitario: 0, clave: Date.now() },
              ])
            }
          >
            + Agregar línea
          </Boton>
          <div className="ml-auto text-right">
            <div className="text-xs text-texto-suave">Total</div>
            <div className="font-display text-2xl font-bold num">{plata(total)}</div>
          </div>
        </div>

        {extra}

        {!!faltantes.length && (
          <Aviso tono="alerta">
            Sin stock suficiente en {faltantes.length} producto{faltantes.length > 1 ? "s" : ""}:{" "}
            {faltantes.map(({ l, queda }) => `${porId.get(l.product_id)?.nombre} (faltan ${Math.abs(queda!)})`).join(", ")}.
            El pedido se registra igual y el stock queda en negativo.
          </Aviso>
        )}

        {error && <Aviso tono="peligro">{error}</Aviso>}

        <div className="flex gap-2">
          <Boton variante="primario" type="button" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando…" : textoGuardar}
          </Boton>
          {onCancelar && (
            <Boton type="button" onClick={onCancelar} disabled={guardando}>Cancelar</Boton>
          )}
        </div>
      </div>
    </div>
  );
}
