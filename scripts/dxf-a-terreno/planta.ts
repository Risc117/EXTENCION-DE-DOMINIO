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
/** Las tres estructuras del pretratamiento van en una sola fila, tomada de datos/pretratamiento.json. */
const FILA = ['rejas', 'desarenador', 'parshall']
const RUTA_FILA = 'datos/pretratamiento.json'
/** EB-1: centro del círculo doble (Ø 3.20 m y su muro) junto al rótulo, en esta capa. */
const CAPA_CARCAMO = 'PTAR-ESTRUCTURAS'
const CAPA_TUBERIA = 'PTAR-TUBERIA'
const ROTULO_EB1 = 'ESTACION DE BOMBEO EB-1'
/** Radio (m) del círculo interior del cárcamo y distancia máxima (m) de ese círculo al rótulo. */
const RADIO_CARCAMO = 1.6
const DISTANCIA_MAXIMA_ROTULO = 15

const redondear = (n: number, decimales: number): number => Math.round(n * 10 ** decimales) / 10 ** decimales
const buscar = (rotulos: Rotulo[], texto: string): Rotulo => {
  const r = rotulos.find((x) => x.texto === texto)
  if (!r) throw new Error(`No encuentro el rótulo "${texto}" en la capa ${CAPA}`)
  return r
}
/** Los rótulos se redondean a 0.1 m; el cárcamo y la fila del pretratamiento, de geometría medida, a 0.01 m. */
const medida = (valor: number, fuente: string, demo: boolean, decimales = 1) => ({ valor: redondear(valor, decimales), unidad: 'm', fuente, ...(demo ? { demo: true } : {}) })

const entidades = leerPlano(PLANO)
const rotulos = leerRotulos(entidades, CAPA, ZONA_PLANTA)
const planta = JSON.parse(readFileSync(SALIDA, 'utf8'))
const origen = `x, y = UTM − origen (${ORIGEN_UTM.este}, ${ORIGEN_UTM.norte}, zona ${ORIGEN_UTM.zona}) de datos/terreno.json`

type Plana = { type: string; layer?: string; radius?: number; center?: { x: number; y: number }; vertices?: { x: number; y: number }[] }
const planas = entidades as unknown as Plana[]

/** EB-1: el círculo de 1.6 m de radio más cercano al rótulo, y la dirección de la tubería que sale de él hacia el pretratamiento. */
function carcamo(): { x: number; y: number; giro: number } {
  const rotulo = buscar(rotulos, ROTULO_EB1)
  const circulos = planas.filter((e) => e.type === 'CIRCLE' && e.layer === CAPA_CARCAMO && e.center && Math.abs((e.radius ?? 0) - RADIO_CARCAMO) < 1e-6)
  const distancia = (c: { x: number; y: number }) => Math.hypot(c.x - rotulo.x, c.y - rotulo.y)
  const centro = circulos.map((c) => c.center!).sort((a, b) => distancia(a) - distancia(b))[0]
  if (!centro || distancia(centro) > DISTANCIA_MAXIMA_ROTULO) throw new Error(`No encuentro el círculo doble del cárcamo junto a "${ROTULO_EB1}"`)
  const tuberia = planas.find((e) => e.type === 'LWPOLYLINE' && e.layer === CAPA_TUBERIA && e.vertices?.some((v) => Math.hypot(v.x - centro.x, v.y - centro.y) < 0.5))
  const i = tuberia?.vertices?.findIndex((v) => Math.hypot(v.x - centro.x, v.y - centro.y) < 0.5) ?? -1
  const siguiente = tuberia?.vertices?.[i + 1]
  if (!siguiente) throw new Error('No encuentro la tubería de impulsión que sale del cárcamo')
  return { x: centro.x, y: centro.y, giro: (Math.atan2(siguiente.y - centro.y, siguiente.x - centro.x) * 180) / Math.PI }
}

const fila = JSON.parse(readFileSync(RUTA_FILA, 'utf8'))
const nombreFila = (v: { valor: number }): number => v.valor
const g = (nombreFila(fila.giro) * Math.PI) / 180

for (const u of planta.unidades as { id: string; x: unknown; y: unknown; giro: unknown }[]) {
  if (u.id === 'bombeo') {
    const c = carcamo()
    const fuente = `${PLANO}, capa ${CAPA_CARCAMO}, centro del círculo doble (radios 1.6 y 1.25 m) junto al rótulo "${ROTULO_EB1}" (${origen})`
    u.x = medida(c.x - ORIGEN_UTM.este, fuente, false, 2)
    u.y = medida(c.y - ORIGEN_UTM.norte, fuente, false, 2)
    u.giro = { ...medida(c.giro, `${PLANO}, capa ${CAPA_TUBERIA}: dirección de la tubería que sale del cárcamo hacia el pretratamiento; el eje de la caseta y de la impulsión apunta así`, false, 2), unidad: 'grados' }
    continue
  }
  if (FILA.includes(u.id)) {
    const t = (fila.tramos as { id: string; desde: { valor: number }; hasta: { valor: number } }[]).find((x) => x.id === u.id)!
    const centro = (nombreFila(t.desde) + nombreFila(t.hasta)) / 2
    const fuente = `${RUTA_FILA}: centro del tramo "${u.id}" de la fila continua (ESTRUCTURAS2.dxf, vista en planta) sobre el mapa general (${PLANO}, capa PTAR-ESTRUCTURAS)`
    u.x = medida(nombreFila(fila.anclaje.x) + centro * Math.cos(g), fuente, false, 2)
    u.y = medida(nombreFila(fila.anclaje.y) + centro * Math.sin(g), fuente, false, 2)
    u.giro = { ...medida(nombreFila(fila.giro), `${RUTA_FILA}: dirección del flujo de la fila del pretratamiento`, false, 2), unidad: 'grados' }
    continue
  }
  const r = buscar(rotulos, ROTULOS[u.id])
  const fuente = `${PLANO}, capa ${CAPA}, rótulo "${r.texto}" (punto del rótulo, junto a la estructura; ${origen})`
  u.x = medida(r.x - ORIGEN_UTM.este, fuente, false)
  u.y = medida(r.y - ORIGEN_UTM.norte, fuente, false)
}
planta.fuente = `${PLANO} (posiciones de los rótulos de ${CAPA}, del círculo del cárcamo EB-1 y de la fila del pretratamiento); cotas de fondo y coronación medidas del dibujo del perfil del mismo DXF (±0.2 m aprox., por confirmar) o derivadas del terreno y de la hoja de cálculo; los tamaños de las cajas siguen de ejemplo`
writeFileSync(SALIDA, JSON.stringify(planta, null, 2) + '\n')
console.log(`${SALIDA}: ${planta.unidades.length} unidades ubicadas`)
