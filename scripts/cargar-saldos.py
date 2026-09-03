#!/usr/bin/env python3
"""
Carga los saldos iniciales (los que venían del Memory G2000) como un
movimiento por cliente en el estado de cuenta.

    bash scripts/migrar.sh cargar-saldos            # muestra el plan, no toca nada
    bash scripts/migrar.sh cargar-saldos --aplicar  # inserta los movimientos

El match con los clientes de la base es por nombre: primero contra el nombre
del negocio, después contra la razón social de sus sucursales, y por último
contra la tabla de equivalencias de abajo (los casos donde el nombre del
Memory no se parece al nuestro). Lo que no matchea NO se carga: se lista.
"""
import os
import re
import sys
import unicodedata
import psycopg2

CSV = os.path.join(os.path.dirname(__file__), "saldos-iniciales.csv")
FECHA = "2026-09-03"          # fecha de corte de las capturas
DESCRIPCION = "Saldo inicial al 03/09/2026 (Memory G2000)"

# Nombre en el Memory  ->  nombre del negocio en el panel
EQUIVALENCIAS = {
    "AAFP SAS- BURGER VILAS-TBV": "TBV",
    "ALVARADO MATUTE RAUL- HARLEM CORDON": "HARLEM",
    "AGUIAR MARTIN- BUSTER": "MARTIN AGUIAR",
    "BOWERDIN S.A.-MANZANAR": "MANZANAR",
    "BOWERDIN S.A.- RIO": "RIO",
    "DE DIEZ- CHIVI BURGER": "DE DIEZ",
    "DIEGO PAGALDAY-GANGSTER BURGER": "GANGSTER BURGER",
    "ESADAR SAS DESMADRE P.CASTELLANO": "DESMADRE",
    "FOCUM SAS-SALAD BOWL": "SALAD BOWL",
    "HARLEM BEER SAS BUCEO": "HARLEM",
    "HDP BURGERS-LASGAR SAS": "HDP",
    "JATAL S.A. PANDA BAR": "PANDA BAR",
    "JOSE I.MONDELLI DESMADRE CORDON": "DESMADRE",
    "MUNDO MILA POCITOS-RIVERA SRL": "MUNDO MILA",
    "NBA-KEVIN CAMPLONE ZABALETA": "NBA",
    "NUEVO PACTO S.A. DESMADRE LAGOMAR": "DESMADRE",
    "NUEVO PACTO S.A. DESMADRE POCITOS": "DESMADRE",
    "PANYCAFECITO SAS-DESMADRE EL PINAR": "DESMADRE",
    "PENTAKILL SRL GARAGE BURGER": "GARAGE BURGER",
    "PIRIZ TURIELLI RODRIGO- BURGERIA": "LA BURGERIA",
    "SALCHI BURGUER": "SALCHI BURGER",
    "SANTO PECADO-FRANCO FRIEDRICH": "SANTO PECADO",
    "SICLAR SAS- DESMADRE PTA.CARRETAS": "DESMADRE",
    "SISON PINGUIN SAS- DESMADRE CENTRO": "DESMADRE",
    "SUSHI APP COSTA-WONDERGROUP SRL": "SUSHI APP",
    "SUSHI APP ZONA- WONDERGROUP SRL": "SUSHI APP",
    "ZONE BURGER - DEBEDENETTI MAURICIO": "BURGER ZONE",
}


def norm(s):
    s = unicodedata.normalize("NFD", (s or "").strip().upper())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^A-Z0-9 ]", " ", re.sub(r"\s+", " ", s)).strip()


def main(aplicar):
    url = os.environ.get("TUPACK_DATABASE_URL") or os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("Falta TUPACK_DATABASE_URL")
    con = psycopg2.connect(url)
    cur = con.cursor()

    cur.execute("SELECT id, nombre FROM businesses")
    negocios = {norm(n): (i, n) for i, n in cur.fetchall()}
    cur.execute("SELECT business_id, razon_social FROM clients WHERE razon_social IS NOT NULL")
    por_razon = {norm(r): b for b, r in cur.fetchall()}

    filas, sin_match, en_dolares = [], [], []
    with open(CSV) as f:
        next(f)
        for linea in f:
            _, codigo, nombre, moneda, monto, detalle = linea.rstrip("\n").split("|")
            clave = norm(nombre)
            destino = None

            if clave in negocios:                                   # nombre exacto
                destino = negocios[clave]
            elif nombre in EQUIVALENCIAS:                            # equivalencia manual
                destino = negocios.get(norm(EQUIVALENCIAS[nombre]))
            elif clave in por_razon:                                 # por razón social
                bid = por_razon[clave]
                destino = next(((i, n) for i, n in negocios.values() if i == bid), None)
            else:
                # Solo prefijo exacto ("FAKE BURGERS" -> FAKE). Nada de coincidir
                # por una palabra suelta: con plata de por medio, un match dudoso
                # es peor que ninguno.
                for k, v in negocios.items():
                    if len(k) >= 5 and clave.startswith(k + " "):
                        destino = v
                        break

            if moneda != "UYU":          # la cuenta lleva una sola moneda
                en_dolares.append((codigo, nombre, moneda, monto))
            elif destino:
                filas.append((destino, codigo, nombre, moneda, float(monto), detalle))
            else:
                sin_match.append((codigo, nombre, moneda, monto))

    print(f"{'CLIENTE EN EL PANEL':<26} {'NOMBRE EN EL MEMORY':<38} {'MON':<4} {'IMPORTE':>12}")
    print("-" * 84)
    for (bid, bnombre), codigo, nombre, moneda, monto, _ in filas:
        print(f"{bnombre:<26} {nombre[:37]:<38} {moneda:<4} {monto:>12,.2f}")

    if sin_match:
        print(f"\nSin cliente en el panel ({len(sin_match)}):")
        for codigo, nombre, moneda, monto in sin_match:
            print(f"  {codigo}  {nombre}  {moneda} {float(monto):,.2f}")

    if en_dolares:
        print(f"\nEn dólares, NO se cargan (la cuenta es en pesos) ({len(en_dolares)}):")
        for codigo, nombre, moneda, monto in en_dolares:
            print(f"  {codigo}  {nombre}  U$S {float(monto):,.2f}")

    pesos = sum(m for _, _, _, _, m, _ in filas)
    print(f"\n{len(filas)} movimientos a cargar · $ {pesos:,.2f}")

    if not aplicar:
        print("\n(simulación: no se tocó la base. Agregá --aplicar para cargarlos)")
        return

    for (bid, _), codigo, nombre, _, monto, detalle in filas:
        cur.execute(
            """INSERT INTO account_movements
                 (business_id, fecha, tipo, descripcion, monto, creado_por)
               VALUES (%s, %s, 'ajuste', %s, %s, 'carga inicial')""",
            (bid, FECHA, f"{DESCRIPCION} · {nombre} ({codigo}) · {detalle}", monto),
        )
    con.commit()
    print(f"\nCargados {len(filas)} movimientos.")


if __name__ == "__main__":
    main("--aplicar" in sys.argv)
