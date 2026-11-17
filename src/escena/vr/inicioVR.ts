interface Via {
  id: string
  eje: { x: number; y: number }[]
}

export interface InicioVR {
  /** Posición (m, ejes de la escena: x este, z sur). */
  x: number
  z: number
  /** Rumbo (rad) hacia donde mira: 0 = norte (−z), positivo hacia la izquierda. */
  yaw: number
}

/** Punto de entrada de la VR: el punto `indice` del eje de la vía, mirando hacia su punto `haciaIndice`. */
export function inicioDeVR(vias: Via[], inicio: { via: string; indice: number; haciaIndice: number }): InicioVR {
  const via = vias.find((v) => v.id === inicio.via)
  if (!via) throw new Error(`No hay una vía "${inicio.via}" en datos/entorno.json (datos/vr.json, inicio)`)
  const [desde, hacia] = [via.eje[inicio.indice], via.eje[inicio.haciaIndice]]
  if (!desde || !hacia) throw new Error(`La vía "${via.id}" no tiene los puntos ${inicio.indice} y ${inicio.haciaIndice} (datos/vr.json, inicio)`)
  const [dx, dz] = [hacia.x - desde.x, -hacia.y + desde.y]
  return { x: desde.x, z: -desde.y, yaw: Math.atan2(-dx, -dz) }
}
