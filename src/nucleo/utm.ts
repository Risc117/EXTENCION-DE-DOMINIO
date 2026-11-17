const A = 6378137
const F = 1 / 298.257223563
const K0 = 0.9996
const FALSO_ESTE = 500000
const FALSO_NORTE_SUR = 10000000
/** Longitud del meridiano central de la zona UTM `zona` (°). */
const meridianoCentral = (zona: number): number => (zona - 1) * 6 - 180 + 3
const RAD = Math.PI / 180

/** Pasa una coordenada UTM (m) del hemisferio sur a latitud y longitud (° WGS84). */
export function utmSurAGeograficas(este: number, norte: number, zona: number): { latitud: number; longitud: number } {
  const e2 = F * (2 - F)
  const ep2 = e2 / (1 - e2)
  const x = este - FALSO_ESTE
  const y = norte - FALSO_NORTE_SUR
  const mu = y / K0 / (A * (1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256))
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))
  const phi1 = mu + ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) + ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) + ((151 * e1 ** 3) / 96) * Math.sin(6 * mu)
  const n1 = A / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2)
  const t1 = Math.tan(phi1) ** 2
  const c1 = ep2 * Math.cos(phi1) ** 2
  const r1 = (A * (1 - e2)) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5
  const d = x / (n1 * K0)
  const latitud = phi1 - ((n1 * Math.tan(phi1)) / r1) * (d ** 2 / 2 - ((5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * ep2) * d ** 4) / 24)
  const longitud = (d - ((1 + 2 * t1 + c1) * d ** 3) / 6) / Math.cos(phi1)
  return { latitud: latitud / RAD, longitud: meridianoCentral(zona) + longitud / RAD }
}
