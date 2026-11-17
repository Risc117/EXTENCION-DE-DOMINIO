import { describe, expect, it } from 'vitest'
import conexionesCrudas from '../../../datos/conexiones.json'
import crudo from '../../../datos/percolador.json'
import { planta } from '../planta'
import { construirEtiquetas } from './anotaciones'
import { esquemaPercolador } from './esquema'
import { construirInterior } from './interior'
import { disponer } from './disposicion'
import { puertoEntrada } from './puertos'

const datos = esquemaPercolador.parse(crudo)
const s = disponer(datos)
const interior = construirInterior(datos)
const cilindro = (id: string) => {
  const p = interior.find((x) => x.id === id)!
  if (p.forma !== 'cilindro') throw new Error(`${id} debe ser un cilindro`)
  return p
}
const u = planta.unidades.find((x) => x.id === 'percolador')!
const radioTubo = datos.entrada.diametro.valor / 2

describe('T16.4 · entrada del percolador (perfil real)', () => {
  it('la altura del eje sale del perfil (2981.866 − fondo 2980.74 = 1.126 m) y no es de ejemplo', () => {
    expect(datos.entrada.altura.valor).toBeCloseTo(2981.866 - u.cotaFondo.valor, 3)
    expect(datos.entrada.altura.demo).not.toBe(true)
    expect(datos.entrada.altura.fuente).toContain('FLUJO-ENTRADA')
  })

  it('el tubo cruza el muro a esa altura, dentro de la cámara inferior (bajo el lecho y sobre la losa)', () => {
    const t = cilindro('tubo-entrada')
    expect(t.pos[1]).toBeCloseTo(datos.entrada.altura.valor, 6)
    expect(t.pos[1] - radioTubo).toBeGreaterThanOrEqual(s.yLosa)
    expect(t.pos[1] + radioTubo).toBeLessThanOrEqual(s.yCamara)
  })

  it('el tubo vertical sube desde el eje del tubo de entrada hasta la punta de la columna, sin huecos', () => {
    const v = cilindro('tubo-subida')
    expect(v.pos[1] - v.alto / 2).toBeCloseTo(datos.entrada.altura.valor - radioTubo, 6)
    expect(v.pos[1] + v.alto / 2).toBeCloseTo(s.yColumna, 6)
  })

  it('la flecha de la etiqueta de la entrada apunta a la altura del tubo', () => {
    const e = construirEtiquetas(datos, 6.5, 13, 30, false).find((x) => x.id === 'et-entrada')!
    expect(e.punta[1]).toBeCloseTo(datos.entrada.altura.valor, 6)
  })

  it('el extremo del tubo cae sobre la línea del DXF (T10) a menos de 10 cm y T10 termina ahí, a la cota del perfil', () => {
    const p = puertoEntrada(datos)
    const g = (u.giro.valor * Math.PI) / 180
    const mundo = { x: u.x.valor + p.x * Math.cos(g) + p.z * Math.sin(g), y: u.y.valor + p.x * Math.sin(g) - p.z * Math.cos(g) }
    const t10 = conexionesCrudas.tramos.find((t) => t.id === 'T10')!
    const fin = t10.trazado[t10.trazado.length - 1]
    expect(Math.hypot(fin.x - mundo.x, fin.y - mundo.y)).toBeLessThan(0.1)
    expect(t10.cotaLlegada.valor).toBeCloseTo(u.cotaFondo.valor + datos.entrada.altura.valor, 3)
  })
})
