import { z } from 'zod'
import { TOLERANCIA_LECHOS } from '../../nucleo/constantesLechos'
import { positivo } from '../comun/medidas'

const metros = positivo('m')
const mm = positivo('mm')
const cuenta = z.object({ valor: z.number().int().positive(), unidad: z.literal('u'), fuente: z.string().min(1), demo: z.boolean().optional() })
const capaGranular = z.object({ espesor: metros, granuloMin: mm, granuloMax: mm })

export const esquemaLechos = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    lecho: z.object({ cantidad: cuenta, separacion: metros, anchoInterior: metros, largoInterior: metros }),
    muro: z.object({ espesor: metros, alturaSobreTerreno: metros }),
    totalesPlano: z.object({ ancho: metros, largo: metros }),
    dren: z.object({ ancho: metros, desdeExterior: metros, profundidad: metros, espesorPared: metros, separacionTapas: metros, ranura: metros, espesorTapa: metros, diametroTuberia: metros }),
    piso: z.object({ pendiente: positivo('%') }),
    capas: z.object({
      ladrillo: z.object({ espesor: metros, largo: metros, ancho: metros, alto: metros }),
      arena: capaGranular,
      gravaFina: capaGranular,
      gravaMedia: capaGranular,
      gravaGruesa: capaGranular,
    }),
    lodo: z.object({ alturaMaxima: metros, horasPorCiclo: positivo('h') }),
    hoja: z.object({ profundidad: metros, cicloDias: positivo('dias'), secadoSemanas: positivo('semanas'), remocionSemanas: positivo('semanas'), areaHoja: positivo('m2') }),
  })
  .refine((d) => Math.abs(d.lecho.anchoInterior.valor + 2 * d.muro.espesor.valor - d.totalesPlano.ancho.valor) <= TOLERANCIA_LECHOS, 'El ancho exterior del plano no cuadra con el interior + 2 muros')
  .refine((d) => Math.abs(d.lecho.largoInterior.valor + 2 * d.muro.espesor.valor - d.totalesPlano.largo.valor) <= TOLERANCIA_LECHOS, 'El largo exterior del plano no cuadra con el interior + 2 muros')
  .refine((d) => d.dren.ancho.valor < d.lecho.anchoInterior.valor, 'El dren debe caber en el ancho del lecho')
  .refine(
    (d) => Math.abs(d.muro.espesor.valor + (d.lecho.anchoInterior.valor - d.dren.ancho.valor) / 2 - d.dren.desdeExterior.valor) <= TOLERANCIA_LECHOS,
    'Los 5.30 m desde el muro exterior hasta el dren no cuadran con el muro + media diferencia entre el ancho y el dren',
  )
  .refine((d) => 2 * d.dren.espesorPared.valor < d.dren.ancho.valor, 'Las paredes del dren no caben en su ancho')
  .refine((d) => d.dren.ranura.valor < d.dren.separacionTapas.valor, 'La ranura debe ser menor que la separación de las tapas')
  .refine((d) => d.dren.diametroTuberia.valor < d.dren.profundidad.valor, 'La tubería debe caber en el dren')
  .refine((d) => d.lodo.alturaMaxima.valor <= d.muro.alturaSobreTerreno.valor, 'El lodo no puede pasar del borde del muro')
  .refine((d) => {
    const c = d.capas
    const suma = c.ladrillo.espesor.valor + c.arena.espesor.valor + c.gravaFina.espesor.valor + c.gravaMedia.espesor.valor + c.gravaGruesa.espesor.valor
    return Math.abs(suma - d.hoja.profundidad.valor) <= TOLERANCIA_LECHOS
  }, 'Las 5 capas deben sumar la profundidad h de la hoja')

export type DatosLechos = z.infer<typeof esquemaLechos>
