import { z } from 'zod'
import crudo from '../../../datos/puente.json'
import { positivo } from '../comun/medidas'

/** Medidas del puente del camino sobre el río (datos/puente.json): interpretación, todas de ejemplo. */
export const esquemaPuente = z.object({
  id: z.string().min(1),
  fuente: z.string().min(1),
  demo: z.boolean(),
  espesorTablero: positivo('m'),
  joroba: positivo('m'),
  alturaBaranda: positivo('m'),
  separacionPostes: positivo('m'),
  ladoPoste: positivo('m'),
  extensionSobreOrilla: positivo('m'),
  largoEstribo: positivo('m'),
  profundidadEstribo: positivo('m'),
  holguraSobreAgua: positivo('m'),
})

/** Puente ya validado. */
export const puente = esquemaPuente.parse(crudo)
