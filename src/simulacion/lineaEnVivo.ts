import lineaCruda from '../../datos/linea.json'
import { INTERVALO_PUBLICACION_LINEA_MS } from '../nucleo/constantesVista'
import { useLineaViva, type NodoLineaViva } from '../estado/lineaViva'
import { useSim } from '../estado/simulacion'
import { avanzarLinea } from './avanzarLinea'
import { publicarCalidad } from './calidadEnVivo'
import { disponerLinea } from './disposicion'
import { hidrograma } from './hidrogramaCargado'
import { crearLinea, type Linea } from './linea'
import { esquemaLinea } from './lineaEsquema'

/** La estructura de la línea (datos/linea.json) con el lugar de cada unidad en el diagrama. */
export function estructuraLinea(): NodoLineaViva[] {
  const nodos = esquemaLinea.parse(lineaCruda).nodos
  const lugar = new Map(disponerLinea(nodos).map((l) => [l.id, l]))
  return nodos.map((n) => ({
    id: n.id,
    retencion: n.retencion ? { valor: n.retencion.valor, unidad: n.retencion.unidad, demo: n.retencion.demo } : null,
    destinos: n.destinos.map((d) => ({ id: d.id, fraccion: d.fraccion })),
    columna: lugar.get(n.id)?.columna ?? 0,
    fila: lugar.get(n.id)?.fila ?? 0,
  }))
}

/**
 * Corre la línea de agua completa junto con el reloj principal y publica los caudales de cada unidad en useLineaViva
 * (cada INTERVALO_PUBLICACION_LINEA_MS, para no redibujar la interfaz en cada cuadro). Devuelve la función que se llama en cada cuadro.
 */
export function crearLineaEnVivo(): (ahoraMs: number, estado: ReturnType<typeof useSim.getState>, segundosSimulados: number) => void {
  let linea: Linea | null = null
  let reinicios = 0
  let ultimaPublicacion = Number.NEGATIVE_INFINITY
  return (ahoraMs, s, segundosSimulados) => {
    if (!s.tanque) return
    if (!linea) {
      linea = crearLinea(lineaCruda, { tanque: s.tanque, modo: () => useSim.getState().modoSalida, ajuste: () => useSim.getState().salidaAjuste })
      reinicios = s.reinicios
      useLineaViva.getState().publicarEstructura(estructuraLinea())
      publicarCalidad()
    }
    if (s.reinicios !== reinicios) {
      linea.reiniciar()
      reinicios = s.reinicios
    }
    const r = avanzarLinea(linea, hidrograma, s.dia, s.hora, segundosSimulados)
    if (ahoraMs - ultimaPublicacion >= INTERVALO_PUBLICACION_LINEA_MS) {
      ultimaPublicacion = ahoraMs
      useLineaViva.getState().publicarCaudales(r.nodos)
    }
  }
}
