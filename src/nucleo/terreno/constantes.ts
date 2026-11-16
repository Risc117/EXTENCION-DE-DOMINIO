/** Terreno: cada cuántos nodos de la malla se dibuja un vértice según la calidad (1 = todos; 2 = malla más gruesa). */
export const CALIDAD_TERRENO_SALTO = { baja: 2, alta: 1 }
/** Curvas de nivel principales (cada 5 m): se ven siempre. Las "menor" (cada metro) son el detalle. */
export const CURVAS_PRINCIPALES: readonly string[] = ['intermedia', 'mayor']
export const CURVAS_DETALLE: readonly string[] = ['menor']
/** Las curvas de cada metro aparecen cuando la cámara está a esta distancia (m) o menos del punto que mira. */
export const DISTANCIA_CURVAS_DETALLE = 120
/** Las curvas de nivel se dibujan un poco sobre el terreno (m) para que no parpadeen contra la malla. */
export const ELEVACION_CURVAS = 0.15
/** Opacidad (0 a 1) del terreno cuando el corte está activo, para ver lo enterrado. */
export const OPACIDAD_TERRENO_CORTE = 0.3
/** Cada cuántos milisegundos se recalcula la cota bajo el mouse, y hasta dónde (m) llega el rayo. */
export const INTERVALO_COTA_MS = 80
export const ALCANCE_RAYO_TERRENO = 5000
/** Cuánto (m) baja el muro bajo el terreno para que no quede flotando en las pendientes. */
export const ENTERRADO_MURO = 0.5
/** Largo máximo (m) de cada tramo del muro al seguir el terreno. */
export const TRAMO_MURO = 2

/** Cifras decimales de la cota del terreno bajo el mouse (la malla es de 3 m, no da para más). */
export const DECIMALES_COTA_TERRENO = 1
/** Explanadas: largo (m) de la transición suave entre el piso plano de una unidad y el terreno natural. */
export const TRANSICION_EXPLANADA = 8
/** Cuánto (m) debe cambiar el terreno por una explanada para no dibujar ahí las curvas de nivel naturales. */
export const TOLERANCIA_TERRENO_MODIFICADO = 0.3
/** Explanadas encimadas: potencia del peso al promediar sus cotas; más alta = el piso plano de cada unidad casi no se contagia de las vecinas. */
export const DOMINIO_PISO_PLANO = 8
