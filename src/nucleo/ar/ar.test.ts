import { describe, expect, it } from 'vitest'
import { esquemaAR, datosAR } from './datos'
import { siguienteFase } from './fase'
import { aMundo, escalaMaqueta } from './maqueta'
import { posicionDeMatriz, rayoDeMatriz } from './hit'
import { soportaAR } from './soporte'

describe('escala de la maqueta', () => {
  it('da el ancho pedido: 0.8 m para una planta de 250 m', () => {
    expect(escalaMaqueta(0.8, 250)).toBeCloseTo(0.0032, 9)
    expect(250 * escalaMaqueta(0.8, 250)).toBeCloseTo(0.8, 9)
  })
  it('una extensión en cero o negativa falla con un mensaje claro', () => {
    expect(() => escalaMaqueta(0.8, 0)).toThrow(/extensión/)
  })
})

describe('dónde cae un punto de la planta en la maqueta', () => {
  const colocacion = { origen: [1, 0.7, -2] as [number, number, number], centro: [10, 5, -20] as [number, number, number], escala: 0.01 }
  it('el centro de la planta cae en el punto tocado (en el piso)', () => {
    const [x, , z] = aMundo([10, 5, -20], colocacion)
    expect(x).toBeCloseTo(1, 9)
    expect(z).toBeCloseTo(-2, 9)
  })
  it('un punto a 100 m al este queda a 100 × escala del centro', () => {
    const [x, , z] = aMundo([110, 5, -20], colocacion)
    expect(x - 1).toBeCloseTo(100 * 0.01, 9)
    expect(z).toBeCloseTo(-2, 9)
  })
  it('la altura se mide desde el piso tocado, escalada', () => {
    expect(aMundo([10, 0, -20], colocacion)[1]).toBeCloseTo(0.7, 9)
    expect(aMundo([10, 30, -20], colocacion)[1]).toBeCloseTo(0.7 + 0.3, 9)
  })
})

// Matrices de WebXR: 16 números por columnas.
const identidad = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
const giroY90 = [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 3, 4, 1]

describe('impactos y toques de WebXR', () => {
  it('la posición es la última columna de la matriz', () => {
    expect(posicionDeMatriz(giroY90)).toEqual([2, 3, 4])
    expect(posicionDeMatriz(identidad)).toEqual([0, 0, 0])
  })
  it('el rayo sale de la posición hacia −z de la matriz: sin giro mira a −z; girada 90° en Y mira a −x', () => {
    expect(rayoDeMatriz(identidad)).toEqual({ origen: [0, 0, 0], direccion: [0, 0, -1] })
    const r = rayoDeMatriz(giroY90)
    expect(r.origen).toEqual([2, 3, 4])
    expect(r.direccion[0]).toBeCloseTo(-1, 9)
    expect(r.direccion[2]).toBeCloseTo(0, 9)
  })
})

describe('fases de la colocación', () => {
  it('buscando → lista al encontrar una superficie, y lista → buscando si se pierde', () => {
    expect(siguienteFase('buscando', 'superficie')).toBe('lista')
    expect(siguienteFase('lista', 'sinSuperficie')).toBe('buscando')
  })
  it('tocar coloca solo si hay superficie lista', () => {
    expect(siguienteFase('lista', 'tocar')).toBe('colocada')
    expect(siguienteFase('buscando', 'tocar')).toBe('buscando')
  })
  it('ya colocada no cambia con superficies ni toques; "recolocar" vuelve a buscar', () => {
    expect(siguienteFase('colocada', 'superficie')).toBe('colocada')
    expect(siguienteFase('colocada', 'sinSuperficie')).toBe('colocada')
    expect(siguienteFase('colocada', 'tocar')).toBe('colocada')
    expect(siguienteFase('colocada', 'recolocar')).toBe('buscando')
  })
})

describe('soporte de AR (el botón se oculta si no hay)', () => {
  it('sin WebXR no hay AR', async () => {
    expect(await soportaAR(undefined)).toBe(false)
    expect(await soportaAR({})).toBe(false)
  })
  it('según lo que conteste el navegador', async () => {
    expect(await soportaAR({ isSessionSupported: async (m) => m === 'immersive-ar' })).toBe(true)
    expect(await soportaAR({ isSessionSupported: async () => false })).toBe(false)
  })
  it('si la pregunta falla no hay AR (no rompe)', async () => {
    expect(await soportaAR({ isSessionSupported: async () => Promise.reject(new Error('no')) })).toBe(false)
  })
})

describe('datos de AR', () => {
  it('son Dato de ejemplo con fuente y el ancho de la maqueta es de 0.8 m', () => {
    for (const m of [datosAR.anchoMaqueta, datosAR.planoCercano, datosAR.planoLejano]) {
      expect(m.demo).toBe(true)
      expect(m.fuente).toContain('No está en las fuentes')
    }
    expect(datosAR.anchoMaqueta.valor).toBe(0.8)
  })
  it('el esquema rechaza un plano cercano mayor que el lejano y un ancho en cero', () => {
    const a = structuredClone(datosAR)
    a.planoCercano.valor = 100
    expect(esquemaAR.safeParse(a).success).toBe(false)
    const b = structuredClone(datosAR)
    b.anchoMaqueta.valor = 0
    expect(esquemaAR.safeParse(b).success).toBe(false)
  })
})
