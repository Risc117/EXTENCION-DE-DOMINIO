import { Quaternion, Vector3, type Group } from 'three'
import { GRADOS_MEDIA_VUELTA } from '../../nucleo/constantesViento'

const [GIRO, EJE] = [new Quaternion(), new Vector3()]
const RAD = Math.PI / GRADOS_MEDIA_VUELTA

/** Inclina la llama `grados` hacia donde sopla el viento (dirección horizontal unitaria x, z); sin viento queda vertical. */
export function inclinarLlama(g: Group, haciaX: number, haciaZ: number, grados: number): void {
  g.quaternion.copy(GIRO.setFromAxisAngle(EJE.set(haciaZ, 0, -haciaX), grados * RAD))
}
