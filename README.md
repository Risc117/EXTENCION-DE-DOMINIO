# Visor 3D de la PTAR de Picoy

Una web que muestra en 3D la planta de tratamiento de aguas residuales (PTAR) de Picoy, Santa Leonor (Lima): el agua recorre el tren de tratamiento, con día y noche, viento, vida y personal, paneles de calidad, lodos y biogás, y un perfil hidráulico. Se maneja con mouse o con gestos de la mano (webcam), y tiene modo VR con el celular y AR en Android. Todo corre en el navegador, sin servidor. Es un **esquema ilustrativo**.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) en una versión reciente (se probó con Node 24).

```
npm install        # una sola vez
npm run dev        # abre el visor en http://localhost:5173
npm test           # pruebas
npm run lint       # revisión de estilo y de la arquitectura
npm run typecheck  # revisión de tipos
npm run build      # crea dist/ para publicar (ver GUIA_PUBLICAR.md)
```

## Dónde leer más

- **CLAUDE.md**: reglas del proyecto y contexto para quien continúe (también lo lee Claude Code).
- **plan.md**: hoja de ruta, decisiones y datos que faltan.
- **tickets/**: un archivo por trabajo hecho, con sus criterios y lo que quedó por confirmar.
- **datos/**: todas las medidas, caudales y textos, cada uno con su `fuente`; lo estimado lleva `demo: true` y la web lo avisa como "Dato de ejemplo".

## Ojo

La carpeta `insumos/` (planos, DXF, memoria y Excel) **no está en el repositorio**: pídela a quien hizo el proyecto. Sin ella la web funciona igual, porque los datos ya están pasados a `datos/`.

## Cómo está organizado

```
src/nucleo       constantes, textos y matemática pura
src/simulacion   caudales, calidad, lodos y biogás, demo (sin dibujar nada)
src/estado       estado compartido (zustand)
src/entrada      mouse, gestos, giroscopio (VR) y sesión de AR: emiten intenciones
src/escena       cámara y escena 3D
src/unidades     cada unidad de la PTAR, el entorno, la vida y el personal
src/ui           paneles y pantallas
datos/           medidas, caudales, textos y créditos de los modelos
```

`npm run lint` impide que `simulacion` y `entrada` importen de `escena` o `ui`: todo pasa por `estado`.
