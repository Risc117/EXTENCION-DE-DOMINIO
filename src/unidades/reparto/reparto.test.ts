import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/camaraReparto.json'
import { todasLasMedidas } from '../comun/medidas'
import { planta } from '../planta'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { alturaTotal, esquemaReparto } from './esquema'
import { construirAguas, construirPiezas } from './geometria'

const datos = esquemaReparto.parse(crudo)

describe('cámara de reparto', () => {
  it('todas sus medidas son de ejemplo y traen fuente', () => {
    for (const m of todasLasMedidas(datos)) {
      expect(m.demo).toBe(true)
      expect(m.fuente.length).toBeGreaterThan(5)
    }
  })

  it('rechaza un nivel de agua más alto que la caja y un valor negativo', () => {
    const alto = structuredClone(crudo)
    alto.caja.nivelAgua.valor = 2
    expect(esquemaReparto.safeParse(alto).success).toBe(false)
    const neg = structuredClone(crudo)
    neg.caja.largo.valor = -1
    expect(esquemaReparto.safeParse(neg).success).toBe(false)
  })

  it('está en planta.json en el rótulo del mapa general, con fondo y coronación de ejemplo', () => {
    const u = planta.unidades.find((x) => x.id === 'camara-reparto')!
    expect([u.x.valor, u.y.valor]).toEqual([-16.5, 49.5])
    expect(u.x.fuente).toContain('CAMARA DE REPARTO')
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
    expect(construirCotas(datos).map((c) => c.texto)).toContain('Largo = 2.00 m (ej.)')
  })
})
