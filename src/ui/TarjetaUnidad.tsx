import { TEXTO_TARJETA as T } from '../nucleo/textos'
import { useEstado } from '../estado/almacen'
import { useBombeo } from '../estado/bombeo'
import { useLineaViva } from '../estado/lineaViva'
import { useSeleccion } from '../estado/seleccion'
import { useSim } from '../estado/simulacion'
import { vistaTarjeta } from './vistaTarjeta'

/** Tarjeta de la estructura elegida con un clic: caudal que entra y sale, tiempo de retención y nivel. */
export function TarjetaUnidad() {
  const id = useSeleccion((s) => s.id)
  const seleccionar = useSeleccion((s) => s.seleccionar)
  const nombres = useEstado((s) => s.unidadesEnfocables)
  const nodos = useLineaViva((s) => s.nodos)
  const caudales = useLineaViva((s) => s.caudales)
  const nivelHomogeneizador = useSim((s) => s.nivel)
  const nivelBombeo = useBombeo((s) => s.nivel)
  if (!id) return null
  // Solo el homogeneizador y la estación de bombeo tienen nivel simulado.
  const nivel = id === 'homogeneizador' ? nivelHomogeneizador : id === 'bombeo' ? nivelBombeo : null
  const v = vistaTarjeta({ id, nombres, nodos, caudales, nivel })
  return (
    <aside className="tarjeta-unidad" aria-label={v.nombre}>
      <header>
        <h2>{v.nombre}</h2>
        <button type="button" onClick={() => seleccionar(null)} aria-label={T.cerrar}>
          ✕
        </button>
      </header>
      {v.sinCaudal ? (
        <p>{T.sinCaudal}</p>
      ) : (
        <dl>
          {v.filas.map((f) => (
            <div key={f.etiqueta} style={{ display: 'contents' }}>
              <dt>{f.etiqueta}</dt>
              <dd>{f.valor}</dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  )
}
