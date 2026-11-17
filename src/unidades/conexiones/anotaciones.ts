import { DESFASE_ET_BUZON, DESFASE_ET_TRAMO, MM_POR_M_CONEXIONES, NOMBRE_LINEA } from '../../nucleo/constantesConexiones'
import { etiquetaDe } from '../comun/anotar'
import type { EtiquetaCalculada } from '../comun/tiposAnotaciones'
import type { DatosConexiones } from './esquema'
import { aEscena, construirBuzones } from './geometria'
import { cotaEn, longitudTramo } from './trazado'

/** Diámetro en milímetros, con un decimal si es menor de 50 mm (la línea de cloro: 12.7 mm). */
const milimetros = (m: number): number => (m * MM_POR_M_CONEXIONES < 50 ? Math.round(m * MM_POR_M_CONEXIONES * 10) / 10 : Math.round(m * MM_POR_M_CONEXIONES))

/** Punto del eje a la mitad del recorrido, en la escena. */
function mitad(d: DatosConexiones, id: string, referencia: number) {
  const t = d.tramos.find((x) => x.id === id)!
  const total = longitudTramo(t)
  let recorrido = 0
  for (let i = 1; i < t.trazado.length; i++) {
    const [p, q] = [t.trazado[i - 1], t.trazado[i]]
    const largo = Math.hypot(q.x - p.x, q.y - p.y)
    if (recorrido + largo >= total / 2) {
      const f = largo === 0 ? 0 : (total / 2 - recorrido) / largo
      return aEscena(p.x + (q.x - p.x) * f, p.y + (q.y - p.y) * f, cotaEn(t, total / 2), referencia)
    }
    recorrido += largo
  }
  return aEscena(t.trazado[0].x, t.trazado[0].y, t.cotaSalida.valor, referencia)
}

/** Etiquetas de cada tramo (línea, material y diámetro; "(ej.)" si alguno es de ejemplo) y de cada buzón. */
export function construirEtiquetas(d: DatosConexiones, referencia: number): EtiquetaCalculada[] {
  const tramos = d.tramos.map((t) =>
    etiquetaDe(`et-${t.id}`, `${NOMBRE_LINEA[t.linea]} · ${t.material.valor} Ø ${milimetros(t.diametro.valor)} mm`, t.diametro.demo === true || t.material.demo === true, mitad(d, t.id, referencia), DESFASE_ET_TRAMO),
  )
  const buzones = construirBuzones(d, referencia).map((b) => {
    const p = d.puntos.find((x) => x.id === b.id)!
    return etiquetaDe(`et-${b.id}`, p.nombre, p.x.demo === true, b.tapa, DESFASE_ET_BUZON)
  })
  return [...tramos, ...buzones]
}
