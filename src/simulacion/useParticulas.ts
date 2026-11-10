import { useEffect } from 'react'
import { NUMERO_PARTICULAS, SEMILLA_PARTICULAS, TOPE_CUADRO_SEGUNDOS } from '../nucleo/constantes'
import { bufferParticulas, useFlujo } from '../estado/flujo'
import { useSim } from '../estado/simulacion'
import { crearAzar } from './azar'
import { avanzarParticulas, crearParticulas, escribirPosiciones, type Particula } from './particulas'

/** Mueve las partículas del flujo y deja sus posiciones en el buffer del estado. Se llama una vez, desde App. */
export function useParticulas() {
  useEffect(() => {
    const azar = crearAzar(SEMILLA_PARTICULAS)
    let particulas: Particula[] = []
    let ultimo = performance.now()
    let cuadro = 0
    const bucle = (ahora: number) => {
      const dt = Math.min((ahora - ultimo) / 1000, TOPE_CUADRO_SEGUNDOS)
      ultimo = ahora
      const { flujo } = useFlujo.getState()
      if (flujo) {
        if (particulas.length === 0) particulas = crearParticulas(NUMERO_PARTICULAS, flujo, azar)
        const s = useSim.getState()
        if (s.corriendo) avanzarParticulas(particulas, flujo, s.nivel, s.caudalEntrada, s.caudalSalida, dt, azar)
        escribirPosiciones(particulas, s.nivel, bufferParticulas.posiciones)
      }
      cuadro = requestAnimationFrame(bucle)
    }
    cuadro = requestAnimationFrame(bucle)
    return () => cancelAnimationFrame(cuadro)
  }, [])
}
