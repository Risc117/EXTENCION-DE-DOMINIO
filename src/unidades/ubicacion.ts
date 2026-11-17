export type Vec3 = [number, number, number]

/** Dónde está una unidad en la escena: posición (m) y giro alrededor de la vertical (radianes). */
export interface UbicacionEscena {
  posicion: Vec3
  giro: number
  /** Lado mayor (m) de la unidad: sirve para saber cuándo la cámara está cerca. */
  tamano?: number
}

export const SIN_UBICACION: UbicacionEscena = { posicion: [0, 0, 0], giro: 0 }

/** Gira un vector alrededor de Y como lo hace three.js (rotation.y = giro). */
export function girar([x, y, z]: Vec3, giro: number): Vec3 {
  const c = Math.cos(giro)
  const s = Math.sin(giro)
  return [x * c + z * s, y, -x * s + z * c]
}

/** Pasa un punto del mundo a las coordenadas propias de la unidad. */
export function aLocal(p: Vec3, u: UbicacionEscena): Vec3 {
  return girar([p[0] - u.posicion[0], p[1] - u.posicion[1], p[2] - u.posicion[2]], -u.giro)
}

/** Plano `normal·p + constante = 0` en coordenadas propias de la unidad. */
export interface PlanoLocal {
  normal: Vec3
  constante: number
}

/** Pasa un plano de la unidad al mundo (los planos de recorte de three.js se dan en el mundo). */
export function planoAMundo(plano: PlanoLocal, u: UbicacionEscena): PlanoLocal {
  const normal = girar(plano.normal, u.giro)
  const [px, py, pz] = u.posicion
  return { normal, constante: plano.constante - (normal[0] * px + normal[1] * py + normal[2] * pz) }
}
