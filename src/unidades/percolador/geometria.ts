import { OPACIDAD_CANAL } from '../../nucleo/constantesCanales'
import { MARGEN_BRAZO_PERCOLADOR } from '../../nucleo/constantesPercolador'
import type { Agua, Pieza, PiezaCilindro } from '../comun/tipos'
import { disponer } from './disposicion'
import type { DatosPercolador } from './esquema'
import { laminaLecho, nivelSalida } from './hidraulica'
import { construirInterior } from './interior'
import { construirSalida } from './salida'

/** Filtro completo armado desde datos/percolador.json. `corte` = true vuelve translúcido el muro para ver adentro. Los brazos van aparte (giran). */
export function construirPiezas(d: DatosPercolador, corte = false): Pieza[] {
  const s = disponer(d)
  return [
    { id: 'losa', forma: 'cilindro', color: '--color-piso', pos: [0, s.yLosa / 2, 0], radio: s.radioExterior, alto: s.yLosa },
    { id: 'muro', forma: 'anillo', color: '--color-muro', pos: [0, s.yLosa, 0], radioInterior: s.radio, radioExterior: s.radioExterior, alto: s.yLecho - s.yLosa, ...(corte ? { opacidad: OPACIDAD_CANAL } : {}) },
    ...construirInterior(d),
    ...construirSalida(d),
  ]
}

/** Los brazos rociadores en reposo (a lo largo de x, repartidos en círculo); el componente los hace girar. */
export function construirBrazos(d: DatosPercolador): PiezaCilindro[] {
  const s = disponer(d)
  const n = d.distribuidor.cantidadBrazos.valor
  const largo = s.radio - s.radioColumna - MARGEN_BRAZO_PERCOLADOR
  const r = s.radioColumna + largo / 2
  return Array.from({ length: n }, (_, k) => {
    const a = (2 * Math.PI * k) / n
    return { id: `brazo-${k + 1}`, forma: 'cilindro', color: '--color-impulsion', pos: [r * Math.cos(a), s.yBrazo, r * Math.sin(a)], radio: d.distribuidor.diametroBrazo.valor / 2, alto: largo, eje: 'x', giroY: -a }
  })
}

/** Agua: lámina fina sobre el lecho y el nivel de la cámara de salida, ambos según el caudal. */
export function construirAguas(d: DatosPercolador, caudalLs: number, caudalMaximoLs: number): Agua[] {
  const s = disponer(d)
  const aguas: Agua[] = [
    { forma: 'caja', id: 'agua-salida', centro: [s.xSalida + d.salida.ancho.valor / 2, 0], largo: d.salida.ancho.valor, ancho: d.salida.ancho.valor, y0: 0, nivel: nivelSalida(d, caudalLs, caudalMaximoLs) },
  ]
  const lamina = laminaLecho(d, caudalLs, caudalMaximoLs)
  if (lamina > 0) aguas.push({ forma: 'cilindro', id: 'agua-lecho', centro: [0, 0], radio: s.radio, y0: s.yLecho, nivel: lamina })
  return aguas
}

/** Puntos (x, z) de donde caen gotas: `porBrazo` repartidos a lo largo de cada brazo, entre la columna y el muro, en las mismas posiciones angulares que los brazos en reposo. */
export function puntosGotasBrazos(d: DatosPercolador, porBrazo: number): { x: number; z: number }[] {
  const s = disponer(d)
  const n = d.distribuidor.cantidadBrazos.valor
  const largo = s.radio - s.radioColumna - MARGEN_BRAZO_PERCOLADOR
  return Array.from({ length: n * porBrazo }, (_, i) => {
    const [brazo, k] = [Math.floor(i / porBrazo), i % porBrazo]
    const [a, r] = [(2 * Math.PI * brazo) / n, s.radioColumna + ((k + 0.5) * largo) / porBrazo]
    return { x: r * Math.cos(a), z: r * Math.sin(a) }
  })
}
