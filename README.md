# Visor 3D del tanque homogeneizador (PTAR)

Una web que muestra en 3D el tanque homogeneizador de una planta de tratamiento de aguas residuales: el agua entra, se mezcla y sale, con el nivel y los caudales de un día simulado. Se maneja con el mouse o con gestos de la mano (webcam). Todo corre en el navegador, sin servidor. Es un **esquema ilustrativo**.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) instalado.

```
npm install        # una sola vez
npm run dev        # abre el visor en http://localhost:5173
npm run build      # crea la carpeta dist/ para publicar
npm test           # pruebas
npm run lint       # revisión de estilo y de la arquitectura
npm run typecheck  # revisión de tipos
```

Para publicarlo, sigue [GUIA_PUBLICAR.md](GUIA_PUBLICAR.md).

## De dónde salen los datos

Ninguna medida está escrita en el código: todo viene de `datos/` y cada valor lleva su `fuente`. Lo que es un estimado lleva `demo: true` y la pantalla lo avisa como "Dato de ejemplo".

| Archivo | Qué contiene | Fuente |
| --- | --- | --- |
| `datos/homogeneizador.json` | Medidas del tanque circular, entrada, salida, rebose y agitador | Plano `HOMOGENIZADOR_enterrado_v1` (algunas medidas están estimadas y marcadas `demo: true`) |
| `datos/hidrograma.json` | Caudal de entrada por hora, 24 h, 5 días | Hoja ECUALIZADOR de `CALCULOS PRIMARIO SECUNDARIO LEONOR.xlsx` |
| `datos/demo.json` | Guion de la demo guiada (textos, duraciones, vistas y acciones) | Redactado para esta web; se edita sin tocar código |

Para cambiar una medida, edita el JSON y recarga: el tanque se redibuja solo. Los textos de la demo pueden usar marcadores como `{diametroInterior:2}`, que se llenan con los datos.

## Cómo se maneja

- **Mouse o dedo**: arrastrar gira el tanque, la rueda acerca y aleja.
- **Gestos (opcional)**: botón "Activar gestos". Palma abierta para girar, pinza (separar pulgar e índice acerca, juntarlos aleja), puño para pausar. Pide permiso de cámara; si no hay cámara, todo funciona con el mouse.
- **Demo guiada**: botón "Iniciar demo" recorre sola la historia del homogeneizador, con anterior, siguiente y salir.
- **Corte**: "Ver corte" y un deslizador para mirar el interior.
- **Calidad**: baja (150 partículas) o alta (400). En celular arranca en baja.

## Cómo está organizado

```
src/nucleo       constantes, textos y colores
src/simulacion   balance de caudales, partículas y demo (sin dibujar nada)
src/estado       estado compartido (zustand)
src/entrada      mouse y gestos: emiten intenciones
src/escena       cámara y escena 3D
src/unidades     cada unidad de la PTAR (hoy: homogeneizador)
src/ui           paneles y pantallas
datos/           todas las medidas, caudales y el guion de la demo
```

`npm run lint` impide que `simulacion` y `entrada` importen de `escena` o `ui`: todo pasa por `estado`.
