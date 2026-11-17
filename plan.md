# Plan: de visor del homogeneizador a simulación de la PTAR completa

Fecha: 14 nov 2026 · Para: el grupo del proyecto

## 1. Punto de partida

Hoy el proyecto ya tiene (T1 a T6.1):

- El homogeneizador circular enterrado, armado por código desde `datos/homogeneizador.json`, con accesorios (baranda, boca de acceso, escalera, ventilación, cajas de válvula, terreno local).
- Balance de caudales (nivel que sube y baja con el hidrograma real de 5 días), partículas, remolino, corte, cotas y etiquetas con flecha.
- Mouse y gestos de mano, demo guiada, calidad baja/alta, publicación en Netlify.
- Reglas que siguen valiendo: cero datos en el código, cada valor con `fuente`, `demo: true` cuando es estimado, archivos de ~200 líneas, una unidad por carpeta en `src/unidades/`, `simulacion` y `entrada` nunca importan de `escena` ni `ui`.

La buena noticia: la arquitectura se pensó para esto. `src/unidades/registro.ts` ya es una lista de unidades; agregar el RAFA o el desarenador es crear otra carpeta igual. Lo que sí hay que cambiar es que hoy la escena asume **una sola unidad en el origen**: falta un "plano general" que diga dónde va cada estructura, el terreno de toda la planta y una simulación que encadene las unidades.

## 2. Qué vamos a construir

Una web que muestra la PTAR completa en 3D, sobre su terreno real con cotas, con cada estructura armada desde sus planos, el agua recorriendo toda la línea y paneles que explican qué entra y qué sale de cada etapa.

Línea de agua (en orden):

0. **Estación de bombeo** (cárcamo con bombas) que eleva el agua al pretratamiento. Es el único bombeo: de ahí en adelante todo va **por gravedad**.
1. **Pretratamiento**: cámara de rejas (cribado) → desarenador → canal Parshall (medición de caudal).
2. **Homogeneizador** (ya existe; se reubica en el plano general).
3. **RAFA / UASB** (reactor anaerobio de flujo ascendente).
4. **Filtro percolador**.
5. **Sedimentadores secundarios** (2 unidades en paralelo).
6. **Desinfección** con cloro gas (cámara de contacto y caseta de cloración).
7. Descarga al cuerpo receptor.

Línea de lodos y gas:

- Lodo del RAFA y de los sedimentadores → **lecho de secado de lodos**.
- Biogás del RAFA → quemador (si existe en el plano).

## 3. Funciones pedidas

| Función | Cómo se haría | Nota |
| --- | --- | --- |
| Terreno con cotas | Malla 3D generada desde los puntos topográficos (x, y, z). Curvas de nivel dibujadas encima y cota visible al pasar el mouse. Las estructuras se asientan o se entierran según su cota de fondo. | Necesita la topografía (sección 4). |
| Estructuras según planos | Cada estructura con su JSON y su carpeta en `src/unidades/`, hecha con cajas y cilindros como el homogeneizador. | Cada una necesita su plano. |
| Vida (pasto, animales) | Pasto y arbustos con instancias (miles de briznas baratas), árboles simples, aves volando en círculos, algún perro o garza cerca de los canales, moscas sobre el lecho de secado. Todo con interruptor y menos cantidad en calidad baja. | Decidido: **modelos 3D gratuitos** (licencia CC0, formato `.glb`) para animales y árboles. Es lo más rápido y se ve mejor. |
| Gestos con la mano | Lo que ya existe (palma gira, pinza hace zoom, puño pausa) se extiende a toda la planta, más gestos para saltar a la estructura siguiente o anterior. | Ya incluido desde T2. |
| VR con el celular | Modo visor tipo Cardboard y modo realidad aumentada (sección 6.1). | Nuevo. |
| Día y noche | Sol que se mueve según la hora simulada (la misma del hidrograma), cielo que cambia de color, faroles y luces de la planta que se encienden de noche, estrellas. Posición del sol según la latitud real. | Necesita latitud/longitud y el norte del plano. |
| Viento | Dirección y velocidad (de datos), que mueven el pasto, los árboles, la llama/humo del quemador de biogás y una manga de viento. Opcional: pluma de olor ilustrativa. | Necesita viento predominante del lugar. |
| Leyenda | Panel con colores y símbolos: agua cruda, agua tratada, lodo, biogás, aire; tipos de estructura; "Dato de ejemplo". | Hoy `Leyenda.tsx` solo dice "Esquema ilustrativo"; se amplía. |
| Flechas y etiquetas | Se generaliza lo hecho en T6.1 (cotas y etiquetas desde el JSON) a toda la planta, con nombre de cada estructura y flechas de sentido del flujo sobre tuberías y canales. Menos etiquetas cuando la cámara está lejos. | Reusa `anotaciones/`. |
| Cuadros de entrada y salida | Al hacer clic en una estructura se abre una tarjeta: caudal que entra, caudal que sale, tiempo de retención, nivel, y (si se agrega) calidad que entra y sale. Un diagrama de bloques fijo con toda la línea y los caudales en vivo. | Calculado por la simulación encadenada. |

