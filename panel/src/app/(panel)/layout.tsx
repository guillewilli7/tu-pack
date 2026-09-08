import { pedirSesion } from "@/lib/auth";
import { Navegacion } from "@/componentes/navegacion";

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const sesion = await pedirSesion();
  return (
    <div className="lg:flex">
      <Navegacion nombre={sesion.nombre || sesion.email} />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-[1240px] flex flex-col gap-5 aparece">{children}</div>
      </main>
    </div>
  );
}
