import { TEXTO_CALIDAD as T } from '../nucleo/textos'
import { useCalidad } from '../estado/calidad'
import type { Calidad } from '../estado/preferenciaCalidad'

export function PanelCalidad() {
  const calidad = useCalidad((s) => s.calidad)
  const fijar = useCalidad((s) => s.fijarCalidad)
  return (
    <section className="panel-calidad">
      <label>
        {T.etiqueta}
        <select value={calidad} onChange={(e) => fijar(e.target.value as Calidad)}>
          <option value="baja">{T.baja}</option>
          <option value="alta">{T.alta}</option>
        </select>
      </label>
    </section>
  )
}