## 4. Datos que necesito de ti (y en qué formato)

Ningún número se inventa. Lo que no llegue se arma con `demo: true` y la pantalla dice "Dato de ejemplo". En orden de importancia:

### 4.1 Plano general (ubicación de todo)

- **Archivo**: el plano general en **DWG o DXF** (ideal) o en **PDF** si no hay otro. Del DWG puedo leer coordenadas exactas; del PDF hay que medir a mano.
- Que se vea: el **norte**, la escala, y el contorno del terreno o cerco.
- Para cada estructura: **coordenadas** (UTM o locales) de su centro o de una esquina, y su **giro** respecto al norte. Si es más fácil, una tabla así:

```csv
id,nombre,x_m,y_m,giro_grados,cota_fondo_m,cota_coronacion_m,fuente
rejas,Cámara de rejas,0.00,0.00,0,99.20,100.40,Plano general lámina PG-01
homogeneizador,Homogeneizador,25.30,-4.10,0,94.70,100.10,Plano general lámina PG-01
```

### 4.2 Topografía (terreno con cotas)

Confirmado: la topografía está en **curvas de nivel** dentro del DWG/DXF. Para leerlas bien:

- Exportar a **DXF** (AutoCAD: Guardar como → DXF 2013 o similar).
- Que las curvas sean **polilíneas con su elevación** (la propiedad "Elevación" con la cota), en una capa propia (por ejemplo `CURVAS` o `TOPO`). Si las curvas están dibujadas planas con un texto al lado, avísame: se puede, pero toma más trabajo.
- Si además hay puntos de levantamiento (CSV `punto,x,y,z,descripcion`), mejor todavía, pero no es obligatorio.

Además: cotas de **terreno natural** y de **terreno terminado** (plataformas, rellenos, cortes), caminos internos, cerco y puerta.

### 4.3 Cada estructura

Para cada una: **plano en planta y cortes** (PDF o DWG), con las medidas interiores, espesores, cotas de fondo, de coronación y del nivel de agua, y la ubicación y cota de las tuberías de entrada y salida. Lo específico de cada una:

| Estructura | Medidas clave que debe tener el plano o la memoria de cálculo |
| --- | --- |
| Estación de bombeo | Medidas del cárcamo, cotas de llegada y de fondo, niveles de arranque y parada de las bombas, número de bombas y su caudal, tubería de impulsión hasta el pretratamiento. |
| Cámara de rejas | Ancho y largo del canal, ángulo de las rejas, espesor y separación de barras, bandeja de escurrido, compuertas o by-pass. |
| Desarenador | Número de canales, largo, ancho, profundidad, tolva o zona de arena, vertedero o control de velocidad. |
| Canal Parshall | Ancho de garganta (W) y medidas estándar del Parshall, cota de la cresta, posición del medidor de nivel. |
| Homogeneizador | Ya está; confirmar las medidas aún marcadas `demo: true` (cota de entrada, salida, rebose, agitador). |
| RAFA (UASB) | Forma y medidas, altura total, número y forma de los separadores trifásicos (campanas GLS), sistema de distribución del afluente (tubos al fondo), canaletas de salida, salida de biogás y purga de lodos. |
| Filtro percolador | Diámetro y altura del lecho, tipo de medio (piedra o plástico), brazo distribuidor rotatorio o fijo, falso fondo, ventilación, recirculación (si hay). |
| Sedimentadores secundarios (×2) | Forma (circular o rectangular), medidas, tolva, vertederos perimetrales, purga de lodos, cómo se reparte el caudal entre los dos. |
| Desinfección (cloro gas) | Cámara de contacto y sus pantallas o bafles, caseta de cloración (cilindros, clorador), dosis de cloro y tiempo de contacto. |
| Lecho de secado | Número de celdas, medidas, capas (arena, grava, ladrillo), drenaje y a dónde va el filtrado. |
| Quemador de biogás | Altura y ubicación (si existe). |

