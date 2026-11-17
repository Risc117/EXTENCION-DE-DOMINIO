import { describe, expect, it } from 'vitest'
import { COLOR_LINEA } from '../../nucleo/constantesConexiones'
import { unidades } from '../registro'
import { construirEtiquetas } from './anotaciones'
import { esquemaConexiones } from './esquema'
import { construirBuzones, construirFlechas, construirTramos } from './geometria'
import { alturaTerreno } from '../comun/terrenoPlanta'
import { longitudTramo, perfilTramo } from './trazado'
import { clon, datos, distancia, referencia } from './ayudaPruebas'

describe('ninguna tubería atraviesa una estructura ni flota sobre el terreno', () => {
  const muestras = (t: (typeof datos.tramos)[number]) => perfilTramo(t, 0.5)
  /** Unidades de este tramo y de los que se juntan con él en un buzón (la impulsión sale de EB-1 pasando por BZ-1). */
  const propias = (t: (typeof datos.tramos)[number]): Set<string> => {
    const vecinos = datos.tramos.filter((o) => [t.desde, t.hasta].some((id) => id === o.desde || id === o.hasta))
    return new Set([t, ...vecinos].flatMap((o) => [o.desde, o.hasta]))
  }

  it('los tramos no pasan por dentro de una unidad que no es la suya (salvo las de sus tramos vecinos)', () => {
    for (const t of datos.tramos) {
      for (const m of muestras(t)) {
        for (const u of unidades) {
          if (propias(t).has(u.id)) continue
          // La fila del pretratamiento está pegada: su tamaño ya incluye los canales vecinos.
          expect(distancia(m, u.posicion) - u.tamano / 2, `${t.id} dentro de ${u.id}`).toBeGreaterThan(-0.5)
        }
      }
    }
  })

  it('la cota va por debajo del terreno (enterrada) salvo cerca de los extremos que salen de una estructura', () => {
    for (const t of datos.tramos) {
      const total = longitudTramo(t)
      for (const m of muestras(t)) {
        const sobre = m.cota - alturaTerreno(m.x, m.y)
        // Un tubo que el perfil muestra sobre un relleno (sobreRelleno) puede quedar más alto sobre el terreno levantado.
        expect(sobre, `${t.id} a ${m.distancia.toFixed(1)} m`).toBeLessThanOrEqual(t.sobreRelleno ? 4.5 : 1.7)
        const lejosDeLosExtremos = m.distancia > 6 && total - m.distancia > 6
        if (lejosDeLosExtremos) expect(sobre, `${t.id} flota a ${m.distancia.toFixed(1)} m`).toBeLessThanOrEqual(0.05)
      }
    }
  })

  it('la cota baja del extremo de salida al de llegada en cada punto (pendiente continua, sin saltos)', () => {
    for (const t of datos.tramos) {
      const p = perfilTramo(t, 0.5)
      expect(p[0].cota).toBeCloseTo(t.cotaSalida.valor, 6)
      expect(p[p.length - 1].cota).toBeCloseTo(t.cotaLlegada.valor, 6)
    }
  })
})

describe('tubos sobre relleno (T16.4.6)', () => {
  it('solo los tramos que el perfil muestra sobre un relleno pasan de 1.7 m sobre el terreno, y están marcados', () => {
    for (const t of datos.tramos) {
      const mayor = Math.max(...perfilTramo(t, 0.5).map((m) => m.cota - alturaTerreno(m.x, m.y)))
      if (mayor > 1.7) expect(t.sobreRelleno, t.id).toBe(true)
    }
    expect(datos.tramos.filter((t) => t.sobreRelleno).map((t) => t.id)).toEqual(['T06'])
  })
})

