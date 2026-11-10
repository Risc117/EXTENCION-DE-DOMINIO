import { Quaternion, Vector3 } from 'three'
import type { Vec3 } from './tipos'

const ARRIBA = new Vector3(0, 1, 0)

/** Posición y giro de un cono (su punta apunta a +y) para que su punta quede en `punta` mirando hacia `direccion`. */
export function geometriaFlecha(punta: Vec3, direccion: Vec3, largo: number): { posicion: Vec3; cuaternion: [number, number, number, number] } {
  const dir = new Vector3(...direccion).normalize()
  const q = new Quaternion().setFromUnitVectors(ARRIBA, dir)
  const centro = new Vector3(...punta).addScaledVector(dir, -largo / 2)
  return { posicion: [centro.x, centro.y, centro.z], cuaternion: [q.x, q.y, q.z, q.w] }
}