### 4.4 Tuberías y canales de conexión

Tabla en CSV o en el plano: `desde,hasta,tipo(tubería/canal),diametro_o_ancho_m,material,cota_salida_m,cota_llegada_m,longitud_m,fuente`. Con esto se dibujan las conexiones y sale el **perfil hidráulico**.

### 4.5 Proceso y calidad (memoria de cálculo)

- Caudales de diseño: promedio, máximo horario, mínimo (ya tenemos el hidrograma de 5 días de la hoja ECUALIZADOR).
- Calidad del agua cruda y en cada etapa: DBO5, DQO, SST, coliformes termotolerantes, y si hay, aceites y grasas, nitrógeno, fósforo, pH, temperatura.
- Eficiencias de remoción de diseño por etapa (de la memoria de cálculo, no de libro).
- Límites de descarga que aplican (LMP o norma de vertimiento).
- Producción de lodos (kg/día), producción de biogás (m³/día), ciclo de secado de lodos (días).
- Hoja de cálculo completa (`CALCULOS PRIMARIO SECUNDARIO LEONOR.xlsx` y las demás) si las tienes: de ahí salen casi todos estos valores.

### 4.6 Lugar y ambiente

- Latitud y longitud aproximadas de la planta (para el sol) y la altitud.
- Viento predominante: dirección y velocidad media (de la estación meteorológica más cercana o del estudio de impacto ambiental).
- 5 a 10 **fotos** de la planta y del entorno (tipo de pasto, árboles, color del suelo, animales que se ven). Sirven para que el ambiente se parezca al real.

### 4.7 Cómo entregarlo

Déjalo todo en una carpeta `insumos/` dentro del proyecto (no se sube a la web), con subcarpetas `planos/`, `topografia/`, `calculos/`, `fotos/`. De ahí se pasa a `datos/*.json` con su `fuente`, ticket por ticket.

## 5. Cambios de arquitectura

Lo que se mantiene igual: capas, reglas de importación, JSON con `fuente`, flujo de tickets con QA.

Lo nuevo:

```
datos/
  planta.json            ← ubicación, giro y cotas de cada estructura (del plano general)
  terreno.json           ← puntos o malla topográfica (generado desde el CSV/DXF)
  conexiones.json        ← tuberías y canales entre estructuras
  proceso.json           ← calidad, eficiencias, lodos, biogás (memoria de cálculo)
  ambiente.json          ← latitud, norte, viento, cantidad de pasto/animales
  estructuras/<id>.json  ← un JSON por estructura (como homogeneizador.json)
src/
  simulacion/linea.ts    ← encadena las unidades: la salida de una es la entrada de la siguiente
  simulacion/calidad.ts  ← C_salida = C_entrada · (1 − eficiencia)
  simulacion/sol.ts, viento.ts ← números puros (posición del sol, ráfagas)
  escena/ambiente/       ← cielo, sol, luces de noche, pasto, árboles, animales
  escena/terreno/        ← malla del terreno y curvas de nivel
  unidades/<id>/         ← bombeo, rejas, desarenador, parshall, rafa, percolador, sedimentador, desinfeccion, lecho
  ui/                    ← tarjeta de estructura, diagrama de la línea, leyenda ampliada
```

- `Unidad` (en `src/unidades/tipos.ts`) gana: `posicion`, `giro`, `cotaFondo` (de `planta.json`), y una función `transferir(entrada) → salida` para la simulación encadenada. Cada unidad sigue dibujándose en su propio origen; la escena la coloca.
- Las unidades que no almacenan (rejas, Parshall, sedimentadores, desinfección) se simulan como "pasa el caudal con un retraso igual a su tiempo de retención". El homogeneizador sigue con su balance de nivel. El RAFA y el percolador, flujo continuo con retención.
- La cámara arranca en vista general de toda la planta y puede "volar" a una estructura (botones o clic).
- Rendimiento: todo con instancias, y los detalles (partículas, accesorios, etiquetas) solo se dibujan en la estructura que se está mirando. Meta: 30 cuadros por segundo en laptop con gráfica integrada.

