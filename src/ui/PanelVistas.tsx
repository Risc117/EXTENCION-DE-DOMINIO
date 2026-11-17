import { camaraDePlanta, esVistaPlanta } from '../nucleo/vistaPlanta'
import { TEXTO_VISTAS as T } from '../nucleo/textosVistas'
import { useEstado } from '../estado/almacen'

/** Vista de planta (desde arriba, como el plano) y regreso a la perspectiva. */
export function PanelVistas() {
  const camara = useEstado((s) => s.camara)
  const fijarCamara = useEstado((s) => s.fijarCamara)
  const irA = useEstado((s) => s.irA)
  const reiniciar = useEstado((s) => s.reiniciarCamara)
  const enPlanta = esVistaPlanta(camara)
  const alternar = () => {
    if (enPlanta) {
      reiniciar()
      return
    }
    irA(null)
    fijarCamara(camaraDePlanta())
  }
  return (
    <section className="panel-corte">
      <button type="button" onClick={alternar} aria-pressed={enPlanta}>
        {enPlanta ? T.perspectiva : T.planta}
      </button>
      <small>{T.notaPlanta}</small>
    </section>
  )
}
