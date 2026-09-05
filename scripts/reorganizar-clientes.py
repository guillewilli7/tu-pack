#!/usr/bin/env python3
"""
Reorganización de clientes pedida el 03/09/2026:

  1. DESMADRE se abre en un negocio por local. Cada uno se lleva su sucursal
     (con su RUT y su facturación) y su cuenta corriente, pero todos siguen
     consumiendo el MISMO stock: apuntan al DESMADRE original, que queda como
     dueño del depósito.
  2. Los movimientos de cuenta que se habían cargado en DESMADRE se reparten
     al local que les corresponde.
  3. Se dan de alta los clientes que estaban en el Memory y no en el panel.
  4. Se cargan los saldos en dólares (ahora la cuenta lleva las dos monedas).

    bash scripts/migrar.sh reorganizar             # muestra el plan
    bash scripts/migrar.sh reorganizar --aplicar   # lo hace
"""
import os
import sys
import psycopg2

FECHA = "2026-09-03"
ORIGEN = "Saldo inicial al 03/09/2026 (Memory G2000)"

# Local de DESMADRE -> (sucursal que ya está en el panel, texto del Memory)
LOCALES = [
    ("DESMADRE POCITOS",        "POCITOS",        "NUEVO PACTO S.A. DESMADRE POCITOS"),
    ("DESMADRE LAGOMAR",        "LAGOMAR",        "NUEVO PACTO S.A. DESMADRE LAGOMAR"),
    ("DESMADRE CENTRO",         "CENTRO",         "SISON PINGUIN SAS- DESMADRE CENTRO"),
    ("DESMADRE PUNTA CARRETAS", "PUNTA CARRETAS", "SICLAR SAS- DESMADRE PTA.CARRETAS"),
    ("DESMADRE CORDON",         "CORDON",         "JOSE I.MONDELLI DESMADRE CORDON"),
    # Pérez Castellano 1515 es la sucursal que el Excel llama CIUDAD VIEJA.
    ("DESMADRE CIUDAD VIEJA",   "CIUDAD VIEJA",   "ESADAR SAS DESMADRE P.CASTELLANO"),
    ("DESMADRE JACINTO VERA",   "JACINTO VERA",   None),   # su captura salió movida
    ("DESMADRE ???",            "???",            None),   # sucursal a confirmar
    ("DESMADRE EL PINAR",       None,             "PANYCAFECITO SAS-DESMADRE EL PINAR"),
]

# Clientes que están en el Memory y no existían en el panel: (nombre, saldo)
NUEVOS = [
    ("ROTI CENTRAL",   "ROTI CENTRAL SAS- ANDANTE",     15330.00),
    ("NICLANI",        "NICLANI SAS",                   13300.00),
    ("EL MIRADOR",     "EL MIRADOR- SIRIO SRL",          2000.00),
    ("SUTEKI SUSHI",   "SUTEKI SUSHI- RIOS HILARIO R.", 19110.00),
    ("GABBS",          "GABBS S.A.S",                   17100.00),
    ("OLA POKE",       "OLA POKE - CEL FLEX SRL",       33616.00),
    ("KITCHEN FACTORY","KITCHEN FACTORY SAS",           45029.00),
]

# Saldos en dólares: (negocio destino, texto del Memory, importe)
DOLARES = [
    ("ROTI CENTRAL",     "ROTI CENTRAL SAS- ANDANTE",        109.80),
    ("DESMADRE LAGOMAR", "NUEVO PACTO S.A. DESMADRE LAGOMAR", 109.80),
    ("PIZZA CENTRO",     "PIZZA CENTRO",                     550.00),
]


