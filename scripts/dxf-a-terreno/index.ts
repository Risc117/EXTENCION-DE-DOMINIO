// Uso: npm run terreno   (se corre a mano; lee el DXF y escribe datos/terreno.json)
import { writeFileSync } from 'node:fs'
import { leerCurvas, type CurvaUtm } from './leerCurvas.ts'
import { crearMalla } from './malla.ts'
import { ORIGEN_UTM } from './origen.ts'
import { leerPlano, leerTrazoMuro } from './leerPlano.ts'
import { ZONA_PLANTA } from './zona.ts'
import { simplificar } from './simplificar.ts'

const ENTRADA = 'insumos/DFX/ZAPATITODECOTAS.dxf'
const PLANO = 'insumos/DFX/LUGAR PROYECTADO FINAL MEJORADO.dxf'
const SALIDA = 'datos/terreno.json'
/** Tamaño de celda (m) de la malla y desvío máximo (m) al simplificar las curvas dibujadas. */
const PASO_MALLA = 3
const TOLERANCIA_CURVAS = 0.3
/** Espesor leído del rótulo del plano y altura de ejemplo (el plano no trae la altura). */
const ESPESOR_MURO = 0.3
const ALTURA_MURO_EJEMPLO = 2

const redondear = (n: number, decimales: number): number => Math.round(n * 10 ** decimales) / 10 ** decimales
const aLocal = (p: [number, number]): [number, number] => [redondear(p[0] - ORIGEN_UTM.este, 1), redondear(p[1] - ORIGEN_UTM.norte, 1)]

const curvas: CurvaUtm[] = leerCurvas(ENTRADA)
const malla = crearMalla(curvas, PASO_MALLA)
const cotaBase = Math.floor(Math.min(...curvas.map((c) => c.cota)))
const trazo = leerTrazoMuro(leerPlano(PLANO), 'PTAR-MURO', ZONA_PLANTA).map(aLocal)
const fuente = `${ENTRADA}, capas Contour_Line_Minor, Contour_Line_Intermediate y Contour_Line_Major (cota = Z de cada vértice)`

const datos = {
  fuente,
  origenUtm: { este: ORIGEN_UTM.este, norte: ORIGEN_UTM.norte, zona: ORIGEN_UTM.zona, fuente: 'Centro de la planta según los rótulos de LUGAR PROYECTADO FINAL MEJORADO.dxf, redondeado a 10 m' },
  cotaBase: { valor: cotaBase, unidad: 'm', fuente },
  malla: {
    fuente: `${fuente}; triangulación de Delaunay llevada a una cuadrícula`,
    paso: PASO_MALLA,
    columnas: malla.columnas,
    filas: malla.filas,
    x0: malla.x0 - ORIGEN_UTM.este,
    y0: malla.y0 - ORIGEN_UTM.norte,
    /** Altura de cada nodo sobre cotaBase (m), de oeste a este y de sur a norte. */
    alturas: malla.alturas.map((h) => redondear(h - cotaBase, 1)),
  },
  muro: {
    fuente: `${PLANO}, capa PTAR-MURO (cara exterior); espesor del rótulo "MURO DE CONTENCION H.A. e=0.30 m"`,
    espesor: { valor: ESPESOR_MURO, unidad: 'm', fuente: `${PLANO}, capa PTAR-TEXTO, rótulo "MURO DE CONTENCION H.A. e=0.30 m"` },
    altura: { valor: ALTURA_MURO_EJEMPLO, unidad: 'm', fuente: 'Altura de ejemplo: el plano no la indica; reemplazar con el corte del muro', demo: true },
    trazo,
  },
  curvas: curvas.map((c) => ({ cota: c.cota, tipo: c.tipo, puntos: simplificar(c.puntos.map(aLocal), TOLERANCIA_CURVAS) })),
}

writeFileSync(SALIDA, JSON.stringify(datos))
console.log(`${SALIDA}: ${curvas.length} curvas, malla ${malla.columnas}x${malla.filas}, cotas desde ${cotaBase} m`)
