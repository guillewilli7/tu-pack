import Link from "next/link";
import { notFound } from "next/navigation";
import { traerOrden } from "@/lib/consultas";
import { ESTADOS_ORDEN, fechaHora, pesos, type EstadoOrden } from "@/lib/formato";
import { accionOrden, guardarLineas, type LineaPedido } from "@/acciones/ordenes";
import { LineasOrden } from "@/componentes/lineas-orden";
import { AccionesOrden } from "@/componentes/acciones-orden";
import { Tarjeta, Titulo, BotonLink, Etiqueta, Dato, Tabla, Th, Td, Vacio, Aviso } from "@/componentes/ui";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Orden #${id}` };
}

export default async function DetalleOrden({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const datos = await traerOrden(Number(id));
  if (!datos) notFound();

  const { orden, items, movimientos, catalogo } = datos;
  const estadoActual = String(orden.status);
  const eliminada = Boolean(orden.eliminada);
  const estado = ESTADOS_ORDEN[estadoActual as EstadoOrden] ?? { texto: estadoActual, tono: "gris" as const };
  const notas = (orden.raw_data as { notas?: string } | null)?.notas;

  async function ejecutar(accion: string, valor?: string) {
    "use server";
    await accionOrden(Number(id), accion, valor);
  }
  async function guardar(lineas: LineaPedido[]) {
    "use server";
    await guardarLineas(Number(id), lineas);
  }

  return (
    <>
      <Titulo accion={<BotonLink href="/ordenes">← Volver</BotonLink>}>Orden #{String(orden.id)}</Titulo>

      {eliminada && (
        <Aviso tono="alerta">
          Esta orden está <strong>eliminada</strong>
          {orden.eliminada_at ? ` desde el ${fechaHora(orden.eliminada_at)}` : ""}
          {orden.eliminada_por ? ` (${String(orden.eliminada_por)})` : ""}. No aparece en las listas ni
          en la cuenta del cliente. Restaurala para volver a trabajarla.
        </Aviso>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px] items-start">
        <Tarjeta titulo="Información">
          <Dato etiqueta="Fecha">{fechaHora(orden.created_at)}</Dato>
          <Dato etiqueta="Cliente">
            <strong>{String(orden.negocio_nombre ?? orden.negocio ?? "—")}</strong>
          </Dato>
          <Dato etiqueta="Sucursal">{String(orden.sucursal ?? "—")}</Dato>
          <Dato etiqueta="Entrega">
            {[orden.direccion_entrega, orden.horario_entrega].filter(Boolean).join(" — ") || "—"}
          </Dato>
          <Dato etiqueta="Teléfono">{String(orden.phone || "—")}</Dato>
          <Dato etiqueta="Estado">
            <span className="flex gap-1.5">
              <Etiqueta tono={estado.tono}>{estado.texto}</Etiqueta>
              {eliminada && <Etiqueta>Eliminada</Etiqueta>}
            </span>
          </Dato>
          <Dato etiqueta="Total">
            <strong className="num text-base">{pesos(orden.total)}</strong>
          </Dato>
          {notas && <Dato etiqueta="Notas"><span className="whitespace-pre-wrap">{notas}</span></Dato>}
          {!!orden.business_id && (
            <Dato etiqueta="Ficha">
              <Link href={`/clientes/${String(orden.business_id)}`} className="text-marca hover:underline">
                Ver cliente, stock y cuenta →
              </Link>
            </Dato>
          )}
        </Tarjeta>

        <Tarjeta titulo="Acciones">
          <AccionesOrden
            ejecutar={ejecutar}
            estado={estadoActual}
            eliminada={eliminada}
            total={Number(orden.total ?? 0)}
          />
        </Tarjeta>
      </div>

      <LineasOrden items={items} catalogo={catalogo} editable={!eliminada} guardar={guardar} />

      <Tarjeta ajustado titulo="Impacto en el stock">
        <Tabla>
          <thead>
            <tr>
              <Th>Producto</Th>
              <Th className="w-32 text-right">Movimiento</Th>
              <Th className="w-36 text-right">Stock resultante</Th>
              <Th className="w-32">Motivo</Th>
            </tr>
          </thead>
          <tbody>
            {!movimientos.length && (
              <Vacio cols={4}>Esta orden no movió stock: ningún ítem coincidió con un producto del cliente.</Vacio>
            )}
            {movimientos.map((m, n) => (
              <tr key={n}>
                <Td className="font-medium">{m.nombre}</Td>
                <Td className="text-right num">{m.delta > 0 ? `+${m.delta}` : m.delta}</Td>
                <Td className="text-right num">
                  {m.stock_result < 0 ? <Etiqueta tono="peligro">{m.stock_result}</Etiqueta> : m.stock_result}
                </Td>
                <Td className="text-texto-suave">{m.motivo}</Td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      </Tarjeta>
    </>
  );
}