## 6. Mis recomendaciones (qué más añadir)

Ordenadas por cuánto aportan para explicar la planta:

1. **Balance de caudales por etapa**: diagrama de bloques siempre visible con el caudal en vivo entre cada estructura. Es el resumen de todo.
2. **Calidad por etapa y medidor de eficiencia**: barras de DBO, SST y coliformes que bajan etapa por etapa, con el % de remoción y una marca del límite de descarga (cumple / no cumple).
3. **Perfil hidráulico**: corte longitudinal 2D con la línea de agua de toda la planta y las cotas. Para una planta por gravedad es la vista más útil para un ingeniero.
4. **Línea de lodos y biogás**: lodo (color marrón) del RAFA y sedimentadores al lecho de secado; biogás (burbujas) al quemador, con la llama movida por el viento.
5. **Cronología con el hidrograma**: barra de tiempo de 24 h (días 1 a 5) que mueve a la vez el caudal, el sol y la iluminación.
6. **Vistas de planta y corte**: botón "Planta" (vista desde arriba, como el plano) y "Corte" de cada estructura (ya existe para el homogeneizador).
7. **Modo recorrido**: la demo guiada actual extendida a toda la planta, siguiendo una gota de agua desde la reja hasta la descarga, con un texto por etapa.
8. **Ficha técnica por estructura**: al hacer clic, además del flujo, sus medidas, volumen, tiempo de retención y la lámina del plano de donde salen.
9. **Escenarios**: "caudal pico / lluvia", "falla del agitador", "un sedimentador fuera de servicio". Muestran por qué existe cada estructura.
10. **Exportar capturas**: botón para guardar una imagen PNG de la vista actual (con leyenda y fecha), útil para informes.
11. **Acabado de entrega a cliente** (lo pidió el profe): pantalla de inicio con nombre del proyecto y logo, una paleta de colores cuidada, textos sin errores, carga rápida con barra de progreso, y que funcione en celular. Es lo que hace que se vea como un producto y no como una tarea.
12. Para después: sonido ambiente (agua, aves, viento) con botón de silencio, y en el futuro, conectar datos medidos reales (caudalímetro del Parshall).

### 6.1 Gestos y VR con el celular

**Gestos**: siguen igual que hoy (webcam en la laptop) y se amplían a la planta: palma para girar, pinza para zoom, puño para pausar, y un gesto nuevo (por ejemplo, deslizar la mano a un lado) para ir a la estructura siguiente o anterior.

**VR con el celular: sí se puede**, con dos modos que se activan con botones en la misma web (sin instalar apps):

| Modo | Cómo se ve | En qué celulares | Cómo se controla |
| --- | --- | --- | --- |
| **Visor VR (tipo Cardboard)** | Pantalla partida en dos (un ojo cada lado); metes el celular en un visor de cartón o plástico y miras alrededor moviendo la cabeza, parado dentro de la planta. | Casi todos: Android y iPhone, en el navegador (pide permiso de sensores de movimiento). | Mirar fijo un punto (una mira en el centro) durante 2 s para "teletransportarse" o abrir el cuadro de una estructura. |
| **Realidad aumentada (AR)** | La PTAR aparece como maqueta sobre tu mesa o el piso a través de la cámara; caminas alrededor de ella. | Android con Chrome y servicios de AR de Google (la mayoría de gama media y alta). En iPhone no funciona en el navegador. | Tocar la pantalla para colocar la maqueta y tocar una estructura para ver su cuadro. |

Si algún día usan un visor de verdad (Meta Quest), el mismo modo VR funciona completo, con mandos.

Límites honestos:
- En modo visor la webcam no ve tus manos, así que los gestos de mano no funcionan ahí: se usa la mirada.
- La planta completa con pasto, animales y partículas pesa: en VR/AR se usa automáticamente la calidad baja, porque hay que dibujar a 60 cuadros por segundo (por debajo marea).
- Se necesita HTTPS (Netlify ya lo da).

Para la sustentación, la combinación más impactante es: laptop con gestos en el proyector, y el profe con el celular en AR viendo la maqueta sobre la mesa.

## 7. Fases y tickets

Se sigue numerando después de T6.1. Cada ticket usa el mismo formato de siempre (Objetivo, Incluye, Fuera de alcance, Criterios de aceptación) y termina con algo nuevo en pantalla. Los que dicen **Necesita datos** esperan los insumos de la sección 4; mientras tanto se pueden hacer los demás.

