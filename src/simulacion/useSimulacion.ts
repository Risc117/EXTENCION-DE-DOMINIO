import { useEffect } from 'react'
import { TOPE_CUADRO_SEGUNDOS } from '../nucleo/constantes'
import { useBombeo } from '../estado/bombeo'
import { useSim } from '../estado/simulacion'
import { avanzar } from './avanzar'
import { avanzarCarcamo } from './carcamo'
import { hidrograma } from './hidrogramaCargado'

/** Arranca el reloj de la simulación. Se llama una vez, desde App. */
export function useSimulacion() {
  useEffect(() => {
    useSim.getState().fijarDias(hidrograma.dias)
    // Al elegir un día, se publica su promedio y su caudal de la hora actual.
    const publicarDia = () => {
      const s = useSim.getState()
      const escalaCaudal =
        hidrograma.caudalDiseno === null || hidrograma.motivoEscala === null
          ? null
          : { factor: hidrograma.factorEscala(s.dia), caudalDiseno: hidrograma.caudalDiseno, motivo: hidrograma.motivoEscala }
      s.publicar({ promedioDia: hidrograma.promedio(s.dia), caudalEntrada: hidrograma.caudalEntrada(s.dia, s.hora), escalaCaudal })
    }
    publicarDia()
    let diaAnterior = useSim.getState().dia
    const desuscribir = useSim.subscribe((s) => {
      if (s.dia !== diaAnterior) {
        diaAnterior = s.dia
        publicarDia()
      }
    })

    let cuadro = 0
    let ultimo = performance.now()
    const bucle = (ahora: number) => {
      const dtReal = Math.min((ahora - ultimo) / 1000, TOPE_CUADRO_SEGUNDOS)
      ultimo = ahora
      const s = useSim.getState()
      if (s.corriendo && s.tanque && dtReal > 0) {
        const medidas = avanzar(hidrograma, s.tanque, { dia: s.dia, modo: s.modoSalida, ajuste: s.salidaAjuste }, s, dtReal * s.velocidad)
        s.publicar(medidas)
        const b = useBombeo.getState()
        if (b.parametros) b.publicar(avanzarCarcamo(b, b.parametros, medidas.caudalEntrada, dtReal * s.velocidad))
      }
      cuadro = requestAnimationFrame(bucle)
    }
    cuadro = requestAnimationFrame(bucle)
    return () => {
      cancelAnimationFrame(cuadro)
      desuscribir()
    }
  }, [])
}
