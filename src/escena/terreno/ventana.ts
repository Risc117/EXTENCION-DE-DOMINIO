import { MARGEN_VENTANA_TERRENO, ventanaDe, type Ventana } from '../../nucleo/terreno'
import { entorno } from '../../unidades/entorno/datos'
import { planta } from '../../unidades/planta'

let guardada: Ventana | null = null

/** Zona de terreno que se dibuja: desde el inicio hasta el fin del río dibujado, con toda la planta (unidades y cerco) dentro, y un margen. */
export function ventanaVisible(): Ventana {
  guardada ??= ventanaDe(
    [
      ...[...entorno.rio.margenesA.flat(), ...entorno.rio.margenB].map((p): [number, number] => [p.x, p.y]),
      ...entorno.cerco.trazos.flat().map((p): [number, number] => [p.x, p.y]),
      ...planta.unidades.flatMap((u): [number, number][] => [
        [u.x.valor - u.radioExplanada.valor, u.y.valor - u.radioExplanada.valor],
        [u.x.valor + u.radioExplanada.valor, u.y.valor + u.radioExplanada.valor],
      ]),
    ],
    MARGEN_VENTANA_TERRENO,
  )
  return guardada
}
