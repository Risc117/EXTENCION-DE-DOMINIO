import type { DatosHomogeneizador } from '../esquema'
import { cilindroVertical, cotaTecho } from './cotas'
import type { PiezaAccesorio } from './tipos'

/** Tubo de ventilación con hongo (sombrero cónico), sobre la losa de techo, del lado del ingreso (-x). */
export function construirVentilacion(d: DatosHomogeneizador): PiezaAccesorio[] {
  const v = d.accesorios.ventilacion
  const base = cotaTecho(d)
  const x = -v.distanciaAlCentro.valor
  const punta = base + v.altura.valor
  return [
    cilindroVertical('ventilacion', 'ventilacion', x, 0, base, punta, v.diametroTubo.valor / 2),
    { id: 'hongo', tipo: 'hongo', forma: 'cono', radio: v.diametroHongo.valor / 2, largo: v.alturaHongo.valor, posicion: [x, punta + v.alturaHongo.valor / 2, 0] },
  ]
}
