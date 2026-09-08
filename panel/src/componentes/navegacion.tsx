"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SECCIONES = [
  {
    titulo: "Operación",
    items: [
      { href: "/inicio", texto: "Resumen", icono: "M3 10 10 3l7 7v7a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z" },
      { href: "/ordenes", texto: "Órdenes", icono: "M4 3h9l3 3v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 6h8M6 12h6" },
      { href: "/clientes", texto: "Clientes", icono: "M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 8v-1a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v1m14-9a3 3 0 1 0-2-5.2M19 17v-1a4 4 0 0 0-3-3.8" },
    ],
  },
  {
    titulo: "Depósito",
    items: [
      { href: "/productos", texto: "Productos", icono: "M10 2 3 6v8l7 4 7-4V6l-7-4zM3 6l7 4 7-4M10 10v8" },
      { href: "/stock", texto: "Stock", icono: "M3 4h14v4H3zM3 12h14v4H3zM6 6h2M6 14h2" },
    ],
  },
  {
    titulo: "Dinero",
    items: [{ href: "/cuentas", texto: "Cuentas", icono: "M2 5h16v10H2zM2 9h16M6 13h4" }],
  },
];

export function Navegacion({ nombre }: { nombre: string }) {
  const path = usePathname();
  const [abierto, setAbierto] = useState(false);

  const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  const menu = SECCIONES.map((seccion) => (
    <div key={seccion.titulo} className="mb-5">
      <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-suave/70">
        {seccion.titulo}
      </p>
      <div className="flex flex-col gap-0.5">
        {seccion.items.map((item) => {
          const activo = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAbierto(false)}
              className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition
                ${activo
                  ? "bg-marca-suave text-marca-fuerte"
                  : "text-texto-suave hover:bg-superficie-2 hover:text-texto"}`}
            >
              {activo && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-marca" />}
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
                   strokeLinecap="round" strokeLinejoin="round" className="size-[18px] shrink-0">
                <path d={item.icono} />
              </svg>
              {item.texto}
            </Link>
          );
        })}
      </div>
    </div>
  ));

  return (
    <>
      {/* Barra de arriba en celular */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-borde bg-superficie px-4 h-14">
        <button onClick={() => setAbierto((v) => !v)} aria-label="Menú" className="p-2 -ml-2 cursor-pointer">
          <svg viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <Logo />
        <span className="ml-auto grid size-8 place-items-center rounded-full bg-marca-suave text-xs font-semibold text-marca-fuerte">
          {iniciales}
        </span>
      </div>

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-[248px] shrink-0 border-r border-borde bg-superficie
          flex-col p-4 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:flex lg:translate-x-0
          ${abierto ? "flex translate-x-0" : "hidden -translate-x-full"}`}
      >
        <div className="px-2 pb-6 pt-2">
          <Logo />
        </div>

        <nav className="flex-1 overflow-y-auto">{menu}</nav>

        <div className="border-t border-borde pt-3">
          <div className="flex items-center gap-2.5 px-2 pb-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-marca-suave text-xs font-semibold text-marca-fuerte">
              {iniciales}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">{nombre}</p>
              <p className="text-xs text-texto-suave">Administración</p>
            </div>
          </div>
          <form action="/api/salir" method="POST">
            <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-texto-suave
              hover:bg-superficie-2 hover:text-texto transition cursor-pointer">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
                   strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
                <path d="M8 17H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3M13 14l4-4-4-4M17 10H8" />
              </svg>
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

function Logo() {
  return (
    <Link href="/inicio" className="block">
      <Image src="/tupack-logo.png" alt="TuPack" width={1968} height={332} priority
             className="h-6 w-auto dark:brightness-125" />
      <p className="mt-1 text-[11px] text-texto-suave">Panel de administración</p>
    </Link>
  );
}
