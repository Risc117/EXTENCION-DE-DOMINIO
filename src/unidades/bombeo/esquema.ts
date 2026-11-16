import { z } from 'zod'
import { medida, positivo } from '../comun/medidas'

const metros = positivo('m')

export const esquemaBombeo = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    carcamo: z.object({ diametroInterior: metros, profundidad: metros, espesorMuro: metros, espesorLosa: metros }),
    niveles: z.object({ parada: metros, arranque: metros }),
    bombas: z.object({
      cantidad: medida.refine((m) => Number.isInteger(m.valor) && m.valor >= 2, 'Hacen falta al menos dos bombas (una de reserva)'),
      caudal: positivo('L/s'),
      diametro: metros,
      alto: metros,
      separacion: metros,
    }),
    disposicion: z.object({ bajoTerrenoColector: metros, sobreTerrenoImpulsion: metros, desplazamientoBombas: metros }),
    impulsion: z.object({ diametro: metros, largoTramo: metros }),
    caseta: z.object({ largo: metros, ancho: metros, alto: metros, espesorMuro: metros, distancia: metros }),
  })
  .refine((d) => d.niveles.arranque.valor > d.niveles.parada.valor, 'El nivel de arranque debe quedar sobre el de parada')
  .refine((d) => d.niveles.arranque.valor < d.carcamo.profundidad.valor, 'El nivel de arranque debe quedar bajo el borde del cárcamo')
  .refine((d) => d.bombas.separacion.valor + d.bombas.diametro.valor < d.carcamo.diametroInterior.valor, 'Las bombas no caben en el cárcamo')

export type DatosBombeo = z.infer<typeof esquemaBombeo>
