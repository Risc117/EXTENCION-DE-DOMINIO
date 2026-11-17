import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/entorno.json'
import { todasLasMedidas } from '../comun/medidas'
import { esquemaEntorno } from './esquema'

const datos = esquemaEntorno.parse(crudo)
const clon = () => structuredClone(crudo)

describe('datos/entorno.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    const medidas = todasLasMedidas(datos)
    expect(medidas.length).toBeGreaterThan(10)
    for (const m of medidas) expect(m.fuente.length).toBeGreaterThan(5)
    for (const e of datos.edificios) expect(e.fuentePoligono).toContain('.dxf')
  })
  it('trae los seis edificios, 71 árboles y el portón de 4.5 m', () => {
    expect(datos.edificios.map((e) => e.id).sort()).toEqual(['almacen-emergencia', 'almacen-taller', 'garita', 'grupo-electrogeno', 'laboratorio', 'oficina'])
    expect(datos.arboles.posiciones).toHaveLength(71)
    expect(datos.cerco.portones[0].ancho.valor).toBe(4.5)
    expect(Math.hypot(datos.cerco.portones[0].hasta.x - datos.cerco.portones[0].desde.x, datos.cerco.portones[0].hasta.y - datos.cerco.portones[0].desde.y)).toBeCloseTo(4.5, 6)
  })
  it('las alturas son de ejemplo y las medidas del dibujo no', () => {
    for (const e of datos.edificios) expect(e.altura.demo, e.id).toBe(true)
    expect(datos.cerco.altura.demo).toBe(true)
    expect(datos.arboles.alturaTotal.demo).toBe(true)
    expect(datos.arboles.radioCopa.demo).not.toBe(true)
    expect(datos.vias[0].ancho.demo).not.toBe(true)
    expect(datos.rotondas[0].radio.valor).toBe(5)
    expect(datos.rotondas[0].espesor.demo).toBe(true)
  })
  it('rechaza datos malos: sin fuente, polígono corto, altura negativa e ids repetidos', () => {
    const sin = clon()
    sin.edificios[0].altura.fuente = ''
    expect(esquemaEntorno.safeParse(sin).success).toBe(false)
    const corto = clon()
    corto.edificios[0].poligono = corto.edificios[0].poligono.slice(0, 2)
    expect(esquemaEntorno.safeParse(corto).success).toBe(false)
    const neg = clon()
    neg.edificios[0].altura.valor = -3
    expect(esquemaEntorno.safeParse(neg).success).toBe(false)
    const rep = clon()
    rep.edificios[1].id = rep.edificios[0].id
    expect(esquemaEntorno.safeParse(rep).success).toBe(false)
  })
})
