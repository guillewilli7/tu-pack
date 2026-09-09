import Image from "next/image";
import { redirect } from "next/navigation";
import { iniciarSesion, sesionActual } from "@/lib/auth";
import { Boton, Campo } from "@/componentes/ui";

export const metadata = { title: "Iniciar sesión — TuPack" };

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
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Panel izquierdo: marca */}
      <div className="hidden lg:flex flex-col items-center justify-center relative bg-navy overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute -top-20 -left-20 size-80 rounded-full bg-marca" />
          <div className="absolute bottom-10 right-10 size-60 rounded-full bg-marca" />
          <div className="absolute top-1/3 right-1/4 size-40 rounded-full bg-marca-fuerte" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 px-10 max-w-md text-center">
          <Image
            src="/tupack-logo.png"
            alt="TuPack"
            width={1968}
            height={332}
            priority
            className="h-14 w-auto brightness-0 invert"
          />
          <div className="h-px w-16 bg-white/20" />
          <p className="text-white/80 text-3xl font-bold leading-relaxed" style={{ fontFamily: "'Courier New', monospace", letterSpacing: "0.15em" }}>
            CEBRAAAAAAAAAAAAAAA!!!
          </p>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex flex-col items-center justify-center px-6 py-10 bg-fondo">
        <div className="w-full max-w-[380px] aparece">
          <div className="mb-10 flex flex-col items-center lg:mb-8">
            <div className="lg:hidden mb-6">
              <div className="size-14 rounded-2xl bg-navy grid place-items-center shadow-lg">
                <Image
                  src="/tupack-logo.png"
                  alt="TuPack"
                  width={1968}
                  height={332}
                  priority
                  className="h-4 w-auto brightness-0 invert"
                />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-texto">
              Iniciar sesión
            </h1>
            <p className="mt-1.5 text-sm text-texto-suave">
              Ingresá al panel de TuPack
            </p>
          </div>

          <form
            action={entrar}
            className="rounded-2xl border border-borde bg-superficie p-6 shadow-[var(--sombra)] flex flex-col gap-4"
          >
            {error && (
              <div className="rounded-lg bg-peligro-suave px-3 py-2.5 text-sm text-peligro flex items-center gap-2">
                <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            <Campo etiqueta="Correo electrónico" name="email" type="email" required autoFocus autoComplete="username" />
            <Campo etiqueta="Contraseña" name="password" type="password" required autoComplete="current-password" />
            <Boton variante="primario" type="submit" className="w-full mt-1">Entrar</Boton>
          </form>

          <p className="mt-6 text-center text-xs text-texto-suave/60">
            TuPack &middot; tupack.com.uy
          </p>
        </div>
      </div>
    </div>
  );
}
