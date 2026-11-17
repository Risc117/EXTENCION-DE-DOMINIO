import { create } from 'zustand'

/** Cantidades por día de biogás y lodo del RAFA con el caudal en vivo. */
export interface ProduccionVivo {
  biogasM3dia: number
  biogasM3h: number
  /** Sólidos del lodo (kg SST/d). */
  lodoKgDia: number
  /** Volumen del lodo húmedo y del deshidratado (m3/d). */
  lodoHumedoM3dia: number
  lodoDeshidratadoM3dia: number
}

/** Lo fijo de la línea de lodos: de dónde salen los porcentajes y los lechos de secado. */
export interface DatosLodosVivo {
  concentracionHumedo: number
  concentracionDeshidratado: number
  lechosAreaM2: number
  lechosCicloDias: number
  /** Biogás al caudal de diseño (m3/h): la llama y las perlas se miden contra él. */
  biogasDisenoM3h: number
  /** true si el volumen del lodo es un cálculo corregido del Excel (Dato de ejemplo). */
  volumenEsEjemplo: boolean
}

interface EstadoLodosBiogas {
  produccion: ProduccionVivo | null
  datos: DatosLodosVivo | null
  publicarProduccion: (p: ProduccionVivo) => void
  publicarDatos: (d: DatosLodosVivo) => void
}

/** La simulación publica aquí lodo y biogás por día; la escena y la interfaz los leen. */
export const useLodosBiogas = create<EstadoLodosBiogas>((set) => ({
  produccion: null,
  datos: null,
  publicarProduccion: (produccion) => set({ produccion }),
  publicarDatos: (datos) => set({ datos }),
}))
