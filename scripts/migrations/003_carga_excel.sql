-- Carga inicial generada por scripts/generar-carga-excel.py
-- Fuente: FINAL base de conocimiento Agente TuPack.xlsx
-- Correr DESPUÉS de 001_modelo_stock.sql

BEGIN;

-- Negocios ------------------------------------------------------------
INSERT INTO businesses (nombre) VALUES ('A LA PAR');
INSERT INTO businesses (nombre) VALUES ('AMORE PASTAS');
INSERT INTO businesses (nombre) VALUES ('BIRRITA SAS');
INSERT INTO businesses (nombre) VALUES ('BLISS');
INSERT INTO businesses (nombre) VALUES ('BOCADITO');
INSERT INTO businesses (nombre) VALUES ('BRUJONA SRL');
INSERT INTO businesses (nombre) VALUES ('BURGER ZONE');
INSERT INTO businesses (nombre) VALUES ('CAFÉ DORÉ');
INSERT INTO businesses (nombre) VALUES ('CANNABIS');
INSERT INTO businesses (nombre) VALUES ('CLUB DEL BAJON');
INSERT INTO businesses (nombre) VALUES ('COMODINES');
INSERT INTO businesses (nombre) VALUES ('DE DIEZ');
INSERT INTO businesses (nombre) VALUES ('DESMADRE');
INSERT INTO businesses (nombre) VALUES ('DVICIO');
INSERT INTO businesses (nombre) VALUES ('EL PALENQUE');
INSERT INTO businesses (nombre) VALUES ('FAKE');
INSERT INTO businesses (nombre) VALUES ('FEDERACION');
INSERT INTO businesses (nombre) VALUES ('GANGSTER BURGER');
INSERT INTO businesses (nombre) VALUES ('GARAGE BURGER');
INSERT INTO businesses (nombre) VALUES ('GARAGE VEGGIE');
INSERT INTO businesses (nombre) VALUES ('GERNERAL');
INSERT INTO businesses (nombre) VALUES ('HARLEM');
INSERT INTO businesses (nombre) VALUES ('HDP');
INSERT INTO businesses (nombre) VALUES ('HORREO BURGER');
INSERT INTO businesses (nombre) VALUES ('INFIEL');
INSERT INTO businesses (nombre) VALUES ('JERO');
INSERT INTO businesses (nombre) VALUES ('JONLU');
INSERT INTO businesses (nombre) VALUES ('LA BARCA');
INSERT INTO businesses (nombre) VALUES ('LA BURGERIA');
INSERT INTO businesses (nombre) VALUES ('LA CHINGADA');
INSERT INTO businesses (nombre) VALUES ('LA DIEZ');
INSERT INTO businesses (nombre) VALUES ('LA RECORRE');
INSERT INTO businesses (nombre) VALUES ('LARRYS');
INSERT INTO businesses (nombre) VALUES ('MADRE MIA');
INSERT INTO businesses (nombre) VALUES ('MANZANAR');
INSERT INTO businesses (nombre) VALUES ('MARTIN AGUIAR');
INSERT INTO businesses (nombre) VALUES ('MUNDO MILA');
INSERT INTO businesses (nombre) VALUES ('NBA');
INSERT INTO businesses (nombre) VALUES ('NELSON');
INSERT INTO businesses (nombre) VALUES ('PAN BASTARDO');
INSERT INTO businesses (nombre) VALUES ('PANDA BAR');
INSERT INTO businesses (nombre) VALUES ('PIZZA BURGER');
INSERT INTO businesses (nombre) VALUES ('PIZZA CENTRO');
INSERT INTO businesses (nombre) VALUES ('RIO');
INSERT INTO businesses (nombre) VALUES ('SALAD BOWL');
INSERT INTO businesses (nombre) VALUES ('SALCHI BURGER');
INSERT INTO businesses (nombre) VALUES ('SAN SORRENTINO');
INSERT INTO businesses (nombre) VALUES ('SANGUCHE');
INSERT INTO businesses (nombre) VALUES ('SANTO PECADO');
INSERT INTO businesses (nombre) VALUES ('SANXES');
INSERT INTO businesses (nombre) VALUES ('SHARPER BURGER');
INSERT INTO businesses (nombre) VALUES ('SOULMELT');
INSERT INTO businesses (nombre) VALUES ('SUSHI APP');
INSERT INTO businesses (nombre) VALUES ('TATU');
INSERT INTO businesses (nombre) VALUES ('TBV');
INSERT INTO businesses (nombre) VALUES ('TEQUEÑOS');

