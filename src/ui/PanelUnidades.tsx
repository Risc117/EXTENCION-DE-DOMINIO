import { useEstado } from '../estado/almacen'
import { TEXTO_UNIDADES as T } from '../nucleo/textos'

/** Botones para ver toda la planta o volar a una unidad (van dentro del grupo "Ir a" del cajón de herramientas). */
export function PanelUnidades() {
  const lista = useEstado((s) => s.unidadesEnfocables)
  const foco = useEstado((s) => s.foco)
  const irA = useEstado((s) => s.irA)
  return (
    <div className="panel-unidades">
      <button type="button" onClick={() => irA(null)} aria-pressed={foco === null}>
        {T.general}
      </button>
      {lista.map((u) => (
        <button key={u.id} type="button" onClick={() => irA(u.id)} aria-pressed={foco === u.id}>
          {u.nombre}
        </button>
      ))}
    </div>
  )
}
