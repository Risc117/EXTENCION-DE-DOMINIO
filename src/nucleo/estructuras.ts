/** Id de la estructura siguiente (paso 1) o anterior (paso −1) en el orden de la planta, dando la vuelta; desde la vista general (o un foco desconocido) va a la primera o a la última; null si no hay estructuras. */
export function estructuraVecina(ids: string[], actual: string | null, paso: 1 | -1): string | null {
  if (ids.length === 0) return null
  const i = actual === null ? -1 : ids.indexOf(actual)
  if (i === -1) return paso === 1 ? ids[0] : ids[ids.length - 1]
  return ids[(i + paso + ids.length) % ids.length]
}
