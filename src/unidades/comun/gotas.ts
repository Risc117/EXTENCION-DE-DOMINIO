import { DESFASE_ENTRE_PUNTOS } from '../../nucleo/constantesGotas'

/**
 * Altura (m) de una gota que cae desde `arriba` hasta `abajo` a `velocidad` m/s y vuelve a empezar; `fase` (0 a 1) la adelanta a lo largo de la caída.
 * Sin velocidad la gota se queda quieta en el lugar que le toca por su fase.
 */
export function alturaGota(fase: number, tiempo: number, velocidad: number, arriba: number, abajo: number): number {
  const caida = arriba - abajo
  const recorrido = fase * caida + tiempo * velocidad
  return arriba - (((recorrido % caida) + caida) % caida)
}

/** `n` fases repartidas entre 0 y 1, desplazadas `desfase` (para que los puntos vecinos no caigan juntos). */
export function fasesGotas(n: number, desfase = 0): number[] {
  return Array.from({ length: n }, (_, i) => (i / n + desfase) % 1)
}

/** Fase (0 a 1) con la que empieza el punto número i, para que los puntos vecinos no suelten sus gotas juntos. */
export const desfasePunto = (i: number): number => (i * DESFASE_ENTRE_PUNTOS) % 1
