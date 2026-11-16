import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/rafa.json'
import escala from '../../../datos/escalaCaudal.json'
import lineaCruda from '../../../datos/linea.json'
import { todasLasMedidas } from '../comun/medidas'
import { planta } from '../planta'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { esquemaRafa } from './esquema'
import { construirAguas, construirPiezas } from './geometria'
import { alturaInterior, alturaTotal, nivelAgua, retencionHoja, retencionPlano, volumenPlano } from './hidraulica'

const datos = esquemaRafa.parse(crudo)
const Qp = escala.caudalPromedio.valor
const Qmh = escala.caudalMaximoHorario.valor
const clon = () => structuredClone(crudo)
const piezasCon = (prefijo: string) => construirPiezas(datos).filter((p) => p.id.startsWith(prefijo))

describe('datos/rafa.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    const medidas = todasLasMedidas(datos)
    expect(medidas.length).toBeGreaterThan(40)
    for (const m of medidas) expect(m.fuente.length, String(m.valor)).toBeGreaterThan(5)
  })

  it('lo que el plano marca "por confirmar" o no trae queda como dato de ejemplo', () => {
    for (const m of [datos.cuerpo.alturaLaminaAgua, datos.cuerpo.alturaCanaleta, datos.cuerpo.bordoLibre, datos.losa.espesor, datos.losa.anchoTapa, datos.losa.alturaBaranda, datos.efluente.recoleccionSuperior, datos.efluente.recoleccionInferior, datos.lodos.ladoCajaMuestreo, datos.lodos.ladoCajaDescarga]) {
      expect(m.demo).toBe(true)
    }
  })

  it('rechaza un valor sin fuente, uno negativo, una unidad equivocada y un conteo con decimales', () => {
    const sinFuente = clon()
    sinFuente.cuerpo.anchoExterior = { valor: 5.7, unidad: 'm' } as typeof crudo.cuerpo.anchoExterior
    expect(esquemaRafa.safeParse(sinFuente).success).toBe(false)
    const negativo = clon()
    negativo.cuerpo.largoExterior.valor = -15.2
    expect(esquemaRafa.safeParse(negativo).success).toBe(false)
    const unidad = clon()
    unidad.hidraulica.retencionHoja.unidad = 'min' as 'h'
    expect(esquemaRafa.safeParse(unidad).success).toBe(false)
    const decimales = clon()
    decimales.sedimentacion.modulos.cantidad.valor = 7.5
    expect(esquemaRafa.safeParse(decimales).success).toBe(false)
  })

  it('rechaza medidas que no caben: muros anchos, deflector alto, módulos y tomas fuera', () => {
    const muros = clon()
    muros.cuerpo.espesorMuro.valor = 3
    expect(esquemaRafa.safeParse(muros).success).toBe(false)
    const deflector = clon()
    deflector.sedimentacion.alturaDeflector.valor = 2
    expect(esquemaRafa.safeParse(deflector).success).toBe(false)
    const modulos = clon()
    modulos.sedimentacion.modulos.largo.valor = 4
    expect(esquemaRafa.safeParse(modulos).success).toBe(false)
    const toma = clon()
    toma.lodos.alturasToma[3].valor = 4.5
    expect(esquemaRafa.safeParse(toma).success).toBe(false)
  })
})

describe('alturas y cota en datos/planta.json', () => {
  it('la altura interior es 6.65 m (0.15 + 0.30 + 0.40 + 1.80 + 4.00) y con el piso la total es 7.25 m', () => {
    expect(alturaInterior(datos)).toBeCloseTo(6.65, 6)
    expect(alturaTotal(datos)).toBeCloseTo(7.25, 6)
  })

  it('la coronación de planta.json es el fondo más la altura total, como dato de ejemplo', () => {
    const u = planta.unidades.find((x) => x.id === 'rafa')!
    expect(u.cotaFondo.valor).toBe(2978.4)
    expect(u.cotaCoronacion.valor - u.cotaFondo.valor).toBeCloseTo(alturaTotal(datos), 6)
    expect(u.cotaCoronacion.demo).toBe(true)
  })
})

describe('volumen y tiempo de retención', () => {
  it('con el volumen de la hoja (259.2 m³) el TR da 11.0 h, igual que datos/linea.json', () => {
    expect(retencionHoja(datos, Qp)).toBeCloseTo(11.0159, 3)
    const enLinea = (lineaCruda.nodos.find((n) => n.id === 'rafa') as { retencion: { valor: number } }).retencion.valor
    expect(retencionHoja(datos, Qp)).toBeCloseTo(enLinea, 3)
  })

  it('el volumen del plano sale de las medidas (4.50 × 14.00 × 4.00 = 252 m³) y su TR se muestra aparte', () => {
    expect(volumenPlano(datos)).toBeCloseTo(252, 6)
    expect(retencionPlano(datos, Qp)).toBeCloseTo(252 / (Qp * 3.6), 6)
    expect(retencionPlano(datos, Qp)).not.toBeCloseTo(retencionHoja(datos, Qp), 1)
  })

  it('sin caudal el TR no existe (no se divide entre cero)', () => {
    expect(retencionHoja(datos, 0)).toBe(Infinity)
    expect(retencionPlano(datos, 0)).toBe(Infinity)
  })

  it('cambiar un muro en el JSON cambia el volumen del plano', () => {
    const otro = clon()
    otro.cuerpo.espesorMuro.valor = 0.5
    expect(volumenPlano(esquemaRafa.parse(otro))).toBeGreaterThan(volumenPlano(datos))
  })
})

