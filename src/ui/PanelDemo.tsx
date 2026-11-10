import { TEXTO_DEMO as T } from '../nucleo/textos'
import { useDemo } from '../estado/demo'

/** Botón de la demo guiada y, mientras corre, la tarjeta con el texto del paso. */
export function PanelDemo() {
  const d = useDemo()
  return (
    <section className="panel-demo">
      <button type="button" onClick={() => d.ordenar(d.activa ? 'salir' : 'iniciar')}>
        {d.activa ? T.detener : T.iniciar}
      </button>
      {d.activa && (
        <div className="panel-demo__tarjeta" role="status">
          <p className="panel-demo__paso">
            {T.paso} {d.paso + 1} {T.de} {d.total}
          </p>
          <h2>{d.titulo}</h2>
          <p>{d.texto}</p>
          <progress value={d.transcurrido} max={d.duracion} />
          <div className="panel-demo__botones">
            <button type="button" onClick={() => d.ordenar('anterior')} disabled={d.paso === 0}>
              {T.anterior}
            </button>
            <button type="button" onClick={() => d.ordenar('siguiente')}>
              {T.siguiente}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
