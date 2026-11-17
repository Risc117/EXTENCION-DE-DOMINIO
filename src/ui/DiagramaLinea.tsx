import { TEXTO_TARJETA as T } from '../nucleo/textos'
import { useEstado } from '../estado/almacen'
import { useLineaViva } from '../estado/lineaViva'
import { useSeleccion } from '../estado/seleccion'
import { cajasDiagrama } from './vistaTarjeta'

/** Diagrama de bloques de la línea de agua con el caudal de salida de cada unidad en vivo; un clic en una caja la selecciona y lleva la cámara. */
export function DiagramaLinea() {
  const nodos = useLineaViva((s) => s.nodos)
  const caudales = useLineaViva((s) => s.caudales)
  const nombres = useEstado((s) => s.unidadesEnfocables)
  const irA = useEstado((s) => s.irA)
  const elegida = useSeleccion((s) => s.id)
  const seleccionar = useSeleccion((s) => s.seleccionar)
  if (nodos.length === 0) return null
  return (
    <details className="diagrama-linea" open>
      <summary>{T.diagrama}</summary>
      <div className="diagrama-linea__rejilla">
        {cajasDiagrama(nodos, caudales, nombres, elegida).map((c) => (
          <button
            key={c.id}
            type="button"
            className="diagrama-linea__caja"
            style={{ gridColumn: c.columna + 1, gridRow: c.fila + 1 }}
            aria-pressed={c.elegida}
            onClick={() => {
              seleccionar(c.id)
              if (nombres.some((u) => u.id === c.id)) irA(c.id)
            }}
          >
            <span>{c.nombre}</span>
            <small>{c.caudal}</small>
          </button>
        ))}
      </div>
    </details>
  )
}
