import { entorno } from '../unidades/entorno/datos'
import { planta } from '../unidades/planta'
import { unidades } from '../unidades/registro'
import { posicionEscena } from '../unidades/ubicar'
import type { ItemEtiqueta } from './nivelEtiquetas'

/** Centro del rectángulo que envuelve un polígono. */
function centro(poligono: { x: number; y: number }[]): { x: number; y: number } {
  const [xs, ys] = [poligono.map((p) => p.x), poligono.map((p) => p.y)]
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
}

/** Una etiqueta por unidad (flecha a su coronación) y por edificio (flecha a su techo), en coordenadas de la escena. */
export function itemsDePlanta(referencia: number): ItemEtiqueta[] {
  const deUnidades = unidades.map((u): ItemEtiqueta => {
    const [x, y, z] = posicionEscena(u, referencia)
    const corona = planta.unidades.find((p) => p.id === u.id)?.cotaCoronacion.valor ?? u.cotaFondo
    return { id: u.id, texto: u.nombre, tipo: 'unidad', punta: [x, y + (corona - u.cotaFondo), z] }
  })
  const deEdificios = entorno.edificios.map((e): ItemEtiqueta => {
    const c = centro(e.poligono)
    return { id: e.id, texto: e.nombre, tipo: 'edificio', punta: [c.x, e.cotaPiso.valor - referencia + e.altura.valor, -c.y] }
  })
  return [...deUnidades, ...deEdificios]
}
