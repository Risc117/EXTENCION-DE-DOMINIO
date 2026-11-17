export interface Ventana {
  x: number
  y: number
  ancho: number
  alto: number
}

/** Las dos mitades de la pantalla (ojo izquierdo y derecho), en píxeles; sin hueco ni solape aunque el ancho sea impar. */
export function ventanasEstereo(ancho: number, alto: number): [Ventana, Ventana] {
  const mitad = Math.floor(ancho / 2)
  return [
    { x: 0, y: 0, ancho: mitad, alto },
    { x: mitad, y: 0, ancho: ancho - mitad, alto },
  ]
}
