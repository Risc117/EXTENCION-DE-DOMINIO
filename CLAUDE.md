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