-- Sucursales (facturación y entrega) ---------------------------------
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, NULL, NULL, NULL, 'Retira en depósito', NULL, 'Sin datos de facturación', 'Retira en depósito' FROM businesses WHERE nombre = 'LA DIEZ';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, NULL, NULL, NULL, 'Es de San José. Retiran en Cebollatí', NULL, 'Sin datos de facturación (Chivi Burger)', 'Es de San José. Retiran en Cebollatí' FROM businesses WHERE nombre = 'DE DIEZ';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'AMORE PASTAS', '218242820013', 'Pedro Bustamante 1438', 'Pedro Bustamante 1438', 'de 8 a 15 hs', 'AMORE PASTAS
RUT 218242820013
Pedro Bustamante 1438', 'Pedro Bustamante 1438 – de 8 a 15 hs
Otra casa en barrio Palermo, calle Isla de Flores' FROM businesses WHERE nombre = 'AMORE PASTAS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'SHARPER BURGER', NULL, 'Hudson 5581 y La Vía (casi Garzón)', 'Hudson 5581 y La Vía, casi Garzón', NULL, 'SHARPER BURGER
Hudson 5581 y La Vía (casi Garzón)', 'Hudson 5581 y La Vía, casi Garzón
Entre 8:30 y 13 hs, y después de las 16 hs' FROM businesses WHERE nombre = 'SHARPER BURGER';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'PAN BASTARDO', '218554120017', '21 de Setiembre 2633', '21 de Setiembre 2633', 'después de las 13 hs', 'PAN BASTARDO
RUT 218554120017
21 de Setiembre 2633', '21 de Setiembre 2633 – después de las 13 hs' FROM businesses WHERE nombre = 'PAN BASTARDO';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM businesses WHERE nombre = 'HORREO BURGER';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'DVICIO SAS', '219484970015', 'Santiago de Chile 1015', 'Santiago de Chile 1015', NULL, 'DVICIO SAS
RUT 219484970015
Santiago de Chile 1015', 'Santiago de Chile 1015' FROM businesses WHERE nombre = 'DVICIO';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'PARQUE MIRAMAR', 'WONDERGROUP SRL (Sushi App Parque Miramar)', '218319790016', 'Gabriela Mistral 2127', 'Gabriela Mistral 2127', 'de 10 a 16 hs', 'WONDERGROUP SRL (Sushi App Parque Miramar)
RUT 218319790016
Gabriela Mistral 2127', 'Gabriela Mistral 2127 – de 10 a 16 hs
Cierra lunes' FROM businesses WHERE nombre = 'SUSHI APP';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'ZONA AMERICA', 'WONDERGROUP SRL (Sushi App Zona América)', '218319790016', NULL, 'Federación – Violeta Acosta – Buenos Aires 515', NULL, 'WONDERGROUP SRL (Sushi App Zona América)
RUT 218319790016', 'Federación – Violeta Acosta – Buenos Aires 515' FROM businesses WHERE nombre = 'SUSHI APP';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'JATAL PANDA BAR', '218739420017', 'Joaquín Núñez 2855', 'Joaquín Núñez 2855', 'de 10 a 15 hs', 'JATAL PANDA BAR
RUT 218739420017
Joaquín Núñez 2855', 'Joaquín Núñez 2855 – de 10 a 15 hs' FROM businesses WHERE nombre = 'PANDA BAR';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'PENTAKILL SRL (Garage Burger)', '218511650014', 'Zorrilla de San Martín 285', 'Zorrilla de San Martín 285', 'de 10:30 a 16 hs', 'PENTAKILL SRL (Garage Burger)
RUT 218511650014
Zorrilla de San Martín 285', 'Zorrilla de San Martín 285 – de 10:30 a 16 hs
Contacto: Diego Pagalday' FROM businesses WHERE nombre = 'GARAGE BURGER';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'BIRRITA SRL (Mundo Mila Prado)', '219401530012', '19 de Abril 1070', '19 de Abril 1070', NULL, 'BIRRITA SRL (Mundo Mila Prado)
RUT 219401530012
19 de Abril 1070', '19 de Abril 1070
Cierra los lunes' FROM businesses WHERE nombre = 'BIRRITA SAS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'POCITOS', 'RIVERA SRL (Mundo Mila Pocitos)', '210123110017', 'Rivera 2593 y Simón Bolívar', 'Rivera 2593 y Simón Bolívar', NULL, 'RIVERA SRL (Mundo Mila Pocitos)
RUT 210123110017
Rivera 2593 y Simón Bolívar', 'Rivera 2593 y Simón Bolívar
Cierra los lunes' FROM businesses WHERE nombre = 'MUNDO MILA';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'AGUIAR MARTÍN (Buster House)', '020164990016', NULL, 'Carga en depósito', NULL, 'AGUIAR MARTÍN (Buster House)
RUT 020164990016', 'Carga en depósito' FROM businesses WHERE nombre = 'MARTIN AGUIAR';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'PIZZA BURGER', NULL, 'Aurelia Ramos de Segarra 4496 esq. Tula', 'Aurelia Ramos de Segarra 4496 esq. Tula', 'hasta 16 hs', 'PIZZA BURGER
Aurelia Ramos de Segarra 4496 esq. Tula', 'Aurelia Ramos de Segarra 4496 esq. Tula – hasta 16 hs' FROM businesses WHERE nombre = 'PIZZA BURGER';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'LA BURGUERÍA – Píriz Turielli Rodrigo', '217663790015', '8 de Octubre 4649', '8 de Octubre 4649', 'de 11 hs en adelante', 'LA BURGUERÍA – Píriz Turielli Rodrigo
RUT 217663790015
8 de Octubre 4649', '8 de Octubre 4649 – de 11 hs en adelante' FROM businesses WHERE nombre = 'LA BURGERIA';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'GANGSTER BURGER – Diego Pagalday', '218949330014', 'Julio Puppo 5814 y Scoseria', 'Julio Puppo 5814 y Scoseria', 'de 10 a 15 hs', 'GANGSTER BURGER – Diego Pagalday
RUT 218949330014
Julio Puppo 5814 y Scoseria', 'Julio Puppo 5814 y Scoseria – de 10 a 15 hs' FROM businesses WHERE nombre = 'GANGSTER BURGER';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'SALCHI BURGER', NULL, 'Llupes 4454 bis', 'Llupes 4454 bis', 'de 11 a 13 hs', 'SALCHI BURGER
Llupes 4454 bis', 'Llupes 4454 bis – de 11 a 13 hs' FROM businesses WHERE nombre = 'SALCHI BURGER';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'CORDON', 'HARLEM – Alvarado Matute Raúl', '219215460018', 'Guayabos 1865 bis', 'Guayabos 1865 bis', 'después de las 13 hs', 'HARLEM – Alvarado Matute Raúl
RUT 219215460018
Guayabos 1865 bis', 'Guayabos 1865 bis – después de las 13 hs' FROM businesses WHERE nombre = 'HARLEM';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'BUCEO', 'HARLEM BEER SAS', '218612590017', 'Rivera 3522', 'Rivera 3522', 'después de las 13 hs', 'HARLEM BEER SAS
RUT 218612590017
Rivera 3522', 'Rivera 3522 – después de las 13 hs' FROM businesses WHERE nombre = 'HARLEM';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'ENRIQUE MIRANDA (La Barca)', '211784580012', 'Río de la Plata 1401', 'Río de la Plata 1401', 'de 11 a 15 hs', 'ENRIQUE MIRANDA (La Barca)
RUT 211784580012
Río de la Plata 1401', 'Río de la Plata 1401 – de 11 a 15 hs' FROM businesses WHERE nombre = 'LA BARCA';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'CIUDAD VIEJA', 'BERGERET LARRAÑAGA JUAN MARTÍN (Salad Bowl Ciudad Vieja)', '218717240016', 'Treinta y Tres 1381', 'Treinta y Tres 1381', NULL, 'BERGERET LARRAÑAGA JUAN MARTÍN (Salad Bowl Ciudad Vieja)
RUT 218717240016
Treinta y Tres 1381', 'Treinta y Tres 1381' FROM businesses WHERE nombre = 'SALAD BOWL';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'POCITOS', 'FOCUM SAS (Salad Bowl Pocitos)', '220342490017', 'Brito del Pino 1167', 'Brito del Pino 1167', NULL, 'FOCUM SAS (Salad Bowl Pocitos)
RUT 220342490017
Brito del Pino 1167', 'Brito del Pino 1167' FROM businesses WHERE nombre = 'SALAD BOWL';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'LAGOMAR', 'NUEVO PACTO SA (Desmadre Lagomar)', '218336960013', 'Giannattasio 21800 y Becú', 'Giannattasio 21800 y Becú', 'de 9 a 16 hs', 'NUEVO PACTO SA (Desmadre Lagomar)
RUT 218336960013
Giannattasio 21800 y Becú', 'Giannattasio 21800 y Becú – de 9 a 16 hs' FROM businesses WHERE nombre = 'DESMADRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'POCITOS', 'NUEVO PACTO SA (Desmadre Pocitos)', '218336960013', 'Juan Pablo Laguna 3492', 'Juan Pablo Laguna 3492', 'de 9 a 16 hs', 'NUEVO PACTO SA (Desmadre Pocitos)
RUT 218336960013
Juan Pablo Laguna 3492', 'Juan Pablo Laguna 3492 – de 9 a 16 hs' FROM businesses WHERE nombre = 'DESMADRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'CORDON', 'JOSÉ MONDELLI (Desmadre Cordón)', '220713220012', 'Requena 1423', 'Requena 1423', 'de 9 a 16 hs', 'JOSÉ MONDELLI (Desmadre Cordón)
RUT 220713220012
Requena 1423', 'Requena 1423 – de 9 a 16 hs' FROM businesses WHERE nombre = 'DESMADRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'CIUDAD VIEJA', 'ESADAR SAS (Desmadre Pérez Castellano)', NULL, 'Pérez Castellano 1515', 'Pérez Castellano 1515', 'de 8:30 a 20 hs', 'ESADAR SAS (Desmadre Pérez Castellano)
Pérez Castellano 1515', 'Pérez Castellano 1515 – de 8:30 a 20 hs
Lunes cerrado' FROM businesses WHERE nombre = 'DESMADRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'JACINTO VERA', 'J Y L DA HOOD SAS (Desmadre Itapebí)', '219498020014', 'Itapebí 2108', 'Itapebí 2108', 'de 9 a 16 hs', 'J Y L DA HOOD SAS (Desmadre Itapebí)
RUT 219498020014
Itapebí 2108', 'Itapebí 2108 – de 9 a 16 hs' FROM businesses WHERE nombre = 'DESMADRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'CENTRO', 'SISON PINGUIN SAS (Desmadre Centro)', '220395730012', 'Canelones 1363', 'Canelones 1363', NULL, 'SISON PINGUIN SAS (Desmadre Centro)
RUT 220395730012
Canelones 1363', 'Canelones 1363' FROM businesses WHERE nombre = 'DESMADRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'PUNTA CARRETAS', 'SICLAR SAS (Desmadre Punta Carretas)', '220429470018', '21 de Setiembre 3133 bis', '21 de Setiembre 3133 bis', NULL, 'SICLAR SAS (Desmadre Punta Carretas)
RUT 220429470018
21 de Setiembre 3133 bis', '21 de Setiembre 3133 bis' FROM businesses WHERE nombre = 'DESMADRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, '???', 'ROTO SAS (Desmadre Carrasco)', '220188190012', 'Carlos Sáez 6697', 'Carlos Sáez 6697', NULL, 'ROTO SAS (Desmadre Carrasco)
RUT 220188190012
Carlos Sáez 6697', 'Carlos Sáez 6697
(Corresponde a la sucursal Desmadre Carrasco)' FROM businesses WHERE nombre = 'DESMADRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'SANXES ROTISERÍA', '214148500016', 'Burgues 2897', 'Burgues 2897', NULL, 'SANXES ROTISERÍA
RUT 214148500016
Burgues 2897', 'Burgues 2897' FROM businesses WHERE nombre = 'SANXES';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'SANGUCHE SAS', '220164520012', 'Uruguay 1802 y T. Narvaja', 'Uruguay 1802 y Tristán Narvaja', NULL, 'SANGUCHE SAS
RUT 220164520012
Uruguay 1802 y T. Narvaja', 'Uruguay 1802 y Tristán Narvaja' FROM businesses WHERE nombre = 'SANGUCHE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'TATU – Valentina Birriel', '218712800013', 'Ecuador manzana 82 solar 16', 'Ecuador Mz. 82 Sl. 16', NULL, 'TATU – Valentina Birriel
RUT 218712800013
Ecuador manzana 82 solar 16', 'Ecuador Mz. 82 Sl. 16' FROM businesses WHERE nombre = 'TATU';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'TRISTAN NARVAJA', 'GRUPO LA RAMBLA SAS 2', '219416760019', 'Tristán Narvaja 1722', 'Tristán Narvaja 1722', 'de 10 a 14 hs', 'GRUPO LA RAMBLA SAS 2
RUT 219416760019
Tristán Narvaja 1722', 'Tristán Narvaja 1722 – de 10 a 14 hs' FROM businesses WHERE nombre = 'TEQUEÑOS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'RIVERA', 'JULIO CÉSAR GUILLEN (Grupo La Rambla)', NULL, 'Rivera 3185', 'Rivera 3185', NULL, 'JULIO CÉSAR GUILLEN (Grupo La Rambla)
Rivera 3185', 'Rivera 3185' FROM businesses WHERE nombre = 'TEQUEÑOS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'CLUB DEL BAJÓN', NULL, 'Aurelia Ramos de Segarra 4496', 'Aurelia Ramos de Segarra 4496', 'hasta 16 hs', 'CLUB DEL BAJÓN
Aurelia Ramos de Segarra 4496', 'Aurelia Ramos de Segarra 4496 – hasta 16 hs' FROM businesses WHERE nombre = 'CLUB DEL BAJON';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'COMODINES SAS', '219512770011', 'Libertad 2613', 'Libertad 2613', 'de 9 a 17 hs', 'COMODINES SAS
RUT 219512770011
Libertad 2613', 'Libertad 2613 – de 9 a 17 hs' FROM businesses WHERE nombre = 'COMODINES';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'SAN SORRENTINO', NULL, 'Uruguay 1980', 'Uruguay 1980', NULL, 'SAN SORRENTINO
Uruguay 1980', 'Uruguay 1980' FROM businesses WHERE nombre = 'SAN SORRENTINO';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'SANTO PECADO – Franco Friedrich', '220303170015', '21 de Setiembre 2612 apto 201', '21 de Setiembre 2612, apto 201', NULL, 'SANTO PECADO – Franco Friedrich
RUT 220303170015
21 de Setiembre 2612 apto 201', '21 de Setiembre 2612, apto 201' FROM businesses WHERE nombre = 'SANTO PECADO';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'A LA PAR EVENTOS SAS', '020626390014', 'Pérez Butler y Sta. Rosa', 'Pérez Butler y Sta. Rosa', 'a partir de 9:30 hs', 'A LA PAR EVENTOS SAS
RUT 020626390014
Pérez Butler y Sta. Rosa', 'Pérez Butler y Sta. Rosa – a partir de 9:30 hs' FROM businesses WHERE nombre = 'A LA PAR';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'PASO CARRASCO', 'LARRY''S BURGERS (Paso Carrasco) – Facundo Pareja (dueño)', '150626430014', 'Munar 117 y Vaz Ferreira', 'Munar 117 y Vaz Ferreira', NULL, 'LARRY''S BURGERS (Paso Carrasco) – Facundo Pareja (dueño)
RUT 150626430014
Munar 117 y Vaz Ferreira', 'Munar 117 y Vaz Ferreira' FROM businesses WHERE nombre = 'LARRYS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'POCITOS', 'LARRY''S (Pocitos) – Facundo Pareja', '150626430014', 'Luis Franzini 917', 'Luis Franzini 917', NULL, 'LARRY''S (Pocitos) – Facundo Pareja
RUT 150626430014
Luis Franzini 917', 'Luis Franzini 917' FROM businesses WHERE nombre = 'LARRYS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'COLUMBIA', 'LARRY''S (Columbia) – Brian Bustos', '220305580016', 'Giannattasio 21.750 (Columbia Market)', 'Giannattasio 21.750 – Columbia Market', NULL, 'LARRY''S (Columbia) – Brian Bustos
RUT 220305580016
Giannattasio 21.750 (Columbia Market)', 'Giannattasio 21.750 – Columbia Market' FROM businesses WHERE nombre = 'LARRYS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'NELSON BURGERS', '150397300010', 'Avda. Agraciada s/n, Rocha', 'Avda. Agraciada s/n, Rocha', NULL, 'NELSON BURGERS
RUT 150397300010
Avda. Agraciada s/n, Rocha', 'Avda. Agraciada s/n, Rocha' FROM businesses WHERE nombre = 'NELSON';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'JERO BURGERS', NULL, 'Carlos de la Vega 5165 y Faramiñán', 'Carlos de la Vega 5165 y Faramiñán', NULL, 'JERO BURGERS
Carlos de la Vega 5165 y Faramiñán', 'Carlos de la Vega 5165 y Faramiñán' FROM businesses WHERE nombre = 'JERO';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'CANNABIS CLUB', NULL, 'Camino Durán 5806', 'Camino Durán 5806', 'de 10 a 14 hs', 'CANNABIS CLUB
Camino Durán 5806', 'Camino Durán 5806 – de 10 a 14 hs' FROM businesses WHERE nombre = 'CANNABIS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'LA CHINGADA', '218866190015', 'Cnel. Mora 549', 'Cnel. Mora 549', NULL, 'LA CHINGADA
RUT 218866190015
Cnel. Mora 549', 'Cnel. Mora 549' FROM businesses WHERE nombre = 'LA CHINGADA';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'BRUJONA SRL', '218388520014', 'Ramón Fernández 285', 'Ramón Fernández 285', 'de 11 a 13 hs', 'BRUJONA SRL
RUT 218388520014
Ramón Fernández 285', 'Ramón Fernández 285 – de 11 a 13 hs' FROM businesses WHERE nombre = 'BRUJONA SRL';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'Contacto: Violeta Acosta', NULL, 'Buenos Aires 515
(Posible mismo RUT Wondergroup 218319790016 – CONFIRMAR)', 'Buenos Aires 515 – Violeta Acosta', NULL, 'Contacto: Violeta Acosta
Buenos Aires 515
(Posible mismo RUT Wondergroup 218319790016 – CONFIRMAR)', 'Buenos Aires 515 – Violeta Acosta' FROM businesses WHERE nombre = 'FEDERACION';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'NBA – Kevin Camplote', '219366120011', 'Scoseria 2639', 'Scoseria 2639', 'de 12 a 18 hs', 'NBA – Kevin Camplote
RUT 219366120011
Scoseria 2639', 'Scoseria 2639 – de 12 a 18 hs' FROM businesses WHERE nombre = 'NBA';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'BLISS COOKIES SAS', '220066700016', 'Ellauri 407 y Solano García', 'Ellauri 407 y Solano García', 'de 15 a 21 hs', 'BLISS COOKIES SAS
RUT 220066700016
Ellauri 407 y Solano García', 'Ellauri 407 y Solano García – de 15 a 21 hs
Lunes cerrado' FROM businesses WHERE nombre = 'BLISS';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM businesses WHERE nombre = 'LA RECORRE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'AAFP TBV', '219128890014', 'Luis A. de Herrera 1154', 'Luis A. de Herrera 1154', NULL, 'AAFP TBV
RUT 219128890014
Luis A. de Herrera 1154', 'Luis A. de Herrera 1154' FROM businesses WHERE nombre = 'TBV';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'BYMELT (Soulmelt)', '220452210019', 'Jackson 1419 apto 102', 'Jackson 1419, apto 102', NULL, 'BYMELT (Soulmelt)
RUT 220452210019
Jackson 1419 apto 102', 'Jackson 1419, apto 102' FROM businesses WHERE nombre = 'SOULMELT';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'BOWERDIN (Río)', '216697960012', 'Carlos F. Sáez 6430', 'Carlos F. Sáez 6430', NULL, 'BOWERDIN (Río)
RUT 216697960012
Carlos F. Sáez 6430', 'Carlos F. Sáez 6430' FROM businesses WHERE nombre = 'RIO';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'BOWERDIN (Manzanar)', '216697960012', 'Carlos Sáez 6463', 'Carlos Sáez 6463', NULL, 'BOWERDIN (Manzanar)
RUT 216697960012
Carlos Sáez 6463', 'Carlos Sáez 6463' FROM businesses WHERE nombre = 'MANZANAR';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM businesses WHERE nombre = 'EL PALENQUE';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'CARRASCO', NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM businesses WHERE nombre = 'MADRE MIA';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'POCITOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM businesses WHERE nombre = 'MADRE MIA';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, 'TRES CRUCES', NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM businesses WHERE nombre = 'MADRE MIA';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, 'LASGAR SAS (HDP Burgers)', '219291420013', 'Obligado 1174', 'Obligado 1174', NULL, 'LASGAR SAS (HDP Burgers)
RUT 219291420013
Obligado 1174', 'Obligado 1174' FROM businesses WHERE nombre = 'HDP';
INSERT INTO clients (business_id, sucursal, razon_social, rut, direccion_facturacion, direccion_entrega, horario_entrega, datos_facturacion, info_cliente)
  SELECT id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM businesses WHERE nombre = 'GERNERAL';
