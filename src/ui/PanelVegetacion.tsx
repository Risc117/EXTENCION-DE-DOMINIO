import { useVegetacion } from '../estado/vegetacion'
import { TEXTO_VEGETACION as T } from '../nucleo/textosVida'

/** Botón para ver u ocultar la vegetación de los alrededores (árboles, arbustos y pasto fuera del cerco). */
export function PanelVegetacion() {
  const visible = useVegetacion((s) => s.visible)
  const alternar = useVegetacion((s) => s.alternarVegetacion)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={visible}>
        {visible ? T.ocultar : T.mostrar}
      </button>
    </section>
  )
}
