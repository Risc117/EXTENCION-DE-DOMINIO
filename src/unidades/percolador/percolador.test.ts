import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/percolador.json'
import escala from '../../../datos/escalaCaudal.json'
import { todasLasMedidas } from '../comun/medidas'
import { planta } from '../planta'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { esquemaPercolador } from './esquema'
import { construirAguas, construirBrazos, construirPiezas } from './geometria'
import { alturaTotal, cargaHidraulica, caidaLosa, nivelSalida, volumenPlano, velocidadGiro } from './hidraulica'

const datos = esquemaPercolador.parse(crudo)
const Qp = escala.caudalPromedio.valor
const Qmh = escala.caudalMaximoHorario.valor
const clon = () => structuredClone(crudo)
const con = (prefijo: string, d = datos) => construirPiezas(d).filter((p) => p.id.startsWith(prefijo))

describe('datos/percolador.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    const medidas = todasLasMedidas(datos)
    expect(medidas.length).toBeGreaterThan(25)
    for (const m of medidas) expect(m.fuente.length).toBeGreaterThan(5)
  })

  it('lo que no está en el plano ni en la hoja queda como dato de ejemplo', () => {
    const d = datos
    for (const m of [d.camaraInferior.anchoViga, d.camaraInferior.cantidadVigas, d.camaraInferior.cantidadVentanas, d.camaraInferior.alturaVentanaSobreLosa, d.distribuidor.alturaColumnaSobreLecho, d.distribuidor.alturaBrazoSobreLecho, d.distribuidor.vueltasPorMinuto, d.canal.ancho, d.canal.alto, d.salida.nivelMinimo, d.salida.nivelMaximo, d.agua.laminaMaxima]) {
      expect(m.demo).toBe(true)
    }
    for (const m of [d.cuerpo.diametroInterior, d.cuerpo.espesorMuro, d.lecho.altura, d.distribuidor.diametroColumna]) expect(m.demo).not.toBe(true)
  })

  it('rechaza valor sin fuente, negativo, unidad equivocada y conteo con decimales', () => {
    const sinFuente = clon()
    sinFuente.cuerpo.diametroInterior = { valor: 18.5, unidad: 'm' } as typeof crudo.cuerpo.diametroInterior
    expect(esquemaPercolador.safeParse(sinFuente).success).toBe(false)
    const negativo = clon()
    negativo.lecho.altura.valor = -2.5
    expect(esquemaPercolador.safeParse(negativo).success).toBe(false)
    const unidad = clon()
    unidad.distribuidor.vueltasPorMinuto.unidad = 'hz' as 'rpm'
    expect(esquemaPercolador.safeParse(unidad).success).toBe(false)
    const decimales = clon()
    decimales.distribuidor.cantidadBrazos.valor = 3.5
    expect(esquemaPercolador.safeParse(decimales).success).toBe(false)
  })

  it('rechaza medidas que no caben: vigas altas, ventanas, columna, un solo brazo y niveles al revés', () => {
    const vigas = clon()
    vigas.camaraInferior.alturaViga.valor = 1.5
    expect(esquemaPercolador.safeParse(vigas).success).toBe(false)
    const ventanas = clon()
    ventanas.camaraInferior.ladoVentana.valor = 1
    expect(esquemaPercolador.safeParse(ventanas).success).toBe(false)
    const columna = clon()
    columna.distribuidor.diametroColumna.valor = 19
    expect(esquemaPercolador.safeParse(columna).success).toBe(false)
    const brazos = clon()
    brazos.distribuidor.cantidadBrazos.valor = 1
    expect(esquemaPercolador.safeParse(brazos).success).toBe(false)
    const niveles = clon()
    niveles.salida.nivelMinimo.valor = 2
    expect(esquemaPercolador.safeParse(niveles).success).toBe(false)
  })
})

describe('alturas, cota y volúmenes', () => {
  it('la altura total es losa 0.50 + cámara 1.05 + lecho 2.50 = 4.05 m', () => {
    expect(alturaTotal(datos)).toBeCloseTo(4.05, 6)
  })

  it('la coronación de planta.json es el fondo más la altura total, como dato de ejemplo', () => {
    const u = planta.unidades.find((x) => x.id === 'percolador')!
    expect(u.cotaFondo.valor).toBe(2980.74)
    expect(u.cotaCoronacion.valor - u.cotaFondo.valor).toBeCloseTo(alturaTotal(datos), 6)
    expect(u.cotaCoronacion.demo).toBe(true)
  })

  it('el volumen del plano (≈ 672 m³) sale de las medidas y el de la hoja (684.3 m³) se muestra aparte', () => {
    expect(volumenPlano(datos)).toBeCloseTo(Math.PI * 9.25 ** 2 * 2.5, 6)
    expect(volumenPlano(datos)).toBeCloseTo(672, 0)
    expect(datos.hidraulica.volumenHoja.valor).toBeCloseTo(684.3, 1)
  })

  it('la pendiente de 1.5 por mil da 1.4 cm de caída hacia el canal central', () => {
    expect(caidaLosa(datos)).toBeCloseTo(0.0015 * 9.25, 6)
  })

  it('la carga hidráulica a Qp es Q / área (≈ 2.1 m³/m²·d con el diámetro del plano)', () => {
    expect(cargaHidraulica(datos, Qp)).toBeCloseTo((Qp * 86.4) / (Math.PI * 9.25 ** 2), 6)
    expect(cargaHidraulica(datos, 0)).toBe(0)
  })
})

