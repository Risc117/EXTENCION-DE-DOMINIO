/** Fases de la AR: buscando una superficie, superficie lista para tocar, o maqueta colocada. */
export type FaseAR = 'buscando' | 'lista' | 'colocada'
export type EventoAR = 'superficie' | 'sinSuperficie' | 'tocar' | 'recolocar'

/** Siguiente fase: solo se coloca con una superficie lista; ya colocada, solo "recolocar" vuelve a buscar. */
export function siguienteFase(fase: FaseAR, evento: EventoAR): FaseAR {
  if (evento === 'recolocar') return 'buscando'
  if (fase === 'buscando' && evento === 'superficie') return 'lista'
  if (fase === 'lista' && evento === 'sinSuperficie') return 'buscando'
  if (fase === 'lista' && evento === 'tocar') return 'colocada'
  return fase
}