### Fase A · Base de la planta (sin datos reales todavía)

**T7 · Planta con varias unidades**
Objetivo: que la escena muestre varias unidades, cada una en su posición, y la cámara pueda ver toda la planta o ir a una.
Incluye: `datos/planta.json` validado con zod; `Unidad` con posición, giro y cota; la escena coloca cada unidad; vista general + botones "ir a"; el homogeneizador reubicado (con posición de ejemplo hasta tener el plano).
Fuera de alcance: terreno, otras estructuras.
Criterios:
- [ ] Cambiar la posición en `planta.json` mueve la unidad sin tocar código.
- [ ] La cámara encuadra toda la planta al inicio y vuela a una unidad con un botón.
- [ ] Prueba de arquitectura sigue en verde; lint, typecheck y test en verde.

**T8 · Simulación encadenada**
Objetivo: que el caudal recorra la línea completa: la salida de una unidad es la entrada de la siguiente.
Incluye: `simulacion/linea.ts`, `transferir()` por unidad, reparto 50/50 a los dos sedimentadores, retraso por tiempo de retención.
Criterios:
- [ ] Prueba: con caudal constante, lo que entra a la planta sale igual (menos lodos) en estado estable.
- [ ] Prueba: el pico del hidrograma se aplana después del homogeneizador.
- [ ] lint, typecheck y test en verde.

### Fase B · Terreno y estructuras (Necesita datos)

**T9 · Terreno con cotas** (Necesita datos 4.1 y 4.2)
Objetivo: el terreno real de la planta con curvas de nivel y cotas.
Incluye: script que convierte el CSV/DXF a `datos/terreno.json`; malla del terreno; curvas de nivel; cota al pasar el mouse; plataformas y caminos; las estructuras enterradas se ven bajo el terreno con el corte.
Criterios:
- [ ] La cota que muestra el mouse coincide con la del levantamiento (±0.05 m en los puntos medidos).
- [ ] Se mantienen ~30 cuadros por segundo.

**T10 · Estación de bombeo y pretratamiento: cárcamo con bombas, rejas, desarenador y Parshall** (Necesita datos 4.3). Las bombas arrancan y paran según el nivel del cárcamo (se ve en la simulación).
**T11 · RAFA (UASB)** (Necesita datos 4.3)
**T12 · Filtro percolador** (con brazo distribuidor girando) (Necesita datos 4.3)
**T13 · Sedimentadores secundarios ×2** (una unidad, dos instancias desde el JSON) (Necesita datos 4.3)
**T14 · Desinfección** (Necesita datos 4.3)
**T15 · Lecho de secado de lodos** (Necesita datos 4.3)
**T16 · Tuberías y canales de conexión** (Necesita datos 4.4)
**T16.5 · Edificios y entorno del plano**: grupo electrógeno, almacén y respuesta de emergencia, garita, oficina, laboratorio, almacén, estacionamiento, portón, muro perimétrico, camino interno, río con corriente y cerco vivo de árboles en sus posiciones del plano.

Todos con el mismo patrón que T1/T1.2 y T6: JSON con `fuente`, esquema zod, carpeta propia, corte, accesorios con interruptor, cotas y etiquetas definidas en el JSON. Criterios comunes:
- [ ] Cambiar una medida en el JSON cambia la estructura sin tocar código.
- [ ] Una prueba valida el JSON y rechaza datos malos.
- [ ] Lo estimado se ve como "Dato de ejemplo".
- [ ] lint, typecheck y test en verde.

### Fase C · Flujo y paneles

**T17 · Flujo de agua en toda la planta**
Objetivo: partículas y flechas de sentido de flujo en canales y tuberías; agua que corre en el Parshall, cae en el percolador, rebalsa en los vertederos.
Fuera de alcance: CFD (sigue siendo ilustrativo).

**T18 · Cuadros de entrada y salida por estructura**
Objetivo: tarjeta al hacer clic en una estructura (caudal que entra y sale, tiempo de retención, nivel) y diagrama de bloques de la línea con caudales en vivo.

**T19 · Calidad por etapa y medidor de eficiencia** (Necesita datos 4.5)
Objetivo: DBO, DQO, SST, coliformes por etapa, % de remoción y comparación con el límite de descarga.

