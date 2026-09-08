import { redirect } from "next/navigation";
import { iniciarSesion, sesionActual } from "@/lib/auth";
import { Boton, Campo } from "@/componentes/ui";

export const metadata = { title: "Iniciar sesión" };

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await sesionActual()) redirect("/ordenes");
  const { error } = await searchParams;

  async function entrar(datos: FormData) {
    "use server";
    const problema = await iniciarSesion(
      String(datos.get("email") ?? ""),
      String(datos.get("password") ?? "")
    );
    if (problema) redirect(`/login?error=${encodeURIComponent(problema)}`);
    redirect("/ordenes");
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-7">
          <span className="font-display text-3xl font-bold tracking-tight text-marca">
            TuPack<span className="text-texto-suave font-medium">.com.uy</span>
          </span>
          <p className="mt-1 text-sm text-texto-suave">Panel de administración</p>
        </div>

        <form
          action={entrar}
          className="rounded-xl border border-borde bg-superficie p-6 shadow-[var(--sombra)] flex flex-col gap-4"
        >
          {error && (
            <div className="rounded-lg bg-peligro-suave px-3 py-2 text-sm text-peligro">{error}</div>
          )}
          <Campo etiqueta="Correo electrónico" name="email" type="email" required autoFocus autoComplete="username" />
          <Campo etiqueta="Contraseña" name="password" type="password" required autoComplete="current-password" />
          <Boton variante="primario" type="submit" className="w-full">Entrar</Boton>
        </form>
      </div>
    </div>
  );
}
