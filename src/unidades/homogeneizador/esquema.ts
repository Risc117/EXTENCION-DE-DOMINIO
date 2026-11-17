import { z } from 'zod'
import { TOLERANCIA_MEDIDAS } from '../../nucleo/constantes'
import { esquemaAccesorios, revisarAccesorios } from './esquemaAccesorios'
import { esquemaAnotaciones, revisarAnotaciones } from './esquemaAnotaciones'
import { medida } from '../comun/medida'
import { positivo } from '../comun/medidas'

const tubo = z.object({ diametro: medida, altura: medida })
/** Dirección (grados antihorarios desde el este, vista en planta) en que el tubo sale del muro. */
const angulo = positivo('grados')
/** Entrada: llega alta, con pendiente suave, directo al muro; el único tramo vertical es el codo que baja `caidaInterior` hacia adentro (T16.4.6). */
const ingreso = tubo.extend({ angulo, caidaInterior: medida })
/** Salida: `alturaEntradaRafa` es la altura del eje del tubo donde llega a la caja de distribución del RAFA. */
const salida = tubo.extend({ angulo, alturaEntradaRafa: medida })

const tanque = z
  .object({
    forma: z.literal('circular'),
    diametroInterior: medida,
    diametroExterior: medida,
    espesorMuro: medida,
    alturaUtil: medida,
    bordeLibre: medida,
    alturaTotal: medida,
    espesorLosaFondo: medida,
    espesorSolado: medida,
    espesorLosaTecho: medida,
  })
  .refine(
    (t) => Math.abs(t.diametroInterior.valor + 2 * t.espesorMuro.valor - t.diametroExterior.valor) <= TOLERANCIA_MEDIDAS,
    'El diámetro exterior debe ser el interior más dos veces el espesor del muro',
  )
  .refine(
    (t) => Math.abs(t.alturaUtil.valor + t.bordeLibre.valor - t.alturaTotal.valor) <= TOLERANCIA_MEDIDAS,
    'La altura total debe ser la altura útil más el borde libre',
  )

export const esquemaHomogeneizador = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  demo: z.boolean().optional(),
  tanque,
  ingreso,
  salida,
  rebose: tubo,
  agitador: z.object({
    cantidad: medida.refine((m) => m.valor === 1, 'Esta versión admite un solo agitador'),
    diametroCuerpo: medida,
    altoCuerpo: medida,
    alturaImpulsor: medida,
    diametroZonaMezcla: medida,
  }),
  accesorios: esquemaAccesorios,
  anotaciones: esquemaAnotaciones,
})
  .refine((d) => d.ingreso.caidaInterior.valor < d.ingreso.altura.valor, 'El codo de la entrada debe quedar sobre el fondo')
  .superRefine((d, ctx) => {
    const problema = revisarAccesorios(d)
    if (problema) ctx.addIssue({ code: 'custom', message: problema, path: ['accesorios'] })
    const problemaNotas = revisarAnotaciones(d)
    if (problemaNotas) ctx.addIssue({ code: 'custom', message: problemaNotas, path: ['anotaciones'] })
  })

export type DatosHomogeneizador = z.infer<typeof esquemaHomogeneizador>
