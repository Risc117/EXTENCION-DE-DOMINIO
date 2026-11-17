/** Rótulos de la pantalla de inicio de la PTAR (T25.1); los textos propios de la planta salen de datos/inicio.json. */
export const TEXTO_INICIO = {
  ubicacion: 'Dónde está',
  altitud: 'altitud aprox.',
  cuerpoReceptor: 'Descarga al',
  poblacion: 'Población',
  poblacionBase: 'base',
  poblacionProyectada: (anio: number) => `proyectada al ${anio}`,
  caudales: 'Caudales de diseño',
  tren: 'Tren de tratamiento, en orden',
  controles: 'Cómo moverte',
  mouse: 'Mouse o dedo: arrastra para girar la planta; con la rueda, acercas y alejas.',
  gestos:
    'Gestos con la cámara (opcional): mueve la palma abierta para girar, separa el pulgar y el índice para acercar y júntalos para alejar, y cierra el puño para pausar. Sin cámara, todo se maneja con el mouse.',
  verPlanta: 'Ver la planta',
  verDemo: 'Ver la demo guiada',
  fuente: 'Datos de la memoria descriptiva del proyecto.',
}
