import { z } from 'zod'
import { medida, positivo } from '../comun/medidas'

const metros = positivo('m')
/** Un dato de texto con su fuente (material de una tubería). */
const texto = z.object({ valor: z.string().min(1), fuente: z.string().min(1), demo: z.boolean().optional() })
const cuenta = medida.refine((m) => Number.isInteger(m.valor) && m.unidad === 'u', 'Debe ser un número entero de unidades')

export const esquemaPercolador = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    cuerpo: z.object({ diametroInterior: metros, espesorMuro: metros, espesorLosa: metros, pendienteLosa: positivo('adim') }),
    camaraInferior: z.object({
      altura: metros,
      alturaViga: metros,
      anchoViga: metros,
      cantidadVigas: cuenta,
      ladoVentana: metros,
      cantidadVentanas: cuenta,
      alturaVentanaSobreLosa: metros,
    }),
    lecho: z.object({ altura: metros }),
    distribuidor: z.object({
      diametroColumna: metros,
      cantidadBrazos: cuenta,
      diametroBrazo: metros,
      alturaColumnaSobreLecho: metros,
      alturaBrazoSobreLecho: metros,
      vueltasPorMinuto: positivo('rpm'),
    }),
    entrada: z.object({ diametro: metros, material: texto }),
    canal: z.object({ ancho: metros, alto: metros }),
    salida: z.object({ ancho: metros, profundidad: metros, ladoCompuerta: metros, diametroTubo: metros, nivelMinimo: metros, nivelMaximo: metros }),
    agua: z.object({ laminaMaxima: metros }),
    hidraulica: z.object({ volumenHoja: positivo('m3'), diametroHoja: metros }),
  })
  .refine((d) => d.camaraInferior.alturaViga.valor < d.camaraInferior.altura.valor, 'Las vigas deben ser más bajas que la cámara inferior')
  .refine((d) => d.camaraInferior.alturaVentanaSobreLosa.valor + d.camaraInferior.ladoVentana.valor <= d.camaraInferior.altura.valor, 'Las ventanas deben caber en la altura de la cámara inferior')
  .refine((d) => d.distribuidor.diametroColumna.valor < d.cuerpo.diametroInterior.valor, 'La columna central debe caber en el filtro')
  .refine((d) => d.distribuidor.cantidadBrazos.valor >= 2, 'Hacen falta al menos dos brazos')
  .refine((d) => d.salida.nivelMinimo.valor < d.salida.nivelMaximo.valor && d.salida.nivelMaximo.valor < d.salida.profundidad.valor, 'Los niveles de la cámara de salida deben ir de menor a mayor y bajo su profundidad')
  .refine((d) => d.salida.ladoCompuerta.valor < d.salida.ancho.valor, 'La compuerta debe caber en la cámara de salida')

export type DatosPercolador = z.infer<typeof esquemaPercolador>
