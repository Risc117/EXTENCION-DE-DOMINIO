import { Euler, Quaternion, Vector3 } from 'three'

/** Cuaternión (x, y, z, w) de la orientación de la cámara. */
export type Cuaternion = [number, number, number, number]

const A_RADIANES = Math.PI / 180
/** Gira −90° alrededor de X: la cámara mira por detrás del celular, no por su pantalla. */
const ATRAS_DEL_CELULAR = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5))
const EJE_Z = new Vector3(0, 0, 1)
const [E, Q, Q_PANTALLA] = [new Euler(), new Quaternion(), new Quaternion()]

/**
 * Orientación de la cámara a partir del evento deviceorientation (alpha, beta, gamma en grados) y del giro de la pantalla (0, 90, 270).
 * Es la misma cuenta del control por giroscopio de three.js: de pie y mirando al frente la cámara mira hacia −z (el norte de la escena).
 */
export function cuaternionDeDispositivo(alpha: number, beta: number, gamma: number, pantalla: number): Cuaternion {
  E.set(beta * A_RADIANES, alpha * A_RADIANES, -gamma * A_RADIANES, 'YXZ')
  Q.setFromEuler(E).multiply(ATRAS_DEL_CELULAR).multiply(Q_PANTALLA.setFromAxisAngle(EJE_Z, -pantalla * A_RADIANES))
  return [Q.x, Q.y, Q.z, Q.w]
}

/** Orientación de la cámara al mirar arrastrando (sin giroscopio): giro a la izquierda (yaw) y cabeceo hacia arriba (pitch), en radianes. */
export function cuaternionManual(yaw: number, pitch: number): Cuaternion {
  Q.setFromEuler(E.set(pitch, yaw, 0, 'YXZ'))
  return [Q.x, Q.y, Q.z, Q.w]
}

const EJE_Y = new Vector3(0, 1, 0)
const MIRADA = new Vector3()

/** Rumbo (radianes) hacia donde mira la cámara en el plano del suelo: 0 = norte (−z), positivo hacia la izquierda (−x). */
export function yawDeCuaternion(q: Cuaternion): number {
  MIRADA.set(0, 0, -1).applyQuaternion(Q.set(q[0], q[1], q[2], q[3]))
  return Math.atan2(-MIRADA.x, -MIRADA.z)
}

/** La misma orientación con el rumbo girado `delta` radianes (sirve para alinear el giroscopio con la entrada de la planta). */
export function girarYaw(q: Cuaternion, delta: number): Cuaternion {
  const base = Q.set(q[0], q[1], q[2], q[3]).clone()
  Q.setFromAxisAngle(EJE_Y, delta).multiply(base)
  return [Q.x, Q.y, Q.z, Q.w]
}
