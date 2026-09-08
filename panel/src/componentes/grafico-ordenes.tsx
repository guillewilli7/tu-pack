import { pesos } from "@/lib/formato";

export type Dia = { dia: string; cantidad: number; total: string };

/**
 * Órdenes por día de las últimas dos semanas. SVG a mano: son catorce barras,
 * no vale traerse una librería de gráficos para esto.
 */
export function GraficoOrdenes({ dias }: { dias: Dia[] }) {
  const maximo = Math.max(1, ...dias.map((d) => d.cantidad));
  const ancho = 100 / (dias.length || 1);

  return (
    <div>
      <div className="flex h-32 items-end gap-[3px]">
        {dias.map((d) => {
          const alto = (d.cantidad / maximo) * 100;
          const fecha = new Date(d.dia + "T12:00:00");
          return (
            <div key={d.dia} className="group relative flex-1 flex flex-col items-center justify-end h-full"
                 style={{ maxWidth: `${ancho * 2}%` }}>
              <div
                className={`w-full rounded-t-md transition-all ${d.cantidad ? "bg-marca group-hover:bg-marca-fuerte" : "bg-borde"}`}
                style={{ height: `${Math.max(alto, d.cantidad ? 6 : 2)}%` }}
              />
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full
                whitespace-nowrap rounded-lg bg-texto px-2 py-1 text-[11px] text-superficie opacity-0
                shadow-lg transition group-hover:opacity-100">
                {d.cantidad} {d.cantidad === 1 ? "orden" : "órdenes"} · {pesos(d.total)}
              </span>
              <span className="mt-1.5 text-[10px] text-texto-suave">
                {fecha.toLocaleDateString("es-UY", { day: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
