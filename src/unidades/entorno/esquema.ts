import { z } from 'zod'
import { positivo } from '../comun/medidas'

const metros = positivo('m')
const punto = z.object({ x: z.number().finite(), y: z.number().finite() })
const poligono = z.array(punto).min(3)
const fuente = z.string().min(1)

const edificio = z.object({ id: z.string().min(1), nombre: z.string().min(1), poligono, fuentePoligono: fuente, altura: metros })
const via = z.object({ id: z.string().min(1), nombre: z.string().min(1), eje: z.array(punto).min(2), fuenteEje: fuente, ancho: metros })
const superficie = z.object({ id: z.string().min(1), nombre: z.string().min(1), poligono, fuentePoligono: fuente, espesor: metros })
const circulo = z.object({ id: z.string().min(1), nombre: z.string().min(1), centro: punto, radio: metros })
const rotonda = circulo.extend({ espesor: metros })
const porton = z.object({ id: z.string().min(1), nombre: z.string().min(1), desde: punto, hasta: punto, ancho: metros, altura: metros })

export const esquemaEntorno = z
  .object({
    id: z.string().min(1),
    fuente,
    demo: z.boolean().optional(),
    edificios: z.array(edificio).min(1),
    /** Pluma de la barrera: del pivote al extremo. */
    barrera: z.object({ nombre: z.string().min(1), desde: punto, hasta: punto, fuente, altura: metros }),
    radiosSeguridad: z.array(circulo),
    vias: z.array(via).min(1),
    rotondas: z.array(rotonda),
    superficies: z.array(superficie),
    cerco: z.object({ trazos: z.array(z.array(punto).min(2)).min(1), fuenteTrazos: fuente, altura: metros, portones: z.array(porton) }),
    arboles: z.object({ fuente, radioCopa: metros, radioTronco: metros, alturaTronco: metros, alturaTotal: metros, posiciones: z.array(punto).min(1) }),
  })
  .refine((d) => new Set(d.edificios.map((e) => e.id)).size === d.edificios.length, 'Hay ids de edificio repetidos')
  .refine((d) => new Set(d.vias.map((v) => v.id)).size === d.vias.length, 'Hay ids de vía repetidos')
  .refine((d) => d.arboles.alturaTronco.valor < d.arboles.alturaTotal.valor, 'El tronco debe ser más bajo que el árbol')

export type DatosEntorno = z.infer<typeof esquemaEntorno>
export type PuntoPlano = z.infer<typeof punto>
