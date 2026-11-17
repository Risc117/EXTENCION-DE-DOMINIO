import { useVida } from '../estado/vida'
import { TEXTO_VIDA as T } from '../nucleo/textos'

/** Botón para ver u ocultar el pasto, los animales y las moscas (T24). */
export function PanelVida() {
  const visible = useVida((s) => s.visible)
  const alternar = useVida((s) => s.alternarVida)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={visible}>
        {visible ? T.ocultar : T.mostrar}
      </button>
    </section>
  )
}
