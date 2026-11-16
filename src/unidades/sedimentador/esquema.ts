import { z } from 'zod'
import { medida, positivo } from '../comun/medidas'

const metros = positivo('m')
const cuenta = medida.refine((m) => Number.isInteger(m.valor) && m.unidad === 'u', 'Debe ser un número entero de unidades')
/** Tolerancia (m) entre la altura de la tolva de la hoja y la que sale de su ángulo y diámetros. */
const TOLERANCIA_TOLVA = 0.01

export const esquemaSedimentador = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    tanque: z.object({ diametroInterior: metros, espesorMuro: metros, alturaAgua: metros, bordoLibre: metros }),
    tolva: z.object({ diametroMenor: metros, altura: metros, angulo: positivo('grados'), alturaLodo: metros }),
    canal: z.object({ ramales: cuenta, ancho: metros, profundidad: metros, velocidad: positivo('m/s'), laminaPlano: metros }),
    vertedero: z.object({ separacionMuescas: metros, profundidadMuesca: metros, alturaPlaca: metros, anguloMuesca: positivo('grados'), espesorPlaca: metros }),
    camaraCentral: z.object({ diametro: metros, altura: metros, diametroDeflector: metros, espesorDeflector: metros }),
    tuberias: z.object({ diametroEntrada: metros, diametroSalida: metros, diametroPurga: metros }),
    accesorios: z.object({
      anchoPuente: metros,
      altoPuente: metros,
      vueltasPorMinuto: positivo('rpm'),
      anchoPasarela: metros,
      alturaMampara: metros,
      separacionMampara: metros,
      alturaEscalera: metros,
      anchoEscalera: metros,
    }),
    hidraulica: z.object({ volumenHoja: positivo('m3') }),
  })
  .refine((d) => d.tolva.diametroMenor.valor < d.tanque.diametroInterior.valor, 'El diámetro menor de la tolva debe ser menor que el del tanque')
  .refine((d) => d.camaraCentral.diametro.valor < d.tanque.diametroInterior.valor, 'La cámara central debe caber en el tanque')
  .refine((d) => d.camaraCentral.diametroDeflector.valor < d.tanque.diametroInterior.valor, 'El deflector debe caber en el tanque')
  .refine((d) => d.tolva.alturaLodo.valor <= d.tolva.altura.valor, 'El manto de lodos debe quedar dentro de la tolva')
  .refine((d) => d.camaraCentral.altura.valor < d.tanque.alturaAgua.valor, 'La cámara central debe ser más baja que el agua')
  .refine((d) => d.canal.profundidad.valor > d.vertedero.profundidadMuesca.valor, 'El canal debe ser más profundo que la muesca del vertedero')
  .refine((d) => d.canal.profundidad.valor < d.tanque.alturaAgua.valor + d.tanque.bordoLibre.valor, 'El canal debe caber en la altura del tanque')
  .refine(
    (d) => Math.abs(((d.tanque.diametroInterior.valor - d.tolva.diametroMenor.valor) * Math.tan((d.tolva.angulo.valor * Math.PI) / 180)) / 2 - d.tolva.altura.valor) <= TOLERANCIA_TOLVA,
    'La altura de la tolva no cuadra con su ángulo y sus diámetros',
  )

export type DatosSedimentador = z.infer<typeof esquemaSedimentador>
