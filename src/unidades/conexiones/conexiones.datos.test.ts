import { describe, expect, it } from 'vitest'
import desinfeccionCruda from '../../../datos/desinfeccion.json'
import lineaCruda from '../../../datos/linea.json'
import { COLOR_LINEA } from '../../nucleo/constantesConexiones'
import { esquemaDesinfeccion } from '../desinfeccion/esquema'
import { construirPiezas } from '../desinfeccion/geometria'
import { todasLasMedidas } from '../comun/medidas'
import { esquemaConexiones, validarReferencias } from './esquema'
import { clon, datos, distancia, idsUnidades, tramo, unidad } from './ayudaPruebas'

describe('datos/conexiones.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    const medidas = todasLasMedidas(datos)
    expect(medidas.length).toBeGreaterThan(100)
    for (const m of medidas) expect(m.fuente.length).toBeGreaterThan(5)
    for (const t of datos.tramos) expect(t.fuenteTrazado).toContain('.dxf')
  })

  it('todos los tramos unen dos puntos que existen (unidad de planta.json o buzón / punto del JSON)', () => {
    expect(validarReferencias(datos, idsUnidades)).toEqual([])
  })

  it('los diámetros y materiales confirmados por el usuario no son de ejemplo, y el resto sí', () => {
    const confirmados = { T02: 0.2, T09: 0.63, T10: 0.63, T13: 0.16, T18: 0.16, T19: 0.16, T22: 0.15, T28: 0.15 }
    for (const [id, d] of Object.entries(confirmados)) {
      expect(tramo(id).diametro.valor, id).toBe(d)
      expect(tramo(id).diametro.demo, id).not.toBe(true)
    }
    for (const id of ['T09', 'T10', 'T13', 'T18']) expect(tramo(id).material.demo, id).not.toBe(true)
    expect(tramo('T09').material.valor).toBe('HDPE PN10')
    expect(tramo('T13').material.valor).toBe('PVC')
    for (const id of ['T01', 'T05', 'T11', 'T20']) expect(tramo(id).diametro.demo, id).toBe(true)
    for (const id of ['T02', 'T22']) expect(tramo(id).material.demo, id).toBe(true)
  })

  it('las cotas y el buzón BZ-1 (que el mapa no trae) son de ejemplo', () => {
    for (const t of datos.tramos) for (const c of [t.cotaSalida, t.cotaLlegada]) expect(c.demo, t.id).toBe(true)
    const bz1 = datos.puntos.find((p) => p.id === 'BZ-1')!
    expect(bz1.x.demo).toBe(true)
    expect(datos.puntos.find((p) => p.id === 'BZ-2')!.x.demo).not.toBe(true)
  })

  it('rechaza datos malos: sin fuente, diámetro negativo, un solo punto, línea desconocida e ids repetidos', () => {
    const sin = clon()
    sin.tramos[0].diametro.fuente = ''
    expect(esquemaConexiones.safeParse(sin).success).toBe(false)
    const neg = clon()
    neg.tramos[0].diametro.valor = -0.2
    expect(esquemaConexiones.safeParse(neg).success).toBe(false)
    const uno = clon()
    uno.tramos[0].trazado = [uno.tramos[0].trazado[0]]
    expect(esquemaConexiones.safeParse(uno).success).toBe(false)
    const linea = clon()
    ;(linea.tramos[0] as { linea: string }).linea = 'verde'
    expect(esquemaConexiones.safeParse(linea).success).toBe(false)
    const repetido = clon()
    repetido.tramos[1].id = repetido.tramos[0].id
    expect(esquemaConexiones.safeParse(repetido).success).toBe(false)
  })

  it('rechaza un tramo que no une dos puntos existentes o que no empieza en su buzón', () => {
    const desconocido = clon()
    desconocido.tramos[0].desde = 'no-existe'
    expect(validarReferencias(esquemaConexiones.parse(desconocido), idsUnidades).length).toBeGreaterThan(0)
    const lejos = clon()
    lejos.tramos.find((t) => t.id === 'T03')!.trazado[0].x += 3
    expect(validarReferencias(esquemaConexiones.parse(lejos), idsUnidades).length).toBeGreaterThan(0)
  })
})

