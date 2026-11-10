import { useEffect } from 'react'
import crudo from '../../datos/demo.json'
import { TOPE_CUADRO_SEGUNDOS } from '../nucleo/constantes'
import { crearControlDemo } from './demo'
import { crearGuion } from './guion'
import { hidrograma } from './hidrogramaCargado'

const control = crearControlDemo(crearGuion(crudo), hidrograma)

/** Reloj de la demo guiada: atiende las órdenes de la interfaz y avanza los pasos. Se llama una vez, desde App. */
export function useGuion() {
  useEffect(() => {
    let ultimo = performance.now()
    let cuadro = 0
    const bucle = (ahora: number) => {
      const dt = Math.min((ahora - ultimo) / 1000, TOPE_CUADRO_SEGUNDOS)
      ultimo = ahora
      control.atender()
      control.avanzar(dt)
      cuadro = requestAnimationFrame(bucle)
    }
    cuadro = requestAnimationFrame(bucle)
    return () => cancelAnimationFrame(cuadro)
  }, [])
}
