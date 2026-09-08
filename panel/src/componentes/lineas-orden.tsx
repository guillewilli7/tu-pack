"use client";

import { useState } from "react";
import type { CatalogoItem, ItemOrden } from "@/lib/consultas";
import type { LineaPedido } from "@/acciones/ordenes";
import { EditorLineas } from "./editor-lineas";
import { Tarjeta, Tabla, Th, Td, Vacio, Boton } from "./ui";

const plata = (n: unknown) =>
  "$ " + Number(n ?? 0).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function LineasOrden({
  items, catalogo, editable, guardar,
}: {
  items: ItemOrden[];
  catalogo: CatalogoItem[];
  editable: boolean;
  guardar: (lineas: LineaPedido[]) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);

  // Lo que la orden ya tiene descontado: sirve para proyectar bien el stock.
  const originales: Record<number, number> = {};
  for (const i of items) {
    if (i.product_id) originales[i.product_id] = (originales[i.product_id] ?? 0) + Number(i.cantidad ?? 0);
  }

  if (editando) {
    return (
      <Tarjeta ajustado titulo="Artículos del pedido">
        <EditorLineas
          catalogo={catalogo}
          cantidadesOriginales={originales}
          iniciales={items.map((i) => ({
            product_id: Number(i.product_id ?? 0),
            cantidad: Number(i.cantidad ?? 0),
            precio_unitario: Number(i.precio_unitario ?? 0),
          }))}
          textoGuardar="Guardar líneas"
          onCancelar={() => setEditando(false)}
          onGuardar={async (lineas) => { await guardar(lineas); setEditando(false); }}
          extra={
            <p className="text-xs text-texto-suave">
              Al guardar se recalculan el total, el stock y el cargo en la cuenta del cliente.
            </p>
          }
        />
      </Tarjeta>
    );
  }

  return (
    <Tarjeta
      ajustado
      titulo="Artículos del pedido"
      accion={editable && <Boton medida="sm" onClick={() => setEditando(true)}>Editar líneas</Boton>}
    >
      <Tabla>
        <thead>
          <tr>
            <Th>Producto</Th>
            <Th className="w-24 text-right">Cantidad</Th>
            <Th className="w-32 text-right">Precio unit.</Th>
            <Th className="w-32 text-right">Subtotal</Th>
          </tr>
        </thead>
        <tbody>
          {!items.length && <Vacio cols={4}>Esta orden no tiene artículos.</Vacio>}
          {items.map((i, n) => (
            <tr key={n}>
              <Td>
                <span className="font-medium">{i.nombre_catalogo ?? i.nombre ?? "—"}</span>
                {i.codigo_prod && <span className="ml-2 text-xs text-texto-suave">{i.codigo_prod}</span>}
              </Td>
              <Td className="text-right num">{i.cantidad ?? "—"}</Td>
              <Td className="text-right num">{i.precio_unitario != null ? plata(i.precio_unitario) : "—"}</Td>
              <Td className="text-right num font-medium">{i.subtotal != null ? plata(i.subtotal) : "—"}</Td>
            </tr>
          ))}
        </tbody>
      </Tabla>
    </Tarjeta>
  );
}