INSERT INTO clients (business_id) SELECT id FROM businesses WHERE nombre = 'BOCADITO';
INSERT INTO clients (business_id) SELECT id FROM businesses WHERE nombre = 'BURGER ZONE';
INSERT INTO clients (business_id) SELECT id FROM businesses WHERE nombre = 'CAFÉ DORÉ';
INSERT INTO clients (business_id) SELECT id FROM businesses WHERE nombre = 'FAKE';
INSERT INTO clients (business_id) SELECT id FROM businesses WHERE nombre = 'GARAGE VEGGIE';
INSERT INTO clients (business_id) SELECT id FROM businesses WHERE nombre = 'INFIEL';
INSERT INTO clients (business_id) SELECT id FROM businesses WHERE nombre = 'JONLU';
INSERT INTO clients (business_id) SELECT id FROM businesses WHERE nombre = 'PIZZA CENTRO';

-- Catálogo de productos ----------------------------------------------
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0001', 'Bandeja 148x60 ???');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0002', 'Bandeja autoarmable SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0003', 'Bandeja de papas abiertas');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0004', 'Bandeja de papas con cheddar');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0005', 'Bandeja de papas con cheddar (cerradas)');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0006', 'Bandeja hamburguesa TBV');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0007', 'Bolsa 16x27 LA BARCA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0008', 'Bolsa 16x31 GARAGE BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0009', 'Bolsa 16x31 LA BURGUERIA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0010', 'Bolsa 16x31 SALCHI BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0011', 'Bolsa 17x3xX13 SHARPER BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0012', 'BOLSA 23X33');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0013', 'Bolsa 23x33 (grande delivery) DESMADRE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0014', 'Bolsa 23x33 (medianas) HARLEM');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0015', 'Bolsa 23x33 (medianas) LA BURGUERIA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0016', 'Bolsa 23x33 A LA PAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0017', 'Bolsa 23x33 DIVICIO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0018', 'Bolsa 23x33 LARRYS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0019', 'Bolsa 23x33 PANDA BAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0020', 'Bolsa 23x33 SOULMET');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0021', 'Bolsa 26.5x17.5 SHARPER BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0022', 'Bolsa 28x28');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0023', 'Bolsa 28x28 ???');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0024', 'Bolsa 28x28 AMORE PASTAS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0025', 'Bolsa 28x28 GARAGE BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0026', 'Bolsa 28x28 MADRE MIA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0027', 'Bolsa 28x28 PAN BASTARDO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0028', 'Bolsa 28x28 SALAD BOWL');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0029', 'Bolsa 28x28 SANTO PECADO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0030', 'Bolsa 28x38');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0031', 'Bolsa 28x38 (grandes) HARLEM');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0032', 'Bolsa 28x38 ???');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0033', 'Bolsa 28x38 BRUJONA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0034', 'Bolsa 28x38 CLUB EL BAJÓN');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0035', 'Bolsa 28x38 COCCOLE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0036', 'Bolsa 28x38 PIZZA BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0037', 'Bolsa 28x38 SALCHI BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0038', 'Bolsa 32x38 (grandes) LA BURGUERIA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0039', 'Bolsa bizcocho CANNABIS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0040', 'Bolsa blanca');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0041', 'BOLSA COMO SANO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0042', 'Bolsa de bizcocho');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0043', 'Bolsa de bizcocho (chicas) HARLEM');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0044', 'Bolsa de bizcocho (chicas) LA BURGUERIA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0045', 'Bolsa de bizcocho (mediana) DESMADRE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0046', 'Bolsa de bizcocho A LA PAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0047', 'Bolsa de bizcocho CLUB EL BAJÓN');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0048', 'Bolsa de bizcocho COCCOLE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0049', 'Bolsa de bizcocho NBA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0050', 'Bolsa de bizcocho NELSON');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0051', 'Bolsa de bizcocho PANDA BAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0052', 'Bolsa de papas 16x31 TBV');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0053', 'Bolsa raviolera (grandes)');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0054', 'Bolsa térmica de delivery HDP');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0055', 'BOlsa Transparente 1x1 EL PALENQUE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0056', 'bowl，1100ml 300G，MANZANAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0057', 'bowl，1300ml 300G，MANZANAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0058', 'bowl，750ml 280G，MANZANAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0059', 'Caja');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0060', 'Caja 16x17.5 amarilla DESMADRE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0061', 'Caja 18x11.5 rosada DESMADRE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0062', 'Caja 22x17 CLUB EL BAJÓN');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0063', 'Caja 22x17 PIZZA BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0064', 'Caja 28x21 A LA PAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0065', 'Caja 28x21 LA BARCA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0066', 'Caja 30x20 SAN SORRENTINO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0067', 'Caja beige');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0068', 'Caja chica');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0069', 'Caja chica MUNDO MILA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0070', 'Caja de 1 cookie BLISS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0071', 'Caja de 4 cookies BLISS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0072', 'Caja de 6 cookies BLISS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0073', 'Caja de cheddar con tapa');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0074', 'Caja de hamburguesa');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0075', 'Caja de hamburguesa DE DIEZ');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0076', 'Caja de hamburguesa GANGSTER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0077', 'Caja de hamburguesa LA DIEZ');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0078', 'Caja de milanesa 30x20 PANDA BAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0079', 'Caja de milanesa GARAGE BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0080', 'Caja de milanesa LARRYS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0081', 'Caja de papas 1/4 amarillas SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0082', 'Caja de papas cheddar SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0083', 'Caja de papas HORREO BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0084', 'Caja de pizza 33x33 GANGSTER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0085', 'Caja de pizza 33x33 PIZZA BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0086', 'Caja de pizza 40x23 HORREO BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0087', 'Caja de pizza A LA PAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0088', 'Caja de pizza al metro marrón');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0089', 'Caja de pizza MANZANAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0090', 'Caja de sánguche');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0091', 'Caja de sushi MANZANAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0092', 'Caja de torta MANZANAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0093', 'Caja estuche cartulina hamburguesa A LA PAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0094', 'Caja grande DE DIEZ');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0095', 'Caja grande MUNDO MILA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0096', 'Caja impresa HARLEM');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0097', 'Caja impresa LA RECORRE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0098', 'Caja impresa SALCHI BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0099', 'Caja JERO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0100', 'Caja nueva ???');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0101', 'Cinta adhesiva 25x50 TEQUEÑOS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0102', 'Cono');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0103', 'Cono 145x100 EL PALENQUE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0104', 'Cono de papas CLUB EL BAJÓN');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0105', 'Cono de papas GARAGE BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0106', 'Cono de papas HARLEM');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0107', 'Cono de papas JERO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0108', 'Cono de papas PANDA BAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0109', 'Cono de papas PIZZA BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0110', 'Cono de papas SANTO PECADO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0111', 'Cono de papas TBV');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0112', 'Cono EL PALENQUE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0113', 'Estuche 14x12 TEQUEÑOS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0114', 'Estuche 15 piezas SUSHI APP');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0115', 'Estuche 18x22 TEQUEÑOS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0116', 'Estuche 30 piezas SUSHI APP');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0117', 'Estuche negro A LA PAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0118', 'Negro 1x1');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0119', 'Negro 1x1 COCCOLE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0120', 'Negro 1x1 TBV');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0121', 'Negro 1x1.2');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0122', 'Negro 1x1.2 NBA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0123', 'Negro 1x1.2 PANDA BAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0124', 'Negro 50x55 BLISS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0125', 'Papel aluminio 30x100');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0126', 'Papel aluminio 30x100 PANDA BAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0127', 'Papel aluminio 30x100 SALCHI BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0128', 'Papel aluminio BRUJONA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0129', 'Papel antigrasa');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0130', 'Papel antigrasa (tequeños)');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0131', 'Papel antigrasa 20x30');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0132', 'Papel antigrasa 30x30 SHARPER BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0133', 'Papel antigrasa 30x40');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0134', 'Papel antigrasa 40x30 DE DIEZ');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0135', 'Papel antigrasa 40x30 LA CHINGADA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0136', 'Papel antigrasa 40x30 SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0137', 'Papel antigrasa 40x30 TATU');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0138', 'Papel antigrasa 40x40 SANTO PECADO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0139', 'Papel antigrasa A LA PAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0140', 'Papel antigrasa amarillo 30x40');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0141', 'Papel antigrasa azul 20x30');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0142', 'Papel antigrasa blanco SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0143', 'Papel antigrasa GANGSTER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0144', 'Papel antigrasa JERO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0145', 'Papel antigrasa LA BURGUERIA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0146', 'Papel antigrasa marrón 30x40');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0147', 'Papel antigrasa negro 30x40');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0148', 'Papel antigrasa RIO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0149', 'Papel antigrasa rojo');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0150', 'Papel antigrasa rojo 30x40');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0151', 'Papel antigrasa SOULMET');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0152', 'Papel film 45x600 HARLEM');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0153', 'Papel film 45x700 AMORE PASTAS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0154', 'Papel film 45x700 BLISS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0155', 'Papel film 45x700 BRUJONA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0156', 'Papel film 45x700 FEDERACION');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0157', 'Papel film 45x700 JERO');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0158', 'Pote de ensalada SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0159', 'Rollo 24x35 HARLEM');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0160', 'Rollo bolsa BRUJONA');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0161', 'Rollo FEDERACION');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0162', 'Rollo hoja 24x35 ???');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0163', 'Rollo hoja 24x35 SHARPER BURGER');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0164', 'Rollos BLISS');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0165', 'Rollos bolsa PANDA BAR');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0166', 'Servilleta HDP');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0167', 'Sobre RINCÓN DE DULCE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0168', 'Tapas vaso de café DESMADRE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0169', 'Tapas vaso de café SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0170', 'Vaso de café 12 oz DESMADRE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0171', 'Vaso de café 12 oz SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0172', 'Vaso de café 8 oz DESMADRE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0173', 'Vaso de café 8 oz SANGUCHE');
INSERT INTO products (codigo_prod, nombre) VALUES ('P-0174', 'Vaso de café 8 oz SIN GRABAR');

