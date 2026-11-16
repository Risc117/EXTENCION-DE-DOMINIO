import { LITROS_POR_M3 } from '../nucleo/constantes'
import { PASO_MAXIMO_CARCAMO } from '../nucleo/constantesCanales'
import type { MedidasBombeo, ParametrosBombeo } from '../estado/bombeo'

/** Un paso corto del cárcamo: entra `entrada` (L/s); si hay una bomba andando, sale su caudal (sin vaciar más de lo que hay). */
function paso(m: MedidasBombeo, p: ParametrosBombeo, entrada: number, dt: number): MedidasBombeo {
  let { bombaActiva, proxima, arranques } = m
  if (bombaActiva === null && m.nivel >= p.nivelArranque) {
    bombaActiva = proxima
    proxima = (proxima + 1) % p.cantidad
    arranques += 1
  } else if (bombaActiva !== null && m.nivel <= p.nivelParada) {
    bombaActiva = null
  }
  const disponible = (m.nivel * p.area * LITROS_POR_M3) / dt + entrada
  const salida = bombaActiva === null ? 0 : Math.min(p.caudalBomba, disponible)
  const nivel = Math.max(0, m.nivel + ((entrada - salida) * dt) / (p.area * LITROS_POR_M3))
  return { nivel, bombaActiva, proxima, caudalImpulsado: salida, arranques }
}

/**
 * Avanza el cárcamo `dtSeg` segundos con el caudal que llega (L/s).
 * Histéresis: la bomba arranca al llegar al nivel de arranque y para al bajar al de parada.
 * Las bombas se turnan: cada arranque usa la siguiente.
 */
export function avanzarCarcamo(inicio: MedidasBombeo, p: ParametrosBombeo, entrada: number, dtSeg: number): MedidasBombeo {
  let m = inicio
  let restante = dtSeg
  while (restante > 0) {
    const dt = Math.min(restante, PASO_MAXIMO_CARCAMO)
    m = paso(m, p, entrada, dt)
    restante -= dt
  }
  return m
}
