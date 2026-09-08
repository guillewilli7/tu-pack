import { consultar, unaFila } from "@/lib/db";
import { ajustarStock } from "@/acciones/stock";
import { FilaStock, type FilaStockDatos } from "@/componentes/fila-stock";
import { Tarjeta, Tabla, Th, Vacio, Titulo, Campo, Boton, BotonLink, Selector } from "@/componentes/ui";

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

  const [filas, totales] = await Promise.all([
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
  ]);

  const tarjetas = [
    { clave: "todos", texto: "Productos asignados", valor: totales?.total ?? 0 },
    { clave: "faltante", texto: "Sin stock", valor: totales?.faltante ?? 0 },
    { clave: "bajo", texto: "Bajo el mínimo", valor: totales?.bajo ?? 0 },
    { clave: "sin_precio", texto: "Sin precio", valor: totales?.sin_precio ?? 0 },
  ];

  return (
    <>
      <Titulo>Stock</Titulo>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <a key={t.clave} href={`/stock?filtro=${t.clave}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
             className={`rounded-xl border bg-superficie p-4 transition hover:border-marca
               ${clave === t.clave ? "border-marca ring-2 ring-marca/15" : "border-borde"}`}>
            <div className="text-xs text-texto-suave">{t.texto}</div>
            <div className="font-display text-2xl font-bold num">{t.valor}</div>
          </a>
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