**T20 · Línea de lodos y biogás** (Necesita datos 4.5)
Objetivo: lodo al lecho de secado, biogás al quemador, cantidades por día.

**T21 · Perfil hidráulico** (Necesita datos 4.4)
Objetivo: corte longitudinal 2D con la línea de agua y las cotas de toda la planta, enlazado con la vista 3D.

### Fase D · Ambiente

**T22 · Día y noche**
Objetivo: sol según la hora simulada y la latitud, cielo, sombras, luces de la planta de noche, estrellas. Botón para fijar la hora o seguir la simulación.
Criterios:
- [ ] Prueba: a mediodía el sol está más alto que a las 7 am; de noche se encienden las luces.

**T23 · Viento**
Objetivo: dirección y velocidad desde `ambiente.json`; mueve pasto, árboles, manga de viento y llama del quemador; indicador de viento en pantalla.

**T24 · Vida: pasto, árboles y animales**
Objetivo: vegetación con instancias y animales (aves, garza, perro, moscas en el lecho de secado), con interruptor y menos cantidad en calidad baja.
Incluye: modelos `.glb` gratuitos con licencia CC0 (por ejemplo Quaternius, Kenney o Poly Pizza) en `public/modelos/`, cada uno anotado con su autor y licencia en `datos/creditos.json`, comprimidos para que carguen rápido. Pasto y arbustos siguen hechos por código (instancias), que es más liviano.
Criterios:
- [ ] Con todo activado, ~30 cuadros por segundo en calidad alta y más en baja.

**T24.1 · Técnicos y vehículos**
Objetivo: dar vida de operación a la planta.
Incluye:
- **Técnicos** (2 a 4, modelos CC0 animados con casco y chaleco) que caminan por las veredas y el camino interno siguiendo rutas definidas en `datos/rutas.json`: ronda de inspección, revisar las rejas, tomar muestra en la cámara de contacto, entrar al laboratorio. Se detienen un momento en cada estructura.
- **Vehículos** (camioneta de operación, camión cisterna o volquete de lodos) que entran por el portón, pasan la barrera de la garita (que se levanta), recorren el camino y estacionan o maniobran en el patio de maniobras, y luego salen.
- Horario según la hora simulada: de día hay técnicos y tránsito; de noche solo un vigilante en la garita y los faros de los vehículos encendidos.
- Opcional: el volquete llega cuando el lecho de secado tiene lodo seco (enlazado con T20).
- Interruptor "Personas y vehículos" y menos cantidad en calidad baja.
Fuera de alcance: personas que se manejan con el teclado.
Criterios de aceptación:
- [ ] Los técnicos y los vehículos siguen las rutas del JSON sin atravesar estructuras ni muros.
- [ ] La barrera se levanta cuando pasa un vehículo.
- [ ] De noche cambia el tránsito y se encienden los faros.
- [ ] lint, typecheck y test en verde.

### Fase E · Interfaz y cierre

**T25 · Leyenda y etiquetas de toda la planta**: leyenda ampliada (colores de agua, lodo, biogás, tipos de estructura) y etiquetas con flecha que se adaptan a la distancia.
**T26 · Vistas planta y corte**: botón de vista de planta (desde arriba, como el plano) y corte por estructura.
**T27 · Modo recorrido**: demo guiada de toda la planta siguiendo una gota, desde `datos/demo.json`.
**T28 · Escenarios**: caudal pico, falla de agitador, un sedimentador fuera de servicio.
**T29 · Exportar captura**: botón que guarda un PNG de la vista con leyenda y fecha.
**T30 · Gestos para toda la planta**: los gestos actuales funcionan en la vista general, más un gesto para ir a la estructura siguiente o anterior.
**T31 · VR con el celular (visor tipo Cardboard)**: botón "VR", pantalla partida, mirar alrededor con el celular, mira central para moverse y abrir cuadros. Calidad baja automática.
**T32 · Realidad aumentada en Android**: botón "AR", maqueta de la planta sobre la mesa, tocar para ver cuadros. El botón se oculta si el celular no lo soporta.
**T33 · Acabado de cliente, rendimiento y publicación** (último): pantalla de inicio, barra de carga, revisión de textos, medir cuadros por segundo con todo prendido, revisar celular y publicar. Pulido pendiente de T16.8: muros de contención en laderas y escalones junto a EB-1 y la impulsión (hoy los taludes llegan a 1:1 y no cumplen los 3 m de holgura a lo hidráulico).

