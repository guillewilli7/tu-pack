import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* Ladrillos del panel. Nada de librerías: son cuatro formas repetidas. */

export function Tarjeta({
  titulo, accion, children, ajustado = false, pie, desborde = false,
}: {
  titulo?: ReactNode; accion?: ReactNode; children: ReactNode;
  ajustado?: boolean; pie?: ReactNode;
  /** Para tarjetas con menús flotantes (el buscador de clientes, por ejemplo). */
  desborde?: boolean;
}) {
  return (
    <section className={`rounded-xl border border-borde bg-superficie shadow-[var(--sombra)] ${desborde ? "" : "overflow-hidden"}`}>
      {(titulo || accion) && (
        <header className="flex items-center gap-3 px-5 py-3.5 border-b border-borde">
          <h2 className="font-display font-semibold text-[15px] tracking-tight">{titulo}</h2>
          <div className="ml-auto flex items-center gap-2">{accion}</div>
        </header>
      )}
      <div className={ajustado ? "" : "p-5"}>{children}</div>
      {pie && <footer className="px-5 py-3 border-t border-borde bg-superficie-2 text-sm">{pie}</footer>}
    </section>
  );
}

const TONOS = {
  ok: "bg-ok-suave text-ok",
  marca: "bg-marca-suave text-marca-fuerte",
  alerta: "bg-alerta-suave text-alerta",
  peligro: "bg-peligro-suave text-peligro",
  gris: "bg-superficie-2 text-texto-suave border border-borde",
} as const;

export function Etiqueta({ tono = "gris", children }: { tono?: keyof typeof TONOS; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONOS[tono]}`}>
      {children}
    </span>
  );
}

const VARIANTES = {
  primario: "bg-marca text-white hover:bg-marca-fuerte border-transparent",
  neutro: "bg-superficie hover:bg-superficie-2 border-borde-fuerte",
  peligro: "bg-peligro-suave text-peligro hover:brightness-95 border-transparent",
  fantasma: "bg-transparent hover:bg-superficie-2 border-transparent",
} as const;

const MEDIDAS = { sm: "h-8 px-3 text-[13px]", md: "h-9.5 px-4 text-sm" } as const;

type BotonProps = {
  variante?: keyof typeof VARIANTES;
  medida?: keyof typeof MEDIDAS;
};

export function Boton({
  variante = "neutro", medida = "md", className = "", ...props
}: BotonProps & ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition
        disabled:opacity-50 disabled:pointer-events-none cursor-pointer
        ${VARIANTES[variante]} ${MEDIDAS[medida]} ${className}`}
    />
  );
}

export function BotonLink({
  variante = "neutro", medida = "md", className = "", ...props
}: BotonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition
        ${VARIANTES[variante]} ${MEDIDAS[medida]} ${className}`}
    />
  );
}

export function Campo({
  etiqueta, ayuda, className = "", ...props
}: { etiqueta?: string; ayuda?: string } & ComponentProps<"input">) {
  return (
    <label className="block">
      {etiqueta && <span className="block mb-1.5 text-[13px] font-medium text-texto-suave">{etiqueta}</span>}
      <input
        {...props}
        className={`w-full h-9.5 rounded-lg border border-borde bg-superficie px-3 text-sm
          outline-none transition focus:border-marca focus:ring-2 focus:ring-marca/20 ${className}`}
      />
      {ayuda && <span className="block mt-1 text-xs text-texto-suave">{ayuda}</span>}
    </label>
  );
}

export function Selector({
  etiqueta, className = "", children, ...props
}: { etiqueta?: string } & ComponentProps<"select">) {
  return (
    <label className="block">
      {etiqueta && <span className="block mb-1.5 text-[13px] font-medium text-texto-suave">{etiqueta}</span>}
      <select
        {...props}
        className={`w-full h-9.5 rounded-lg border border-borde bg-superficie px-2.5 text-sm
          outline-none transition focus:border-marca focus:ring-2 focus:ring-marca/20 ${className}`}
      >
        {children}
      </select>
    </label>
  );
}

export function Tabla({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`text-left font-medium text-[11px] uppercase tracking-wider text-texto-suave
      px-4 py-2.5 border-b border-borde bg-superficie-2 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function Td({
  children, className = "", colSpan,
}: { children?: ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 border-b border-borde align-middle ${className}`}>
      {children}
    </td>
  );
}

export function Vacio({ children, cols }: { children: ReactNode; cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-texto-suave">{children}</td>
    </tr>
  );
}

export function Aviso({ tono = "marca", children }: { tono?: keyof typeof TONOS; children: ReactNode }) {
  return <div className={`rounded-lg px-4 py-3 text-sm ${TONOS[tono]}`}>{children}</div>;
}

export function Saldo({ valor, moneda = "UYU", grande = false }: { valor: unknown; moneda?: "UYU" | "USD"; grande?: boolean }) {
  const n = Number(valor ?? 0);
  const color = n > 0 ? "text-peligro" : n < 0 ? "text-ok" : "text-texto-suave";
  const simbolo = moneda === "USD" ? "US$ " : "$ ";
  return (
    <span className={`num font-semibold ${color} ${grande ? "text-2xl" : ""}`}>
      {simbolo}
      {n.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

export function Titulo({ children, accion }: { children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="flex items-end gap-3 flex-wrap">
      <h1 className="font-display text-2xl font-bold tracking-tight">{children}</h1>
      <div className="ml-auto flex items-center gap-2">{accion}</div>
    </div>
  );
}

export function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5 text-sm">
      <span className="w-36 shrink-0 text-texto-suave">{etiqueta}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}
