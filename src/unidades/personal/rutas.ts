import planta from '../../../datos/planta.json'
import { entorno } from '../entorno/datos'
import type { Parada } from './cronograma'
import { centroDeCaja, desplazar, entrePuntos, proyectar, type Punto } from './geometria'
import type { RutaTecnico, RutaVehiculo } from './esquema'

type Tramo = RutaTecnico['tramos'][number]

/** Puntos de un tramo: parte del eje de una vía o el centro (de su caja) de una superficie. */
function puntosDelTramo(t: Tramo): Punto[] {
  if ('via' in t) {
    const via = entorno.vias.find((v) => v.id === t.via)
    if (!via) throw new Error(`No hay una vía "${t.via}" en datos/entorno.json`)
    return via.eje.slice(t.desde ?? 0, (t.hasta ?? via.eje.length - 1) + 1)
  }
  const s = entorno.superficies.find((e) => e.id === t.superficie)
  if (!s) throw new Error(`No hay una superficie "${t.superficie}" en datos/entorno.json`)
  return [centroDeCaja(s.poligono)]
}

const unir = (tramos: Tramo[]): Punto[] => entrePuntos(tramos.map(puntosDelTramo))

/** Ruta de un vehículo: de la entrada al patio por el eje de las vías. */
export const rutaDeVehiculo = (v: RutaVehiculo): Punto[] => unir(v.tramos)

/** Ruta de un técnico: el eje de la vía corrido `lado` veces su desplazamiento (1 = a la izquierda, −1 = a la derecha). */
export const rutaDeTecnico = (t: RutaTecnico, lado: number): Punto[] => desplazar(unir(t.tramos), t.desplazamiento.valor * lado)

/** Centro de una estructura por su id: una unidad de datos/planta.json o un edificio de datos/entorno.json. */
export function centroDeEstructura(id: string): Punto {
  const u = (planta.unidades as { id: string; x: { valor: number }; y: { valor: number } }[]).find((e) => e.id === id)
  if (u) return { x: u.x.valor, y: u.y.valor }
  const e = entorno.edificios.find((b) => b.id === id)
  if (e) return centroDeCaja(e.poligono)
  throw new Error(`No hay una estructura "${id}" en datos/planta.json ni en datos/entorno.json`)
}

export interface ParadaRuta extends Parada {
  /** A qué distancia (m) queda la estructura de la ruta. */
  distanciaALaEstructura: number
}

/** Paradas de un técnico: el punto de su ruta más cercano a cada estructura, con su pausa. */
export function paradasDe(t: RutaTecnico, ruta: Punto[]): ParadaRuta[] {
  return t.paradas.map((p) => {
    const { d, distancia } = proyectar(ruta, centroDeEstructura(p.unidad))
    return { d, pausa: p.pausa.valor, distanciaALaEstructura: distancia }
  })
}
