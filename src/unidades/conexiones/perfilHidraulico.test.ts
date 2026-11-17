import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/perfil.json'
import { planta } from '../planta'
import { alturaTerreno } from '../comun/terrenoPlanta'
import { datos as conexiones, tramo } from './ayudaPruebas'
import { construirPerfil } from './perfilHidraulico'
import { esquemaPerfil, problemasCadena } from './perfilEsquema'

const cadena = esquemaPerfil.parse(crudo)
const perfil = construirPerfil(cadena, conexiones, planta, alturaTerreno)
const clon = () => structuredClone(crudo)

describe('datos/perfil.json', () => {
  it('es válido y recorre la línea de agua en orden: cada tramo empieza donde terminó el anterior o tras las unidades del hueco', () => {
    expect(problemasCadena(cadena, conexiones, planta.unidades.map((u) => u.id))).toEqual([])
  })
  it('incluye todos los tramos de agua residual, impulsión y efluente, menos los gemelos del segundo sedimentador', () => {
    const enCadena = new Set(cadena.cadena.filter((c) => c.tipo === 'tramo').map((c) => (c as { id: string }).id))
    const esperados = conexiones.tramos.filter((t) => ['agua-residual', 'impulsion', 'efluente'].includes(t.linea)).map((t) => t.id)
    for (const id of esperados) expect(enCadena.has(id) || cadena.gemelos.tramos.includes(id), id).toBe(true)
    for (const id of cadena.gemelos.tramos) expect(enCadena.has(id), id).toBe(false)
  })
  it('rechaza datos malos: sin tramos, una cadena que empieza con un hueco, un tramo que no existe y un hueco sin unidades', () => {
    const vacia = clon()
    vacia.cadena = []
    expect(esquemaPerfil.safeParse(vacia).success).toBe(false)
    const inexistente = clon()
    ;(inexistente.cadena[0] as { id: string }).id = 'T99'
    expect(problemasCadena(esquemaPerfil.parse(inexistente), conexiones, planta.unidades.map((u) => u.id)).length).toBeGreaterThan(0)
    const empiezaConHueco = clon()
    empiezaConHueco.cadena = [{ tipo: 'hueco', unidades: ['bombeo'] }, ...empiezaConHueco.cadena] as never
    expect(esquemaPerfil.safeParse(empiezaConHueco).success).toBe(false)
    const hueco = clon()
    hueco.cadena[1] = { tipo: 'hueco', unidades: [] } as never
    expect(esquemaPerfil.safeParse(hueco).success).toBe(false)
  })
})

describe('perfil hidráulico', () => {
  it('la línea parte de la cota de salida de la entrada y llega a la cota de llegada del río', () => {
    const tubos = perfil.segmentos.filter((s) => s.tipo === 'tubo')
    expect(tubos[0].puntos[0].cota).toBeCloseTo(tramo('T01').cotaSalida.valor, 6)
    const ultimo = tubos[tubos.length - 1].puntos
    expect(ultimo[ultimo.length - 1].cota).toBeCloseTo(tramo('T21').cotaLlegada.valor, 6)
  })
  it('la progresiva empieza en 0, nunca baja y el largo es el recorrido total (unos 237 m, cerca de los 231 m entre las progresivas 0+030 y 0+261 del plano)', () => {
    const todos = perfil.segmentos.flatMap((s) => s.puntos)
    expect(todos[0].s).toBe(0)
    todos.slice(1).forEach((p, i) => expect(p.s, `punto ${i + 1}`).toBeGreaterThanOrEqual(todos[i].s - 1e-9))
    expect(perfil.largo).toBeCloseTo(todos[todos.length - 1].s, 6)
    expect(perfil.largo).toBeCloseTo(237, 0)
  })
  it('cada unidad de la cadena trae su fondo y coronación de planta.json, dentro del largo, en orden', () => {
    const ids = cadena.cadena.flatMap((c) => (c.tipo === 'hueco' ? c.unidades : []))
    expect(perfil.unidades.map((u) => u.id)).toEqual(ids)
    for (const u of perfil.unidades) {
      const p = planta.unidades.find((x) => x.id === u.id)!
      expect(u.fondo).toBe(p.cotaFondo.valor)
      expect(u.corona).toBe(p.cotaCoronacion.valor)
      expect(u.hasta).toBeGreaterThanOrEqual(u.desde)
      expect(u.hasta).toBeLessThanOrEqual(perfil.largo + 1e-9)
    }
    for (let i = 1; i < perfil.unidades.length; i++) expect(perfil.unidades[i].desde).toBeGreaterThanOrEqual(perfil.unidades[i - 1].desde - 1e-9)
  })
  it('los buzones del recorrido traen su tapa de conexiones.json', () => {
    expect(perfil.buzones.map((b) => b.id)).toEqual(['BZ-1', 'BZ-2', 'BZ-3', 'BZ-4', 'BZ-5', 'BZ-6', 'BZ-7', 'BZ-8', 'BZ-9', 'BZ-10'])
    for (const b of perfil.buzones) {
      const punto = conexiones.puntos.find((q) => q.id === b.id)!
      const llega = conexiones.tramos.find((t) => t.hasta === b.id)!
      expect(b.tapa).toBe(punto.cotaTapa!.valor)
      // El buzón es de ejemplo si su tapa o la cota de la tubería que llega lo son.
      expect(b.demo, b.id).toBe(punto.cotaTapa!.demo === true || llega.cotaLlegada.demo === true)
    }
  })
  it('el terreno se toma del terreno levantado a lo largo del recorrido: la tubería va casi siempre enterrada, y nunca a más de 3 m sobre el suelo (las salidas de las unidades quedan sobre el terreno)', () => {
    expect(perfil.terreno.length).toBeGreaterThan(50)
    const porS = new Map(perfil.terreno.map((p) => [p.s.toFixed(4), p.cota]))
    const tubo = perfil.segmentos.filter((q) => q.tipo === 'tubo').flatMap((q) => q.puntos).filter((p) => porS.has(p.s.toFixed(4)))
    expect(tubo.length).toBeGreaterThan(50)
    for (const p of tubo) expect(p.cota - porS.get(p.s.toFixed(4))!, `s=${p.s.toFixed(1)}`).toBeLessThanOrEqual(3)
    const enterradas = tubo.filter((p) => p.cota <= porS.get(p.s.toFixed(4))!).length
    expect(enterradas / tubo.length).toBeGreaterThan(0.6)
    expect(perfil.cotaMinima).toBeLessThan(perfil.cotaMaxima)
  })
  it('lo que es de ejemplo queda marcado: las cotas de las tuberías son de ejemplo', () => {
    expect(perfil.hayEjemplo).toBe(true)
    expect(perfil.fuente).toContain('conexiones.json')
  })
})
