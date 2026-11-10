import { useAnotaciones } from '../estado/anotaciones'
import { TEXTO_ANOTACIONES as T } from '../nucleo/textos'

/** Botones para mostrar u ocultar las cotas y las etiquetas. */
export function PanelAnotaciones() {
  const cotas = useAnotaciones((s) => s.cotas)
  const etiquetas = useAnotaciones((s) => s.etiquetas)
  const alternarCotas = useAnotaciones((s) => s.alternarCotas)
  const alternarEtiquetas = useAnotaciones((s) => s.alternarEtiquetas)
  return (
    <section className="panel-corte panel-anotaciones">
      <button type="button" onClick={alternarCotas} aria-pressed={cotas}>
        {T.cotas}
      </button>
      <button type="button" onClick={alternarEtiquetas} aria-pressed={etiquetas}>
        {T.etiquetas}
      </button>
    </section>
  )
}
