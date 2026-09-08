"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ITEMS = [
  { href: "/ordenes", texto: "Órdenes", icono: "M4 4h12l2 4v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 5h14M8 13h6" },
  { href: "/clientes", texto: "Clientes", icono: "M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 12v-1a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v1m14-8a3 3 0 1 0-2-5.2M19 20v-1a4 4 0 0 0-3-3.8" },
  { href: "/productos", texto: "Productos", icono: "M10 2 3 6v8l7 4 7-4V6l-7-4zM3 6l7 4 7-4M10 10v8" },
  { href: "/stock", texto: "Stock", icono: "M3 4h14v4H3zM3 12h14v4H3zM6 6h2M6 14h2" },
  { href: "/cuentas", texto: "Cuentas", icono: "M2 5h16v10H2zM2 9h16M6 13h4" },
];

export function Navegacion({ nombre }: { nombre: string }) {
  const path = usePathname();
  const [abierto, setAbierto] = useState(false);

  const enlaces = ITEMS.map((item) => {
    const activo = path === item.href || path.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setAbierto(false)}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition
          ${activo ? "bg-marca text-white" : "text-texto-suave hover:bg-superficie-2 hover:text-texto"}`}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
             strokeLinecap="round" strokeLinejoin="round" className="size-[18px] shrink-0">
          <path d={item.icono} />
        </svg>
        {item.texto}
      </Link>
    );
  });

  return (
    <>
      {/* Barra de arriba en celular */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-borde bg-superficie px-4 h-14">
        <button onClick={() => setAbierto((v) => !v)} aria-label="Menú" className="p-2 -ml-2 cursor-pointer">
          <svg viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <Marca />
        <span className="ml-auto text-sm text-texto-suave">{nombre}</span>
      </div>

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-60 shrink-0 border-r border-borde bg-superficie
          flex-col p-4 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:flex lg:translate-x-0
          ${abierto ? "flex translate-x-0" : "hidden -translate-x-full"}`}
      >
        <div className="px-2 pb-5 pt-1">
          <Marca />
          <p className="mt-0.5 text-[11px] text-texto-suave">Panel de administración</p>
        </div>

        <nav className="flex flex-col gap-1">{enlaces}</nav>

        <div className="mt-auto border-t border-borde pt-3">
          <div className="px-3 pb-2">
            <p className="text-sm font-medium leading-tight">{nombre}</p>
            <p className="text-xs text-texto-suave">Administración</p>
          </div>
          <form action="/api/salir" method="POST">
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-texto-suave
              hover:bg-superficie-2 hover:text-texto transition cursor-pointer">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {abierto && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setAbierto(false)} />
      )}
    </>
  );
}

function Marca() {
  return (
    <span className="font-display text-lg font-bold tracking-tight text-marca">
      TuPack<span className="text-texto-suave font-medium">.com.uy</span>
    </span>
  );
}
