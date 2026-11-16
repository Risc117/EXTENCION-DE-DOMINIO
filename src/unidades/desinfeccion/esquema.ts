import { z } from 'zod'
import { positivo } from '../comun/medidas'

const metros = positivo('m')
/** Tolerancia (m) entre el total del plano y la suma de canales, tabiques y muros. */
const TOLERANCIA_TOTAL = 0.001
const CANALES = 4

const cuenta = z.object({ valor: z.number().int().positive(), unidad: z.literal('u'), fuente: z.string().min(1), demo: z.boolean().optional() })

export const esquemaDesinfeccion = z
  .object({
    id: z.string().min(1),
    nombre: z.string().min(1),
    demo: z.boolean().optional(),
    canales: z.object({ cantidad: cuenta, ancho: metros, largoInterior: metros, largoRecorrido: metros }),
    tabique: z.object({ espesor: metros, largo: metros }),
    muro: z.object({ espesor: metros }),
    losa: z.object({ espesor: metros }),
    agua: z.object({ profundidad: metros, bordeLibre: metros }),
    totalesPlano: z.object({ ancho: metros, largo: metros }),
    pantalla: z.object({ espesor: metros, largo: metros }),
    tuberias: z.object({ diametro: metros, alturaEjeEntrada: metros, alturaEjeSalida: metros }),
    hidraulica: z.object({ caudalDiseno: positivo('L/s'), tiempoContacto: positivo('min'), volumenHoja: positivo('m3') }),
    cloracion: z.object({
      concentracion: positivo('mg/L'),
      dosisMaxima: positivo('mg/L'),
      diametroLinea: metros,
      diametroMezclador: metros,
      largoMezclador: metros,
      largoValvula: metros,
      alturaPunto: metros,
    }),
    caseta: z.object({ largo: metros, ancho: metros, alturaMuros: metros, espesor: metros }),
    tanque: z.object({ diametro: metros, altura: metros }),
    bomba: z.object({ largo: metros, alto: metros, ancho: metros }),
  })
  .refine((d) => d.canales.cantidad.valor === CANALES, 'El laberinto del plano tiene 4 canales')
  .refine((d) => d.tabique.largo.valor < d.canales.largoInterior.valor, 'Los tabiques deben dejar un paso: tienen que ser más cortos que el largo interior')
  .refine(
    (d) => Math.abs(CANALES * d.canales.ancho.valor + (CANALES - 1) * d.tabique.espesor.valor + 2 * d.muro.espesor.valor - d.totalesPlano.ancho.valor) <= TOLERANCIA_TOTAL,
    'El ancho total del plano no cuadra con 4 canales + 3 tabiques + 2 muros',
  )
  .refine((d) => Math.abs(d.canales.largoInterior.valor + 2 * d.muro.espesor.valor - d.totalesPlano.largo.valor) <= TOLERANCIA_TOTAL, 'El largo total del plano no cuadra con el largo interior + 2 muros')
  .refine((d) => d.tuberias.alturaEjeEntrada.valor < d.agua.profundidad.valor && d.tuberias.alturaEjeSalida.valor < d.agua.profundidad.valor + d.agua.bordeLibre.valor, 'Las tuberías deben quedar dentro de la altura de la cámara')
  .refine((d) => d.pantalla.largo.valor < d.canales.ancho.valor + d.tabique.espesor.valor + d.canales.ancho.valor, 'La pantalla debe caber en el paso')

export type DatosDesinfeccion = z.infer<typeof esquemaDesinfeccion>
