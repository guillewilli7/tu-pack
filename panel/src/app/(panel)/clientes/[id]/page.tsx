import Link from "next/link";
import { notFound } from "next/navigation";
import { consultar, unaFila } from "@/lib/db";
import { saldosDeNegocio } from "@/lib/consultas";
import { fecha, pesos, ESTADOS_ORDEN, type EstadoOrden } from "@/lib/formato";
import {
  agregarMovimiento, agregarProductoANegocio, agregarSucursal, agregarTelefono, anularMovimiento,
  bajaTelefono, cambiarEstadoNegocio, cambiarEstadoProductoDeNegocio, guardarNegocio,
  guardarPrecioYStock, guardarSucursal,
} from "@/acciones/clientes";
import { FilaProducto, type ProductoNegocio } from "@/componentes/producto-negocio";
import { BotonAccion } from "@/componentes/boton-accion";
import {
  Tarjeta, Titulo, BotonLink, Boton, Campo, Selector, Etiqueta, Tabla, Th, Td, Vacio, Saldo, Aviso,
} from "@/componentes/ui";

type Negocio = {
  id: number; nombre: string; notas: string | null; activo: boolean;
  deposito_nombre: string | null; locales: string;
};
type Sucursal = {
  id: number; sucursal: string | null; razon_social: string | null; rut: string | null;
  direccion_facturacion: string | null; direccion_entrega: string | null;
  horario_entrega: string | null; info_cliente: string | null; activo: boolean;
};
type Telefono = { id: number; client_id: number; phone: string; label: string | null; activo: boolean };
type Movimiento = {
  id: number; fecha: string; tipo: string; descripcion: string; monto: string; moneda: "UYU" | "USD";
  order_id: number | null; creado_por: string | null; anulado: boolean; saldo_acumulado: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const negocio = await unaFila<{ nombre: string }>("SELECT nombre FROM businesses WHERE id=$1", [Number(id)]);
  return { title: negocio?.nombre ?? "Cliente" };
}

