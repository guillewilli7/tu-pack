"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Boton, Etiqueta, Td } from "./ui";

export type FilaStockDatos = {
  business_id: number; negocio: string; product_id: number; producto: string;
  unidad: string | null; precio: string | null; stock: number; stock_minimo: number | null;
  locales_que_comparten: string;
};

export function FilaStock({
  f, guardar,
}: {
  f: FilaStockDatos;
  guardar: (stock: string, minimo: string) => Promise<void>;
}) {
  const [stock, setStock] = useState(String(f.stock));
  const [minimo, setMinimo] = useState(f.stock_minimo == null ? "" : String(f.stock_minimo));
  const [pendiente, iniciar] = useTransition();

  const sucio = stock !== String(f.stock) || minimo !== (f.stock_minimo == null ? "" : String(f.stock_minimo));
  const bajoMinimo = f.stock_minimo != null && f.stock <= f.stock_minimo;
  const campo = "h-8 rounded-lg border border-borde bg-superficie px-2 text-sm text-right num outline-none focus:border-marca focus:ring-2 focus:ring-marca/20";

  return (
    <tr className="hover:bg-superficie-2 transition">
      <Td>
        <Link href={`/clientes/${f.business_id}`} className="font-medium hover:text-marca">{f.negocio}</Link>
        {Number(f.locales_que_comparten) > 0 && (
          <span className="ml-2"><Etiqueta tono="marca">depósito de {f.locales_que_comparten} locales más</Etiqueta></span>
        )}
      </Td>
      <Td>{f.producto}</Td>
      <Td className="text-right num text-texto-suave">
        {f.precio == null ? <Etiqueta tono="alerta">sin precio</Etiqueta> : `$ ${Number(f.precio).toFixed(2)}`}
      </Td>
      <Td>
        <div className="flex items-center gap-2 justify-end">
          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number"
                 className={`${campo} w-24 ${f.stock < 0 ? "border-peligro text-peligro font-semibold" : ""}`} />
          <input value={minimo} onChange={(e) => setMinimo(e.target.value)} type="number" placeholder="mín."
                 className={`${campo} w-20`} />
          {f.stock < 0 ? <Etiqueta tono="peligro">faltan {Math.abs(f.stock)}</Etiqueta>
            : bajoMinimo ? <Etiqueta tono="alerta">bajo mínimo</Etiqueta> : null}
          <Boton medida="sm" variante={sucio ? "primario" : "neutro"} disabled={!sucio || pendiente}
                 onClick={() => iniciar(async () => { await guardar(stock, minimo); })}>
            {pendiente ? "…" : "Guardar"}
          </Boton>
        </div>
      </Td>
    </tr>
  );
}
