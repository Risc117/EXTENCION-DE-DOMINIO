/** Rondas máximas al limitar la pendiente. */
const RONDAS = 200

export interface ResultadoPerfil {
  alturas: number[]
  /** true si todos los tramos (salvo los que unen dos estaciones ancladas) respetan la pendiente máxima. */
  cumple: boolean
  /** Pendiente más fuerte (m por m) entre dos estaciones ancladas: es la del terreno, no se modifica. */
  pendienteAnclada: number
}

/**
 * Perfil continuo y suave de una vía: promedio móvil de las cotas del terreno (ventana en metros, que se achica hacia los extremos para no sesgarlos)
 * y luego pendiente limitada a `pendienteMax` (m por m). Las estaciones `ancladas` quedan con la cota del terreno tal cual.
 */
export function perfilSuave(alturas: number[], paso: number, ancladas: boolean[], ventana: number, pendienteMax: number): ResultadoPerfil {
  const n = alturas.length
  const mitad = Math.max(1, Math.round(ventana / paso / 2))
  const h = alturas.map((_, i) => {
    if (ancladas[i]) return alturas[i]
    const k = Math.min(mitad, i, n - 1 - i)
    let suma = 0
    for (let j = i - k; j <= i + k; j++) suma += alturas[j]
    return suma / (2 * k + 1)
  })
  const tope = pendienteMax * paso
  const limitar = (i: number, vecino: number) => {
    if (!ancladas[i]) h[i] = Math.min(h[vecino] + tope, Math.max(h[vecino] - tope, h[i]))
  }
  for (let ronda = 0; ronda < RONDAS; ronda++) {
    const antes = h.slice()
    for (let i = 1; i < n; i++) limitar(i, i - 1)
    for (let i = n - 2; i >= 0; i--) limitar(i, i + 1)
    if (h.every((v, i) => Math.abs(v - antes[i]) < 1e-9)) break
  }
  const pasos = h.slice(1).map((v, i) => ({ pendiente: Math.abs(v - h[i]) / paso, anclado: ancladas[i] && ancladas[i + 1] }))
  return {
    alturas: h,
    cumple: pasos.every((p) => p.anclado || p.pendiente <= pendienteMax + 1e-6),
    pendienteAnclada: Math.max(0, ...pasos.filter((p) => p.anclado).map((p) => p.pendiente)),
  }
}