**T34 · Extras pequeños del plano (al final)**
Objetivo: cerrar detalles menores del plano, sin que bloqueen nada.
Incluye: retorno del drenaje de los lechos de secado al cárcamo de bombeo (tubería y flujo); ducha de emergencia y lavaojos junto a la caseta de cloración; corregir el rótulo ("NUEVA LEONA" → nombre correcto) y los campos "Lorep ipsum" en el plano y en la web.
Criterios de aceptación:
- [ ] El drenaje se ve y suma al caudal del cárcamo.
- [ ] La ducha y el lavaojos aparecen junto a la caseta de cloración.
- [ ] No queda texto "Lorep ipsum" en la web.
- [ ] lint, typecheck y test en verde.

### Orden sugerido

1. T7 y T8 (ahora, no necesitan datos).
2. T22, T23, T24, T24.1 y T25 mientras llegan los planos (ambiente e interfaz no dependen de las medidas).
3. Cuando lleguen el plano general y la topografía: T9.
4. Estructuras T10 a T16, en el orden de la línea de agua.
5. T17 a T21 (flujo, paneles, calidad, lodos, perfil).
6. T26 a T32 (interfaz, gestos, VR y AR).
7. T33 y T34 al final.

Estimado a tiempo parcial: unas 6 a 9 semanas (contando VR y AR), muy dependiente de cuándo lleguen los datos y de cuántos subtickets salgan. Es una estimación.

## 8. Resumen

La planta completa es viable con la misma base: la arquitectura ya separa unidades, datos y simulación. Hacen falta tres piezas nuevas (plano general, terreno y simulación encadenada) y luego una carpeta por estructura. Lo que más define la calidad del resultado son los insumos: plano general en DWG/DXF, topografía en puntos y la memoria de cálculo. Mientras llegan, se avanza con la base, el ambiente (día/noche, viento, vida) y la interfaz.

## 9. Decisiones tomadas (14 nov 2026)

| Pregunta | Respuesta del grupo |
| --- | --- |
| Formato de planos | Hay DWG/DXF y PDF. Se usará DWG/DXF. |
| Topografía | Curvas de nivel (en el DWG/DXF). |
| Bombeo | Solo antes del pretratamiento; de ahí en adelante todo por gravedad. |
| Desinfección | Cloro gas (por confirmar en el plano). |
| Modelos 3D | Se usan modelos gratuitos CC0 para animales y árboles (más rápido). Esto cambia la regla de T6 "sin modelos importados" solo para el ambiente; las estructuras siguen hechas por código desde los planos. |
| Público | Trabajo final de ciclo, pero con nivel de entrega a cliente (pedido del profe). |
| Calidad del agua | Todo sale de la memoria de cálculo (sin laboratorio). Se marcará como "valor de diseño". |
| Gestos | Siguen incluidos y se amplían a toda la planta (T30). |
| VR | Sí: visor tipo Cardboard en cualquier celular (T31) y AR en Android (T32). |

## 10. Lo que muestra el plano general (PLANO_GENERAL_PTAR-PICOY, nov 2026)

Leído del PDF (planta y perfil longitudinal 0+030 a 0+260.92, escala 1:1000):

