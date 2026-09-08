import Link from "next/link";
import { listarOrdenes } from "@/lib/consultas";
import { ESTADOS_ORDEN, fecha, pesos, type EstadoOrden } from "@/lib/formato";
import { Tarjeta, Tabla, Th, Td, Vacio, Etiqueta, BotonLink, Boton, Titulo, Campo, Selector, Inicial } from "@/componentes/ui";

export const metadata = { title: "Órdenes" };

const ESTADOS = [
  ["todas", "Todas"], ["pendiente", "Pendientes"], ["en_proceso", "En proceso"],
  ["completada", "Completadas"], ["cancelado", "Canceladas"], ["eliminadas", "Eliminadas"],
] as const;

export default async function Ordenes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const { filas, total, pagina, paginas } = await listarOrdenes({
    estado: p.estado ?? "todas",
    desde: p.desde, hasta: p.hasta, q: p.q,
    pagina: Number(p.pagina ?? 1),
  });

  const link = (destino: number) => {
    const qs = new URLSearchParams(
      Object.entries({ ...p, pagina: String(destino) }).filter(([, v]) => v) as [string, string][]
    );
    return `/ordenes?${qs.toString()}`;
  };

  return (
    <>
      <Titulo bajada="Lo que entró por WhatsApp y lo que cargás a mano"
              accion={<BotonLink href="/ordenes/nueva" variante="primario">+ Nueva orden</BotonLink>}>
        Órdenes
      </Titulo>

      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_170px_150px_150px_auto] lg:items-end">
        <Campo etiqueta="Cliente" name="q" defaultValue={p.q ?? ""} placeholder="Nombre del negocio…" />
        <Selector etiqueta="Estado" name="estado" defaultValue={p.estado ?? "todas"}>
          {ESTADOS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </Selector>
        <Campo etiqueta="Desde" name="desde" type="date" defaultValue={p.desde ?? ""} />
        <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={p.hasta ?? ""} />
        <div className="flex gap-2">
          <Boton variante="primario" type="submit">Filtrar</Boton>
          <BotonLink href="/ordenes">Limpiar</BotonLink>
        </div>
      </form>

      <Tarjeta
        ajustado
        titulo={<>Órdenes <span className="text-texto-suave font-normal">({total})</span></>}
        pie={paginas > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-texto-suave">Página {pagina} de {paginas}</span>
            <div className="ml-auto flex gap-2">
              {pagina > 1 && <BotonLink medida="sm" href={link(pagina - 1)}>← Anterior</BotonLink>}
              {pagina < paginas && <BotonLink medida="sm" href={link(pagina + 1)}>Siguiente →</BotonLink>}
            </div>
          </div>
        )}
      >
        <Tabla>
          <thead>
            <tr>
              <Th className="w-16">#</Th>
              <Th className="w-28">Fecha</Th>
              <Th>Cliente</Th>
              <Th className="w-44">Estado</Th>
              <Th className="w-32 text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {!filas.length && <Vacio cols={5}>No hay órdenes con estos filtros.</Vacio>}
            {filas.map((o) => {
              const estado = ESTADOS_ORDEN[o.status as EstadoOrden] ?? { texto: o.status, tono: "gris" as const };
              return (
                <tr key={o.id} className="hover:bg-superficie-2 transition">
                  <Td className="text-texto-suave num">
                    <Link href={`/ordenes/${o.id}`} className="block hover:text-marca">#{o.id}</Link>
                  </Td>
                  <Td className="text-texto-suave num">
                    <Link href={`/ordenes/${o.id}`} className="block">{fecha(o.created_at)}</Link>
                  </Td>
                  <Td>
                    <Link href={`/ordenes/${o.id}`} className="flex items-center gap-3">
                      <Inicial nombre={o.client_negocio ?? o.negocio ?? "?"} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{o.client_negocio ?? o.negocio ?? "—"}</span>
                        {o.sucursal && <span className="block text-xs text-texto-suave">{o.sucursal}</span>}
                      </span>
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`/ordenes/${o.id}`} className="flex gap-1.5">
                      <Etiqueta punto tono={estado.tono}>{estado.texto}</Etiqueta>
                      {o.eliminada && <Etiqueta>Eliminada</Etiqueta>}
                    </Link>
                  </Td>
                  <Td className="text-right num font-medium">
                    <Link href={`/ordenes/${o.id}`} className="block">{pesos(o.total)}</Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Tabla>
      </Tarjeta>
    </>
  );
}
