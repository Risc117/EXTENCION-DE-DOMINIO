import { leyenda } from './datosLeyenda'

/** Leyenda de colores de la planta: tuberías (agua residual, efluente, lodos, biogás...) y tipos de estructura, desde datos/leyenda.json. */
export function PanelLeyenda() {
  return (
    <div className="leyenda-colores">
      {leyenda.grupos.map((g) => (
        <section key={g.id}>
          <h3>{g.titulo}</h3>
          <ul>
            {g.entradas.map((e) => (
              <li key={e.id} title={e.fuente}>
                <span className={`leyenda-colores__muestra leyenda-colores__muestra--${e.forma}`} style={{ background: `var(${e.token})` }} aria-hidden="true" />
                {e.nombre}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
