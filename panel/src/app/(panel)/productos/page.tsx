import { consultar } from "@/lib/db";
import { cambiarEstadoProducto, crearProducto, guardarProducto } from "@/acciones/productos";
import { FilaCatalogo, type ProductoCatalogo } from "@/componentes/producto-catalogo";
import { Tarjeta, Tabla, Th, Vacio, BotonLink, Boton, Titulo, Campo, Selector } from "@/componentes/ui";

export const metadata = { title: "Productos" };

const ESTADOS: Record<string, string> = { activos: "activo", inactivos: "NOT activo", todos: "true" };

export default async function Productos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;
  const clave = estado && ESTADOS[estado] ? estado : "activos";
  const params: unknown[] = [];
  let where = `WHERE ${ESTADOS[clave]}`;
  if (q) { params.push(`%${q}%`); where += ` AND (nombre ILIKE $1 OR codigo_prod ILIKE $1)`; }

  const [productos, negocios] = await Promise.all([
    consultar<ProductoCatalogo>(
      `SELECT p.id, p.codigo_prod, p.nombre, p.descripcion, p.unidad, p.costo, p.activo,
              (SELECT count(*) FROM business_products bp WHERE bp.product_id = p.id AND bp.activo) AS negocios
         FROM products p ${where.replace("WHERE activo", "WHERE p.activo").replace("WHERE NOT activo", "WHERE NOT p.activo")}
        ORDER BY p.nombre`,
      params
    ),
    consultar<{ id: number; nombre: string }>(
      "SELECT id, nombre FROM businesses WHERE activo ORDER BY nombre"
    ),
  ]);

  return (
    <>
      <Titulo>Productos</Titulo>

      <form className="grid gap-3 sm:grid-cols-[1fr_170px_auto] sm:items-end">
        <Campo etiqueta="Buscar" name="q" defaultValue={q ?? ""} placeholder="Nombre o código…" />
        <Selector etiqueta="Estado" name="estado" defaultValue={clave}>
          <option value="activos">Activos</option>
          <option value="inactivos">Dados de baja</option>
          <option value="todos">Todos</option>
        </Selector>
        <div className="flex gap-2">
          <Boton variante="primario" type="submit">Buscar</Boton>
          <BotonLink href="/productos">Limpiar</BotonLink>
        </div>
      </form>

      <Tarjeta titulo="Nuevo producto">
        <form action={crearProducto} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[130px_1fr_1fr_110px_110px]">
            <Campo etiqueta="Código" name="codigo_prod" placeholder="P-0123" />
            <Campo etiqueta="Nombre" name="nombre" required />
            <Campo etiqueta="Descripción" name="descripcion" />
            <Campo etiqueta="Unidad" name="unidad" defaultValue="unidad" />
            <Campo etiqueta="Costo" name="costo" type="number" step="0.01" defaultValue={0} />
          </div>

          <div className="rounded-xl border border-borde bg-superficie-2 p-4 flex flex-col gap-3">
            <p className="text-[13px] text-texto-suave">
              Un producto recién creado no aparece en Stock hasta que es de algún cliente.
              Asignalo acá y ya queda con su stock cargado.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_130px_130px_auto] lg:items-end">
              <Selector etiqueta="Asignar a cliente (opcional)" name="business_id" defaultValue="">
                <option value="">No asignar por ahora</option>
                {negocios.map((n) => (
                  <option key={n.id} value={n.id}>{n.nombre}</option>
                ))}
              </Selector>
              <Campo etiqueta="Precio" name="precio" type="number" step="0.01" placeholder="a definir" />
              <Campo etiqueta="Stock inicial" name="stock" type="number" defaultValue={0} />
              <Boton variante="primario" type="submit">Crear producto</Boton>
            </div>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta ajustado titulo={<>Catálogo <span className="text-texto-suave font-normal">({productos.length})</span></>}>
        <Tabla>
          <thead>
            <tr>
              <Th className="w-28">Código</Th>
              <Th>Producto</Th>
              <Th className="w-24">Unidad</Th>
              <Th className="w-28 text-right">Costo</Th>
              <Th className="w-28 text-right">Clientes</Th>
              <Th className="w-52" />
            </tr>
          </thead>
          <tbody>
            {!productos.length && <Vacio cols={6}>No se encontraron productos.</Vacio>}
            {productos.map((p) => (
              <FilaCatalogo
                key={p.id}
                p={p}
                guardar={guardarProducto.bind(null, p.id)}
                cambiarEstado={async (activo) => {
                  "use server";
                  await cambiarEstadoProducto(p.id, activo);
                }}
              />
            ))}
          </tbody>
        </Tabla>
      </Tarjeta>
    </>
  );
}
