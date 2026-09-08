"use client";

import { useState, useTransition } from "react";
import { Boton, Etiqueta, Td } from "./ui";

export type ProductoNegocio = {
  bp_id: number; product_id: number; nombre: string; codigo_prod: string | null;
  precio: string | null; stock: number; stock_minimo: number | null; notas: string | null; activo: boolean;
};

/**
 * Fila editable: precio, stock y mínimo se guardan juntos. El stock pasa por
 * la función de la base, así que cada cambio deja su movimiento.
 */
export function FilaProducto({
  p, guardar, quitar,
}: {
  p: ProductoNegocio;
  guardar: (productId: number, precio: string, stock: string, minimo: string) => Promise<void>;
  quitar: (bpId: number) => Promise<void>;
}) {
  const [precio, setPrecio] = useState(p.precio == null ? "" : Number(p.precio).toFixed(2));
  const [stock, setStock] = useState(String(p.stock));
  const [minimo, setMinimo] = useState(p.stock_minimo == null ? "" : String(p.stock_minimo));
  const [pendiente, iniciar] = useTransition();

  const sucio =
    precio !== (p.precio == null ? "" : Number(p.precio).toFixed(2)) ||
    stock !== String(p.stock) ||
    minimo !== (p.stock_minimo == null ? "" : String(p.stock_minimo));

  const bajoMinimo = p.stock_minimo != null && p.stock <= p.stock_minimo;
  const campo = "h-8 rounded-lg border border-borde bg-superficie px-2 text-sm text-right num outline-none focus:border-marca focus:ring-2 focus:ring-marca/20";

  return (
    <tr className="hover:bg-superficie-2 transition">
      <Td>
        <span className="font-medium">{p.nombre}</span>
        {p.codigo_prod && <span className="ml-2 text-xs text-texto-suave">{p.codigo_prod}</span>}
        {p.notas && <div className="text-xs text-texto-suave">{p.notas}</div>}
      </Td>
      <Td>
        <input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="a definir"
               type="number" step="0.01" className={`${campo} w-24`} />
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number"
                 className={`${campo} w-24 ${p.stock < 0 ? "border-peligro text-peligro font-semibold" : ""}`} />
          <input value={minimo} onChange={(e) => setMinimo(e.target.value)} type="number" placeholder="mín."
                 className={`${campo} w-20`} />
          {p.stock < 0 ? <Etiqueta tono="peligro">faltan {Math.abs(p.stock)}</Etiqueta>
            : bajoMinimo ? <Etiqueta tono="alerta">bajo mínimo</Etiqueta> : null}
        </div>
      </Td>
      <Td>
        <div className="flex gap-2 justify-end">
          <Boton
            medida="sm"
            variante={sucio ? "primario" : "neutro"}
            disabled={!sucio || pendiente}
            onClick={() => iniciar(async () => { await guardar(p.product_id, precio, stock, minimo); })}
          >
            {pendiente ? "…" : "Guardar"}
          </Boton>
          <Boton
            medida="sm"
            disabled={pendiente}
            onClick={() => {
              if (!window.confirm(`¿Quitar ${p.nombre} de este cliente? No se borra: queda en “productos quitados” con su stock.`)) return;
              iniciar(async () => { await quitar(p.bp_id); });
            }}
          >
            Quitar
          </Boton>
        </div>
      </Td>
    </tr>
  );
}
