import "server-only";
import { consultar, unaFila } from "./db";

/* Consultas compartidas. El stock y la cuenta los mantienen los triggers de
   la base: acá solo se lee y se escribe lo que el usuario carga. */

export type FilaOrden = {
  id: number; negocio: string | null; client_negocio: string | null; sucursal: string | null;
  status: string; total: string; created_at: string; eliminada: boolean; items: unknown;
};

export async function listarOrdenes(f: {
  estado?: string; desde?: string; hasta?: string; q?: string; pagina?: number;
}) {
  const porPagina = 25;
  const pagina = Math.max(1, f.pagina ?? 1);
  const params: unknown[] = [];
  let where = f.estado === "eliminadas" ? "WHERE o.eliminada" : "WHERE NOT o.eliminada";

  if (f.estado && !["todas", "eliminadas"].includes(f.estado)) {
    if (f.estado === "completada") {
      params.push("completada", "confirmado");
      where += ` AND o.status IN ($${params.length - 1}, $${params.length})`;
    } else {
      params.push(f.estado);
      where += ` AND o.status = $${params.length}`;
    }
  }
  if (f.desde) { params.push(f.desde); where += ` AND o.created_at >= $${params.length}`; }
  if (f.hasta) { params.push(f.hasta + "T23:59:59"); where += ` AND o.created_at <= $${params.length}`; }
  if (f.q) { params.push(`%${f.q}%`); where += ` AND (b.nombre ILIKE $${params.length} OR o.negocio ILIKE $${params.length})`; }

  const base = `
    FROM orders o
    LEFT JOIN clients c ON c.id = o.client_id
    LEFT JOIN businesses b ON b.id = COALESCE(o.business_id, c.business_id)
    ${where}`;

  const [filas, cuenta] = await Promise.all([
    consultar<FilaOrden>(
      `SELECT o.id, o.negocio, o.status, o.total, o.created_at, o.eliminada,
              b.nombre AS client_negocio, c.sucursal ${base}
        ORDER BY o.created_at DESC
        LIMIT ${porPagina} OFFSET ${(pagina - 1) * porPagina}`,
      params
    ),
    unaFila<{ total: string }>(`SELECT count(*)::int AS total ${base}`, params),
  ]);

  const total = Number(cuenta?.total ?? 0);
  return { filas, total, pagina, paginas: Math.max(1, Math.ceil(total / porPagina)), porPagina };
}

export type ItemOrden = {
  product_id?: number; codigo_prod?: string; nombre_catalogo?: string; nombre?: string;
  cantidad?: number; precio_unitario?: number; subtotal?: number; notas?: string;
};

export async function traerOrden(id: number) {
  const orden = await unaFila<Record<string, unknown>>(
    `SELECT o.*, b.nombre AS negocio_nombre, c.sucursal, c.direccion_entrega, c.horario_entrega
       FROM orders o
       LEFT JOIN clients c ON c.id = o.client_id
       LEFT JOIN businesses b ON b.id = COALESCE(o.business_id, c.business_id)
      WHERE o.id = $1`,
    [id]
  );
  if (!orden) return null;

  const [movimientos, catalogo] = await Promise.all([
    consultar<{ nombre: string; delta: number; stock_result: number; motivo: string }>(
      `SELECT p.nombre, sm.delta, sm.stock_result, sm.motivo
         FROM stock_movements sm JOIN products p ON p.id = sm.product_id
        WHERE sm.order_id = $1 ORDER BY sm.id`,
      [id]
    ),
    consultar<CatalogoItem>(
      `SELECT bp.product_id, bp.precio, bp.stock, p.nombre, p.codigo_prod
         FROM business_products bp JOIN products p ON p.id = bp.product_id
        WHERE bp.business_id = tupack_stock_owner($1) AND bp.activo AND p.activo
        ORDER BY p.nombre`,
      [orden.business_id]
    ),
  ]);

  const items = Array.isArray(orden.items) ? (orden.items as ItemOrden[]) : [];
  return { orden, items, movimientos, catalogo };
}

export type CatalogoItem = {
  product_id: number; precio: string | null; stock: number; nombre: string; codigo_prod: string | null;
};

export async function catalogoDeSucursal(clientId: number) {
  return consultar<CatalogoItem>(
    `SELECT bp.product_id, bp.precio, bp.stock, p.nombre, p.codigo_prod
       FROM clients c
       JOIN business_products bp ON bp.business_id = tupack_stock_owner(c.business_id)
       JOIN products p ON p.id = bp.product_id
      WHERE c.id = $1 AND bp.activo AND p.activo
      ORDER BY p.nombre`,
    [clientId]
  );
}

export type Sucursal = {
  id: number; business_id: number; negocio: string; sucursal: string | null;
  direccion_entrega: string | null; horario_entrega: string | null;
};

export async function buscarSucursales(q: string) {
  if (!q.trim()) return [];
  return consultar<Sucursal>(
    `SELECT c.id, c.business_id, b.nombre AS negocio, c.sucursal,
            c.direccion_entrega, c.horario_entrega
       FROM clients c JOIN businesses b ON b.id = c.business_id
      WHERE c.activo AND b.activo AND b.nombre ILIKE $1
      ORDER BY b.nombre, c.sucursal NULLS FIRST LIMIT 20`,
    [`%${q}%`]
  );
}

export async function saldosDeNegocio(businessId: number) {
  const fila = await unaFila<{ uyu: string; usd: string }>(
    `SELECT tupack_saldo($1,'UYU') AS uyu, tupack_saldo($1,'USD') AS usd`,
    [businessId]
  );
  return { uyu: Number(fila?.uyu ?? 0), usd: Number(fila?.usd ?? 0) };
}

export type DuenoDeposito = { id: number; nombre: string; locales: string };

/**
 * Para elegir a quién asignarle un producto sólo sirven los dueños de
 * depósito: los locales que comparten stock resuelven al mismo lugar, así
 * que ofrecerlos sería repetir la misma opción varias veces.
 */
export async function duenosDeDeposito() {
  return consultar<DuenoDeposito>(
    `SELECT b.id, b.nombre,
            (SELECT count(*) FROM businesses o
              WHERE o.stock_owner_id = b.id AND o.id <> b.id AND o.activo) AS locales
       FROM businesses b
      WHERE b.activo AND COALESCE(b.stock_owner_id, b.id) = b.id
      ORDER BY b.nombre`
  );
}

/** "DESMADRE (depósito de 10 locales)" cuando comparte; el nombre solo si no. */
export function etiquetaDeposito(n: DuenoDeposito) {
  const locales = Number(n.locales);
  return locales > 0 ? `${n.nombre} (depósito de ${locales + 1} locales)` : n.nombre;
}
