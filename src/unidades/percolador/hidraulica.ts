import { HORAS_POR_DIA, LITROS_POR_M3, SEGUNDOS_POR_HORA } from '../../nucleo/constantes'
import type { DatosPercolador } from './esquema'

const SEGUNDOS_POR_MINUTO = 60

/** Altura total (m): losa + cámara inferior + lecho (0.50 + 1.05 + 2.50 = 4.05). Los brazos y la columna sobresalen del muro. */
export const alturaTotal = (d: DatosPercolador): number => d.cuerpo.espesorLosa.valor + d.camaraInferior.altura.valor + d.lecho.altura.valor

export const radioInterior = (d: DatosPercolador): number => d.cuerpo.diametroInterior.valor / 2

/** Área (m²) y volumen (m³) del lecho con el diámetro del plano; la hoja trae el suyo (684.3 m³) aparte. */
export const areaPlano = (d: DatosPercolador): number => Math.PI * radioInterior(d) ** 2
export const volumenPlano = (d: DatosPercolador): number => areaPlano(d) * d.lecho.altura.valor

/** Caída (m) de la losa de fondo hacia el canal central: pendiente × radio. */
export const caidaLosa = (d: DatosPercolador): number => d.cuerpo.pendienteLosa.valor * radioInterior(d)

/** Carga hidráulica superficial (m³/m²·d) = Q / área. */
export function cargaHidraulica(d: DatosPercolador, caudalLs: number): number {
  if (caudalLs <= 0) return 0
  return ((caudalLs / LITROS_POR_M3) * HORAS_POR_DIA * SEGUNDOS_POR_HORA) / areaPlano(d)
}

/** Parte (0 a 1) del caudal máximo horario que está pasando. */
const relacion = (caudalLs: number, caudalMaximoLs: number): number => Math.min(Math.max(caudalLs, 0) / caudalMaximoLs, 1)

/** Velocidad de giro (rad/s) de los brazos: la de ejemplo a caudal promedio, proporcional al caudal. */
export function velocidadGiro(d: DatosPercolador, caudalLs: number, caudalPromedioLs: number): number {
  if (caudalLs <= 0) return 0
  return ((d.distribuidor.vueltasPorMinuto.valor * (caudalLs / caudalPromedioLs)) * 2 * Math.PI) / SEGUNDOS_POR_MINUTO
}

/** Nivel (m) del agua en la cámara de salida: del mínimo al máximo de ejemplo, según el caudal. */
export function nivelSalida(d: DatosPercolador, caudalLs: number, caudalMaximoLs: number): number {
  const s = d.salida
  return s.nivelMinimo.valor + (s.nivelMaximo.valor - s.nivelMinimo.valor) * relacion(caudalLs, caudalMaximoLs)
}

/** Lámina (m) sobre el lecho: de cero a la máxima de ejemplo, según el caudal. */
export const laminaLecho = (d: DatosPercolador, caudalLs: number, caudalMaximoLs: number): number => d.agua.laminaMaxima.valor * relacion(caudalLs, caudalMaximoLs)
