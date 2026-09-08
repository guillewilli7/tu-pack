"use client";

import { useState, useTransition } from "react";
import { Boton, Campo, Etiqueta, Td } from "./ui";

export type ProductoCatalogo = {
  id: number; codigo_prod: string | null; nombre: string; descripcion: string | null;
  unidad: string | null; costo: string | null; activo: boolean; negocios: string;
};

const plata = (n: unknown) =>
  "$ " + Number(n ?? 0).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function FilaCatalogo({
  p, guardar, cambiarEstado,
}: {
  p: ProductoCatalogo;
  guardar: (datos: FormData) => Promise<void>;
  cambiarEstado: (activo: boolean) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [pendiente, iniciar] = useTransition();

  if (editando) {
    return (
      <tr className="bg-superficie-2">
        <Td className="text-texto-suave num">{p.codigo_prod ?? "—"}</Td>
        <Td colSpan={5}>
          <form
            action={async (datos) => { await guardar(datos); setEditando(false); }}
            className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_120px_auto] sm:items-end"
          >
            <Campo etiqueta="Nombre" name="nombre" defaultValue={p.nombre} required />
            <Campo etiqueta="Descripción" name="descripcion" defaultValue={p.descripcion ?? ""} />
            <Campo etiqueta="Unidad" name="unidad" defaultValue={p.unidad ?? "unidad"} />
            <Campo etiqueta="Costo" name="costo" type="number" step="0.01" defaultValue={Number(p.costo ?? 0).toFixed(2)} />
            <div className="flex gap-2">
              <Boton variante="primario" type="submit">Guardar</Boton>
              <Boton type="button" onClick={() => setEditando(false)}>Cancelar</Boton>
            </div>
          </form>
        </Td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-superficie-2 transition">
      <Td className="text-texto-suave num">{p.codigo_prod ?? "—"}</Td>
      <Td>
        <span className="font-medium">{p.nombre}</span>
        {p.descripcion && <div className="text-xs text-texto-suave">{p.descripcion}</div>}
      </Td>
      <Td className="text-texto-suave">{p.unidad ?? "—"}</Td>
      <Td className="text-right num">{plata(p.costo)}</Td>
      <Td className="text-right num text-texto-suave">{p.negocios}</Td>
      <Td>
        <div className="flex gap-2 justify-end">
          <Boton medida="sm" onClick={() => setEditando(true)}>Editar</Boton>
          {p.activo ? (
            <Boton
              medida="sm" variante="peligro" disabled={pendiente}
              onClick={() => {
                if (!window.confirm(`¿Dar de baja ${p.nombre}? Deja de ofrecerse, pero no se borra ni se tocan las órdenes viejas.`)) return;
                iniciar(async () => { await cambiarEstado(false); });
              }}
            >
              Dar de baja
            </Boton>
          ) : (
            <Boton medida="sm" variante="primario" disabled={pendiente}
                   onClick={() => iniciar(async () => { await cambiarEstado(true); })}>
              Reactivar
            </Boton>
          )}
        </div>
      </Td>
    </tr>
  );
}

export function EtiquetaEstado({ activo }: { activo: boolean }) {
  return activo ? <Etiqueta tono="ok">Activo</Etiqueta> : <Etiqueta tono="peligro">De baja</Etiqueta>;
}
