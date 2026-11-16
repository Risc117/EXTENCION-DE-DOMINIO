import { ANGULO_ANCLA_VISIBLE, ANGULO_REBOSE, ESPESOR_ZONA_MEZCLA, PROLONGACION_TUBO } from '../../../nucleo/constantes'
import { cotaTecho } from '../accesorios/cotas'
import type { DatosHomogeneizador } from '../esquema'
import type { DefEtiqueta } from '../esquemaAnotaciones'
import type { Vec3 } from '../../comun/tiposAnotaciones'

type Objetivo = DefEtiqueta['objetivo']

/**
 * Punto de cada pieza al que apunta la flecha (metros, mismos ejes que geometria.ts: ingreso al oeste, salida al este).
 * `interior` = la pieza está dentro del tanque. `nivel` es el nivel de agua actual.
 */
export function puntoObjetivo(d: DatosHomogeneizador, objetivo: Objetivo, nivel: number): { punto: Vec3; interior: boolean } {
  const t = d.tanque
  const radioInt = t.diametroInterior.valor / 2
  const radioExt = t.diametroExterior.valor / 2
  const afuera = radioExt + PROLONGACION_TUBO / 2
  const alrededor = (radio: number, y: number, fi = ANGULO_ANCLA_VISIBLE): Vec3 => [radio * Math.cos(fi), y, radio * Math.sin(fi)]
  const a = d.accesorios

  switch (objetivo) {
    case 'ingreso':
      return { punto: [-afuera, d.ingreso.altura.valor, 0], interior: false }
    case 'salida':
      return { punto: [afuera, d.salida.altura.valor, 0], interior: false }
    case 'rebose':
      return { punto: alrededor(afuera, d.rebose.altura.valor, Math.PI - ANGULO_REBOSE), interior: false }
    case 'agitador':
      return { punto: [0, d.agitador.alturaImpulsor.valor + d.agitador.altoCuerpo.valor / 2, 0], interior: true }
    case 'zonaMezcla':
      return { punto: alrededor(d.agitador.diametroZonaMezcla.valor / 2, ESPESOR_ZONA_MEZCLA), interior: true }
    case 'bocaAcceso':
      return { punto: [a.bocaAcceso.distanciaAlCentro.valor, cotaTecho(d) + a.bocaAcceso.alturaBrocal.valor + a.bocaAcceso.espesorTapa.valor, 0], interior: false }
    case 'baranda':
      return { punto: alrededor(radioExt - a.baranda.retranqueBorde.valor, cotaTecho(d) + a.baranda.altura.valor), interior: false }
    case 'nivelAgua':
      return { punto: alrededor(radioInt, nivel), interior: true }
  }
}
