import { TEXTO_DATO_EJEMPLO } from '../nucleo/constantes'
import { RADIO_ROSA, VISTA_ROSA } from '../nucleo/constantesViento'
import { TEXTO_VIENTO as T } from '../nucleo/textosAmbiente'
import { useViento } from '../estado/viento'
import { vistaViento } from './vistaViento'

/** Indicador de viento: una rosa con una flecha que apunta hacia donde sopla, la velocidad (con ráfaga) y de dónde viene. */
export function IndicadorViento() {
  const velocidad = useViento((s) => s.velocidad)
  const desde = useViento((s) => s.desde)
  const v = vistaViento(velocidad, desde)
  return (
    <aside className="indicador-viento" aria-label={T.titulo} title={T.nota}>
      <svg viewBox={`${-VISTA_ROSA} ${-VISTA_ROSA} ${2 * VISTA_ROSA} ${2 * VISTA_ROSA}`} width="56" height="56" aria-hidden="true">
        <circle r={RADIO_ROSA} className="indicador-viento__rosa" />
        <text y={-RADIO_ROSA - 2} textAnchor="middle" className="indicador-viento__norte">
          {T.norte}
        </text>
        <g transform={`rotate(${v.giro})`}>
          <line y1={RADIO_ROSA * 0.7} y2={-RADIO_ROSA * 0.7} className="indicador-viento__flecha" />
          <path d={`M0 ${-RADIO_ROSA * 0.8} L${RADIO_ROSA * 0.25} ${-RADIO_ROSA * 0.4} L${-RADIO_ROSA * 0.25} ${-RADIO_ROSA * 0.4} Z`} className="indicador-viento__punta" />
        </g>
      </svg>
      <div>
        <strong>
          {v.velocidad} {T.unidad}
        </strong>
        <div>
          {T.del} {v.desde} ({v.grados})
        </div>
        <small>{TEXTO_DATO_EJEMPLO}</small>
      </div>
    </aside>
  )
}
