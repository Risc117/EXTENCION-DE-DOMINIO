import { useAmbiente, horaAmbiente } from '../../estado/ambiente'
import { useSim } from '../../estado/simulacion'
import { posicionSol, type Sol } from '../../nucleo/solar'
import { ambiente } from './datos'

/** La hora del día que ve la escena ahora: la fijada a mano o la de la simulación. */
export const horaActual = (): number => horaAmbiente(useSim.getState().hora, useAmbiente.getState().horaFija)

/** Posición del sol ahora, según la latitud y la fecha de datos/ambiente.json y la hora actual. */
export const solActual = (): Sol => posicionSol(ambiente.ubicacion.latitud.valor, ambiente.fecha.mes, ambiente.fecha.dia, horaActual())
