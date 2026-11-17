import { TEXTO_TERRENO as T } from '../nucleo/textos'
import { avisoDemoTerreno, terreno, textoCotaTerreno } from '../nucleo/terreno'
import { useTerreno } from '../estado/terreno'

const aviso = avisoDemoTerreno(terreno)

export function PanelTerreno() {
  const terrenoVisible = useTerreno((s) => s.terrenoVisible)
  const alternarTerreno = useTerreno((s) => s.alternarTerreno)
  const visibles = useTerreno((s) => s.curvasVisibles)
  const alternar = useTerreno((s) => s.alternarCurvas)
  const puntero = useTerreno((s) => s.puntero)
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternarTerreno} aria-pressed={terrenoVisible}>
        {terrenoVisible ? T.terrenoOcultar : T.terrenoMostrar}
      </button>
      <button type="button" onClick={alternar} aria-pressed={visibles}>
        {visibles ? T.curvasOcultar : T.curvasMostrar}
      </button>
      {puntero && (
        <p className="cota-terreno">
          {T.cota}: <strong>{textoCotaTerreno(puntero.cota)}</strong>
        </p>
      )}
      {aviso && <p className="cota-terreno">{aviso}</p>}
    </section>
  )
}
