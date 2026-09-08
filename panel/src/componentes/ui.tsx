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
    <section className={`rounded-2xl border border-borde bg-superficie shadow-[var(--sombra)] ${desborde ? "" : "overflow-hidden"}`}>
      {(titulo || accion) && (
        <header className="flex items-center gap-3 px-5 py-4 border-b border-borde">
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

const PUNTOS = {
  ok: "bg-ok", marca: "bg-marca", alerta: "bg-alerta", peligro: "bg-peligro", gris: "bg-texto-suave",
} as const;

export function Etiqueta({
  tono = "gris", punto = false, children,
}: { tono?: keyof typeof TONOS; punto?: boolean; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONOS[tono]}`}>
      {punto && <span className={`size-1.5 rounded-full ${PUNTOS[tono]}`} />}
      {children}
    </span>
  );
}

/** Iniciales del cliente: le da cara a las tablas sin inventar un logo. */
export function Inicial({ nombre }: { nombre: string }) {
  const letras = nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-marca-suave
      text-[11px] font-semibold text-marca-fuerte">
      {letras || "?"}
    </span>
  );
}

/** Número grande con su etiqueta: la fila de indicadores de arriba. */
export function Indicador({
  titulo, valor, detalle, tono, href, icono,
}: {
  titulo: string; valor: ReactNode; detalle?: ReactNode;
  tono?: "ok" | "alerta" | "peligro" | "marca"; href?: string; icono?: ReactNode;
}) {
  const color = tono === "peligro" ? "text-peligro" : tono === "ok" ? "text-ok"
    : tono === "alerta" ? "text-alerta" : tono === "marca" ? "text-marca" : "";
  const cuerpo = (
    <>
      <div className="flex items-center gap-2">
        {icono && <span className="text-texto-suave">{icono}</span>}
        <span className="text-[13px] text-texto-suave">{titulo}</span>
      </div>
      <div className={`mt-1 font-display text-[20px] sm:text-[26px] leading-tight font-bold num
        truncate ${color}`}>{valor}</div>
      {detalle && <div className="mt-0.5 text-xs text-texto-suave">{detalle}</div>}
    </>
  );
  const clases = `rounded-2xl border border-borde bg-superficie p-4 shadow-[var(--sombra)] ${href ? "transition hover:border-marca hover:-translate-y-0.5" : ""}`;
  return href ? <Link href={href} className={`block ${clases}`}>{cuerpo}</Link> : <div className={clases}>{cuerpo}</div>;
}

const VARIANTES = {
  primario: "bg-marca text-white hover:bg-marca-fuerte border-transparent",
  neutro: "bg-superficie hover:bg-superficie-2 border-borde-fuerte",
  peligro: "bg-peligro-suave text-peligro hover:brightness-95 border-transparent",
  fantasma: "bg-transparent hover:bg-superficie-2 border-transparent",
} as const;

const MEDIDAS = { sm: "h-8 px-3 text-[13px]", md: "h-10 px-4 text-sm" } as const;

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
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border font-medium transition
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border font-medium transition
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
        className={`w-full h-10 rounded-xl border border-borde bg-superficie px-3.5 text-sm
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
        className={`w-full h-10 rounded-xl border border-borde bg-superficie px-3 text-sm
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

export function Titulo({
  children, accion, bajada,
}: { children: ReactNode; accion?: ReactNode; bajada?: ReactNode }) {
  return (
    <div className="flex items-end gap-3 flex-wrap">
      <div>
        <h1 className="font-display text-[26px] leading-tight font-bold tracking-tight">{children}</h1>
        {bajada && <p className="mt-1 text-sm text-texto-suave">{bajada}</p>}
      </div>
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
