// Uso: npm run planta   (se corre a mano; pone en datos/planta.json la posición x, y de cada unidad según los rótulos del plano)
import { readFileSync, writeFileSync } from 'node:fs'
import { leerPlano, leerRotulos, type Rotulo } from './leerPlano.ts'
import { ORIGEN_UTM } from './origen.ts'
import { ZONA_PLANTA } from './zona.ts'

const PLANO = 'insumos/DFX/LUGAR PROYECTADO FINAL MEJORADO.dxf'
const CAPA = 'PTAR-TEXTO'
const SALIDA = 'datos/planta.json'

/** Rótulo del plano que marca cada unidad. */
const ROTULOS: Record<string, string> = {
  rejas: 'PRETRATAMIENTO',
  homogeneizador: 'HOMOGENIZADOR',
  rafa: 'RAFA',
  percolador: 'FILTRO PERCOLADOR',
  'sedimentador-1': 'SED. SECUNDARIO 1',
  'sedimentador-2': 'SED. SECUNDARIO 2',
  'camara-contacto': 'CAMARA DE CONTACTO',
  'lechos-secado': 'LECHOS DE SECADO (AREA DE LODOS)',
}
/** El plano solo rotula el pretratamiento como un bloque: las otras dos unidades siguen en fila hacia el norte (separación de ejemplo, m). */
const PRETRATAMIENTO = { desarenador: 8, parshall: 16 }

const redondear = (n: number): number => Math.round(n * 10) / 10
const buscar = (rotulos: Rotulo[], texto: string): Rotulo => {
  const r = rotulos.find((x) => x.texto === texto)
  if (!r) throw new Error(`No encuentro el rótulo "${texto}" en la capa ${CAPA}`)
  return r
}
const medida = (valor: number, fuente: string, demo: boolean) => ({ valor: redondear(valor), unidad: 'm', fuente, ...(demo ? { demo: true } : {}) })

const rotulos = leerRotulos(leerPlano(PLANO), CAPA, ZONA_PLANTA)
const planta = JSON.parse(readFileSync(SALIDA, 'utf8'))
const origen = `x, y = UTM − origen (${ORIGEN_UTM.este}, ${ORIGEN_UTM.norte}, zona ${ORIGEN_UTM.zona}) de datos/terreno.json`

for (const u of planta.unidades as { id: string; x: unknown; y: unknown }[]) {
  const texto = ROTULOS[u.id]
  const extra = PRETRATAMIENTO[u.id as keyof typeof PRETRATAMIENTO]
  const r = buscar(rotulos, texto ?? ROTULOS.rejas)
  const fuente = `${PLANO}, capa ${CAPA}, rótulo "${r.texto}" (punto del rótulo, junto a la estructura; ${origen})`
  const fuenteFila = `${fuente}; separación en fila de ejemplo (${extra} m hacia el norte), el plano no separa estas unidades`
  u.x = medida(r.x - ORIGEN_UTM.este, extra === undefined ? fuente : fuenteFila, extra !== undefined)
  u.y = medida(r.y - ORIGEN_UTM.norte + (extra ?? 0), extra === undefined ? fuente : fuenteFila, extra !== undefined)
}
planta.fuente = `${PLANO} (posiciones de los rótulos de ${CAPA}); cotas de fondo y coronación medidas del dibujo del perfil del mismo DXF (±0.2 m aprox., por confirmar) o derivadas del terreno y de la hoja de cálculo; los tamaños de las cajas siguen de ejemplo`
writeFileSync(SALIDA, JSON.stringify(planta, null, 2) + '\n')
console.log(`${SALIDA}: ${planta.unidades.length} unidades ubicadas`)
