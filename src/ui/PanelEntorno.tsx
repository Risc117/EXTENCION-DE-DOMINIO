import { useEntorno } from '../estado/entorno'
import { TEXTO_ENTORNO as T } from '../nucleo/textos'

/** Botón para ver u ocultar el entorno de la planta: edificios, vías, camino, río, cerco y árboles. */
export function PanelEntorno() {
  const visible = useEntorno((s) => s.visible)
  const alternar = useEntorno((s) => s.alternarEntorno)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={visible}>
        {visible ? T.ocultar : T.mostrar}
      </button>
    </section>
  )
}
