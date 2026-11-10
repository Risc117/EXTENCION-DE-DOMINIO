import { z } from 'zod'
import { medida } from './medida'

const posteEntero = medida.refine((m) => Number.isInteger(m.valor) && m.valor >= 4, 'Debe haber al menos 4 postes, en número entero')

export const esquemaAccesorios = z.object({
  baranda: z.object({ altura: medida, diametroTubo: medida, retranqueBorde: medida, numeroPostes: posteEntero }),
  bocaAcceso: z.object({ lado: medida, alturaBrocal: medida, espesorTapa: medida, distanciaAlCentro: medida }),
  portillo: z.object({ ancho: medida, espesor: medida }),
  escalera: z.object({
    ancho: medida,
    separacionPeldanos: medida,
    separacionMuro: medida,
    prolongacionSobreBoca: medida,
    alturaInicioJaula: medida,
    diametroJaula: medida,
    separacionAros: medida,
  }),
  ventilacion: z.object({ diametroTubo: medida, altura: medida, diametroHongo: medida, alturaHongo: medida, distanciaAlCentro: medida }),
  cajaValvula: z.object({ diametroValvula: medida, lado: medida, alto: medida, diametroVarilla: medida, distanciaAlMuro: medida }),
  terreno: z.object({ anchoRelleno: medida, anchoTerreno: medida, profundidadBajoSolado: medida }),
})

export type DatosAccesorios = z.infer<typeof esquemaAccesorios>

interface Base {
  tanque: { diametroInterior: { valor: number }; diametroExterior: { valor: number } }
  accesorios: DatosAccesorios
}

/** Revisa que los accesorios quepan donde el plano los pone. Devuelve el problema, o null si todo cuadra. */
export function revisarAccesorios({ tanque, accesorios: a }: Base): string | null {
  const radioInt = tanque.diametroInterior.valor / 2
  const radioExt = tanque.diametroExterior.valor / 2
  const lado = a.bocaAcceso.lado.valor
  const centroBoca = a.bocaAcceso.distanciaAlCentro.valor
  if (Math.hypot(centroBoca + lado / 2, lado / 2) > radioExt) return 'La boca de acceso se sale de la losa de techo'
  const radioBaranda = radioExt - a.baranda.retranqueBorde.valor
  if (radioBaranda <= a.portillo.ancho.valor / 2) return 'El portillo no cabe en la baranda'
  if (centroBoca + lado / 2 > radioBaranda) return 'La boca de acceso choca con la baranda'
  const xEscalera = radioInt - a.escalera.separacionMuro.valor
  if (Math.abs(xEscalera - centroBoca) > lado / 2) return 'La escalera no queda debajo de la boca de acceso'
  if (a.ventilacion.distanciaAlCentro.valor + a.ventilacion.diametroHongo.valor / 2 > radioExt) return 'El tubo de ventilación se sale de la losa de techo'
  const t = a.terreno
  if (a.cajaValvula.distanciaAlMuro.valor + a.cajaValvula.lado.valor / 2 > t.anchoRelleno.valor + t.anchoTerreno.valor) {
    return 'La caja de válvula queda fuera del terreno'
  }
  return null
}