describe('nivel del agua', () => {
  it('sube con el caudal, con 6.10 m sin caudal y 6.50 m (bordo libre de 0.15 m) a Qmh', () => {
    expect(nivelAgua(datos, 0, Qmh)).toBeCloseTo(6.1, 6)
    expect(nivelAgua(datos, Qp, Qmh)).toBeGreaterThan(nivelAgua(datos, 0, Qmh))
    expect(nivelAgua(datos, Qmh, Qmh)).toBeCloseTo(6.5, 6)
    expect(nivelAgua(datos, Qp, Qmh)).toBeLessThan(nivelAgua(datos, Qmh, Qmh))
  })

  it('nunca pasa del bordo libre, aunque el caudal se dispare', () => {
    expect(nivelAgua(datos, 10 * Qmh, Qmh)).toBeLessThanOrEqual(alturaInterior(datos) - datos.cuerpo.bordoLibre.valor + 1e-9)
  })

  it('el agua dibujada llega a ese nivel, sobre el piso', () => {
    const a = construirAguas(datos, Qp, Qmh).find((x) => x.id === 'agua-digestor')!
    expect(a.y0).toBeCloseTo(datos.cuerpo.espesorPiso.valor, 6)
    expect(a.nivel).toBeCloseTo(nivelAgua(datos, Qp, Qmh), 6)
  })
})

describe('geometría armada desde el JSON', () => {
  it('el cuerpo mide 5.70 × 15.20 m por fuera y los muros 0.60 m', () => {
    const muroOeste = piezasCon('muro-oeste')[0]
    const muroNorte = piezasCon('muro-norte')[0]
    if (muroOeste.forma !== 'caja' || muroNorte.forma !== 'caja') throw new Error('Los muros son cajas')
    expect(muroNorte.tam[0]).toBeCloseTo(15.2, 6)
    expect(muroOeste.tam[2]).toBeCloseTo(5.7, 6)
    expect(muroNorte.tam[2]).toBeCloseTo(0.6, 6)
    expect(muroNorte.tam[1]).toBeCloseTo(alturaInterior(datos), 6)
  })

  it('hay 8 módulos con 3 canaletas cada uno, 22 ramales, 6 tubos de fondo y 4 tomas de lodo', () => {
    expect(piezasCon('modulo-')).toHaveLength(8)
    expect(piezasCon('canaleta-')).toHaveLength(24)
    expect(piezasCon('ramal-')).toHaveLength(22)
    expect(piezasCon('tubo-fondo-')).toHaveLength(6)
    expect(piezasCon('toma-lodo-')).toHaveLength(4)
  })

  it('los tubos de fondo van cada 2.00 m y las tomas a 0.30, 0.80, 1.30 y 1.80 m del piso', () => {
    const x = piezasCon('tubo-fondo-').map((p) => p.pos[0])
    for (let i = 1; i < x.length; i++) expect(x[i] - x[i - 1]).toBeCloseTo(2, 6)
    const y = piezasCon('toma-lodo-').map((p) => p.pos[1] - datos.cuerpo.espesorPiso.valor)
    expect(y).toEqual([0.3, 0.8, 1.3, 1.8].map((v) => expect.closeTo(v, 6)))
  })

  it('los muros son de concreto opaco: sin opacidad propia', () => {
    for (const p of piezasCon('muro-')) expect(p.opacidad ?? 1).toBe(1)
  })

  it('cambiar una medida en el JSON cambia la pieza, sin tocar código', () => {
    const otro = clon()
    otro.cuerpo.anchoExterior.valor = 6.2
    otro.sedimentacion.modulos.cantidad.valor = 4
    const d = esquemaRafa.parse(otro)
    const muro = construirPiezas(d).find((p) => p.id.startsWith('muro-oeste'))!
    if (muro.forma !== 'caja') throw new Error('Los muros son cajas')
    expect(muro.tam[2]).toBeCloseTo(6.2, 6)
    expect(construirPiezas(d).filter((p) => p.id.startsWith('modulo-'))).toHaveLength(4)
  })
})

describe('cotas y etiquetas', () => {
  it('las cotas dicen las medidas del plano y la altura interior sale de la suma (6.65 m)', () => {
    const textos = construirCotas(datos).map((c) => c.texto)
    expect(textos).toContain('Largo exterior = 15.20 m')
    expect(textos).toContain('Ancho exterior = 5.70 m')
    expect(textos.some((t) => t.startsWith('Altura interior = 6.65 m'))).toBe(true)
  })

  it('muestra aparte el TR de la hoja y el del plano, y marca el nivel del agua como dato de ejemplo', () => {
    const et = construirEtiquetas(datos, nivelAgua(datos, Qp, Qmh), retencionHoja(datos, Qp), retencionPlano(datos, Qp))
    expect(et.find((e) => e.id === 'et-tr-hoja')!.texto).toBe('TR (hoja) = 11.0 h')
    expect(et.find((e) => e.id === 'et-tr-plano')!.texto).toBe('TR (plano) = 10.7 h')
    expect(et.find((e) => e.id === 'et-nivel')!.texto).toContain('(ej.)')
  })

  it('sin caudal el TR dice "sin caudal" en vez de infinito', () => {
    const et = construirEtiquetas(datos, 6.1, Infinity, Infinity)
    expect(et.find((e) => e.id === 'et-tr-hoja')!.texto).toContain('sin caudal')
  })
})
