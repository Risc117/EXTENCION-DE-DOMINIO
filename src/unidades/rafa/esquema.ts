import { z } from 'zod'
import { medida, positivo } from '../comun/medidas'

const metros = positivo('m')

/** Un conteo entero positivo (módulos, ramales, tubos...). */
const cuenta = medida.refine((m) => Number.isInteger(m.valor) && m.unidad === 'u', 'Debe ser un número entero de unidades')

export const esquemaRafa = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    cuerpo: z.object({
      anchoExterior: metros,
      largoExterior: metros,
      espesorMuro: metros,
      espesorPiso: metros,
      alturaDigestor: metros,
      alturaSedimentacion: metros,
      alturaLaminaAgua: metros,
      alturaCanaleta: metros,
      bordoLibre: metros,
    }),
    losa: z.object({ espesor: metros, anchoTapa: metros, cantidadTapas: cuenta, alturaBaranda: metros }),
    sedimentacion: z.object({
      espesorDeflector: metros,
      alturaDeflector: metros,
      separacionPie: metros,
      alturaRecta: metros,
      aberturaPaso: metros,
      modulos: z.object({ cantidad: cuenta, largo: metros, separacionEje: metros, canaletasPorModulo: cuenta }),
    }),
    distribucion: z.object({
      anchoColector: metros,
      ramalesColector: cuenta,
      colector: z.object({ alturaSobrePiso: metros, holguraPared: metros, espesorAnillo: metros, altoAnillo: metros }),
      tubosFondo: z.object({ cantidad: cuenta, separacion: metros, diametro: metros, alturaSobrePiso: metros }),
      caja: z.object({ ancho: metros, alto: metros, anchoUtil: metros, espesorMuro: metros, diametroAfluente: metros, diametroSalida: metros }),
    }),
    efluente: z.object({ anchoCamara: metros, salidas: cuenta, recoleccionSuperior: metros, recoleccionInferior: metros, espesorRejilla: metros }),
    lodos: z.object({ alturasToma: z.array(metros).min(1), diametroToma: metros, margenCajaMuestreo: metros, ladoCajaMuestreo: metros, ladoCajaDescarga: metros }),
    hidraulica: z.object({ volumenHoja: positivo('m3'), retencionHoja: positivo('h') }),
  })
  .refine((d) => d.cuerpo.anchoExterior.valor > 2 * d.cuerpo.espesorMuro.valor, 'Los muros no caben en el ancho exterior')
  .refine((d) => d.cuerpo.largoExterior.valor > 2 * d.cuerpo.espesorMuro.valor, 'Los muros no caben en el largo exterior')
  .refine((d) => d.sedimentacion.alturaDeflector.valor < d.cuerpo.alturaSedimentacion.valor, 'El deflector debe ser más bajo que la zona de sedimentación')
  .refine((d) => d.lodos.alturasToma.every((t) => t.valor < d.cuerpo.alturaDigestor.valor), 'Las tomas de lodo deben quedar dentro del digestor')
  // Los módulos van en dos filas (a cada lado del eje) y en dos tramos (oeste y este del colector central).
  .refine((d) => d.sedimentacion.modulos.cantidad.valor % 4 === 0, 'Los módulos van en cuatro grupos iguales (dos filas por dos lados del colector)')
  .refine(
    (d) => (d.sedimentacion.modulos.cantidad.valor / 2) * d.sedimentacion.modulos.largo.valor + d.distribucion.anchoColector.valor <= d.cuerpo.largoExterior.valor,
    'Los módulos y el colector no caben en el largo exterior',
  )
  .refine((d) => d.sedimentacion.modulos.separacionEje.valor < (d.cuerpo.anchoExterior.valor - 2 * d.cuerpo.espesorMuro.valor) / 2, 'La fila de módulos no cabe en el ancho interior')
  .refine(
    (d) => (d.distribucion.tubosFondo.cantidad.valor - 1) * d.distribucion.tubosFondo.separacion.valor < d.cuerpo.largoExterior.valor - 2 * d.cuerpo.espesorMuro.valor,
    'Los tubos de fondo no caben en el largo interior',
  )

export type DatosRafa = z.infer<typeof esquemaRafa>