export default async function DetalleCliente({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);

  const negocio = await unaFila<Negocio>(
    `SELECT b.*, d.nombre AS deposito_nombre,
            (SELECT count(*) FROM businesses o WHERE o.stock_owner_id = b.id AND o.id <> b.id) AS locales
       FROM businesses b
       LEFT JOIN businesses d ON d.id = b.stock_owner_id AND d.id <> b.id
      WHERE b.id = $1`,
    [id]
  );
  if (!negocio) notFound();

  const [sucursales, productos, catalogo, telefonos, movimientos, saldos, ordenes] = await Promise.all([
    consultar<Sucursal>("SELECT * FROM clients WHERE business_id=$1 ORDER BY sucursal NULLS FIRST, id", [id]),
    consultar<ProductoNegocio>(
      `SELECT bp.id AS bp_id, bp.product_id, bp.precio, bp.stock, bp.stock_minimo, bp.notas, bp.activo,
              p.nombre, p.codigo_prod
         FROM business_products bp JOIN products p ON p.id = bp.product_id
        WHERE bp.business_id = tupack_stock_owner($1)
        ORDER BY p.nombre`, [id]
    ),
    consultar<{ id: number; nombre: string; codigo_prod: string | null }>(
      "SELECT id, nombre, codigo_prod FROM products WHERE activo ORDER BY nombre"
    ),
    consultar<Telefono>(
      `SELECT ph.* FROM client_phones ph JOIN clients c ON c.id = ph.client_id
        WHERE c.business_id = $1 ORDER BY ph.id`, [id]
    ),
    consultar<Movimiento>(
      `SELECT m.*, SUM(m.monto) FILTER (WHERE NOT m.anulado)
                     OVER (PARTITION BY m.moneda ORDER BY m.fecha, m.id) AS saldo_acumulado
         FROM account_movements m WHERE m.business_id = $1
        ORDER BY m.fecha DESC, m.id DESC LIMIT 100`, [id]
    ),
    saldosDeNegocio(id),
    consultar<{ id: number; created_at: string; status: string; total: string; sucursal: string | null }>(
      `SELECT o.id, o.created_at, o.status, o.total, c.sucursal
         FROM orders o LEFT JOIN clients c ON c.id = o.client_id
        WHERE o.business_id = $1 AND NOT o.eliminada
        ORDER BY o.created_at DESC LIMIT 10`, [id]
    ),
  ]);

  const activos = productos.filter((p) => p.activo);
  const quitados = productos.filter((p) => !p.activo);
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Titulo
        accion={
          <>
            <BotonLink href="/clientes">← Volver</BotonLink>
            {negocio.activo ? (
              <BotonAccion
                variante="peligro"
                confirmar={`¿Desactivar a ${negocio.nombre}? No se borra nada: sale de las listas y se puede reactivar.`}
                accion={async () => { "use server"; await cambiarEstadoNegocio(id, false); }}
              >
                Desactivar cliente
              </BotonAccion>
            ) : (
              <BotonAccion variante="primario"
                accion={async () => { "use server"; await cambiarEstadoNegocio(id, true); }}>
                Reactivar cliente
              </BotonAccion>
            )}
          </>
        }
      >
        <span className="flex items-center gap-3">
          {negocio.nombre}
          {!negocio.activo && <Etiqueta tono="peligro">Inactivo</Etiqueta>}
        </span>
      </Titulo>

      {/* ── Datos ─────────────────────────────────────────────────────── */}
      <Tarjeta titulo="Datos del cliente">
        <form action={guardarNegocio.bind(null, id)} className="flex flex-col gap-4 max-w-2xl">
          <Campo etiqueta="Nombre" name="nombre" defaultValue={negocio.nombre} required />
          <label className="block">
            <span className="block mb-1.5 text-[13px] font-medium text-texto-suave">Notas</span>
            <textarea name="notas" rows={2} defaultValue={negocio.notas ?? ""}
              className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-sm resize-y
                outline-none focus:border-marca focus:ring-2 focus:ring-marca/20" />
          </label>
          <div><Boton variante="primario" type="submit">Guardar cambios</Boton></div>
        </form>
      </Tarjeta>

      {/* ── Cuenta corriente ──────────────────────────────────────────── */}
      <Tarjeta titulo="Estado de cuenta">
        <div className="grid gap-5 sm:grid-cols-[repeat(2,minmax(0,200px))_1fr] items-start">
          <div>
            <div className="text-xs text-texto-suave">Saldo en pesos</div>
            <Saldo valor={saldos.uyu} grande />
          </div>
          <div>
            <div className="text-xs text-texto-suave">Saldo en dólares</div>
            <Saldo valor={saldos.usd} moneda="USD" grande />
          </div>
          <p className="text-sm text-texto-suave">
            {saldos.uyu > 0 || saldos.usd > 0 ? "El cliente adeuda estos importes."
              : saldos.uyu < 0 || saldos.usd < 0 ? "El cliente tiene saldo a favor."
              : "La cuenta está al día."}{" "}
            Las órdenes suman solas; los pagos y ajustes se cargan acá. Cada moneda va por separado.
          </p>
        </div>

        <form action={agregarMovimiento.bind(null, id)}
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[130px_130px_1fr_140px_110px_auto] lg:items-end">
          <Campo etiqueta="Fecha" type="date" name="fecha" defaultValue={hoy} />
          <Selector etiqueta="Tipo" name="tipo" defaultValue="pago">
            <option value="pago">Pago (resta)</option>
            <option value="cargo">Cargo (suma)</option>
            <option value="ajuste">Ajuste (con signo)</option>
          </Selector>
          <Campo etiqueta="Descripción" name="descripcion" required placeholder="Transferencia, nota de crédito…" />
          <Campo etiqueta="Monto" name="monto" type="number" step="0.01" required />
          <Selector etiqueta="Moneda" name="moneda" defaultValue="UYU">
            <option value="UYU">$ UYU</option>
            <option value="USD">US$ USD</option>
          </Selector>
          <Boton variante="primario" type="submit">Agregar</Boton>
        </form>
      </Tarjeta>

      <Tarjeta ajustado titulo="Movimientos">
        <Tabla>
          <thead>
            <tr>
              <Th className="w-28">Fecha</Th>
              <Th className="w-28">Tipo</Th>
              <Th>Descripción</Th>
              <Th className="w-36 text-right">Monto</Th>
              <Th className="w-36 text-right">Saldo</Th>
              <Th className="w-28" />
            </tr>
          </thead>
          <tbody>
            {!movimientos.length && <Vacio cols={6}>Todavía no hay movimientos en esta cuenta.</Vacio>}
            {movimientos.map((m) => {
              const monto = Number(m.monto);
              const tono = m.tipo === "orden" ? "marca" : m.tipo === "pago" ? "ok" : m.tipo === "cargo" ? "alerta" : "gris";
              return (
                <tr key={m.id} className={m.anulado ? "opacity-55" : ""}>
                  <Td className="text-texto-suave num">{fecha(m.fecha)}</Td>
                  <Td><Etiqueta tono={tono}>{m.tipo}</Etiqueta></Td>
                  <Td>
                    {m.order_id ? (
                      <Link href={`/ordenes/${m.order_id}`} className="text-marca hover:underline">{m.descripcion}</Link>
                    ) : m.descripcion}
                    {m.creado_por && m.creado_por !== "automático" && (
                      <span className="text-texto-suave text-xs"> · {m.creado_por}</span>
                    )}
                    {m.anulado && <span className="ml-2"><Etiqueta>Anulado</Etiqueta></span>}
                  </Td>
                  <Td className={`text-right ${m.anulado ? "line-through" : ""}`}>
                    <Saldo valor={monto} moneda={m.moneda} />
                  </Td>
                  <Td className="text-right num text-texto-suave">
                    {m.anulado ? "—" : pesos(m.saldo_acumulado, m.moneda)}
                  </Td>
                  <Td>
                    {m.order_id ? (
                      <span className="text-xs text-texto-suave">automático</span>
                    ) : m.anulado ? (
                      <BotonAccion medida="sm" variante="primario"
                        accion={async () => { "use server"; await anularMovimiento(id, m.id, false); }}>
                        Restaurar
                      </BotonAccion>
                    ) : (
                      <BotonAccion medida="sm"
                        confirmar={`¿Anular “${m.descripcion}”? Deja de sumar al saldo pero queda registrado.`}
                        accion={async () => { "use server"; await anularMovimiento(id, m.id, true); }}>
                        Anular
                      </BotonAccion>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Tabla>
      </Tarjeta>

      {/* ── Productos y stock ─────────────────────────────────────────── */}
      <Tarjeta
        ajustado
        titulo={
          <span className="flex items-center gap-2">
            Productos y stock <span className="text-texto-suave font-normal">({activos.length})</span>
            {negocio.deposito_nombre && <Etiqueta tono="marca">stock de {negocio.deposito_nombre}</Etiqueta>}
            {!negocio.deposito_nombre && Number(negocio.locales) > 0 && (
              <Etiqueta tono="marca">compartido con {negocio.locales} locales</Etiqueta>
            )}
          </span>
        }
      >
        {negocio.deposito_nombre && (
          <div className="px-5 pt-4">
            <Aviso>
              Este local comparte el depósito de <strong>{negocio.deposito_nombre}</strong>: lo que se
              edite acá cambia el stock de todos los locales de la marca.
            </Aviso>
          </div>
        )}
        <Tabla>
          <thead>
            <tr>
              <Th>Producto</Th>
              <Th className="w-28">Precio</Th>
              <Th className="w-72">Stock / mínimo</Th>
              <Th className="w-44" />
            </tr>
          </thead>
          <tbody>
            {!activos.length && <Vacio cols={4}>Este cliente todavía no tiene productos.</Vacio>}
            {activos.map((p) => (
              <FilaProducto
                key={p.bp_id}
                p={p}
                guardar={async (productId, precio, stock, minimo) => {
                  "use server";
                  await guardarPrecioYStock(id, productId, precio, stock, minimo);
                }}
                quitar={async (bpId) => {
                  "use server";
                  await cambiarEstadoProductoDeNegocio(id, bpId, false);
                }}
              />
            ))}
          </tbody>
        </Tabla>

        <form action={agregarProductoANegocio.bind(null, id)}
              className="p-5 grid gap-3 sm:grid-cols-[1fr_130px_130px_auto] sm:items-end border-t border-borde">
          <Selector etiqueta="Agregar producto" name="product_id" required>
            <option value="">— Elegir del catálogo —</option>
            {catalogo.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}{p.codigo_prod ? ` (${p.codigo_prod})` : ""}</option>
            ))}
          </Selector>
          <Campo etiqueta="Precio" name="precio" type="number" step="0.01" placeholder="a definir" />
          <Campo etiqueta="Stock inicial" name="stock" type="number" defaultValue={0} />
          <Boton variante="primario" type="submit">Agregar</Boton>
        </form>
      </Tarjeta>

      {!!quitados.length && (
        <Tarjeta ajustado titulo={<>Productos quitados <span className="text-texto-suave font-normal">({quitados.length})</span></>}>
          <Tabla>
            <thead>
              <tr>
                <Th>Producto</Th>
                <Th className="w-28 text-right">Precio</Th>
                <Th className="w-24 text-right">Stock</Th>
                <Th className="w-32" />
              </tr>
            </thead>
            <tbody>
              {quitados.map((p) => (
                <tr key={p.bp_id}>
                  <Td>
                    <span className="font-medium">{p.nombre}</span>
                    {p.codigo_prod && <span className="ml-2 text-xs text-texto-suave">{p.codigo_prod}</span>}
                  </Td>
                  <Td className="text-right num">{p.precio == null ? "—" : pesos(p.precio)}</Td>
                  <Td className="text-right num">{p.stock}</Td>
                  <Td>
                    <BotonAccion medida="sm" variante="primario"
                      accion={async () => { "use server"; await cambiarEstadoProductoDeNegocio(id, p.bp_id, true); }}>
                      Reactivar
                    </BotonAccion>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Tarjeta>
      )}

      {/* ── Sucursales ────────────────────────────────────────────────── */}
      <Tarjeta titulo={<>Sucursales y facturación <span className="text-texto-suave font-normal">({sucursales.length})</span></>}>
        <div className="flex flex-col gap-3">
          {sucursales.map((s) => {
            const tels = telefonos.filter((t) => t.client_id === s.id && t.activo);
            return (
              <details key={s.id} className="rounded-lg border border-borde bg-superficie-2 overflow-hidden"
                       open={sucursales.length === 1}>
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm select-none">
                  <span className="font-medium">{s.sucursal || "Sucursal única"}</span>
                  {!s.activo && <Etiqueta tono="peligro">Inactiva</Etiqueta>}
                  {!s.rut && <Etiqueta tono="alerta">sin facturación</Etiqueta>}
                  <span className="text-texto-suave truncate">
                    {[s.rut && `RUT ${s.rut}`, s.direccion_entrega,
                      tels.length ? `${tels.length} tel.` : null].filter(Boolean).join(" · ") || "sin datos"}
                  </span>
                </summary>

                <div className="border-t border-borde bg-superficie p-4">
                  <form action={guardarSucursal.bind(null, id, s.id)} className="grid gap-3 sm:grid-cols-2">
                    <Campo etiqueta="Sucursal" name="sucursal" defaultValue={s.sucursal ?? ""} placeholder="(única)" />
                    <Selector etiqueta="Estado" name="activo" defaultValue={String(s.activo)}>
                      <option value="true">Activa</option>
                      <option value="false">Inactiva</option>
                    </Selector>
                    <Campo etiqueta="Razón social" name="razon_social" defaultValue={s.razon_social ?? ""} />
                    <Campo etiqueta="RUT" name="rut" defaultValue={s.rut ?? ""} />
                    <Campo etiqueta="Dirección de facturación" name="direccion_facturacion" defaultValue={s.direccion_facturacion ?? ""} />
                    <Campo etiqueta="Dirección de entrega" name="direccion_entrega" defaultValue={s.direccion_entrega ?? ""} />
                    <Campo etiqueta="Horario de entrega" name="horario_entrega" defaultValue={s.horario_entrega ?? ""} />
                    <Campo etiqueta="Observaciones" name="info_cliente" defaultValue={(s.info_cliente ?? "").replace(/\n/g, " · ")} />
                    <div className="sm:col-span-2">
                      <Boton variante="primario" medida="sm" type="submit">Guardar sucursal</Boton>
                    </div>
                  </form>

                  <div className="mt-4 border-t border-borde pt-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tels.map((t) => (
                        <span key={t.id} className="inline-flex items-center gap-2 rounded-full border border-borde
                          bg-superficie-2 pl-3 pr-1 py-1 text-sm">
                          {t.phone}{t.label ? ` (${t.label})` : ""}
                          <BotonAccion medida="sm" variante="fantasma" className="size-6 !px-0"
                            confirmar={`¿Dar de baja el teléfono ${t.phone}?`}
                            accion={async () => { "use server"; await bajaTelefono(id, t.id); }}>
                            ✕
                          </BotonAccion>
                        </span>
                      ))}
                      {!tels.length && <span className="text-sm text-texto-suave">Sin teléfonos cargados.</span>}
                    </div>
                    <form action={agregarTelefono.bind(null, id, s.id)} className="flex flex-wrap items-end gap-2">
                      <Campo etiqueta="Teléfono" name="phone" className="w-40" required />
                      <Campo etiqueta="Etiqueta" name="label" className="w-40" placeholder="dueño, depósito…" />
                      <Boton medida="md" type="submit">+ Agregar</Boton>
                    </form>
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        <form action={agregarSucursal.bind(null, id)} className="mt-4 flex flex-wrap items-end gap-2 border-t border-borde pt-4">
          <Campo etiqueta="Nueva sucursal" name="sucursal" className="w-56" placeholder="Nombre de la sucursal" />
          <Boton variante="primario" type="submit">+ Agregar sucursal</Boton>
        </form>
      </Tarjeta>

      {/* ── Últimas órdenes ───────────────────────────────────────────── */}
      <Tarjeta ajustado titulo="Últimas órdenes">
        <Tabla>
          <thead>
            <tr>
              <Th className="w-20">#</Th>
              <Th className="w-28">Fecha</Th>
              <Th>Sucursal</Th>
              <Th className="w-40">Estado</Th>
              <Th className="w-32 text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {!ordenes.length && <Vacio cols={5}>Todavía no hay órdenes de este cliente.</Vacio>}
            {ordenes.map((o) => {
              const estado = ESTADOS_ORDEN[o.status as EstadoOrden] ?? { texto: o.status, tono: "gris" as const };
              return (
                <tr key={o.id} className="hover:bg-superficie-2 transition">
                  <Td className="num text-texto-suave">
                    <Link href={`/ordenes/${o.id}`} className="hover:text-marca">#{o.id}</Link>
                  </Td>
                  <Td className="num text-texto-suave">{fecha(o.created_at)}</Td>
                  <Td>{o.sucursal ?? "—"}</Td>
                  <Td><Etiqueta tono={estado.tono}>{estado.texto}</Etiqueta></Td>
                  <Td className="text-right num font-medium">{pesos(o.total)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Tabla>
      </Tarjeta>
    </>
  );
}
