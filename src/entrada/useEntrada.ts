import { useEffect } from 'react'
import { useEstado } from '../estado/almacen'
import { iniciarMano } from './mano'
import { iniciarMouse } from './mouse'

/** Conecta el mouse siempre y la mano solo cuando el usuario la pide. Se usa una vez, en App. */
export function useEntrada() {
  useEffect(() => iniciarMouse(), [])

  const gestosPedidos = useEstado((s) => s.gestosPedidos)
  useEffect(() => {
    if (!gestosPedidos) return
    const { fijarGestos, pedirGestos } = useEstado.getState()
    let cancelado = false
    let apagar: (() => void) | null = null
    fijarGestos('iniciando')
    iniciarMano()
      .then((detener) => {
        if (cancelado) detener()
        else apagar = detener
      })
      .catch((e: unknown) => {
        if (cancelado) return
        fijarGestos(e instanceof DOMException && e.name === 'NotAllowedError' ? 'denegado' : 'error')
        pedirGestos(false)
      })
    return () => {
      cancelado = true
      apagar?.()
      if (!apagar && useEstado.getState().gestos === 'iniciando') fijarGestos('apagado')
    }
  }, [gestosPedidos])
}
