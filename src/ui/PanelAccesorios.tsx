import { TEXTO_ACCESORIOS as T } from '../nucleo/textos'
import { useAccesorios } from '../estado/accesorios'

export function PanelAccesorios() {
  const visibles = useAccesorios((s) => s.visibles)
  const alternar = useAccesorios((s) => s.alternarAccesorios)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={visibles}>
        {visibles ? T.ocultar : T.mostrar}
      </button>
    </section>
  )
}
