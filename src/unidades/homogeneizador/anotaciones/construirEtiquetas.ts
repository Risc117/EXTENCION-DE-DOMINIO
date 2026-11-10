import type { DatosHomogeneizador } from '../esquema'
import type { DefEtiqueta } from '../esquemaAnotaciones'
import { medidaPorRuta } from './medidaPorRuta'
import { puntoObjetivo } from './puntos'
import { resolverTexto } from './texto'
import type { EtiquetaCalculada } from './tipos'

/** Una etiqueta con su texto y sus puntos. La de "nivelAgua" usa el nivel actual de la simulación. */
export function calcularEtiqueta(d: DatosHomogeneizador, def: DefEtiqueta, nivel: number): EtiquetaCalculada {
  const { punto, interior } = puntoObjetivo(d, def.objetivo, nivel)
  const m = def.medida ? medidaPorRuta(d, def.medida) : null
  const valor = def.objetivo === 'nivelAgua' ? nivel : (m?.valor ?? null)
  const [dx, dy, dz] = def.desfase
  return {
    id: def.id,
    texto: resolverTexto(def.texto, valor, m?.demo === true),
    origen: [punto[0] + dx, punto[1] + dy, punto[2] + dz],
    punta: punto,
    interior,
    prioridad: def.prioridad === true,
  }
}
