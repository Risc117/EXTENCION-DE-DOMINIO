import { TEXTO_LODOS_BIOGAS as T } from '../nucleo/textos'
import { useLodosBiogas } from '../estado/lodosBiogas'
import { filasLodosBiogas } from './vistaLodosBiogas'

/** Panel de lodos y biogás: cantidades por día del RAFA con el caudal en vivo. */
export function PanelLodosBiogas() {
  const produccion = useLodosBiogas((s) => s.produccion)
  const datos = useLodosBiogas((s) => s.datos)
  const filas = filasLodosBiogas(produccion, datos)
  if (filas.length === 0) return null
  return (
    <details className="lodos-biogas">
      <summary>{T.titulo}</summary>
      <dl>
        {filas.map((f) => (
          <div key={f.etiqueta} className="lodos-biogas__fila">
            <dt>{f.etiqueta}</dt>
            <dd>{f.valor}</dd>
          </div>
        ))}
      </dl>
      <p className="lodos-biogas__nota">{T.nota}</p>
    </details>
  )
}
