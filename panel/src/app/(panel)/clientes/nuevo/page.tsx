import { crearNegocio } from "@/acciones/clientes";
import { Tarjeta, Titulo, BotonLink, Boton, Campo, Aviso } from "@/componentes/ui";

export const metadata = { title: "Nuevo cliente" };

export default async function NuevoCliente({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      <Titulo accion={<BotonLink href="/clientes">← Volver</BotonLink>}>Nuevo cliente</Titulo>
      <div className="max-w-xl">
        <Tarjeta titulo="Datos del negocio">
          <form action={crearNegocio} className="flex flex-col gap-4">
            {error && <Aviso tono="peligro">{error}</Aviso>}
            <Campo etiqueta="Nombre del negocio" name="nombre" required autoFocus
                   ayuda="Se crea con una sucursal principal; después le agregás las demás." />
            <label className="block">
              <span className="block mb-1.5 text-[13px] font-medium text-texto-suave">Notas</span>
              <textarea name="notas" rows={3}
                className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-sm resize-y
                  outline-none focus:border-marca focus:ring-2 focus:ring-marca/20" />
            </label>
            <div><Boton variante="primario" type="submit">Crear cliente</Boton></div>
          </form>
        </Tarjeta>
      </div>
    </>
  );
}
