import { useAnotaciones } from '../estado/anotaciones'
import { TEXTO_ANOTACIONES as T, TEXTO_HERRAMIENTAS as H } from '../nucleo/textos'

/** Botones para mostrar u ocultar las cotas y las etiquetas, y para verlas también de lejos (por defecto solo salen al acercarse a una estructura). */
export function PanelAnotaciones() {
  const cotas = useAnotaciones((s) => s.cotas)
  const etiquetas = useAnotaciones((s) => s.etiquetas)
  const siempre = useAnotaciones((s) => s.siempre)
  const alternarCotas = useAnotaciones((s) => s.alternarCotas)
  const alternarEtiquetas = useAnotaciones((s) => s.alternarEtiquetas)
  const alternarSiempre = useAnotaciones((s) => s.alternarSiempre)
  return (
    <section className="panel-corte panel-anotaciones">
      <div className="panel-anotaciones__fila">
        <button type="button" onClick={alternarCotas} aria-pressed={cotas}>
          {T.cotas}
        </button>
        <button type="button" onClick={alternarEtiquetas} aria-pressed={etiquetas}>
          {T.etiquetas}
        </button>
      </div>
      <button type="button" onClick={alternarSiempre} aria-pressed={siempre}>
        {siempre ? H.siempreQuitar : H.siempreActivar}
      </button>
    </section>
  )
}
