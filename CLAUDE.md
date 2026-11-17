# Visor 3D del homogeneizador — instrucciones para Claude

## Qué es
Web que muestra el tanque homogeneizador de una PTAR en 3D, con flujo de agua
ilustrativo y control por gestos (webcam) o mouse. Todo corre en el navegador.
El usuario no es experimentado: explica en simple y no le pidas comandos de git.

## Stack
Vite + React + TypeScript + React Three Fiber + drei + Zustand + zod.
Gestos: @mediapipe/tasks-vision (HandLandmarker). Nunca @mediapipe/hands.
Pruebas: Vitest + Playwright. Lint: ESLint con eslint-plugin-boundaries.

## Arquitectura (obligatoria)
- src/{nucleo, simulacion, estado, entrada, escena, unidades, ui}
- simulacion y entrada NUNCA importan de escena ni de ui. Todo pasa por estado.
- La escena no sabe si la mueve una mano o un mouse: entrada emite intenciones.
- Cada unidad de la PTAR vive en src/unidades/<unidad>/ y se registra en una lista.
- Archivos de ~200 líneas como máximo y una responsabilidad cada uno.

## Datos
- Cero datos en el código: medidas y caudales vienen de datos/*.json.
- Todo valor lleva `fuente`; los de ejemplo llevan `demo: true` y se muestran
  como "Dato de ejemplo". Nunca inventes medidas ni caudales: si falta uno, pregunta.
- Colores solo en src/ui/tokens.css; constantes en src/nucleo/constantes.ts.

## Cómo trabajar
- Un ticket a la vez desde tickets/<ID>.md. Se trabaja en main, sin ramas.
- Primero un plan corto y esperar OK. Luego pruebas, luego código.
- Evidencia = comandos corridos: npm run lint, npm run typecheck, npm test.
- Antes de cerrar, pasar el subagente qa-revisor. Si responde OBSERVADO,
  escribir los subtickets en tickets/<ID>.1.md, <ID>.2.md... y avisar.
- Si un ticket ya tiene 3 subtickets, parar y explicar qué está fallando.
- Con el QA en APROBADO: commit "[ID] descripción" con rutas explícitas.
- Nunca: force-push, borrar historial ni guardar .env en git.

## Contexto para quien continúe el proyecto
- **Qué es:** un visor 3D que corre en el navegador (sin servidor) de la PTAR (planta de tratamiento de aguas residuales) del pueblo de Picoy, distrito de Santa Leonor, Lima. Muestra la planta completa con agua, lodo y biogás ilustrativos, día y noche, viento, vida y personal, un perfil hidráulico y paneles de calidad y de lodos y biogás. Se maneja con mouse, gestos (webcam), VR con el celular (Cardboard) y AR en Android. Es un **esquema ilustrativo**, no una simulación de fluidos.
- **Cadena de tratamiento (en orden):** estación de bombeo (cárcamo EB-1), cámara de rejas, desarenador, canal Parshall, tanque homogeneizador, RAFA, filtro percolador, cámara de reparto y dos sedimentadores secundarios, desinfección con cloro (cámara de contacto y caseta de cloración), descarga al río; el lodo va a los lechos de secado y el biogás al quemador.
- **Reglas clave:** nada de medidas ni caudales inventados; lo que no sale de una fuente lleva `demo: true` y se muestra como "Dato de ejemplo"; todos los datos van en datos/*.json con su `fuente`; el 3D se dibuja por código desde los planos (solo animales y árboles pueden usar modelos CC0 con crédito en datos/creditos.json); si dos fuentes se contradicen, se pregunta y no se elige.
- **insumos/ NO está en el repositorio** (está en .gitignore): ahí van los planos PDF, los DXF, la memoria y los Excel de cálculo. Se piden aparte a quien hizo el proyecto; los datos que salen de ahí ya están pasados a datos/*.json con su fuente (archivo, hoja o capa).
- **Cómo se trabaja:** con tickets en tickets/ (uno a la vez, pruebas primero, lint, typecheck y test, subagente qa-revisor y commit "[ID] descripción" con rutas explícitas). La hoja de ruta y las decisiones están en plan.md. Los agentes y skills de .claude/ (qa-revisor, ticket) vienen con el repositorio.
- **Estado:** hechos los tickets hasta T32 y T34 (con subtickets). Falta T33 (acabado de cliente, medición de cuadros por segundo y publicación), que se hace al final, después de la revisión visual. Lo que sigue "por confirmar" está en cada ticket y en las `fuente` de datos/*.json. VR y AR solo se probaron con datos simulados: faltan pruebas en un celular.

## Ampliación a la PTAR completa
- La hoja de ruta está en plan.md (raíz): fases, tickets T7 a T34, datos que faltan y decisiones tomadas. Léela antes de empezar cualquier ticket de T7 en adelante.
- Los insumos del usuario están en insumos/ (planos PDF, DXF con curvas de nivel y mapa general en UTM, cálculos en Excel). No están en el repositorio (.gitignore) ni en la web: de ahí se pasan a datos/*.json con su `fuente` (archivo y hoja o capa).
- Las medidas de diseño salen de insumos/CALCULO; si dos fuentes se contradicen (plan.md sección 12), no elijas: pregunta.
- Para esta ampliación se permiten modelos .glb gratuitos CC0 solo para ambiente (animales y árboles), con crédito en datos/creditos.json. Las estructuras siguen hechas por código desde los planos.
- Los tickets nuevos se escriben en tickets/<ID>.md con el formato existente, uno a la vez, cuando se llega a ellos.
