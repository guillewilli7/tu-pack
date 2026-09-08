import Link from "next/link";
import { consultar, unaFila } from "@/lib/db";
import { fecha, pesos } from "@/lib/formato";
import { Tarjeta, Tabla, Th, Td, Vacio, Titulo, Campo, Boton, BotonLink, Selector, Saldo, Etiqueta, Indicador, Inicial } from "@/componentes/ui";

export const metadata = { title: "Cuentas" };

const FILTROS: Record<string, string> = {
  deudores: "saldo > 0 OR saldo_usd > 0",
  a_favor: "saldo < 0 OR saldo_usd < 0",
  en_cero: "saldo = 0 AND saldo_usd = 0",
  todos: "true",
};

type Cuenta = {
  id: number; nombre: string; saldo: string; saldo_usd: string;
  ultimo_movimiento: string | null; movimientos: string;
};

export default async function Cuentas({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filtro?: string }>;
}) {
  const { q, filtro } = await searchParams;
  const clave = filtro && FILTROS[filtro] ? filtro : "deudores";
  const params: unknown[] = [];
  let extra = "";
  if (q) { params.push(`%${q}%`); extra = " AND b.nombre ILIKE $1"; }

  const [cuentas, totales] = await Promise.all([
    consultar<Cuenta>(
      `WITH cuentas AS (
         SELECT b.id, b.nombre, tupack_saldo(b.id,'UYU') AS saldo, tupack_saldo(b.id,'USD') AS saldo_usd,
                (SELECT max(m.fecha) FROM account_movements m
                  WHERE m.business_id = b.id AND NOT m.anulado) AS ultimo_movimiento,
                (SELECT count(*) FROM account_movements m
                  WHERE m.business_id = b.id AND NOT m.anulado) AS movimientos
           FROM businesses b WHERE b.activo${extra}
       )
       SELECT * FROM cuentas WHERE ${FILTROS[clave]} ORDER BY saldo DESC, nombre`,
      params
    ),
    unaFila<{ por_cobrar: string; a_favor: string; deudores: string; por_cobrar_usd: string }>(
      `SELECT COALESCE(SUM(saldo) FILTER (WHERE saldo > 0),0)::numeric(12,2) AS por_cobrar,
              COALESCE(SUM(saldo) FILTER (WHERE saldo < 0),0)::numeric(12,2) AS a_favor,
              count(*) FILTER (WHERE saldo > 0) AS deudores,
              COALESCE(SUM(usd) FILTER (WHERE usd > 0),0)::numeric(12,2) AS por_cobrar_usd
         FROM (SELECT tupack_saldo(b.id,'UYU') AS saldo, tupack_saldo(b.id,'USD') AS usd
                 FROM businesses b WHERE b.activo) x`
    ),
  ]);

  return (
    <>
      <Titulo bajada="A quién hay que cobrarle, sin entrar cliente por cliente">Cuentas</Titulo>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Indicador titulo="Por cobrar" valor={pesos(totales?.por_cobrar)} tono="peligro" />
        <Indicador titulo="Por cobrar (USD)" valor={pesos(totales?.por_cobrar_usd, "USD")} tono="peligro" />
        <Indicador titulo="Saldo a favor" valor={pesos(totales?.a_favor)} tono="ok" />
        <Indicador titulo="Clientes con deuda" valor={String(totales?.deudores ?? 0)} />
      </div>

      <form className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <Campo etiqueta="Buscar" name="q" defaultValue={q ?? ""} placeholder="Nombre del cliente…" />
        <Selector etiqueta="Ver" name="filtro" defaultValue={clave}>
          <option value="deudores">Con deuda</option>
          <option value="a_favor">Con saldo a favor</option>
          <option value="en_cero">Al día</option>
          <option value="todos">Todos</option>
        </Selector>
        <div className="flex gap-2">
          <Boton variante="primario" type="submit">Filtrar</Boton>
          <BotonLink href="/cuentas">Limpiar</BotonLink>
        </div>
      </form>

      <Tarjeta ajustado titulo={<>Cuentas <span className="text-texto-suave font-normal">({cuentas.length})</span></>}>
        <Tabla>
          <thead>
            <tr>
              <Th>Cliente</Th>
              <Th className="w-40 text-right">Saldo</Th>
              <Th className="w-40 text-right">Saldo USD</Th>
              <Th className="w-36">Último movimiento</Th>
              <Th className="w-28 text-right">Movimientos</Th>
            </tr>
          </thead>
          <tbody>
            {!cuentas.length && <Vacio cols={5}>No hay cuentas con este filtro.</Vacio>}
            {cuentas.map((c) => (
              <tr key={c.id} className="hover:bg-superficie-2 transition">
                <Td>
                  <Link href={`/clientes/${c.id}`} className="flex items-center gap-3">
                    <Inicial nombre={c.nombre} />
                    <span className="truncate font-medium">{c.nombre}</span>
                  </Link>
                </Td>
                <Td className="text-right"><Saldo valor={c.saldo} /></Td>
                <Td className="text-right">
                  {Number(c.saldo_usd) ? <Saldo valor={c.saldo_usd} moneda="USD" /> : <span className="text-texto-suave">—</span>}
                </Td>
                <Td className="text-texto-suave num">
                  {c.ultimo_movimiento ? fecha(c.ultimo_movimiento) : <Etiqueta>sin movimientos</Etiqueta>}
                </Td>
                <Td className="text-right num text-texto-suave">{c.movimientos}</Td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      </Tarjeta>
    </>
  );
}
