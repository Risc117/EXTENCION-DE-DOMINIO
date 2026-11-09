import { useEstado } from '../estado/almacen'
import type { AjusteGestos } from '../estado/almacen'
import { AJUSTE_GESTOS_RANGO } from '../nucleo/constantes'
import { TEXTO_AJUSTE } from '../nucleo/textos'

const CAMPOS: (keyof AjusteGestos)[] = ['giro', 'zoom', 'suavizado', 'zonaMuerta']
const ID_CONTENIDO = 'contenido-ajuste-gestos'

export function PanelAjusteGestos() {
  const ajuste = useEstado((s) => s.ajusteGestos)
  const cambiar = useEstado((s) => s.cambiarAjusteGestos)
  const restablecer = useEstado((s) => s.restablecerAjusteGestos)
  const abierto = useEstado((s) => s.panelAjusteAbierto)
  const alternar = useEstado((s) => s.alternarPanelAjuste)

  return (
    <section className={abierto ? 'ajuste-gestos' : 'ajuste-gestos ajuste-gestos--plegado'}>
      <button
        type="button"
        className="ajuste-gestos__engranaje"
        aria-label={abierto ? TEXTO_AJUSTE.cerrarPanel : TEXTO_AJUSTE.abrirPanel}
        aria-expanded={abierto}
        aria-controls={ID_CONTENIDO}
        onClick={alternar}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
          <circle cx="12" cy="12" r="6.5" />
        </svg>
      </button>
      {abierto && (
        <div id={ID_CONTENIDO} className="ajuste-gestos__contenido">
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
        </div>
      )}
    </section>
  )
}
