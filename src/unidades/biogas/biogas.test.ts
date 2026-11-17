import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/biogas.json'
import planta from '../../../datos/planta.json'
import { todasLasMedidas } from '../comun/medidas'
import { esquemaBiogas } from './esquema'
import { escalaLlama, perlasBiogas, rutaBiogas } from './geometria'

const datos = esquemaBiogas.parse(crudo)
const clon = () => structuredClone(crudo)

describe('datos/biogas.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    for (const m of todasLasMedidas(datos)) expect(m.fuente.length).toBeGreaterThan(10)
    expect(datos.fuente).toContain('.dxf')
  })
  it('las alturas y la altura de la línea son de ejemplo; lo medido del dibujo no', () => {
    expect(datos.antorcha.alturaChimenea.demo).toBe(true)
    expect(datos.antorcha.recinto.altura.demo).toBe(true)
    expect(datos.antorcha.llama.alturaMaxima.demo).toBe(true)
    expect(datos.linea.alturaSobreTerreno.demo).toBe(true)
    expect(datos.antorcha.radioSeguridad.demo).not.toBe(true)
    expect(datos.antorcha.radioSeguridad.valor).toBe(5)
    expect(datos.linea.diametro.demo).not.toBe(true)
  })
  it('la línea sale junto al RAFA y llega a la antorcha (puntos del DXF)', () => {
    const rafa = (planta.unidades as { id: string; x: { valor: number }; y: { valor: number } }[]).find((u) => u.id === 'rafa')!
    const [ini, fin] = [datos.linea.trazado[0], datos.linea.trazado[datos.linea.trazado.length - 1]]
    expect(Math.hypot(ini.x - rafa.x.valor, ini.y - rafa.y.valor)).toBeLessThan(10)
    expect(Math.hypot(fin.x - datos.antorcha.centro.x, fin.y - datos.antorcha.centro.y)).toBeLessThan(0.5)
  })
  it('rechaza datos malos: sin fuente, altura negativa y un solo punto de línea', () => {
    const sin = clon()
    sin.antorcha.alturaChimenea.fuente = ''
    expect(esquemaBiogas.safeParse(sin).success).toBe(false)
    const neg = clon()
    neg.antorcha.alturaChimenea.valor = -5
    expect(esquemaBiogas.safeParse(neg).success).toBe(false)
    const uno = clon()
    uno.linea.trazado = [uno.linea.trazado[0]]
    expect(esquemaBiogas.safeParse(uno).success).toBe(false)
  })
})

describe('geometría de la línea y de la llama', () => {
  const ruta = rutaBiogas(datos.linea.trazado, () => 100, 90, 0.5)
  it('la ruta va del RAFA a la antorcha a la altura sobre el terreno, en la escena (x este, y arriba, z sur)', () => {
    expect(ruta.puntos).toHaveLength(datos.linea.trazado.length)
    expect(ruta.puntos[0]).toEqual([-18.02, 10.5, -2.83])
    expect(ruta.largo).toBeGreaterThan(30)
    expect(ruta.acumulado[0]).toBe(0)
  })
  it('las perlas están repartidas por la ruta y avanzan con el tiempo, dando la vuelta', () => {
    const a = perlasBiogas(ruta, 0, 10)
    const b = perlasBiogas(ruta, ruta.largo / 10 / 2, 10)
    expect(a).toHaveLength(10)
    expect(a[0]).toEqual(ruta.puntos[0])
    expect(b[0]).not.toEqual(a[0])
    expect(perlasBiogas(ruta, ruta.largo, 10)[0][0]).toBeCloseTo(a[0][0], 6)
  })
  it('la llama crece con el biogás, no pasa del doble del de diseño y se apaga sin biogás', () => {
    expect(escalaLlama(9.25, 9.25)).toBeCloseTo(1, 6)
    expect(escalaLlama(4.625, 9.25)).toBeCloseTo(0.5, 6)
    expect(escalaLlama(100, 9.25)).toBe(2)
    expect(escalaLlama(0, 9.25)).toBe(0)
  })
})
