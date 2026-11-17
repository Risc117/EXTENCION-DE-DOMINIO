import { TEXTO_DATO_EJEMPLO } from '../nucleo/constantes'
import { TEXTO_CALIDAD_AGUA as T } from '../nucleo/textos'
import { useEstado } from '../estado/almacen'
import { PARAMETROS, useCalidadAgua } from '../estado/calidadAgua'
import { useLineaViva } from '../estado/lineaViva'
import { barrasParametro, filasBalance, formatoConcentracion } from './vistaCalidad'

/** Panel de calidad del agua: barras por etapa con el límite de descarga y la tabla de balance de masas por unidad. */
export function PanelCalidadAgua() {
  const etapas = useCalidadAgua((s) => s.etapas)
  const limites = useCalidadAgua((s) => s.limites)
  const metodo = useCalidadAgua((s) => s.metodo)
  const nombres = useEstado((s) => s.unidadesEnfocables)
  const caudales = useLineaViva((s) => s.caudales)
  if (etapas.length === 0 || !limites) return null
  const hayEjemplo = etapas.some((e) => PARAMETROS.some((p) => e.demo[p]))
  return (
    <details className="calidad-agua">
      <summary>{T.titulo}</summary>
      <p className="calidad-agua__nota">
        {T.valoresDiseno}
        {hayEjemplo ? ` ${T.marcaEjemplo} ${TEXTO_DATO_EJEMPLO}.` : ''}
      </p>
      {PARAMETROS.map((p) => (
        <section key={p} className="calidad-agua__parametro">
          <h3>
            {T.parametros[p]} <small>({T.limite}: {formatoConcentracion(limites.descarga[p], p)} {T.unidades[p]})</small>
          </h3>
          {barrasParametro(etapas, p, limites.descarga[p], nombres).map((b) => (
            <div key={b.id} className="calidad-agua__fila" title={`${b.nombre}: ${formatoConcentracion(b.valor, p)} ${T.unidades[p]}`}>
              <span className="calidad-agua__nombre">{b.nombre}</span>
              <span className="calidad-agua__pista" aria-hidden="true">
                <span className="calidad-agua__barra" style={{ width: `${Math.max(b.ancho, 1)}%` }} />
                <span className="calidad-agua__limite" style={{ left: `${b.limiteAncho}%` }} />
              </span>
              <span className="calidad-agua__valor">
                {formatoConcentracion(b.valor, p)}
                {b.remocion !== null && b.remocion > 0 ? ` (−${Math.round(b.remocion * 100)} %${b.ejemplo ? ' †' : ''})` : ''}
              </span>
              <span className={b.cumple ? 'calidad-agua__estado calidad-agua__estado--si' : 'calidad-agua__estado calidad-agua__estado--no'}>
                {b.cumple ? '✓' : '✕'} {b.estado}
              </span>
            </div>
          ))}
        </section>
      ))}
      <details className="calidad-agua__tabla">
        <summary>{T.balance}</summary>
        <div className="calidad-agua__scroll">
          <table>
            <thead>
              <tr>
                <th>{T.unidad}</th>
                <th>{T.caudalEntra}</th>
                <th>{T.caudalSale}</th>
                {PARAMETROS.map((p) => (
                  <th key={p}>{T.parametros[p]} ({T.entraSale})</th>
                ))}
                <th>{T.cargaDbo}</th>
              </tr>
            </thead>
            <tbody>
              {filasBalance(etapas, caudales, nombres).map((f) => (
                <tr key={f.id}>
                  <th scope="row">{f.nombre}</th>
                  <td>{f.caudalEntra}</td>
                  <td>{f.caudalSale}</td>
                  {PARAMETROS.map((p) => (
                    <td key={p}>
                      {f.parametros[p].entra} → {f.parametros[p].sale}
                    </td>
                  ))}
                  <td>{f.cargaDboSale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="calidad-agua__nota">{metodo}</p>
    </details>
  )
}
