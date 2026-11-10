import { CORTE_RANGO } from '../nucleo/constantes'
import { TEXTO_SIMULACION as T } from '../nucleo/textos'
import { useCorte } from '../estado/flujo'

export function PanelCorte() {
  const activo = useCorte((s) => s.activo)
  const posicion = useCorte((s) => s.posicion)
  const alternar = useCorte((s) => s.alternarCorte)
  const fijar = useCorte((s) => s.fijarPosicionCorte)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={activo}>
        {activo ? T.corteQuitar : T.corteActivar}
      </button>
      {activo && (
        <label>
          {T.cortePosicion}
          <input
            type="range"
            min={CORTE_RANGO.min}
            max={CORTE_RANGO.max}
            step={CORTE_RANGO.paso}
            value={posicion}
            onChange={(e) => fijar(Number(e.target.value))}
          />
        </label>
      )}
    </section>
  )
}
