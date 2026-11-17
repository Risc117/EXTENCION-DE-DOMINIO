import { TEXTO_INICIO as T } from '../nucleo/textosInicio'
import { useDemo } from '../estado/demo'
import { inicio } from './datosInicio'
import { vistaInicio } from './vistaInicio'

const v = vistaInicio(inicio)

/** Pantalla inicial: presenta la PTAR de Picoy (de datos/inicio.json), cómo moverse (mouse y gestos) y la entrada a la planta o a la demo. */
export function Bienvenida() {
  const visible = useDemo((s) => s.bienvenida)
  const cerrar = useDemo((s) => s.cerrarBienvenida)
  const ordenar = useDemo((s) => s.ordenar)
  if (!visible) return null
  return (
    <div className="bienvenida" role="dialog" aria-modal="true" aria-labelledby="titulo-bienvenida">
      <div className="bienvenida__caja">
        <h1 id="titulo-bienvenida">{v.titulo}</h1>
        <p>{v.queEs}</p>
        <div className="bienvenida__datos">
          <section>
            <h2>{T.ubicacion}</h2>
            <p>
              {v.ubicacion} ({v.altitud}). {T.cuerpoReceptor} {v.cuerpoReceptor}.
            </p>
            <h2>{T.poblacion}</h2>
            <dl>
              {v.poblacion.map((p) => (
                <div key={p.etiqueta}>
                  <dt>{p.etiqueta}</dt>
                  <dd>{p.valor}</dd>
                </div>
              ))}
            </dl>
            <h2>{T.caudales}</h2>
            <dl>
              {v.caudales.map((c) => (
                <div key={c.nombre} title={c.descripcion}>
                  <dt>
                    {c.nombre} <small>({c.descripcion})</small>
                  </dt>
                  <dd>{c.valor}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <h2>{T.tren}</h2>
            <ol>
              {v.tren.map((t) => (
                <li key={t.numero}>
                  {t.nombre}
                  {t.detalle ? <small> · {t.detalle}</small> : null}
                </li>
              ))}
            </ol>
          </section>
        </div>
        <p className="bienvenida__fuente">{T.fuente}</p>
        <h2>{T.controles}</h2>
        <ul>
          <li>{T.mouse}</li>
          <li>{T.gestos}</li>
        </ul>
        <div className="bienvenida__botones">
          <button type="button" onClick={cerrar}>{T.verPlanta}</button>
          <button type="button" onClick={() => ordenar('iniciar')}>{T.verDemo}</button>
        </div>
      </div>
    </div>
  )
}
