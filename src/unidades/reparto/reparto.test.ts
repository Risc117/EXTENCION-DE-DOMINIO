import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/camaraReparto.json'
import conexionesCrudas from '../../../datos/conexiones.json'
import { todasLasMedidas } from '../comun/medidas'
import { planta } from '../planta'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { alturaTotal, esquemaReparto } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

const datos = esquemaReparto.parse(crudo)

describe('cámara de reparto', () => {
  it('el largo y el ancho son las del cuadrado del mapa general (2.4 × 2.4 m) y no son de ejemplo; la altura, el muro y el nivel sí, y todas traen fuente', () => {
    const { largo, ancho, alto, espesorMuro, nivelAgua } = datos.caja
    expect([largo.valor, ancho.valor]).toEqual([2.4, 2.4])
    for (const m of [largo, ancho]) {
      expect(m.demo).not.toBe(true)
      expect(m.fuente).toContain('PTAR-ESTRUCTURAS')
    }
    for (const m of [alto, espesorMuro, nivelAgua]) expect(m.demo).toBe(true)
    expect(alto.fuente).toContain('derivado')
    for (const m of todasLasMedidas(datos)) expect(m.fuente.length).toBeGreaterThan(5)
  })

  it('los tubos T12 y T13 de conexiones.json llegan a sus paredes oeste y este (menos de 5 cm)', () => {
    const u = planta.unidades.find((x) => x.id === 'camara-reparto')!
    const t12 = conexionesCrudas.tramos.find((t) => t.id === 'T12')!
    const t13 = conexionesCrudas.tramos.find((t) => t.id === 'T13')!
    expect(Math.abs(t12.trazado[t12.trazado.length - 1].x - (u.x.valor - datos.caja.largo.valor / 2))).toBeLessThan(0.05)
    expect(Math.abs(t13.trazado[0].x - (u.x.valor + datos.caja.largo.valor / 2))).toBeLessThan(0.05)
  })

  it('rechaza un nivel de agua más alto que la caja y un valor negativo', () => {
    const alto = structuredClone(crudo)
    alto.caja.nivelAgua.valor = 2
    expect(esquemaReparto.safeParse(alto).success).toBe(false)
    const neg = structuredClone(crudo)
    neg.caja.largo.valor = -1
    expect(esquemaReparto.safeParse(neg).success).toBe(false)
  })

  it('está en planta.json en el centro de su cuadrado del mapa general, con fondo y coronación de ejemplo', () => {
    const u = planta.unidades.find((x) => x.id === 'camara-reparto')!
    expect([u.x.valor, u.y.valor]).toEqual([4, 49.5])
    expect(u.x.fuente).toContain('centro del cuadrado')
    expect(u.cotaCoronacion.valor - u.cotaFondo.valor).toBeCloseTo(alturaTotal(datos), 6)
    expect(u.cotaFondo.demo).toBe(true)
  })

  it('se arma desde el JSON y su agua va al nivel del JSON', () => {
    expect(construirPiezas(datos).length).toBeGreaterThanOrEqual(5)
    const agua = construirAguas(datos)[0]
    expect(agua.nivel).toBeCloseTo(0.8, 6)
    const otro = structuredClone(crudo)
    otro.caja.nivelAgua.valor = 0.5
    expect(construirAguas(esquemaReparto.parse(otro))[0].nivel).toBeCloseTo(0.5, 6)
  })

  it('el texto del reparto sale de la fracción de linea.json: 0.5 dice Q/2, 0.25 dice Q/4 y 0.4 dice 0.4·Q', () => {
    const texto = (f: number) => construirEtiquetas(datos, 10, f).find((e) => e.id === 'et-reparto-caudal')!.texto
    expect(texto(0.5)).toContain('(Q/2)')
    expect(texto(0.25)).toContain('(Q/4)')
    expect(texto(0.4)).toContain('(0.4·Q)')
    expect(texto(0.25)).toContain('2.50')
  })

  it('dice que reparte Q/2 a cada sedimentador, con "(ej.)", y tiene sus cotas', () => {
    const t = construirEtiquetas(datos, 6.536, 0.5).map((e) => e.texto)
    expect(t.some((x) => x.includes('3.27') && x.includes('(ej.)'))).toBe(true)
    expect(construirCotas(datos).map((c) => c.texto)).toContain('Largo = 2.40 m')
    expect(construirCotas(datos).map((c) => c.texto)).toContain('Ancho = 2.40 m')
  })
})
