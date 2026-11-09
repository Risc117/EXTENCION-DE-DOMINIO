import { useEstado } from '../estado/almacen'
import type { AjusteGestos } from '../estado/almacen'
import { AJUSTE_GESTOS_RANGO } from '../nucleo/constantes'
import { TEXTO_AJUSTE } from '../nucleo/textos'

const CAMPOS: (keyof AjusteGestos)[] = ['giro', 'zoom', 'suavizado', 'zonaMuerta']

export function PanelAjusteGestos() {
  const ajuste = useEstado((s) => s.ajusteGestos)
  const cambiar = useEstado((s) => s.cambiarAjusteGestos)
  const restablecer = useEstado((s) => s.restablecerAjusteGestos)

  return (
    <section className="ajuste-gestos">
      <h2>{TEXTO_AJUSTE.titulo}</h2>
      {CAMPOS.map((campo) => (
        <label key={campo}>
          {TEXTO_AJUSTE[campo]}
          <input
            type="range"
            min={AJUSTE_GESTOS_RANGO[campo].min}
            max={AJUSTE_GESTOS_RANGO[campo].max}
            step={AJUSTE_GESTOS_RANGO[campo].paso}
            value={ajuste[campo]}
            onChange={(e) => cambiar({ [campo]: Number(e.target.value) })}
          />
        </label>
      ))}
      <button type="button" onClick={restablecer}>
        {TEXTO_AJUSTE.restablecer}
      </button>
    </section>
  )
}
