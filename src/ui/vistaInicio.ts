import type { DatosInicio } from '../nucleo/inicioEsquema'
import { TEXTO_INICIO as T } from '../nucleo/textosInicio'

const ESPACIO_FINO = ' '

/** Un número con miles separados por un espacio y decimales con punto (5872 → "5 872"; 6.536 → "6.536"). */
export function formatoNumero(n: number): string {
  const [entero, decimales] = String(n).split('.')
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ESPACIO_FINO)
  return decimales ? `${miles}.${decimales}` : miles
}

export interface VistaInicio {
  titulo: string
  queEs: string
  ubicacion: string
  altitud: string
  cuerpoReceptor: string
  poblacion: { etiqueta: string; valor: string }[]
  caudales: { nombre: string; descripcion: string; valor: string }[]
  tren: { numero: number; nombre: string; detalle: string | null }[]
}

/** Lo que dice la pantalla de inicio, armado con los datos de datos/inicio.json. */
export function vistaInicio(d: DatosInicio): VistaInicio {
  return {
    titulo: d.titulo,
    queEs: d.queEs,
    ubicacion: d.ubicacion.texto,
    altitud: `${T.altitud} ${formatoNumero(d.ubicacion.altitud.valor)} ${d.ubicacion.altitud.unidad}`,
    cuerpoReceptor: d.ubicacion.cuerpoReceptor,
    poblacion: [
      { etiqueta: T.poblacionBase, valor: `${formatoNumero(d.poblacion.base.valor)} ${d.poblacion.base.unidad}` },
      { etiqueta: T.poblacionProyectada(d.poblacion.proyectada.anio), valor: `${formatoNumero(d.poblacion.proyectada.valor)} ${d.poblacion.proyectada.unidad}` },
    ],
    caudales: Object.values(d.caudales).map((c) => ({ nombre: c.nombre, descripcion: c.descripcion, valor: `${formatoNumero(c.valor)} ${c.unidad}` })),
    tren: d.tren.map((t, i) => ({ numero: i + 1, nombre: t.nombre, detalle: t.detalle ?? null })),
  }
}
