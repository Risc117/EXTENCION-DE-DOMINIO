import { SALIDA_AJUSTE_RANGO, TEXTO_DATO_EJEMPLO, VELOCIDADES_SIMULACION, CD_SALIDA, CD_SALIDA_ES_EJEMPLO } from '../nucleo/constantes'
import { TEXTO_SIMULACION as T } from '../nucleo/textos'
import { useSim, type ModoSalida } from '../estado/simulacion'

const dosDecimales = (n: number) => n.toFixed(2)

function formatoHora(hora: number): string {
  const h = Math.floor(hora)
  const m = Math.floor((hora - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function PanelSimulacion() {
  const s = useSim()
  const sobreAlturaUtil = s.tanque !== null && s.nivel > s.tanque.alturaUtil
  const salidaFija = s.salidaAjuste ?? s.promedioDia

  return (
    <section className="panel-simulacion">
      <h2>{T.titulo}</h2>
      <label>
        {T.dia}
        <select value={s.dia} onChange={(e) => s.elegirDia(Number(e.target.value))}>
          {s.diasDisponibles.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>
      <div className="panel-simulacion__fila">
        <button type="button" onClick={s.alternarCorriendo}>{s.corriendo ? T.pausar : T.reproducir}</button>
        <label>
          {T.velocidad}
          <select value={s.velocidad} onChange={(e) => s.fijarVelocidad(Number(e.target.value))}>
            {VELOCIDADES_SIMULACION.map((v) => (
              <option key={v} value={v}>×{v}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {T.modo}
        <select value={s.modoSalida} onChange={(e) => s.fijarModoSalida(e.target.value as ModoSalida)}>
          <option value="constante">{T.modoConstante}</option>
          <option value="gravedad">{T.modoGravedad}</option>
        </select>
      </label>
      {s.modoSalida === 'constante' ? (
        <label>
          {T.caudalSalidaAjuste}: {dosDecimales(salidaFija)}
          <input
            type="range"
            min={SALIDA_AJUSTE_RANGO.min}
            max={SALIDA_AJUSTE_RANGO.max}
            step={SALIDA_AJUSTE_RANGO.paso}
            value={salidaFija}
            onChange={(e) => s.fijarSalidaAjuste(Number(e.target.value))}
          />
        </label>
      ) : (
        CD_SALIDA_ES_EJEMPLO && <p className="panel-simulacion__nota">{T.cdEjemplo} ({CD_SALIDA}) · {TEXTO_DATO_EJEMPLO}</p>
      )}
      <dl>
        <dt>{T.hora}</dt><dd>{formatoHora(s.hora)}</dd>
        <dt>{T.caudalEntrada}</dt><dd>{dosDecimales(s.caudalEntrada)} L/s</dd>
        <dt>{T.caudalSalida}</dt><dd>{dosDecimales(s.caudalSalida)} L/s</dd>
        <dt>{T.nivel}</dt><dd>{dosDecimales(s.nivel)} m</dd>
        <dt>{T.volumen}</dt><dd>{dosDecimales(s.volumen)} m³</dd>
      </dl>
      {sobreAlturaUtil && <p className="panel-simulacion__aviso">{s.caudalRebose > 0 ? T.avisoRebose : T.avisoNivel}</p>}
    </section>
  )
}
