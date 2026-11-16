import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/desinfeccion.json'
import { todasLasMedidas } from '../comun/medidas'
import { planta } from '../planta'
import { construirCotas, construirEtiquetas } from './anotaciones'
import { construirEtiquetasCaseta } from './anotacionesCaseta'
import { disponer } from './disposicion'
import { esquemaDesinfeccion } from './esquema'
import { construirAguas, construirPiezas } from './geometria'
import { construirPiezasCaseta } from './geometriaCaseta'
import { alturaTotal, anchoTotal, caudalSolucion, largoTotal, nivelAgua, paso, retencionMin, volumenPlano } from './hidraulica'

const datos = esquemaDesinfeccion.parse(crudo)
const clon = () => structuredClone(crudo)
const Q = crudo.hidraulica.caudalDiseno.valor

describe('datos/desinfeccion.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    const medidas = todasLasMedidas(datos)
    expect(medidas.length).toBeGreaterThan(30)
    for (const m of medidas) expect(m.fuente.length).toBeGreaterThan(5)
  })

  it('las medidas del plano y de la hoja no son de ejemplo; lo que no está en las fuentes sí', () => {
    for (const m of [datos.canales.ancho, datos.canales.largoInterior, datos.canales.largoRecorrido, datos.tabique.espesor, datos.muro.espesor, datos.agua.profundidad, datos.agua.bordeLibre, datos.tuberias.diametro, datos.hidraulica.tiempoContacto, datos.cloracion.concentracion]) {
      expect(m.demo, m.fuente).not.toBe(true)
    }
    for (const m of [datos.losa.espesor, datos.pantalla.largo, datos.tuberias.alturaEjeEntrada, datos.caseta.alturaMuros, datos.tanque.diametro, datos.bomba.largo, datos.cloracion.diametroMezclador]) expect(m.demo).toBe(true)
  })

  it('el ancho total sale de 4 × 0.60 + 3 × 0.15 + 2 × 0.20 = 3.25 y el largo de 4.0 + 2 × 0.20 = 4.4', () => {
    expect(anchoTotal(datos)).toBeCloseTo(3.25, 9)
    expect(largoTotal(datos)).toBeCloseTo(4.4, 9)
    expect(datos.totalesPlano.ancho.valor).toBe(3.25)
  })

  it('los tabiques de 3.27 m dejan un paso de 0.73 m', () => {
    expect(paso(datos)).toBeCloseTo(0.73, 9)
  })

  it('rechaza un ancho de plano que no cuadra con los canales, un tabique que llena todo el largo, valores malos y falta de fuente', () => {
    const ancho = clon()
    ancho.canales.ancho.valor = 0.7
    expect(esquemaDesinfeccion.safeParse(ancho).success).toBe(false)
    const lleno = clon()
    lleno.tabique.largo.valor = 4.0
    expect(esquemaDesinfeccion.safeParse(lleno).success).toBe(false)
    const neg = clon()
    neg.agua.profundidad.valor = -1
    expect(esquemaDesinfeccion.safeParse(neg).success).toBe(false)
    const sin = clon()
    sin.muro.espesor.fuente = ''
    expect(esquemaDesinfeccion.safeParse(sin).success).toBe(false)
    const tres = clon()
    tres.canales.cantidad.valor = 3
    expect(esquemaDesinfeccion.safeParse(tres).success).toBe(false)
  })

  it('la altura total (losa + agua + borde libre) coincide con fondo y coronación de planta.json', () => {
    const u = planta.unidades.find((x) => x.id === 'camara-contacto')!
    expect(u.cotaCoronacion.valor - u.cotaFondo.valor).toBeCloseTo(alturaTotal(datos), 6)
  })
})

describe('cámara de contacto: geometría', () => {
  const piezas = construirPiezas(datos)
  const por = (id: string) => piezas.find((p) => p.id === id)!
  const caja = (id: string) => {
    const p = por(id)
    if (p.forma !== 'caja') throw new Error(`${id} debe ser una caja`)
    return p
  }

  it('tiene losa, 4 muros, 3 tabiques, pantalla y las dos tuberías', () => {
    for (const id of ['losa', 'muro-norte', 'muro-sur', 'muro-este', 'muro-oeste', 'tabique-1', 'tabique-2', 'tabique-3', 'pantalla', 'tubo-entrada', 'tubo-salida']) expect(por(id), id).toBeDefined()
  })

  it('la losa mide el largo y el ancho exteriores del plano', () => {
    expect(caja('losa').tam[0]).toBeCloseTo(4.4, 9)
    expect(caja('losa').tam[2]).toBeCloseTo(3.25, 9)
  })

  it('los tabiques alternan: el 1 y el 3 pegados al oeste, el 2 al este, todos de 3.27 m', () => {
    expect(caja('tabique-1').tam[0]).toBeCloseTo(3.27, 9)
    expect(caja('tabique-1').pos[0]).toBeLessThan(0)
    expect(caja('tabique-2').pos[0]).toBeGreaterThan(0)
    expect(caja('tabique-3').pos[0]).toBeLessThan(0)
  })

  it('un muro translúcido solo con "Ver corte"', () => {
    expect(construirPiezas(datos, false).find((p) => p.id === 'muro-norte')!.opacidad).toBeUndefined()
    expect(construirPiezas(datos, true).find((p) => p.id === 'muro-norte')!.opacidad).toBeLessThan(1)
  })

  it('cambiar una medida del JSON cambia la pieza', () => {
    const otro = clon()
    otro.canales.largoInterior.valor = 5
    otro.totalesPlano.largo.valor = 5.4
    const l = construirPiezas(esquemaDesinfeccion.parse(otro)).find((p) => p.id === 'losa')!
    if (l.forma !== 'caja') throw new Error('caja')
    expect(l.tam[0]).toBeCloseTo(5.4, 9)
  })

  it('la pantalla es un accesorio con interruptor', () => {
    expect(por('pantalla').accesorio).toBe(true)
  })

  it('el mezclador y la válvula de retención van en el punto de aplicación del cloro', () => {
    const ids = piezas.map((p) => p.id)
    for (const id of ['mezclador', 'valvula-retencion', 'linea-cloro-vertical']) expect(ids).toContain(id)
    expect(disponer(datos).mitadLargo).toBeCloseTo(2.2, 9)
  })
})