describe('la línea de agua queda conectada en orden', () => {
  const alcanzables = (origen: string): Set<string> => {
    const aristas = datos.tramos.filter((t) => t.linea !== 'lodos' && t.linea !== 'cloro').map((t) => [t.desde, t.hasta])
    // El pretratamiento es una fila de canales pegados: no tiene tubería entre ellos.
    aristas.push(['rejas', 'desarenador'], ['desarenador', 'parshall'])
    const visto = new Set([origen])
    for (let cambio = true; cambio; ) {
      cambio = false
      for (const [a, b] of aristas) {
        if (visto.has(a) && !visto.has(b)) {
          visto.add(b)
          cambio = true
        }
      }
    }
    return visto
  }

  it('desde la entrada de agua se llega, en el orden de linea.json, a todas las unidades y al río', () => {
    const orden = ['bombeo', 'rejas', 'desarenador', 'parshall', 'homogeneizador', 'rafa', 'percolador', 'camara-reparto', 'sedimentador-1', 'sedimentador-2', 'camara-contacto', 'descarga-rio']
    const todos = alcanzables('entrada-agua')
    for (const id of orden) expect(todos.has(id), id).toBe(true)
    // Cada paso de linea.json (de una unidad a la siguiente) tiene su camino.
    for (const n of lineaCruda.nodos as { id: string; destinos: { id: string }[] }[]) {
      for (const d of n.destinos) if (idsUnidades.includes(n.id) && idsUnidades.includes(d.id)) expect(alcanzables(n.id).has(d.id), `${n.id} → ${d.id}`).toBe(true)
    }
  })

  it('los lodos llegan al lecho desde el RAFA y desde los dos sedimentadores, y la caseta llega al punto de aplicación', () => {
    for (const desde of ['rafa', 'sedimentador-1', 'sedimentador-2']) {
      expect(datos.tramos.some((t) => t.linea === 'lodos' && t.desde === desde), desde).toBe(true)
    }
    expect(datos.tramos.filter((t) => t.linea === 'lodos' && t.hasta === 'lechos-secado').length).toBe(2)
    expect(datos.tramos.find((t) => t.linea === 'cloro')!.desde).toBe('caseta-cloracion')
    expect(datos.tramos.find((t) => t.linea === 'cloro')!.hasta).toBe('punto-cloro')
  })

  it('el efluente sale de la cámara de contacto a la descarga y las tres líneas usan sus colores', () => {
    expect(datos.tramos.some((t) => t.linea === 'efluente' && t.desde === 'camara-contacto')).toBe(true)
    expect(datos.tramos.some((t) => t.linea === 'efluente' && t.hasta === 'descarga-rio')).toBe(true)
    const colores = new Set(Object.values(COLOR_LINEA))
    expect(colores.size).toBe(5)
    expect(COLOR_LINEA['agua-residual']).toBe('--color-tub-residual')
    expect(COLOR_LINEA.efluente).toBe('--color-tub-efluente')
    expect(COLOR_LINEA.lodos).toBe('--color-tub-lodos')
  })
})

describe('los extremos caen en las estructuras', () => {
  const extremos = datos.tramos.flatMap((t) => [
    { t, id: t.desde, p: t.trazado[0] },
    { t, id: t.hasta, p: t.trazado[t.trazado.length - 1] },
  ])

  it('cada extremo está en su buzón (menos de 5 cm) o a menos de 2 m del borde de su unidad', () => {
    for (const { t, id, p } of extremos) {
      const punto = datos.puntos.find((q) => q.id === id)
      if (punto) {
        expect(distancia(p, { x: punto.x.valor, y: punto.y.valor }), `${t.id} en ${id}`).toBeLessThan(0.05)
      } else {
        const u = unidad(id)
        expect(distancia(p, u.posicion) - u.tamano / 2, `${t.id} en ${id}`).toBeLessThan(2)
      }
    }
  })

  it('la tubería de entrada y la de salida de la cámara de contacto terminan en el extremo de su tubo (menos de 10 cm)', () => {
    const d = esquemaDesinfeccion.parse(desinfeccionCruda)
    const u = unidad('camara-contacto')
    const g = (u.giro * Math.PI) / 180
    const mundo = (lx: number, lz: number) => ({ x: u.posicion.x + lx * Math.cos(g) + lz * Math.sin(g), y: u.posicion.y + lx * Math.sin(g) - lz * Math.cos(g) })
    for (const [idTubo, idTramo, fin] of [['tubo-entrada', 'T18', true], ['tubo-salida', 'T19', false]] as const) {
      const p = construirPiezas(d).find((x) => x.id === idTubo)!
      if (p.forma !== 'cilindro') throw new Error('debe ser un cilindro')
      const punta = mundo(p.pos[0] - p.alto / 2, p.pos[2])
      const t = tramo(idTramo)
      const extremo = fin ? t.trazado[t.trazado.length - 1] : t.trazado[0]
      expect(distancia(extremo, punta), idTramo).toBeLessThan(0.1)
    }
  })
})

describe('T16.2 · extremos sueltos', () => {
  const sueltos = datos.puntos.filter((p) => p.tipo !== 'buzon').map((p) => p.id)

  it('los únicos puntos de la red que no son buzón ni unidad son la entrada de agua, la descarga al río y el punto de aplicación del cloro', () => {
    expect(sueltos.sort()).toEqual(['descarga-rio', 'entrada-agua', 'punto-cloro'])
  })

  it('cada uno de esos extremos sueltos es el extremo de un solo tramo y ningún otro tramo termina en el aire', () => {
    for (const id of sueltos) expect(datos.tramos.filter((t) => t.desde === id || t.hasta === id).length, id).toBe(1)
  })

  it('el tubo que llega al RAFA (T08) ya llega a su caja de distribución: el último tramo es mío y queda anotado', () => {
    expect(tramo('T08').fuenteTrazado).toContain('prolongué yo')
    expect(tramo('T08').fuenteTrazado).toContain('caja de distribución')
    expect(tramo('T08').cotaLlegada.fuente).toContain('POR CONFIRMAR')
  })
})
