"use client";

import { useEffect, useRef, useState } from "react";
import type { CatalogoItem, Sucursal } from "@/lib/consultas";
import type { LineaPedido } from "@/acciones/ordenes";
import { EditorLineas } from "./editor-lineas";
import { Tarjeta, Campo, Dato, Saldo, Etiqueta } from "./ui";

type Cuenta = { saldo: number; saldo_usd: number };

export function NuevaOrden({
  crear,
}: {
  crear: (datos: { client_id: number; phone?: string; notas?: string; lineas: LineaPedido[] }) => Promise<void>;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [opciones, setOpciones] = useState<Sucursal[]>([]);
  const [elegida, setElegida] = useState<Sucursal | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [telefonos, setTelefonos] = useState<{ phone: string; label: string | null }[]>([]);
  const [telefono, setTelefono] = useState("");
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [notas, setNotas] = useState("");
  const caja = useRef<HTMLDivElement>(null);

  // Busca mientras se escribe, pero solo cuando el texto se queda quieto.
  useEffect(() => {
    if (!busqueda.trim() || elegida) {
      const vaciar = setTimeout(() => setOpciones([]), 0);
      return () => clearTimeout(vaciar);
    }
    const t = setTimeout(async () => {
      const r = await fetch(`/api/clients?search=${encodeURIComponent(busqueda)}`);
      setOpciones(r.ok ? await r.json() : []);
    }, 250);
    return () => clearTimeout(t);
  }, [busqueda, elegida]);

  async function elegir(s: Sucursal) {
    setElegida(s);
    setBusqueda(`${s.negocio}${s.sucursal ? " — " + s.sucursal : ""}`);
    setOpciones([]);
    const [prods, tels, cta] = await Promise.all([
      fetch(`/api/clients/${s.id}/products`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/clients/${s.id}/phones`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/businesses/${s.business_id}/cuenta`).then((r) => (r.ok ? r.json() : null)),
    ]);
    setCatalogo(prods);
    setTelefonos(tels);
    setTelefono(tels[0]?.phone ?? "");
    setCuenta(cta);
  }

  return (
    <>
      <Tarjeta desborde titulo="1 · Cliente">
        <div className="relative max-w-md" ref={caja}>
          <Campo
            etiqueta="Buscar negocio"
            value={busqueda}
            autoFocus
            placeholder="Escribí el nombre del negocio…"
            onChange={(e) => { setBusqueda(e.target.value); setElegida(null); }}
          />
          {!!opciones.length && (
            <ul className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-borde
              bg-superficie shadow-lg">
              {opciones.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => elegir(s)}
                    className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-superficie-2 transition cursor-pointer"
                  >
                    <span className="font-medium">{s.negocio}</span>
                    {s.sucursal && <span className="text-texto-suave"> — {s.sucursal}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {elegida && (
          <div className="mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            <Dato etiqueta="Negocio"><strong>{elegida.negocio}</strong></Dato>
            <Dato etiqueta="Sucursal">{elegida.sucursal ?? "única"}</Dato>
            <Dato etiqueta="Entrega">{elegida.direccion_entrega ?? "—"}</Dato>
            <Dato etiqueta="Horario">{elegida.horario_entrega ?? "—"}</Dato>
            <Dato etiqueta="Saldo en cuenta">
              {cuenta ? (
                <span className="flex items-center gap-2">
                  <Saldo valor={cuenta.saldo} />
                  {!!cuenta.saldo_usd && <Saldo valor={cuenta.saldo_usd} moneda="USD" />}
                </span>
              ) : "—"}
            </Dato>
            <Dato etiqueta="Teléfono">
              {telefonos.length ? (
                <select
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="h-8 rounded-lg border border-borde bg-superficie px-2 text-sm"
                >
                  {telefonos.map((t) => (
                    <option key={t.phone} value={t.phone}>
                      {t.phone}{t.label ? ` (${t.label})` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="099 123 456"
                  className="h-8 w-40 rounded-lg border border-borde bg-superficie px-2 text-sm"
                />
              )}
            </Dato>
          </div>
        )}
      </Tarjeta>

      {elegida && (
        <Tarjeta ajustado titulo={<>2 · Productos {!catalogo.length && <Etiqueta tono="alerta">este cliente no tiene productos cargados</Etiqueta>}</>}>
          <EditorLineas
            catalogo={catalogo}
            iniciales={[]}
            textoGuardar="Confirmar orden"
            onGuardar={(lineas) =>
              crear({ client_id: elegida.id, phone: telefono, notas: notas.trim() || undefined, lineas })
            }
            extra={
              <label className="block">
                <span className="block mb-1.5 text-[13px] font-medium text-texto-suave">Notas (opcional)</span>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-sm resize-y
                    outline-none focus:border-marca focus:ring-2 focus:ring-marca/20"
                  placeholder="Algo para tener en cuenta en la entrega…"
                />
              </label>
            }
          />
        </Tarjeta>
      )}
    </>
  );
}
