import { useEstado } from '../estado/almacen'
import { TEXTO_UNIDADES as T } from '../nucleo/textos'

/** Botones para ver toda la planta o volar a una unidad. */
export function PanelUnidades() {
  const lista = useEstado((s) => s.unidadesEnfocables)
  const foco = useEstado((s) => s.foco)
  const irA = useEstado((s) => s.irA)
  return (
    <details className="panel-unidades" open>
      <summary>{T.titulo}</summary>
      <button type="button" onClick={() => irA(null)} aria-pressed={foco === null}>
        {T.general}
      </button>
      {lista.map((u) => (
        <button key={u.id} type="button" onClick={() => irA(u.id)} aria-pressed={foco === u.id}>
          {u.nombre}
        </button>
      ))}
    </details>
  )
}
