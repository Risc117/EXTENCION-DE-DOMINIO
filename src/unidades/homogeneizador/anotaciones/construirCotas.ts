import {
  DESFASE_COTA_ESPESOR,
  DESFASE_COTA_LATERAL,
  DESFASE_COTA_PLANTA,
  SEPARACION_COLUMNA_COTA,
  SUBIDA_TEXTO_COTA,
} from '../../../nucleo/constantes'
import type { DatosHomogeneizador } from '../esquema'
import type { DefCota } from '../esquemaAnotaciones'
import { cotaTecho } from '../accesorios/cotas'
import { leerMedida } from './medidaPorRuta'
import { resolverTexto } from '../../comun/texto'
import type { CotaCalculada, Vec3 } from '../../comun/tiposAnotaciones'

const aRadianes = (grados: number) => (grados * Math.PI) / 180
const medio = (a: Vec3, b: Vec3, subida = 0): Vec3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + subida, (a[2] + b[2]) / 2]

function calcular(d: DatosHomogeneizador, def: DefCota): CotaCalculada {
  const t = d.tanque
  const m = leerMedida(d, def.medida)
  const texto = resolverTexto(def.texto, m.valor, m.demo)
  const radioInt = t.diametroInterior.valor / 2
  const radioExt = t.diametroExterior.valor / 2
  const alturaTecho = cotaTecho(d)

  if (def.tipo === 'diametro') {
    const y = alturaTecho + DESFASE_COTA_PLANTA
    const r = m.valor / 2
    const a: Vec3 = [0, y, -r]
    const b: Vec3 = [0, y, r]
    const extensiones: [Vec3, Vec3][] = [
      [[0, t.alturaTotal.valor, -radioInt], a],
      [[0, t.alturaTotal.valor, radioInt], b],
    ]
    return { id: def.id, texto, a, b, extensiones, centro: medio(a, b, SUBIDA_TEXTO_COTA) }
  }

  const direccion = aRadianes(def.angulo)
  const en = (radio: number, y: number): Vec3 => [radio * Math.cos(direccion), y, radio * Math.sin(direccion)]

  if (def.tipo === 'altura') {
    const radio = radioExt + DESFASE_COTA_LATERAL + def.columna * SEPARACION_COLUMNA_COTA
    const desde = def.base ? leerMedida(d, def.base).valor : 0
    const a = en(radio, desde)
    const b = en(radio, desde + m.valor)
    const extensiones: [Vec3, Vec3][] = [
      [en(radioExt, a[1]), a],
      [en(radioExt, b[1]), b],
    ]
    return { id: def.id, texto, a, b, extensiones, centro: medio(a, b) }
  }

  const y = alturaTecho + DESFASE_COTA_ESPESOR
  const a = en(radioInt, y)
  const b = en(radioInt + m.valor, y)
  const extensiones: [Vec3, Vec3][] = [
    [en(radioInt, alturaTecho), a],
    [en(radioInt + m.valor, alturaTecho), b],
  ]
  return { id: def.id, texto, a, b, extensiones, centro: medio(a, b, SUBIDA_TEXTO_COTA) }
}

/** Todas las cotas del JSON, con sus puntos y su texto. Cambiar una medida o quitar una entrada cambia lo que se ve. */
export function construirCotas(d: DatosHomogeneizador): CotaCalculada[] {
  return d.anotaciones.cotas.map((def) => calcular(d, def))
}