-- Precio y stock por negocio -----------------------------------------
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 17.0, 3700, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA DIEZ' AND p.nombre = 'Caja de hamburguesa LA DIEZ';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 17.0, 4100, NULL FROM businesses b, products p
   WHERE b.nombre = 'DE DIEZ' AND p.nombre = 'Caja grande DE DIEZ';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 14.0, 6400, NULL FROM businesses b, products p
   WHERE b.nombre = 'DE DIEZ' AND p.nombre = 'Caja de hamburguesa DE DIEZ';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 1.77, 8000, NULL FROM businesses b, products p
   WHERE b.nombre = 'DE DIEZ' AND p.nombre = 'Papel antigrasa 40x30 DE DIEZ';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.5, 3500, NULL FROM businesses b, products p
   WHERE b.nombre = 'AMORE PASTAS' AND p.nombre = 'Bolsa 28x28 AMORE PASTAS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 820.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'AMORE PASTAS' AND p.nombre = 'Papel film 45x700 AMORE PASTAS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 5.5, 1000, NULL FROM businesses b, products p
   WHERE b.nombre = 'SHARPER BURGER' AND p.nombre = 'Bolsa 17x3xX13 SHARPER BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.7, 7900, NULL FROM businesses b, products p
   WHERE b.nombre = 'SHARPER BURGER' AND p.nombre = 'Bolsa 26.5x17.5 SHARPER BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 1.99, 3000, NULL FROM businesses b, products p
   WHERE b.nombre = 'SHARPER BURGER' AND p.nombre = 'Papel antigrasa 30x30 SHARPER BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 150.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SHARPER BURGER' AND p.nombre = 'Rollo hoja 24x35 SHARPER BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.2, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'PAN BASTARDO' AND p.nombre = 'Bolsa 28x28 PAN BASTARDO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 22.57, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'HORREO BURGER' AND p.nombre = 'Caja de pizza 40x23 HORREO BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.2, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'HORREO BURGER' AND p.nombre = 'Caja de papas HORREO BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 4.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'DVICIO' AND p.nombre = 'Bolsa 23x33 DIVICIO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.44, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'DVICIO' AND p.nombre = 'Bolsa de bizcocho COCCOLE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 6.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'DVICIO' AND p.nombre = 'Bolsa 28x38 COCCOLE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 110.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'DVICIO' AND p.nombre = 'Negro 1x1 COCCOLE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 3.54, 2664, NULL FROM businesses b, products p
   WHERE b.nombre = 'DVICIO' AND p.nombre = 'Sobre RINCÓN DE DULCE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 19.03, 19000, NULL FROM businesses b, products p
   WHERE b.nombre = 'SUSHI APP' AND p.nombre = 'Estuche 30 piezas SUSHI APP';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 14.15, 5400, 'Cada paquete tiene 200 unidades c/u' FROM businesses b, products p
   WHERE b.nombre = 'SUSHI APP' AND p.nombre = 'Estuche 15 piezas SUSHI APP';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 5.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'PANDA BAR' AND p.nombre = 'Bolsa 23x33 PANDA BAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 500.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'PANDA BAR' AND p.nombre = 'Papel aluminio 30x100 PANDA BAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 13.18, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'PANDA BAR' AND p.nombre = 'Caja de milanesa 30x20 PANDA BAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 6.25, 12000, NULL FROM businesses b, products p
   WHERE b.nombre = 'PANDA BAR' AND p.nombre = 'Cono de papas PANDA BAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 1.7, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'PANDA BAR' AND p.nombre = 'Bolsa de bizcocho PANDA BAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 110.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'PANDA BAR' AND p.nombre = 'Negro 1x1.2 PANDA BAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 150.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'PANDA BAR' AND p.nombre = 'Rollos bolsa PANDA BAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 6.95, 0, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'GARAGE BURGER' AND p.nombre = 'Bolsa 28x28 GARAGE BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 5.49, 0, 'No pedir más stock, en su lugar mandamos cajas de cheddar con tapa' FROM businesses b, products p
   WHERE b.nombre = 'GARAGE BURGER' AND p.nombre = 'Cono de papas GARAGE BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 109.8, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'GARAGE BURGER' AND p.nombre = 'Negro 1x1.2';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 3.05, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'GARAGE BURGER' AND p.nombre = 'Bolsa 16x31 GARAGE BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 19.83, 4000, NULL FROM businesses b, products p
   WHERE b.nombre = 'GARAGE BURGER' AND p.nombre = 'Caja de milanesa GARAGE BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 12000, NULL FROM businesses b, products p
   WHERE b.nombre = 'GARAGE BURGER' AND p.nombre = 'Caja de cheddar con tapa';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 9672, NULL FROM businesses b, products p
   WHERE b.nombre = 'GARAGE BURGER' AND p.nombre = 'Bolsa de bizcocho';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 17.08, 4900, NULL FROM businesses b, products p
   WHERE b.nombre = 'MUNDO MILA' AND p.nombre = 'Caja grande MUNDO MILA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 15.07, 7000, NULL FROM businesses b, products p
   WHERE b.nombre = 'MUNDO MILA' AND p.nombre = 'Caja chica MUNDO MILA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 9.9, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'MARTIN AGUIAR' AND p.nombre = 'Caja nueva ???';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 500.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'MARTIN AGUIAR' AND p.nombre = 'Papel aluminio 30x100';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 8.5, 9000, NULL FROM businesses b, products p
   WHERE b.nombre = 'MARTIN AGUIAR' AND p.nombre = 'Bolsa 28x38 ???';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 150.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'MARTIN AGUIAR' AND p.nombre = 'Rollo hoja 24x35 ???';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 100.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'MARTIN AGUIAR' AND p.nombre = 'Negro 1x1';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.9, 12500, NULL FROM businesses b, products p
   WHERE b.nombre = 'MARTIN AGUIAR' AND p.nombre = 'Bandeja 148x60 ???';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 20.98, 1600, NULL FROM businesses b, products p
   WHERE b.nombre = 'PIZZA BURGER' AND p.nombre = 'Caja de pizza 33x33 PIZZA BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 20.62, 400, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'PIZZA BURGER' AND p.nombre = 'Caja 22x17 PIZZA BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 8.54, 4700, NULL FROM businesses b, products p
   WHERE b.nombre = 'PIZZA BURGER' AND p.nombre = 'Bolsa 28x38 PIZZA BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 6.71, 0, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'PIZZA BURGER' AND p.nombre = 'Cono de papas PIZZA BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 12572, NULL FROM businesses b, products p
   WHERE b.nombre = 'PIZZA BURGER' AND p.nombre = 'Bolsa de bizcocho';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.0, 900, 'PEDIR MÁS STOCK' FROM businesses b, products p
   WHERE b.nombre = 'LA BURGERIA' AND p.nombre = 'Bolsa 23x33 (medianas) LA BURGUERIA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 10.5, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA BURGERIA' AND p.nombre = 'Bolsa 32x38 (grandes) LA BURGUERIA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.93, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA BURGERIA' AND p.nombre = 'Bolsa 16x31 LA BURGUERIA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.28, 10000, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA BURGERIA' AND p.nombre = 'Papel antigrasa LA BURGUERIA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 3500, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA BURGERIA' AND p.nombre = 'Papel antigrasa rojo';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 5100, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA BURGERIA' AND p.nombre = 'Bolsa raviolera (grandes)';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 26512, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA BURGERIA' AND p.nombre = 'Bolsa de bizcocho (chicas) LA BURGUERIA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 13.0, 2861, NULL FROM businesses b, products p
   WHERE b.nombre = 'GANGSTER BURGER' AND p.nombre = 'Caja de hamburguesa GANGSTER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.3, 4000, NULL FROM businesses b, products p
   WHERE b.nombre = 'GANGSTER BURGER' AND p.nombre = 'Papel antigrasa GANGSTER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 13.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'GANGSTER BURGER' AND p.nombre = 'Caja de pizza 33x33 GANGSTER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 110.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'GANGSTER BURGER' AND p.nombre = 'Negro 1x1';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 14.0, 500, 'PEDIR MÁS STOCK' FROM businesses b, products p
   WHERE b.nombre = 'SALCHI BURGER' AND p.nombre = 'Caja impresa SALCHI BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SALCHI BURGER' AND p.nombre = 'Bolsa 28x38 SALCHI BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 500.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SALCHI BURGER' AND p.nombre = 'Papel aluminio 30x100 SALCHI BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.5, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SALCHI BURGER' AND p.nombre = 'Bolsa 16x31 SALCHI BURGER';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 3000, 'No pedir aún consumen poco' FROM businesses b, products p
   WHERE b.nombre = 'SALCHI BURGER' AND p.nombre = 'Bolsa de bizcocho';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 820.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'HARLEM' AND p.nombre = 'Papel film 45x600 HARLEM';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 6.7, 800, 'Ya pedimos más stock, aún no entra a producción esta medida de bolsa' FROM businesses b, products p
   WHERE b.nombre = 'HARLEM' AND p.nombre = 'Bolsa 23x33 (medianas) HARLEM';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 150.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'HARLEM' AND p.nombre = 'Rollo 24x35 HARLEM';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 8.05, 4200, NULL FROM businesses b, products p
   WHERE b.nombre = 'HARLEM' AND p.nombre = 'Bolsa 28x38 (grandes) HARLEM';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 3.05, 13464, NULL FROM businesses b, products p
   WHERE b.nombre = 'HARLEM' AND p.nombre = 'Bolsa de bizcocho (chicas) HARLEM';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 5.49, 9300, NULL FROM businesses b, products p
   WHERE b.nombre = 'HARLEM' AND p.nombre = 'Cono de papas HARLEM';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 12.6, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'HARLEM' AND p.nombre = 'Caja impresa HARLEM';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 17.0, 83, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'LA BARCA' AND p.nombre = 'Caja 28x21 LA BARCA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.44, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA BARCA' AND p.nombre = 'Bolsa 16x27 LA BARCA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 4.64, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SALAD BOWL' AND p.nombre = 'Bolsa 28x28 SALAD BOWL';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 11.9, 500, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'DESMADRE' AND p.nombre = 'Caja 16x17.5 amarilla DESMADRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 22.9, 4309, NULL FROM businesses b, products p
   WHERE b.nombre = 'DESMADRE' AND p.nombre = 'Caja 18x11.5 rosada DESMADRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 6.8, 6600, NULL FROM businesses b, products p
   WHERE b.nombre = 'DESMADRE' AND p.nombre = 'Bolsa 23x33 (grande delivery) DESMADRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.9, 27404, NULL FROM businesses b, products p
   WHERE b.nombre = 'DESMADRE' AND p.nombre = 'Bolsa de bizcocho (mediana) DESMADRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.0, 950, NULL FROM businesses b, products p
   WHERE b.nombre = 'DESMADRE' AND p.nombre = 'Vaso de café 8 oz DESMADRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 8.1, 8350, NULL FROM businesses b, products p
   WHERE b.nombre = 'DESMADRE' AND p.nombre = 'Vaso de café 12 oz DESMADRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 1.83, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'DESMADRE' AND p.nombre = 'Tapas vaso de café DESMADRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 4.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANXES' AND p.nombre = 'Bolsa 28x28 ???';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.45, 4400, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Caja de papas cheddar SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.04, 7600, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Caja de papas 1/4 amarillas SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.44, 4000, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Papel antigrasa 40x30 SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.08, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Vaso de café 8 oz SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 8.11, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Vaso de café 12 oz SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 1.83, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Tapas vaso de café SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 14.4, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Pote de ensalada SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 5.0, 0, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Bandeja autoarmable SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Papel antigrasa blanco SANGUCHE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 5000, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANGUCHE' AND p.nombre = 'Papel antigrasa azul 20x30';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.68, 5000, NULL FROM businesses b, products p
   WHERE b.nombre = 'TATU' AND p.nombre = 'Papel antigrasa 40x30 TATU';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 12.69, 7200, NULL FROM businesses b, products p
   WHERE b.nombre = 'TEQUEÑOS' AND p.nombre = 'Estuche 14x12 TEQUEÑOS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 14.27, 6200, NULL FROM businesses b, products p
   WHERE b.nombre = 'TEQUEÑOS' AND p.nombre = 'Estuche 18x22 TEQUEÑOS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 25.62, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'TEQUEÑOS' AND p.nombre = 'Cinta adhesiva 25x50 TEQUEÑOS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 3500, NULL FROM businesses b, products p
   WHERE b.nombre = 'TEQUEÑOS' AND p.nombre = 'Papel antigrasa (tequeños)';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.93, 14156, NULL FROM businesses b, products p
   WHERE b.nombre = 'CLUB DEL BAJON' AND p.nombre = 'Bolsa de bizcocho CLUB EL BAJÓN';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 8.54, 2000, NULL FROM businesses b, products p
   WHERE b.nombre = 'CLUB DEL BAJON' AND p.nombre = 'Bolsa 28x38 CLUB EL BAJÓN';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 20.62, 700, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'CLUB DEL BAJON' AND p.nombre = 'Caja 22x17 CLUB EL BAJÓN';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 6.71, 4000, NULL FROM businesses b, products p
   WHERE b.nombre = 'CLUB DEL BAJON' AND p.nombre = 'Cono de papas CLUB EL BAJÓN';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.08, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'COMODINES' AND p.nombre = 'BOLSA COMO SANO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 16.2, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'SAN SORRENTINO' AND p.nombre = 'Caja 30x20 SAN SORRENTINO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.68, 3000, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANTO PECADO' AND p.nombre = 'Papel antigrasa 40x40 SANTO PECADO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.93, 4500, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANTO PECADO' AND p.nombre = 'Cono de papas SANTO PECADO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.2, 5100, NULL FROM businesses b, products p
   WHERE b.nombre = 'SANTO PECADO' AND p.nombre = 'Bolsa 28x28 SANTO PECADO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 20.0, 5000, NULL FROM businesses b, products p
   WHERE b.nombre = 'A LA PAR' AND p.nombre = 'Caja 28x21 A LA PAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 16.5, 30000, NULL FROM businesses b, products p
   WHERE b.nombre = 'A LA PAR' AND p.nombre = 'Caja estuche cartulina hamburguesa A LA PAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 16.5, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'A LA PAR' AND p.nombre = 'Estuche negro A LA PAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 18.91, 400, 'No pedir aún consumen poco' FROM businesses b, products p
   WHERE b.nombre = 'A LA PAR' AND p.nombre = 'Caja de pizza A LA PAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.7, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'A LA PAR' AND p.nombre = 'Papel antigrasa A LA PAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.4, 5150, NULL FROM businesses b, products p
   WHERE b.nombre = 'A LA PAR' AND p.nombre = 'Bolsa 23x33 A LA PAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 3.0, 20136, NULL FROM businesses b, products p
   WHERE b.nombre = 'A LA PAR' AND p.nombre = 'Bolsa de bizcocho A LA PAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.4, 8000, NULL FROM businesses b, products p
   WHERE b.nombre = 'LARRYS' AND p.nombre = 'Bolsa 23x33 LARRYS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 21.0, 1400, 'Esperando respuesta de cliente' FROM businesses b, products p
   WHERE b.nombre = 'LARRYS' AND p.nombre = 'Caja de milanesa LARRYS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 3800, NULL FROM businesses b, products p
   WHERE b.nombre = 'LARRYS' AND p.nombre = 'Caja chica';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 1000, 'No sé si son estas las bolsas blancas de papas' FROM businesses b, products p
   WHERE b.nombre = 'LARRYS' AND p.nombre = 'Bolsa 28x38';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 9.15, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'NELSON' AND p.nombre = 'BOLSA 23X33';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 3.9, 10296, NULL FROM businesses b, products p
   WHERE b.nombre = 'NELSON' AND p.nombre = 'Bolsa de bizcocho NELSON';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.7, 2000, NULL FROM businesses b, products p
   WHERE b.nombre = 'JERO' AND p.nombre = 'Papel antigrasa JERO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 8.05, 1800, NULL FROM businesses b, products p
   WHERE b.nombre = 'JERO' AND p.nombre = 'Cono de papas JERO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 17.2, 3400, NULL FROM businesses b, products p
   WHERE b.nombre = 'JERO' AND p.nombre = 'Caja JERO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 718.77, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'JERO' AND p.nombre = 'Papel film 45x700 JERO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 4000, NULL FROM businesses b, products p
   WHERE b.nombre = 'JERO' AND p.nombre = 'Caja beige';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.77, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'CANNABIS' AND p.nombre = 'Bolsa bizcocho CANNABIS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.68, 10000, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA CHINGADA' AND p.nombre = 'Papel antigrasa 40x30 LA CHINGADA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 793.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'BRUJONA SRL' AND p.nombre = 'Papel film 45x700 BRUJONA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 524.6, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'BRUJONA SRL' AND p.nombre = 'Papel aluminio BRUJONA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 150.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'BRUJONA SRL' AND p.nombre = 'Rollo bolsa BRUJONA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 7.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'BRUJONA SRL' AND p.nombre = 'Bolsa 28x38 BRUJONA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 165.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'FEDERACION' AND p.nombre = 'Rollo FEDERACION';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 790.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'FEDERACION' AND p.nombre = 'Papel film 45x700 FEDERACION';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 3.05, 0, 'Esperando por nuevo diseño para pedir más stock' FROM businesses b, products p
   WHERE b.nombre = 'NBA' AND p.nombre = 'Bolsa de bizcocho NBA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 100.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'NBA' AND p.nombre = 'Negro 1x1.2 NBA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 16.23, 2250, NULL FROM businesses b, products p
   WHERE b.nombre = 'BLISS' AND p.nombre = 'Caja de 1 cookie BLISS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 20.5, 1600, NULL FROM businesses b, products p
   WHERE b.nombre = 'BLISS' AND p.nombre = 'Caja de 6 cookies BLISS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 20.5, 900, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'BLISS' AND p.nombre = 'Caja de 4 cookies BLISS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 160.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'BLISS' AND p.nombre = 'Rollos BLISS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 790.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'BLISS' AND p.nombre = 'Papel film 45x700 BLISS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 125.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'BLISS' AND p.nombre = 'Negro 50x55 BLISS';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 1000, 'No pedir aún consumen poco' FROM businesses b, products p
   WHERE b.nombre = 'BLISS' AND p.nombre = 'Papel antigrasa 30x40';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 13.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'LA RECORRE' AND p.nombre = 'Caja impresa LA RECORRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 3.42, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'Bandeja hamburguesa TBV';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 120.0, 12344, NULL FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'Bolsa de papas 16x31 TBV';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 5.49, 0, 'No pedir, cambiamos a sobre que ya pedimos y entregan esta semana' FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'Cono de papas TBV';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 105.0, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'Negro 1x1 TBV';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 8000, NULL FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'Papel antigrasa 30x40';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 22432, NULL FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'Bolsa de bizcocho';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 1300, 'No va a consumir más este producto' FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'BOLSA 23X33';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 6200, NULL FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'Bandeja de papas abiertas';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 2500, NULL FROM businesses b, products p
   WHERE b.nombre = 'TBV' AND p.nombre = 'Bandeja de papas con cheddar (cerradas)';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 6.71, 3700, NULL FROM businesses b, products p
   WHERE b.nombre = 'SOULMELT' AND p.nombre = 'Bolsa 23x33 SOULMET';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.93, 1000, 'No pedir aún' FROM businesses b, products p
   WHERE b.nombre = 'SOULMELT' AND p.nombre = 'Papel antigrasa SOULMET';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 1000, 'No pedir aún' FROM businesses b, products p
   WHERE b.nombre = 'SOULMELT' AND p.nombre = 'Papel antigrasa 20x30';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 3800, NULL FROM businesses b, products p
   WHERE b.nombre = 'SOULMELT' AND p.nombre = 'Caja';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 2.93, 8000, NULL FROM businesses b, products p
   WHERE b.nombre = 'RIO' AND p.nombre = 'Papel antigrasa RIO';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 21.35, 2700, NULL FROM businesses b, products p
   WHERE b.nombre = 'MANZANAR' AND p.nombre = 'Caja de pizza MANZANAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 71.98, 250, 'No pedir aún consumen poco' FROM businesses b, products p
   WHERE b.nombre = 'MANZANAR' AND p.nombre = 'Caja de torta MANZANAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 18.54, 1000, NULL FROM businesses b, products p
   WHERE b.nombre = 'MANZANAR' AND p.nombre = 'Caja de sushi MANZANAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 0, 'Precio: revisar con felipe' FROM businesses b, products p
   WHERE b.nombre = 'MANZANAR' AND p.nombre = 'bowl，1300ml 300G，MANZANAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 0, 'Precio: revisar con felipe' FROM businesses b, products p
   WHERE b.nombre = 'MANZANAR' AND p.nombre = 'bowl，1100ml 300G，MANZANAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 0, 'Precio: revisar con felipe' FROM businesses b, products p
   WHERE b.nombre = 'MANZANAR' AND p.nombre = 'bowl，750ml 280G，MANZANAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 9000, NULL FROM businesses b, products p
   WHERE b.nombre = 'MANZANAR' AND p.nombre = 'Papel antigrasa';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 10588, NULL FROM businesses b, products p
   WHERE b.nombre = 'MANZANAR' AND p.nombre = 'Bolsa de bizcocho';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 134.2, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'EL PALENQUE' AND p.nombre = 'BOlsa Transparente 1x1 EL PALENQUE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 4.92, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'EL PALENQUE' AND p.nombre = 'Cono 145x100 EL PALENQUE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 4.27, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'EL PALENQUE' AND p.nombre = 'Cono EL PALENQUE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 4.2, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'MADRE MIA' AND p.nombre = 'Bolsa 28x28 MADRE MIA';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 4.4, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'HDP' AND p.nombre = 'Servilleta HDP';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 17.56, 32500, NULL FROM businesses b, products p
   WHERE b.nombre = 'HDP' AND p.nombre = 'Bolsa térmica de delivery HDP';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 8.1, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'GERNERAL' AND p.nombre = 'Vaso de café 8 oz SIN GRABAR';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, 1.83, 0, NULL FROM businesses b, products p
   WHERE b.nombre = 'GERNERAL' AND p.nombre = 'Tapas vaso de café DESMADRE';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 8000, NULL FROM businesses b, products p
   WHERE b.nombre = 'PIZZA CENTRO' AND p.nombre = 'Papel antigrasa 20x30';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 1000, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'FAKE' AND p.nombre = 'Papel antigrasa rojo 30x40';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 1000, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'FAKE' AND p.nombre = 'Papel antigrasa marrón 30x40';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 2000, NULL FROM businesses b, products p
   WHERE b.nombre = 'FAKE' AND p.nombre = 'Papel antigrasa negro 30x40';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 2000, NULL FROM businesses b, products p
   WHERE b.nombre = 'FAKE' AND p.nombre = 'Papel antigrasa amarillo 30x40';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 3800, NULL FROM businesses b, products p
   WHERE b.nombre = 'FAKE' AND p.nombre = 'Bandeja de papas con cheddar';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 13464, NULL FROM businesses b, products p
   WHERE b.nombre = 'FAKE' AND p.nombre = 'Bolsa blanca';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 0, 'Ya pedimos más stock' FROM businesses b, products p
   WHERE b.nombre = 'FAKE' AND p.nombre = 'Cono';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 10000, NULL FROM businesses b, products p
   WHERE b.nombre = 'JONLU' AND p.nombre = 'Bolsa de bizcocho';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 848, NULL FROM businesses b, products p
   WHERE b.nombre = 'BURGER ZONE' AND p.nombre = 'Caja de hamburguesa';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 6300, NULL FROM businesses b, products p
   WHERE b.nombre = 'GARAGE VEGGIE' AND p.nombre = 'Bolsa 28x28';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 17622, NULL FROM businesses b, products p
   WHERE b.nombre = 'CAFÉ DORÉ' AND p.nombre = 'Bolsa de bizcocho';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 3200, 'Asumo que son las cajas chicas azules' FROM businesses b, products p
   WHERE b.nombre = 'BOCADITO' AND p.nombre = 'Caja de sánguche';
INSERT INTO business_products (business_id, product_id, precio, stock, notas)
  SELECT b.id, p.id, NULL, 700, 'Ya pedimos más stock 500 unidades' FROM businesses b, products p
   WHERE b.nombre = 'INFIEL' AND p.nombre = 'Caja de pizza al metro marrón';

COMMIT;
