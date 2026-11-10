import { TEXTO_BIENVENIDA as T } from '../nucleo/textos'
import { useDemo } from '../estado/demo'

/** Pantalla inicial: qué es, cómo moverse (mouse y gestos) y entrada al tanque o a la demo. */
export function Bienvenida() {
  const visible = useDemo((s) => s.bienvenida)
  const cerrar = useDemo((s) => s.cerrarBienvenida)
  const ordenar = useDemo((s) => s.ordenar)
  if (!visible) return null
  return (
    <div className="bienvenida" role="dialog" aria-modal="true" aria-labelledby="titulo-bienvenida">
      <div className="bienvenida__caja">
        <h1 id="titulo-bienvenida">{T.titulo}</h1>
        <p>{T.queEs}</p>
        <h2>{T.controles}</h2>
        <ul>
          <li>{T.mouse}</li>
          <li>{T.gestos}</li>
        </ul>
        <div className="bienvenida__botones">
          <button type="button" onClick={cerrar}>{T.verTanque}</button>
          <button type="button" onClick={() => ordenar('iniciar')}>{T.verDemo}</button>
        </div>
      </div>
    </div>
  )
}
