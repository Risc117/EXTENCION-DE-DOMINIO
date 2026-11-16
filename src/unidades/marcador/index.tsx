import type { DatosPlanta } from '../planta/esquema'
import type { UnidadBase } from '../tipos'
import { Marcador } from './Marcador'

/** Una unidad marcadora por cada entrada de planta.json que trae `marcador`. */
export function crearMarcadores(planta: DatosPlanta): UnidadBase[] {
  return planta.unidades.flatMap((p) => {
    const m = p.marcador
    if (!m) return []
    const largo = m.largo.valor
    const ancho = m.ancho.valor
    const alto = p.cotaCoronacion.valor - p.cotaFondo.valor
    return [
      {
        id: p.id,
        nombre: p.nombre,
        demo: true,
        tamano: Math.max(largo, ancho),
        Componente: () => <Marcador nombre={p.nombre} largo={largo} ancho={ancho} alto={alto} />,
      },
    ]
  })
}
