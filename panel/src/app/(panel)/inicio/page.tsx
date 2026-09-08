import Link from "next/link";
import { consultar, unaFila } from "@/lib/db";
import { ESTADOS_ORDEN, fecha, pesos, type EstadoOrden } from "@/lib/formato";
import { GraficoOrdenes, type Dia } from "@/componentes/grafico-ordenes";
import {
  Tarjeta, Tabla, Th, Td, Vacio, Etiqueta, Titulo, BotonLink, Indicador, Inicial, Saldo,
} from "@/componentes/ui";

export const metadata = { title: "Resumen" };

export default async function Inicio() {
  const [numeros, dias, ultimas, deudores] = await Promise.all([
    unaFila<{
      pendientes: number; en_proceso: number; ordenes_mes: number; vendido_mes: string;
      por_cobrar: string; deudores: number; sin_stock: number; bajo_minimo: number;
    }>(
      `SELECT
         (SELECT count(*) FROM orders WHERE NOT eliminada AND status = 'pendiente')::int  AS pendientes,
         (SELECT count(*) FROM orders WHERE NOT eliminada AND status = 'en_proceso')::int AS en_proceso,
         (SELECT count(*) FROM orders WHERE NOT eliminada AND status <> 'cancelado'
            AND created_at >= date_trunc('month', now()))::int                            AS ordenes_mes,
         (SELECT COALESCE(sum(total), 0) FROM orders WHERE NOT eliminada AND status <> 'cancelado'
            AND created_at >= date_trunc('month', now()))                                 AS vendido_mes,
         (SELECT COALESCE(sum(s), 0) FROM (
            SELECT tupack_saldo(b.id, 'UYU') AS s FROM businesses b WHERE b.activo) x
           WHERE s > 0)                                                                   AS por_cobrar,
         (SELECT count(*) FROM (
            SELECT tupack_saldo(b.id, 'UYU') AS s FROM businesses b WHERE b.activo) y
           WHERE s > 0)::int                                                              AS deudores,
         (SELECT count(*) FROM business_products bp
            JOIN businesses b ON b.id = bp.business_id
           WHERE bp.activo AND b.activo AND bp.stock <= 0)::int                           AS sin_stock,
         (SELECT count(*) FROM business_products bp
            JOIN businesses b ON b.id = bp.business_id
           WHERE bp.activo AND b.activo AND bp.stock > 0
             AND bp.stock_minimo IS NOT NULL AND bp.stock <= bp.stock_minimo)::int        AS bajo_minimo`
    ),
    consultar<Dia>(
      `SELECT to_char(d.dia, 'YYYY-MM-DD') AS dia,
              count(o.id)::int AS cantidad,
              COALESCE(sum(o.total), 0) AS total
         FROM generate_series(current_date - 13, current_date, interval '1 day') AS d(dia)
         LEFT JOIN orders o ON o.created_at::date = d.dia
                           AND NOT o.eliminada AND o.status <> 'cancelado'
        GROUP BY d.dia ORDER BY d.dia`
    ),
    consultar<{ id: number; created_at: string; status: string; total: string; negocio: string | null; sucursal: string | null }>(
      `SELECT o.id, o.created_at, o.status, o.total, b.nombre AS negocio, c.sucursal
         FROM orders o
         LEFT JOIN clients c ON c.id = o.client_id
         LEFT JOIN businesses b ON b.id = COALESCE(o.business_id, c.business_id)
        WHERE NOT o.eliminada
        ORDER BY o.created_at DESC LIMIT 6`
    ),
    consultar<{ id: number; nombre: string; saldo: string }>(
      `SELECT b.id, b.nombre, tupack_saldo(b.id, 'UYU') AS saldo
         FROM businesses b WHERE b.activo
        ORDER BY tupack_saldo(b.id, 'UYU') DESC LIMIT 6`
    ),
  ]);

  const hoy = new Date().toLocaleDateString("es-UY", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="flex flex-col gap-5 aparece">
      <Titulo
        bajada={hoy.charAt(0).toUpperCase() + hoy.slice(1)}
        accion={<BotonLink href="/ordenes/nueva" variante="primario">+ Nueva orden</BotonLink>}
      >
        Resumen
      </Titulo>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <Indicador
          titulo="Órdenes pendientes" href="/ordenes?estado=pendiente"
          valor={numeros?.pendientes ?? 0}
          detalle={`${numeros?.en_proceso ?? 0} en proceso`}
          tono={numeros?.pendientes ? "alerta" : undefined}
        />
        <Indicador
          titulo="Por cobrar" href="/cuentas"
          valor={pesos(numeros?.por_cobrar)}
          detalle={`${numeros?.deudores ?? 0} clientes con deuda`}
          tono="peligro"
        />
        <Indicador
          titulo="Vendido este mes"
          valor={pesos(numeros?.vendido_mes)}
          detalle={`${numeros?.ordenes_mes ?? 0} órdenes`}
          tono="ok"
        />
        <Indicador
          titulo="Sin stock" href="/stock?filtro=faltante"
          valor={numeros?.sin_stock ?? 0}
          detalle="productos en cero"
          tono={numeros?.sin_stock ? "peligro" : undefined}
        />
        <Indicador
          titulo="Por reponer" href="/stock?filtro=bajo"
          valor={numeros?.bajo_minimo ?? 0}
          detalle="bajo el mínimo"
          tono={numeros?.bajo_minimo ? "alerta" : undefined}
        />
      </div>

      <Tarjeta titulo="Órdenes de las últimas dos semanas">
        <GraficoOrdenes dias={dias} />
      </Tarjeta>

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <Tarjeta
          ajustado titulo="Últimas órdenes"
          accion={<BotonLink medida="sm" href="/ordenes">Ver todas</BotonLink>}
        >
          <Tabla>
            <tbody>
              {!ultimas.length && <Vacio cols={3}>Todavía no hay órdenes.</Vacio>}
              {ultimas.map((o) => {
                const estado = ESTADOS_ORDEN[o.status as EstadoOrden] ?? { texto: o.status, tono: "gris" as const };
                return (
                  <tr key={o.id} className="hover:bg-superficie-2 transition">
                    <Td>
                      <Link href={`/ordenes/${o.id}`} className="flex items-center gap-3">
                        <Inicial nombre={o.negocio ?? "?"} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{o.negocio ?? "—"}</span>
                          <span className="block text-xs text-texto-suave">
                            #{o.id} · {fecha(o.created_at)}
                          </span>
                        </span>
                      </Link>
                    </Td>
                    <Td className="w-32"><Etiqueta punto tono={estado.tono}>{estado.texto}</Etiqueta></Td>
                    <Td className="w-28 text-right num font-medium">{pesos(o.total)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Tabla>
        </Tarjeta>

        <Tarjeta
          ajustado titulo="Los que más deben"
          accion={<BotonLink medida="sm" href="/cuentas">Ver cuentas</BotonLink>}
        >
          <Tabla>
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th className="w-36 text-right">Saldo</Th>
              </tr>
            </thead>
            <tbody>
              {!deudores.length && <Vacio cols={2}>No hay cuentas cargadas.</Vacio>}
              {deudores.map((c) => (
                <tr key={c.id} className="hover:bg-superficie-2 transition">
                  <Td>
                    <Link href={`/clientes/${c.id}`} className="flex items-center gap-3">
                      <Inicial nombre={c.nombre} />
                      <span className="truncate font-medium">{c.nombre}</span>
                    </Link>
                  </Td>
                  <Td className="text-right"><Saldo valor={c.saldo} /></Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Tarjeta>
      </div>
    </div>
  );
}
