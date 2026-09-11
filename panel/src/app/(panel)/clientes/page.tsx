import Link from "next/link";
import { consultar } from "@/lib/db";
import { Tarjeta, Tabla, Th, Td, Vacio, Etiqueta, BotonLink, Boton, Titulo, Campo, Selector, Saldo, Inicial } from "@/componentes/ui";

export const metadata = { title: "Clientes" };

const ESTADOS: Record<string, string> = {
  activos: "b.activo", inactivos: "NOT b.activo", todos: "true",
};

type Fila = {
  id: number; nombre: string; activo: boolean; sucursales: string; productos: string;
  sin_stock: string; saldo: string; saldo_usd: string;
  deposito_nombre: string | null; locales: string;
};

export default async function Clientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;
  const clave = estado && ESTADOS[estado] ? estado : "activos";
  const params: unknown[] = [];
  let where = `WHERE ${ESTADOS[clave]}`;
  if (q) { params.push(`%${q}%`); where += ` AND b.nombre ILIKE $1`; }

  const filas = await consultar<Fila>(
    `SELECT b.id, b.nombre, b.activo,
            (SELECT count(*) FROM clients c WHERE c.business_id = b.id) AS sucursales,
            (SELECT count(*) FROM business_products bp
              WHERE bp.business_id = tupack_stock_owner(b.id) AND bp.activo) AS productos,
            (SELECT count(*) FROM business_products bp
              WHERE bp.business_id = tupack_stock_owner(b.id) AND bp.activo AND bp.stock <= 0) AS sin_stock,
            tupack_saldo(b.id,'UYU') AS saldo, tupack_saldo(b.id,'USD') AS saldo_usd,
            d.nombre AS deposito_nombre,
            (SELECT count(*) FROM businesses o
              WHERE o.stock_owner_id = b.id AND o.id <> b.id AND o.activo) AS locales
       FROM businesses b
       LEFT JOIN businesses d ON d.id = b.stock_owner_id AND d.id <> b.id
       ${where} ORDER BY b.nombre`,
    params
  );

  return (
    <>
      <Titulo bajada="Cada negocio con sus sucursales, su stock y su cuenta corriente"
              accion={<BotonLink href="/clientes/nuevo" variante="primario">+ Nuevo cliente</BotonLink>}>
        Clientes
      </Titulo>

      <form className="grid gap-3 sm:grid-cols-[1fr_170px_auto] sm:items-end">
        <Campo etiqueta="Buscar" name="q" defaultValue={q ?? ""} placeholder="Nombre del negocio…" />
        <Selector etiqueta="Estado" name="estado" defaultValue={clave}>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </Selector>
        <div className="flex gap-2">
          <Boton variante="primario" type="submit">Buscar</Boton>
          <BotonLink href="/clientes">Limpiar</BotonLink>
        </div>
      </form>

      <Tarjeta ajustado titulo={<>Clientes <span className="text-texto-suave font-normal">({filas.length})</span></>}>
        <Tabla>
          <thead>
            <tr>
              <Th>Cliente</Th>
              <Th className="w-24 text-right">Sucursales</Th>
              <Th className="w-24 text-right">Productos</Th>
              <Th className="w-32">Stock</Th>
              <Th className="w-40 text-right">Saldo</Th>
            </tr>
          </thead>
          <tbody>
            {!filas.length && <Vacio cols={5}>No se encontraron clientes.</Vacio>}
            {filas.map((c) => (
              <tr key={c.id} className="hover:bg-superficie-2 transition">
                <Td>
                  <Link href={`/clientes/${c.id}`} className="flex items-center gap-3">
                    <Inicial nombre={c.nombre} />
                    <span className="min-w-0 flex items-center gap-2 flex-wrap">
                      <span className="truncate font-medium">{c.nombre}</span>
                      {!c.activo && <Etiqueta tono="peligro">Inactivo</Etiqueta>}
                      {c.deposito_nombre ? (
                        <Etiqueta tono="marca">stock de {c.deposito_nombre}</Etiqueta>
                      ) : Number(c.locales) > 0 ? (
                        <Etiqueta tono="marca">depósito de {Number(c.locales) + 1} locales</Etiqueta>
                      ) : null}
                    </span>
                  </Link>
                </Td>
                <Td className="text-right num text-texto-suave">{c.sucursales}</Td>
                <Td className="text-right num text-texto-suave">{c.productos}</Td>
                <Td>
                  {Number(c.sin_stock) > 0 ? (
                    <Etiqueta punto tono="peligro">{c.sin_stock} sin stock</Etiqueta>
                  ) : Number(c.productos) > 0 ? (
                    <Etiqueta punto tono="ok">Al día</Etiqueta>
                  ) : (
                    <span className="text-texto-suave">—</span>
                  )}
                </Td>
                <Td className="text-right">
                  <Saldo valor={c.saldo} />
                  {Number(c.saldo_usd) !== 0 && (
                    <div className="text-xs"><Saldo valor={c.saldo_usd} moneda="USD" /></div>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      </Tarjeta>
    </>
  );
}