describe('cámara de contacto: agua', () => {
  it('recorre los 4 canales en orden, con un paso entre cada par, alternando lados (este, oeste, este)', () => {
    const aguas = construirAguas(datos, Q)
    expect(aguas.map((a) => a.id)).toEqual(['agua-canal-1', 'agua-paso-1', 'agua-canal-2', 'agua-paso-2', 'agua-canal-3', 'agua-paso-3', 'agua-canal-4'])
    const lados = aguas.filter((a) => a.id.startsWith('agua-paso')).map((a) => (a.forma === 'caja' ? Math.sign(a.centro[0]) : 0))
    expect(lados).toEqual([1, -1, 1])
  })

  it('con el caudal de diseño el agua llega a 1.50 m; sube y baja con el caudal y no pasa del borde', () => {
    expect(nivelAgua(datos, Q)).toBeCloseTo(1.5, 9)
    expect(nivelAgua(datos, Q / 2)).toBeCloseTo(0.75, 9)
    expect(nivelAgua(datos, 0)).toBe(0)
    expect(nivelAgua(datos, Q * 10)).toBeCloseTo(1.8, 9)
    for (const a of construirAguas(datos, Q / 2)) expect(a.nivel).toBeCloseTo(0.75, 9)
  })
})

describe('hidráulica', () => {
  it('la hoja da 30 min con el caudal de diseño', () => {
    expect(retencionMin(datos.hidraulica.volumenHoja.valor, Q)).toBeCloseTo(30, 2)
  })

  it('el plano da su volumen (4 × 0.60 × 3.27 × 1.50) y su propio tiempo, aparte', () => {
    expect(volumenPlano(datos)).toBeCloseTo(11.772, 3)
    expect(retencionMin(volumenPlano(datos), Q)).toBeCloseTo(30.02, 1)
  })

  it('sin caudal no hay tiempo de contacto', () => {
    expect(retencionMin(11.7, 0)).toBe(Infinity)
  })

  it('el caudal de solución de cloro es q = Q × DM / C = 5.6 mL/s con el caudal de diseño', () => {
    expect(caudalSolucion(datos, Q)).toBeCloseTo(5.602, 3)
    expect(caudalSolucion(datos, 0)).toBe(0)
  })
})

describe('anotaciones', () => {
  it('muestra los dos tiempos de contacto y marca "(ej.)" solo en lo estimado', () => {
    const t = construirEtiquetas(datos, Q).map((e) => e.texto)
    expect(t.some((x) => x.includes('TR (hoja)') && x.includes('30.00'))).toBe(true)
    expect(t.some((x) => x.includes('TR (plano)'))).toBe(true)
    expect(t.some((x) => x.includes('Pantalla') && x.includes('(ej.)'))).toBe(true)
    expect(t.some((x) => x.includes('Muros') && !x.includes('(ej.)'))).toBe(true)
  })

  it('las cotas salen de las medidas, sin números escritos a mano', () => {
    const c = construirCotas(datos).map((x) => x.texto)
    expect(c).toContain('Ancho total = 3.25 m')
    expect(c).toContain('Largo útil Lu = 4.00 m')
    expect(c.some((x) => x.includes('0.60'))).toBe(true)
  })

  it('el diámetro de las tuberías sale de la medida: DN 160', () => {
    expect(construirEtiquetas(datos, Q).some((e) => e.texto.includes('DN 160'))).toBe(true)
  })
})

describe('caseta de cloración', () => {
  it('está en planta.json en el cuadrado de 3 × 3 m del mapa, con cotas derivadas del terreno (de ejemplo)', () => {
    const u = planta.unidades.find((x) => x.id === 'caseta-cloracion')!
    expect([u.x.valor, u.y.valor]).toEqual([31.5, 48.3])
    expect(u.x.demo).toBe(true)
    expect(u.cotaCoronacion.valor - u.cotaFondo.valor).toBeCloseTo(datos.caseta.alturaMuros.valor + 2 * datos.caseta.espesor.valor, 6)
  })

  it('tiene piso, muros, tanque, bomba, línea de 1/2" y el techo como accesorio', () => {
    const p = construirPiezasCaseta(datos)
    for (const id of ['piso', 'muro-norte', 'tanque', 'bomba', 'linea-cloro']) expect(p.find((x) => x.id === id), id).toBeDefined()
    expect(p.find((x) => x.id === 'techo')!.accesorio).toBe(true)
  })

  it('las etiquetas dicen 3500 mg/L, hipoclorito, la dosis según el caudal y la línea de 1/2"', () => {
    const t = construirEtiquetasCaseta(datos, Q).map((e) => e.texto).join(' | ')
    expect(t).toContain('3500')
    expect(t).toContain('Hipoclorito')
    expect(t).toContain('5.60')
    expect(t).toContain('1/2"')
  })
})
