import { TEXTO_MEZCLA as T } from '../nucleo/textosMezcla'
import { useMezclaRio } from '../estado/mezclaRio'
import { vistaDiferencias, vistaEscenarios, type CeldaLimite } from './vistaMezcla'

const Limite = ({ c }: { c: CeldaLimite | null }) =>
  c ? (
    <td className={c.cumple ? 'mezcla-rio__si' : 'mezcla-rio__no'}>
      {c.limite} · {c.estado}
    </td>
  ) : (
    <td>{T.sinLimite}</td>
  )

/** Mezcla de la descarga con el río (estiaje y lluvia) contra el ECA y el LMP, y la diferencia entre la descarga de la memoria y la de la cadena del visor. */
export function PanelMezclaRio() {
  const { rio, fuente, escenarios, diferencias } = useMezclaRio()
  if (escenarios.length === 0) return null
  return (
    <details className="mezcla-rio">
      <summary>{T.titulo(rio)}</summary>
      <p className="calidad-agua__nota">{T.fuente}</p>
      {vistaEscenarios(escenarios).map((e) => (
        <section key={e.id}>
          <h3>{e.titulo}</h3>
          <div className="calidad-agua__scroll">
            <table>
              <thead>
                <tr>
                  <th>{T.parametro}</th>
                  <th>{T.descarga}</th>
                  <th>{T.mezcla}</th>
                  <th>{T.eca}</th>
                  <th>{T.lmp}</th>
                </tr>
              </thead>
              <tbody>
                {e.filas.map((f) => (
                  <tr key={f.parametro}>
                    <th scope="row">{f.parametro}</th>
                    <td>{f.descarga}</td>
                    <td>{f.mezcla}</td>
                    <Limite c={f.eca} />
                    <Limite c={f.lmp} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={e.cumpleTodo ? 'mezcla-rio__si' : 'mezcla-rio__no'}>{e.cumpleTodo ? '✓ ' : '✕ '}{e.resumen}</p>
        </section>
      ))}
      <section className="mezcla-rio__diferencia">
        <h3>{T.tituloDiferencia}</h3>
        <p className="calidad-agua__nota">{T.explicacionDiferencia}</p>
        <div className="calidad-agua__scroll">
          <table>
            <thead>
              <tr>
                <th>{T.parametro}</th>
                <th>{T.fuenteMemoria}</th>
                <th>{T.fuenteVisor}</th>
                <th>{T.diferencia}</th>
              </tr>
            </thead>
            <tbody>
              {vistaDiferencias(diferencias).map((d) => (
                <tr key={d.parametro}>
                  <th scope="row">{d.parametro}</th>
                  <td>{d.memoria}</td>
                  <td>{d.visor}</td>
                  <td className={d.coincide ? undefined : 'mezcla-rio__no'}>
                    {d.diferencia}
                    {d.veces ? ` (${d.veces})` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="calidad-agua__nota">{fuente}</p>
    </details>
  )
}
