import { consultar, unaFila } from "@/lib/db";
import { ajustarStock, asignarProducto } from "@/acciones/stock";
import { FilaStock, type FilaStockDatos } from "@/componentes/fila-stock";
import { Tarjeta, Tabla, Th, Td, Vacio, Titulo, Campo, Boton, BotonLink, Selector, Indicador } from "@/componentes/ui";

export const metadata = { title: "Stock" };

const FILTROS: Record<string, string> = {
  todos: "true",
  faltante: "bp.stock <= 0",
  bajo: "bp.stock_minimo IS NOT NULL AND bp.stock <= bp.stock_minimo",
  sin_precio: "bp.precio IS NULL",
};

export default async function Stock({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filtro?: string }>;
}) {
  const { q, filtro } = await searchParams;
  const clave = filtro && FILTROS[filtro] ? filtro : "todos";
  const params: unknown[] = [];
  let where = `WHERE bp.activo AND p.activo AND ${FILTROS[clave]}`;
  if (q) { params.push(`%${q}%`); where += ` AND (b.nombre ILIKE $1 OR p.nombre ILIKE $1)`; }

  const [filas, totales, sinAsignar, negocios] = await Promise.all([
    consultar<FilaStockDatos>(
      `SELECT bp.stock, bp.stock_minimo, bp.precio,
              b.id AS business_id, b.nombre AS negocio,
              (SELECT count(*) FROM businesses o WHERE o.stock_owner_id = b.id AND o.id <> b.id) AS locales_que_comparten,
              p.id AS product_id, p.nombre AS producto, p.unidad
         FROM business_products bp
         JOIN businesses b ON b.id = bp.business_id
         JOIN products p ON p.id = bp.product_id
         ${where}
        ORDER BY b.nombre, p.nombre LIMIT 400`,
      params
    ),
    unaFila<{ total: number; faltante: number; bajo: number; sin_precio: number }>(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE bp.stock <= 0)::int AS faltante,
              count(*) FILTER (WHERE bp.stock_minimo IS NOT NULL AND bp.stock <= bp.stock_minimo)::int AS bajo,
              count(*) FILTER (WHERE bp.precio IS NULL)::int AS sin_precio
         FROM business_products bp WHERE bp.activo`
    ),
    // Productos del catálogo que no son de ningún cliente: no tienen fila de
    // stock, así que sin esto quedarían invisibles en esta pantalla.
    consultar<{ id: number; nombre: string; codigo_prod: string | null; unidad: string | null }>(
      `SELECT p.id, p.nombre, p.codigo_prod, p.unidad
         FROM products p
        WHERE p.activo
          AND NOT EXISTS (
            SELECT 1 FROM business_products bp
             WHERE bp.product_id = p.id AND bp.activo)
          ${q ? "AND (p.nombre ILIKE $1 OR p.codigo_prod ILIKE $1)" : ""}
        ORDER BY p.nombre LIMIT 25`,
      q ? [`%${q}%`] : []
    ),
    consultar<{ id: number; nombre: string }>(
      "SELECT id, nombre FROM businesses WHERE activo ORDER BY nombre"
    ),
  ]);

  const tarjetas = [
    { clave: "todos", texto: "Productos asignados", valor: totales?.total ?? 0 },
    { clave: "faltante", texto: "Sin stock", valor: totales?.faltante ?? 0 },
    { clave: "bajo", texto: "Bajo el mínimo", valor: totales?.bajo ?? 0 },
    { clave: "sin_precio", texto: "Sin precio", valor: totales?.sin_precio ?? 0 },
  ];

  return (
    <>
      <Titulo bajada="Todo el depósito en una pantalla, editable en la misma fila">Stock</Titulo>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div key={t.clave} className={clave === t.clave ? "rounded-2xl ring-2 ring-marca/25" : ""}>
            <Indicador
              titulo={t.texto}
              valor={t.valor}
              href={`/stock?filtro=${t.clave}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              tono={t.clave === "faltante" && t.valor ? "peligro" : t.clave === "bajo" && t.valor ? "alerta" : undefined}
            />
          </div>
        ))}
      </div>

      <form className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <Campo etiqueta="Buscar" name="q" defaultValue={q ?? ""} placeholder="Cliente o producto…" />
        <Selector etiqueta="Filtro" name="filtro" defaultValue={clave}>
          <option value="todos">Todos</option>
          <option value="faltante">Sin stock</option>
          <option value="bajo">Bajo el mínimo</option>
          <option value="sin_precio">Sin precio</option>
        </Selector>
        <div className="flex gap-2">
          <Boton variante="primario" type="submit">Filtrar</Boton>
          <BotonLink href="/stock">Limpiar</BotonLink>
        </div>
      </form>

      {sinAsignar.length > 0 && (
        <Tarjeta
          ajustado
          titulo={
            <span className="text-alerta">
              Productos sin cliente{" "}
              <span className="font-normal">({sinAsignar.length})</span>
            </span>
          }
        >
          <div className="px-5 py-3 text-sm text-texto-suave border-b border-borde bg-alerta-suave/40">
            Estos productos están en el catálogo pero no son de ningún cliente todavía, por eso
            no tienen stock. Elegí el cliente y cargales el stock inicial para que aparezcan
            en la tabla de abajo.
          </div>
          <Tabla>
            <thead>
              <tr>
                <Th>Producto</Th>
                <Th className="w-[560px]">Asignar a cliente</Th>
              </tr>
            </thead>
            <tbody>
              {sinAsignar.map((p) => (
                <tr key={p.id} className="hover:bg-superficie-2 transition">
                  <Td>
                    <span className="font-medium">{p.nombre}</span>
                    {p.codigo_prod && (
                      <span className="ml-2 text-xs text-texto-suave num">{p.codigo_prod}</span>
                    )}
                  </Td>
                  <Td>
                    <form action={asignarProducto} className="flex items-end gap-2 justify-end">
                      <input type="hidden" name="product_id" value={p.id} />
                      <Selector name="business_id" className="w-52" defaultValue="">
                        <option value="">Elegí un cliente…</option>
                        {negocios.map((n) => (
                          <option key={n.id} value={n.id}>{n.nombre}</option>
                        ))}
                      </Selector>
                      <Campo name="precio" type="number" step="0.01" placeholder="precio"
                             className="w-28 text-right num" />
                      <Campo name="stock" type="number" defaultValue={0}
                             className="w-24 text-right num" />
                      <Boton variante="primario" type="submit">Asignar</Boton>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Tarjeta>
      )}

      <Tarjeta ajustado titulo={<>Stock por cliente <span className="text-texto-suave font-normal">({filas.length})</span></>}>
        <Tabla>
          <thead>
            <tr>
              <Th>Cliente</Th>
              <Th>Producto</Th>
              <Th className="w-28 text-right">Precio</Th>
              <Th className="w-96 text-right">Stock / mínimo</Th>
            </tr>
          </thead>
          <tbody>
            {!filas.length && <Vacio cols={4}>No hay productos con este filtro.</Vacio>}
            {filas.map((f) => (
              <FilaStock
                key={`${f.business_id}-${f.product_id}`}
                f={f}
                guardar={async (stock, minimo) => {
                  "use server";
                  await ajustarStock(f.business_id, f.product_id, stock, minimo);
                }}
              />
            ))}
          </tbody>
        </Tabla>
      </Tarjeta>
    </>
  );
}
