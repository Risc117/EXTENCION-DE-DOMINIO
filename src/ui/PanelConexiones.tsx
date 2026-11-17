import { useConexiones } from '../estado/conexiones'
import { TEXTO_CONEXIONES as T } from '../nucleo/textos'

/** Botones para ver u ocultar las tuberías que conectan las estructuras y el flujo que corre por ellas. */
export function PanelConexiones() {
  const visibles = useConexiones((s) => s.visibles)
  const alternar = useConexiones((s) => s.alternarConexiones)
  const flujo = useConexiones((s) => s.flujo)
  const alternarFlujo = useConexiones((s) => s.alternarFlujo)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={visibles}>
        {visibles ? T.ocultar : T.mostrar}
      </button>
      <button type="button" onClick={alternarFlujo} aria-pressed={flujo} disabled={!visibles}>
        {flujo ? T.ocultarFlujo : T.mostrarFlujo}
      </button>
    </section>
  )
}
