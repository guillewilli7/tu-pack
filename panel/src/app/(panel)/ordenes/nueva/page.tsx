import { crearOrden } from "@/acciones/ordenes";
import { NuevaOrden } from "@/componentes/nueva-orden";
import { BotonLink, Titulo } from "@/componentes/ui";

export const metadata = { title: "Nueva orden" };

export default function PaginaNuevaOrden() {
  return (
    <>
      <Titulo accion={<BotonLink href="/ordenes">← Volver</BotonLink>}>Nueva orden</Titulo>
      <NuevaOrden crear={crearOrden} />
    </>
  );
}