describe('giro y agua según el caudal', () => {
  it('los brazos giran más rápido con más caudal y paran sin caudal', () => {
    expect(velocidadGiro(datos, 0, Qp)).toBe(0)
    expect(velocidadGiro(datos, Qp, Qp)).toBeCloseTo((1 * 2 * Math.PI) / 60, 9)
    expect(velocidadGiro(datos, Qmh, Qp)).toBeCloseTo(2 * velocidadGiro(datos, Qp, Qp), 9)
  })

  it('el nivel de la cámara de salida sube con el caudal y nunca pasa del máximo', () => {
    expect(nivelSalida(datos, 0, Qmh)).toBeCloseTo(0.3, 6)
    expect(nivelSalida(datos, Qmh, Qmh)).toBeCloseTo(1.2, 6)
    expect(nivelSalida(datos, Qp, Qmh)).toBeGreaterThan(0.3)
    expect(nivelSalida(datos, 10 * Qmh, Qmh)).toBeCloseTo(1.2, 6)
  })

  it('la lámina sobre el lecho crece con el caudal y la cámara de salida tiene su agua', () => {
    const lamina = (q: number) => construirAguas(datos, q, Qmh).find((a) => a.id === 'agua-lecho')?.nivel ?? 0
    expect(lamina(0)).toBe(0)
    expect(lamina(Qp)).toBeGreaterThan(0)
    expect(lamina(Qmh)).toBeCloseTo(0.05, 6)
    expect(construirAguas(datos, Qp, Qmh).some((a) => a.id === 'agua-salida')).toBe(true)
  })
})

describe('geometría armada desde el JSON', () => {
  it('el muro tiene radio interior 9.25 m y exterior 9.65 m, y la altura va de la losa al tope del lecho', () => {
    const muro = con('muro')[0]
    if (muro.forma !== 'anillo') throw new Error('El muro es un anillo')
    expect(muro.radioInterior).toBeCloseTo(9.25, 6)
    expect(muro.radioExterior).toBeCloseTo(9.65, 6)
    expect(muro.pos[1]).toBeCloseTo(0.5, 6)
    expect(muro.alto).toBeCloseTo(3.55, 6)
  })

  it('hay 4 brazos, 7 vigas, 8 ventanas y el lecho de 2.50 m sobre la cámara', () => {
    expect(construirBrazos(datos)).toHaveLength(4)
    expect(con('viga-')).toHaveLength(7)
    expect(con('ventana-')).toHaveLength(8)
    const lecho = con('lecho')[0]
    if (lecho.forma !== 'cilindro') throw new Error('El lecho es un cilindro')
    expect(lecho.alto).toBeCloseTo(2.5, 6)
    expect(lecho.pos[1] - lecho.alto / 2).toBeCloseTo(1.55, 6)
  })

  it('los muros son de concreto opaco salvo con "Ver corte"', () => {
    expect(con('muro')[0].opacidad ?? 1).toBe(1)
    expect(construirPiezas(datos, true).find((p) => p.id === 'muro')!.opacidad).toBeLessThan(1)
  })

  it('cambiar una medida en el JSON cambia la pieza, sin tocar código', () => {
    const otro = clon()
    otro.cuerpo.diametroInterior.valor = 20
    otro.distribuidor.cantidadBrazos.valor = 6
    otro.camaraInferior.cantidadVigas.valor = 5
    const d = esquemaPercolador.parse(otro)
    const muro = con('muro', d)[0]
    if (muro.forma !== 'anillo') throw new Error('El muro es un anillo')
    expect(muro.radioInterior).toBeCloseTo(10, 6)
    expect(construirBrazos(d)).toHaveLength(6)
    expect(con('viga-', d)).toHaveLength(5)
  })
})

describe('cotas y etiquetas', () => {
  const etiquetas = (contacto = 30) => construirEtiquetas(datos, Qp, Qmh, contacto, true)

  it('las cotas dicen el diámetro 18.50 m, el muro 0.40 m y el lecho 2.50 m', () => {
    const textos = construirCotas(datos).map((c) => c.texto)
    expect(textos).toContain('Diámetro interior = 18.50 m')
    expect(textos).toContain('Muro e = 0.40 m')
    expect(textos).toContain('Lecho de roca = 2.50 m')
  })

  it('las etiquetas de piezas con medidas de ejemplo llevan "(ej.)" y las del plano no', () => {
    const m = Object.fromEntries(etiquetas().map((e) => [e.id, e.texto.includes('(ej.)')]))
    for (const id of ['et-brazos', 'et-ventanas', 'et-canal', 'et-contacto', 'et-lamina']) expect(m[id], id).toBe(true)
    for (const id of ['et-muro', 'et-lecho', 'et-entrada', 'et-volumen-hoja', 'et-volumen-plano']) expect(m[id], id).toBe(false)
  })

  it('muestra aparte el volumen de la hoja y el del plano, y la carga hidráulica', () => {
    const t = Object.fromEntries(etiquetas().map((e) => [e.id, e.texto]))
    expect(t['et-volumen-hoja']).toContain('684.3')
    expect(t['et-volumen-plano']).toContain('672.0')
    expect(t['et-carga']).toContain('2.10')
  })
})
