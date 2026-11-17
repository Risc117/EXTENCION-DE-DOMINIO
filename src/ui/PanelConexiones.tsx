import { useConexiones } from '../estado/conexiones'
import { TEXTO_CONEXIONES as T } from '../nucleo/textos'

/** Botón para ver u ocultar las tuberías que conectan las estructuras. */
export function PanelConexiones() {
  const visibles = useConexiones((s) => s.visibles)
  const alternar = useConexiones((s) => s.alternarConexiones)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={visibles}>
        {visibles ? T.ocultar : T.mostrar}
      </button>
    </section>
  )
}
