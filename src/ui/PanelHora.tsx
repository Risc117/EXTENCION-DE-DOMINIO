import { useMemo } from 'react'
import { HORAS_POR_DIA } from '../nucleo/constantes'
import { PASO_HORA_DESLIZADOR } from '../nucleo/constantesAmbiente'
import { posicionSol } from '../nucleo/solar'
import { TEXTO_HORA as T } from '../nucleo/textosAmbiente'
import { horaAmbiente, useAmbiente } from '../estado/ambiente'
import { useSim } from '../estado/simulacion'
import { franjaDelDia, luzPorTramo, vistaHora } from './vistaHora'

/** Hora del día: seguir la simulación o fijar la hora a mano; muestra si es de día o de noche, la altura del sol y las luces. */
export function PanelHora() {
  const sitio = useAmbiente((s) => s.sitio)
  const horaSim = useSim((s) => s.hora)
  const fija = useAmbiente((s) => s.horaFija)
  const fijar = useAmbiente((s) => s.fijarHora)
  const seguir = useAmbiente((s) => s.seguirSimulacion)
  const hora = horaAmbiente(horaSim, fija)
  const v = useMemo(() => (sitio ? vistaHora(hora, posicionSol(sitio.latitud, sitio.mes, sitio.dia, hora).elevacion) : null), [hora, sitio])
  const franja = useMemo(() => (sitio ? franjaDelDia(luzPorTramo(sitio.latitud, sitio.mes, sitio.dia)) : undefined), [sitio])
  if (!v) return null
  return (
    <section className="panel-hora">
      <button type="button" onClick={fija === null ? () => fijar(horaSim) : seguir} aria-pressed={fija !== null}>
        {fija === null ? T.fijar : T.seguir}
      </button>
      <label>
        {T.hora}: {v.hora} · {v.momento}
        <span className="panel-hora__franja" style={{ background: franja }} aria-hidden="true" />
        <input type="range" min={0} max={HORAS_POR_DIA} step={PASO_HORA_DESLIZADOR} value={hora} onChange={(e) => fijar(Number(e.target.value))} />
      </label>
      <p>
        {T.alturaSol}: {v.altura} · {T.luces}: {v.luces}
      </p>
      <p className="panel-hora__nota">{T.nota}</p>
    </section>
  )
}