- **Ubicación**: Picoy, distrito Santa Leonor, provincia Huaura, Lima. El perfil va de cota ~2994 a ~2976 m s.n.m. (planta andina: cielo despejado, noches frías, sol fuerte).
- **Línea de agua confirmada**: entrada de agua residual → **estación de bombeo EB-1** (cárcamo Ø 3.20 m, 2 bombas 1+1R, caseta de válvulas, línea de impulsión Ø 200) → caja de recepción → pretratamiento (rejas con by-pass, desarenador, Parshall) → homogeneizador → RAFA → filtro percolador → **cámara de reparto** → sedimentador secundario 1 y 2 → **cámara de contacto** con **caseta de cloración** (Cl₂ Ø 1/2") → válvula de retención → salida de agua tratada (0+261) al río.
- **Lodos**: tuberías Ø 150 (buzones BZ-R, BZ-L1, BZ-L2, BZ-L3) llevan el lodo del RAFA y de los dos sedimentadores **directo a los lechos de secado** (2 celdas). Ya no hace falta preguntarlo.
- **Biogás**: el plano **no muestra quemador** ni línea de biogás.
- **Otras construcciones**: garita, barrera, portón de 4.5 m (entrada única vehicular y peatonal), oficina con SS.HH., laboratorio, almacén-taller, estacionamiento y patio de maniobras. Se suman como edificios simples (ticket nuevo T16.5).
- **Entorno**: un río o quebrada al norte (flechas de sentido de corriente), un camino interno en curva con rotonda, muro de contención de concreto armado (e = 0.30 m) en el perímetro y una fila de árboles (cerco vivo) alrededor. Todo esto entra en el 3D: el río con agua que corre y los árboles reales del plano en vez de árboles al azar.
- **Buzones** BZ-2 a BZ-10 en la línea de agua, con progresivas cada 20 m: sirven para el perfil hidráulico (T21).

### Lo que le falta al plano (para el 3D y para que se vea de entrega a cliente)

1. **Flecha del norte**: no la encontré. Es indispensable para el sol y el viento.
2. **Curvas de nivel en la planta**: el perfil tiene cotas, pero la planta no muestra la topografía (solo líneas del río y del camino). Sin ellas el terreno sale solo del perfil.
3. **Tabla del perfil vacía**: las filas "cota tapa de buzón", "cota fondo", "profundidad", "diámetro", "pendiente" y "distancia acumulada" están en blanco.
4. **Leyenda o simbología**: no hay cuadro que diga qué es cada color de línea (rojo, celeste, naranja), los buzones BZ ni los círculos verdes.
5. **Cuadro de coordenadas** (UTM) de las estructuras o una cuadrícula, y **escala gráfica** en la planta.
6. **Quemador de biogás** del RAFA: el RAFA produce metano; normalmente se dibuja un quemador o al menos el venteo.
7. **Retorno del drenaje de los lechos de secado**: el agua que se filtra del lodo suele volver al cárcamo de bombeo; no veo esa tubería.
8. **Detalles menores**: el rótulo dice "SECTOR PICOY - NUEVA LEONA" (¿Leonor?) y varios campos con "Lorep ipsum".

## 11. Actualización del plano (versión "LUGAR PROYECTADO FINAL MEJORADO", 15 nov 2026)

El grupo entregó una versión nueva. Cambios que ya incorporo al plan:

- **Quemador de biogás (antorcha)** con su radio de seguridad, junto a los lechos de secado, conectado al RAFA por una línea amarilla (biogás). Queda decidido: hay quemador. T20 dibuja la llama (movida por el viento) y el caudal de biogás.
- **Grupo electrógeno** (con su radio de seguridad) y **almacén y respuesta de emergencia**, en el espacio libre del centro. Entran en T16.5.
- **Flecha del norte** (arriba a la izquierda): ya se puede orientar el sol y el viento. Dato para `ambiente.json`.
- **Leyenda**: cerco perimétrico, árbol, franja verde, vía interna, vereda peatonal, edificación, unidad de tratamiento. Colores de tuberías: **celeste = agua residual, rojo = efluente tratado, naranja = lodos**, y los buzones BZ, las luminarias y la señalización/barrera (los círculos magenta son radios de seguridad). Esta leyenda se reutiliza tal cual en la leyenda de la web (T25).
- **Luminarias**: aparecen en el plano; las uso como las luces de noche (T22).
- **Río Picoy**: el río del plano se llama Picoy. Va en la etiqueta del 3D.

### Lo que todavía falta en el plano

1. **Curvas de nivel en la planta** (siguen sin aparecer; solo el perfil tiene cotas).
2. **Tabla del perfil vacía** (cota de tapa y fondo de buzón, profundidad, diámetro, pendiente, distancia acumulada).
3. **Coordenadas UTM** o cuadrícula y escala gráfica.
4. **Retorno del drenaje de los lechos de secado** al cárcamo.
5. **Ducha de emergencia y lavaojos** junto a la caseta de cloración.
6. El rótulo sigue diciendo "NUEVA LEONA" (¿Leonor?) y campos "Lorep ipsum".

## 12. Preguntas que siguen abiertas

1. ¿El quemador y el grupo electrógeno son del diseño final o propuestos? (Los dibujo como parte de la planta.)
2. Dado que el visor de cartón ya está confirmado, no queda pregunta pendiente sobre VR.
3. ¿Me puedes pasar el DXF o las curvas de nivel de la planta, y la memoria de cálculo de los lechos de secado?
