/** Carga (kg/d) de una concentración (mg/L) con un caudal (L/s): mg/L × L/s × 86 400 s/d ÷ 10⁶. */
export const cargaKgDia = (mgPorL: number, litrosPorSegundo: number): number => mgPorL * litrosPorSegundo * 0.0864