describe('geometría y anotaciones', () => {
  const tubos = construirTramos(datos, referencia)

  it('cada tramo tiene su color de línea y su radio sale del diámetro del JSON', () => {
    expect(tubos.length).toBe(datos.tramos.length)
    const t09 = tubos.find((t) => t.id === 'T09')!
    expect(t09.color).toBe(COLOR_LINEA['agua-residual'])
    expect(t09.radio).toBeCloseTo(0.315, 9)
    expect(tubos.find((t) => t.id === 'T22')!.color).toBe(COLOR_LINEA.lodos)
    expect(tubos.find((t) => t.id === 'T19')!.color).toBe(COLOR_LINEA.efluente)
  })

  it('cambiar un diámetro o un punto en el JSON cambia el tramo, sin tocar código', () => {
    const otro = clon()
    otro.tramos.find((t) => t.id === 'T09')!.diametro.valor = 0.4
    otro.tramos.find((t) => t.id === 'T10')!.trazado[1].x += 1
    const nuevos = construirTramos(esquemaConexiones.parse(otro), referencia)
    expect(nuevos.find((t) => t.id === 'T09')!.radio).toBeCloseTo(0.2, 9)
    expect(nuevos.find((t) => t.id === 'T10')!.segmentos[0].b[0]).not.toBeCloseTo(tubos.find((t) => t.id === 'T10')!.segmentos[0].b[0], 3)
  })

  it('la línea de cloro de 1/2" se ve aunque sea muy delgada (radio mínimo visible)', () => {
    expect(tubos.find((t) => t.id === 'T29')!.radio).toBeGreaterThan(0.0127 / 2)
  })

  it('los tramos enterrados se marcan para dibujarlos con transparencia, y los que salen de la cámara de contacto no', () => {
    expect(tubos.filter((t) => t.segmentos.some((s) => s.enterrado)).length).toBeGreaterThan(20)
    expect(tubos.find((t) => t.id === 'T19')!.segmentos[0].enterrado).toBe(false)
  })

  it('cada tramo trae una flecha en el sentido del flujo (de desde a hasta)', () => {
    const flechas = construirFlechas(datos, referencia)
    expect(flechas.length).toBe(datos.tramos.length)
    const f = flechas.find((x) => x.id === 'T13')!
    // T13 va hacia el este (de la cámara de reparto al buzón BZ-7): la dirección en x es positiva.
    expect(f.direccion[0]).toBeGreaterThan(0.9)
    const g = flechas.find((x) => x.id === 'T05')!
    // T05 va de sur a norte en el plano: z de la escena baja... pero sube en y del plano; en la escena avanza hacia -z.
    expect(g.direccion[2]).toBeLessThan(-0.9)
  })

  it('los 13 buzones del mapa, BZ-1 y el pozo de drenaje BZ-D (T34, de ejemplo) están, en sus posiciones', () => {
    const b = construirBuzones(datos, referencia)
    expect(b.map((x) => x.id).sort()).toEqual(datos.puntos.filter((p) => p.tipo === 'buzon').map((p) => p.id).sort())
    expect(b.length).toBe(15)
    const bz2 = b.find((x) => x.id === 'BZ-2')!
    expect(bz2.pos[0]).toBeCloseTo(-21.5, 9)
    expect(bz2.pos[2]).toBeCloseTo(57, 9)
  })

  it('las etiquetas dicen diámetro y material, con "(ej.)" solo en lo estimado, y nombran los buzones', () => {
    const t = construirEtiquetas(datos, referencia).map((e) => e.texto)
    expect(t.some((x) => x.includes('HDPE PN10') && x.includes('630 mm') && !x.includes('(ej.)'))).toBe(true)
    expect(t.some((x) => x.includes('PVC') && x.includes('160 mm') && !x.includes('(ej.)'))).toBe(true)
    expect(t.some((x) => x.includes('200 mm') && x.includes('(ej.)'))).toBe(true)
    expect(t.some((x) => x.includes('BZ-L1'))).toBe(true)
    expect(t.some((x) => x.includes('BZ-1') && x.includes('(ej.)'))).toBe(true)
  })
})
