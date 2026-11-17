import calidadCruda from '../../datos/calidad.json'
import lineaCruda from '../../datos/linea.json'
import { useCalidadAgua, PARAMETROS, type Concentracion, type EtapaCalidad } from '../estado/calidadAgua'
import { balanceCalidad } from './calidadAgua'
import { esquemaCalidad } from './calidadEsquema'
import { esquemaLinea } from './lineaEsquema'

/** Calcula la calidad de cada unidad (valores de diseño de datos/calidad.json) y la publica para la interfaz. Se llama una vez al arrancar la simulación. */
export function publicarCalidad(): void {
  const datos = esquemaCalidad.parse(calidadCruda)
  const nodos = esquemaLinea.parse(lineaCruda).nodos
  const etapas: EtapaCalidad[] = balanceCalidad(datos, nodos).map((e) => {
    const remocion = datos.etapas.find((x) => x.id === e.id)!.remocion
    return { ...e, demo: Object.fromEntries(PARAMETROS.map((p) => [p, remocion[p].demo === true])) as EtapaCalidad['demo'] }
  })
  const valores = (o: Record<string, { valor: number }>): Partial<Concentracion> => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.valor]))
  useCalidadAgua.getState().publicar(etapas, { descarga: valores(datos.limites.descarga) as Concentracion, eca: valores(datos.limites.eca) }, datos.metodo)
}
