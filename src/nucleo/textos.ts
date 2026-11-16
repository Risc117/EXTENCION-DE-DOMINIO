/** Textos de la interfaz de gestos. */
export const TEXTO_GESTOS = {
  activar: 'Activar gestos',
  desactivar: 'Desactivar gestos',
  iniciando: 'Pidiendo permiso de la cámara…',
  manoSi: 'Mano detectada',
  manoNo: 'Muestra la mano a la cámara',
  pausado: 'Pausado (puño)',
  denegado:
    'El navegador no dio permiso para usar la cámara. Puedes permitirla desde el candado de la barra de direcciones. Mientras tanto, usa el mouse.',
  error: 'No se pudo iniciar la cámara o el reconocimiento de la mano. Usa el mouse.',
}

/** Panel de ajuste de gestos. */
export const TEXTO_AJUSTE = {
  titulo: 'Ajuste de gestos',
  giro: 'Sensibilidad de giro',
  zoom: 'Sensibilidad de zoom',
  suavizado: 'Suavizado',
  zonaMuerta: 'Zona muerta (temblores)',
  restablecer: 'Restablecer',
  abrirPanel: 'Mostrar ajuste de gestos',
  cerrarPanel: 'Ocultar ajuste de gestos',
}

/** Demo guiada. */
export const TEXTO_DEMO = {
  iniciar: 'Iniciar demo',
  detener: 'Detener demo',
  anterior: 'Anterior',
  siguiente: 'Siguiente',
  paso: 'Paso',
  de: 'de',
}

/** Calidad de las partículas. */
export const TEXTO_CALIDAD = {
  etiqueta: 'Calidad',
  baja: 'Baja (más fluida)',
  alta: 'Alta',
}

/** Pantalla inicial. */
export const TEXTO_BIENVENIDA = {
  titulo: 'Tanque homogeneizador de la PTAR',
  queEs:
    'Un tanque donde llega el agua residual con caudales que cambian durante el día. Aquí se mezcla y sale pareja hacia el tratamiento: así se amortiguan los picos. Lo que ves es un esquema ilustrativo.',
  controles: 'Cómo moverte',
  mouse: 'Mouse o dedo: arrastra para girar el tanque; con la rueda, acercas y alejas.',
  gestos:
    'Gestos con la cámara (opcional): mueve la palma abierta para girar, separa el pulgar y el índice para acercar y júntalos para alejar, y cierra el puño para pausar. Sin cámara, todo se maneja con el mouse.',
  verTanque: 'Ver el tanque',
  verDemo: 'Ver la demo guiada',
}

/** Panel de simulación de nivel y caudales. */
export const TEXTO_SIMULACION = {
  titulo: 'Nivel y caudales',
  dia: 'Día',
  hora: 'Hora simulada',
  reproducir: 'Reproducir',
  pausar: 'Pausar',
  velocidad: 'Velocidad',
  modo: 'Salida',
  modoConstante: 'Constante (promedio del día)',
  modoGravedad: 'Por gravedad',
  caudalSalidaAjuste: 'Caudal de salida (L/s)',
  caudalEntrada: 'Caudal de entrada',
  hidrogramaEscalado: 'Hidrograma escalado',
  hidrogramaEscaladoPor: 'para que el promedio del día sea el caudal de diseño de todo el sistema',
  caudalSalida: 'Caudal de salida',
  nivel: 'Nivel',
  volumen: 'Volumen',
  avisoNivel: 'El nivel supera la altura útil',
  avisoRebose: 'El tanque está rebosando',
  cdEjemplo: 'Coeficiente de descarga Cd: dato de ejemplo',
  leyenda: 'Esquema ilustrativo',
  corte: 'Corte',
  corteActivar: 'Ver corte',
  corteQuitar: 'Quitar corte',
  cortePosicion: 'Posición del corte',
}

export const TEXTO_ACCESORIOS = {
  mostrar: 'Mostrar accesorios',
  ocultar: 'Ocultar accesorios',
}

/** Cotas y etiquetas con flechas (los textos de cada una vienen de datos/homogeneizador.json). */
export const TEXTO_ANOTACIONES = {
  cotas: 'Cotas',
  etiquetas: 'Etiquetas',
  sufijoEjemplo: ' (ej.)',
}

/** Botones para volar a cada unidad. */
export const TEXTO_UNIDADES = {
  titulo: 'Ir a',
  general: 'Vista general',
}

/** Terreno con curvas de nivel y cota bajo el mouse. */
export const TEXTO_TERRENO = {
  curvasMostrar: 'Mostrar curvas de nivel',
  curvasOcultar: 'Ocultar curvas de nivel',
  cota: 'Cota del terreno',
  unidad: 'm s.n.m.',
  muroEjemplo: 'altura del muro',
}
