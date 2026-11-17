import type { DatosHomogeneizador } from '../esquema'
import type { PiezaAccesorio } from './tipos'

/** Relleno compactado pegado al muro y terreno natural alrededor, hasta el nivel del suelo real (no hasta la losa de techo: el tanque sale del suelo). */
export function construirTerreno(d: DatosHomogeneizador): PiezaAccesorio[] {
  const t = d.accesorios.terreno
  const radioMuro = d.tanque.diametroExterior.valor / 2
  const fondo = -d.tanque.espesorLosaFondo.valor - d.tanque.espesorSolado.valor - t.profundidadBajoSolado.valor
  const alto = t.nivelSuelo.valor - fondo
  const radioRelleno = radioMuro + t.anchoRelleno.valor
  return [
    { id: 'relleno', tipo: 'relleno', forma: 'anillo', posicion: [0, fondo, 0], radioInterior: radioMuro, radioExterior: radioRelleno, alto },
    { id: 'terreno', tipo: 'terreno', forma: 'anillo', posicion: [0, fondo, 0], radioInterior: radioRelleno, radioExterior: radioRelleno + t.anchoTerreno.valor, alto },
  ]
}
