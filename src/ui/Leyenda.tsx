import { TEXTO_SIMULACION } from '../nucleo/textos'

/** Aviso fijo: lo que se ve es una ilustración, no una simulación de fluidos. */
export function Leyenda() {
  return <div className="leyenda">{TEXTO_SIMULACION.leyenda}</div>
}
