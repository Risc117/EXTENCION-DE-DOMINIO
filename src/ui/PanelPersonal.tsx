import { usePersonal } from '../estado/personal'
import { TEXTO_PERSONAL as T } from '../nucleo/textosVida'

/** Botón para ver u ocultar los técnicos, los vehículos y el vigilante (T24.1). */
export function PanelPersonal() {
  const visible = usePersonal((s) => s.visible)
  const alternar = usePersonal((s) => s.alternarPersonal)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={visible}>
        {visible ? T.ocultar : T.mostrar}
      </button>
    </section>
  )
}