def main(aplicar):
    url = os.environ.get("TUPACK_DATABASE_URL") or os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("Falta TUPACK_DATABASE_URL")
    con = psycopg2.connect(url)
    cur = con.cursor()
    plan = []

    cur.execute("SELECT id FROM businesses WHERE nombre = 'DESMADRE'")
    fila = cur.fetchone()
    if not fila:
        sys.exit("No existe el negocio DESMADRE")
    deposito = fila[0]

    # ── 1 y 2. Un negocio por local ─────────────────────────────────────────
    for nombre, sucursal, texto_memory in LOCALES:
        cur.execute("SELECT id FROM businesses WHERE nombre = %s", (nombre,))
        if cur.fetchone():
            plan.append(f"= {nombre}: ya existe, se saltea")
            continue

        sucursal_id = None
        if sucursal:
            cur.execute(
                "SELECT id FROM clients WHERE business_id = %s AND sucursal = %s",
                (deposito, sucursal))
            r = cur.fetchone()
            sucursal_id = r[0] if r else None

        plan.append(f"+ {nombre}" +
                    (f" ← sucursal {sucursal}" if sucursal_id else " (sucursal nueva)") +
                    (f" · saldo de «{texto_memory}»" if texto_memory else " · sin saldo"))

        if not aplicar:
            continue

        cur.execute(
            """INSERT INTO businesses (nombre, stock_owner_id, notas)
               VALUES (%s, %s, 'Local de DESMADRE: comparte el stock del depósito')
               RETURNING id""",
            (nombre, deposito))
        nuevo = cur.fetchone()[0]

        if sucursal_id:
            cur.execute("UPDATE clients SET business_id = %s WHERE id = %s", (nuevo, sucursal_id))
        else:
            cur.execute("INSERT INTO clients (business_id, sucursal) VALUES (%s, %s)",
                        (nuevo, sucursal or None))

        if texto_memory:
            cur.execute(
                """UPDATE account_movements SET business_id = %s
                    WHERE business_id = %s AND descripcion LIKE %s""",
                (nuevo, deposito, f"%{texto_memory}%"))

    # ── 3. Clientes nuevos ──────────────────────────────────────────────────
    for nombre, texto_memory, saldo in NUEVOS:
        cur.execute("SELECT id FROM businesses WHERE nombre = %s", (nombre,))
        if cur.fetchone():
            plan.append(f"= {nombre}: ya existe, se saltea")
            continue
        plan.append(f"+ {nombre} (cliente nuevo) · $ {saldo:,.2f}")
        if not aplicar:
            continue
        cur.execute(
            "INSERT INTO businesses (nombre, notas) VALUES (%s, %s) RETURNING id",
            (nombre, f"Alta desde el Memory G2000 ({texto_memory})"))
        nuevo = cur.fetchone()[0]
        cur.execute("INSERT INTO clients (business_id) VALUES (%s)", (nuevo,))
        cur.execute(
            """INSERT INTO account_movements
                 (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
               VALUES (%s, %s, 'ajuste', %s, %s, 'UYU', 'carga inicial')""",
            (nuevo, FECHA, f"{ORIGEN} · {texto_memory}", saldo))

    # ── 4. Saldos en dólares ────────────────────────────────────────────────
    for nombre, texto_memory, monto in DOLARES:
        plan.append(f"$ {nombre}: U$S {monto:,.2f}")
        if not aplicar:
            continue
        cur.execute("SELECT id FROM businesses WHERE nombre = %s", (nombre,))
        r = cur.fetchone()
        if not r:
            plan.append(f"  ! {nombre} no existe: no se carga el saldo en dólares")
            continue
        cur.execute(
            """INSERT INTO account_movements
                 (business_id, fecha, tipo, descripcion, monto, moneda, creado_por)
               VALUES (%s, %s, 'ajuste', %s, %s, 'USD', 'carga inicial')""",
            (r[0], FECHA, f"{ORIGEN} · {texto_memory}", monto))

    print("\n".join(plan))
    if aplicar:
        con.commit()
        print("\nAplicado.")
        cur.execute("""SELECT b.nombre, tupack_saldo(b.id,'UYU'), tupack_saldo(b.id,'USD')
                         FROM businesses b WHERE b.nombre LIKE 'DESMADRE%' ORDER BY b.nombre""")
        print(f"\n{'NEGOCIO':<26}{'PESOS':>14}{'DÓLARES':>12}")
        for n, uyu, usd in cur.fetchall():
            print(f"{n:<26}{float(uyu):>14,.2f}{float(usd):>12,.2f}")
    else:
        print("\n(simulación: no se tocó la base. Agregá --aplicar)")


if __name__ == "__main__":
    main("--aplicar" in sys.argv)
