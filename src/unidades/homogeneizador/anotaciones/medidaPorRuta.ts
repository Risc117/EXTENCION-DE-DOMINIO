export interface MedidaLeida {
  valor: number
  demo: boolean
}

/** Busca en los datos una medida por su ruta ("tanque.diametroInterior"). Devuelve null si la ruta no lleva a una medida. */
export function medidaPorRuta(datos: unknown, ruta: string): MedidaLeida | null {
  let actual: unknown = datos
  for (const clave of ruta.split('.')) {
    if (typeof actual !== 'object' || actual === null || !Object.hasOwn(actual, clave)) return null
    actual = (actual as Record<string, unknown>)[clave]
  }
  if (typeof actual !== 'object' || actual === null) return null
  const { valor, demo } = actual as { valor?: unknown; demo?: unknown }
  return typeof valor === 'number' ? { valor, demo: demo === true } : null
}

/** Igual que medidaPorRuta, pero falla si no existe (el esquema ya lo garantiza al cargar los datos). */
export function leerMedida(datos: unknown, ruta: string): MedidaLeida {
  const m = medidaPorRuta(datos, ruta)
  if (!m) throw new Error(`No hay una medida en la ruta "${ruta}"`)
  return m
}
