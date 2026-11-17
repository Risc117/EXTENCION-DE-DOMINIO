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

/** Tuberías de conexión entre las estructuras. */
export const TEXTO_CONEXIONES = {
  mostrar: 'Mostrar tuberías',
  ocultar: 'Ocultar tuberías',
  mostrarFlujo: 'Mostrar flujo',
  ocultarFlujo: 'Ocultar flujo',
}

/** Entorno de la planta: edificios, vías, cerco y árboles. */
export const TEXTO_ENTORNO = {
  mostrar: 'Mostrar entorno',
  ocultar: 'Ocultar entorno',
}

/** Cajón de herramientas: un solo cajón plegable con las opciones de vista agrupadas. */
export const TEXTO_HERRAMIENTAS = {
  titulo: 'Herramientas',
  grupoUnidades: 'Ir a',
  grupoCorte: 'Corte',
  grupoCapas: 'Capas',
  grupoAnotaciones: 'Cotas y etiquetas',
  grupoCalidad: 'Calidad',
  siempreActivar: 'Mostrar también de lejos',
  siempreQuitar: 'Mostrar solo al acercarse',
}

/** Cotas y etiquetas con flechas (los textos de cada una vienen de datos/homogeneizador.json). */
export const TEXTO_ANOTACIONES = {
  cotas: 'Cotas',
  etiquetas: 'Etiquetas',
  sufijoEjemplo: ' (ej.)',
}

/** Botones para volar a cada unidad. */
export const TEXTO_UNIDADES = {
  general: 'Vista general',
}

/** Terreno con curvas de nivel y cota bajo el mouse. */
export const TEXTO_TERRENO = {
  terrenoMostrar: 'Mostrar terreno',
  terrenoOcultar: 'Ocultar terreno',
  curvasMostrar: 'Mostrar curvas de nivel',
  curvasOcultar: 'Ocultar curvas de nivel',
  cota: 'Cota del terreno',
  unidad: 'm s.n.m.',
  muroEjemplo: 'altura del muro',
}

/** Tarjeta de una estructura y diagrama de bloques de la línea de agua (T18). */
export const TEXTO_TARJETA = {
  entra: 'Caudal que entra',
  sale: 'Caudal que sale',
  retencion: 'Tiempo de retención',
  nivel: 'Nivel de agua',
  nivelNoSimula: 'no se simula',
  sinRetencion: 'no aplica',
  sinDato: '—',
  sinCaudal: 'Sin caudal de agua en la línea: esta estructura no está en el recorrido del agua (los lodos van en otro ticket).',
  cerrar: 'Cerrar tarjeta',
  diagrama: 'Línea de agua (caudales en vivo)',
  salida: 'Salida de agua tratada',
}

/** Panel de calidad del agua (T19). */
export const TEXTO_CALIDAD_AGUA = {
  titulo: 'Calidad del agua por etapa',
  valoresDiseno: 'Valores de diseño de la memoria de cálculo (no de laboratorio). † = porcentaje estimado.',
  marcaEjemplo: 'Lo marcado con † es',
  limite: 'límite de descarga',
  aguaCruda: 'Agua cruda',
  salidaFinal: 'Salida final',
  cumple: 'Cumple',
  noCumple: 'No cumple',
  sinDato: '—',
  balance: 'Balance de masas por unidad (tabla)',
  unidad: 'Unidad',
  caudalEntra: 'Q entra (L/s)',
  caudalSale: 'Q sale (L/s)',
  entraSale: 'entra → sale',
  cargaDbo: 'Carga DBO que sale (kg/d)',
  parametros: { dbo: 'DBO₅ (mg/L)', dqo: 'DQO (mg/L)', sst: 'SST (mg/L)', cf: 'Coliformes (NMP/100 mL)' },
  unidades: { dbo: 'mg/L', dqo: 'mg/L', sst: 'mg/L', cf: 'NMP/100 mL' },
}
