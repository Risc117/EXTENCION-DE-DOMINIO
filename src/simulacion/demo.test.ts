import { beforeEach, describe, expect, it } from 'vitest'
import crudo from '../../datos/demo.json'
import { useEstado } from '../estado/almacen'
import { INICIO_DEMO, useDemo } from '../estado/demo'
import { useSim, type ParametrosTanque } from '../estado/simulacion'
import { crearControlDemo } from './demo'
import { crearGuion } from './guion'
import { hidrograma } from './hidrogramaCargado'

const tanque: ParametrosTanque = { area: Math.PI * 3.79 ** 2, alturaUtil: 4.9, alturaTotal: 5.4, alturaEjeSalida: 0.3, diametroSalida: 0.16 }
const pasos = crearGuion(crudo)
const crear = (p = pasos) => crearControlDemo(p, hidrograma)

/** Pasos que van antes del tanque en el recorrido de la planta (la gota entra, rejas, desarenador, Parshall). */
const ANTES = 4
const alTanque = (demo: ReturnType<typeof crear>) => {
  for (let i = 0; i < ANTES; i++) demo.siguiente()
}

beforeEach(() => {
  useSim.getState().reiniciar()
  useSim.setState({ tanque })
  useDemo.setState({ ...INICIO_DEMO })
})

describe('demo: iniciar', () => {
  it('queda activa en el paso 1 (la gota entra, vista general), cierra la bienvenida, pone la cámara y llena el texto con datos', () => {
    crear().iniciar()
    const d = useDemo.getState()
    expect(d.activa).toBe(true)
    expect(d.bienvenida).toBe(false)
    expect(d.paso).toBe(0)
    expect(d.total).toBe(15)
    expect(d.texto).toContain('6.536')
    expect(d.texto).not.toMatch(/[{}]/)
    expect(useEstado.getState().camara).toEqual(pasos[0].vista)
    expect(useEstado.getState().foco).toBeNull()
  })

  it('el paso del tanque enfoca el homogeneizador y llena el texto con los datos del tanque', () => {
    const demo = crear()
    demo.iniciar()
    alTanque(demo)
    const d = useDemo.getState()
    expect(d.paso).toBe(ANTES)
    expect(d.texto).toContain('7.58')
    expect(useEstado.getState().foco).toBe('homogeneizador')
    expect(useEstado.getState().camara).toEqual(pasos[ANTES].vista)
  })

  it('sin datos del tanque no arranca', () => {
    useSim.setState({ tanque: null })
    crear().iniciar()
    expect(useDemo.getState().activa).toBe(false)
  })
})

describe('demo: avance y acciones', () => {
  it('avanza paso a paso con el tiempo y aplica las acciones al estado', () => {
    const demo = crear()
    demo.iniciar()
    alTanque(demo)
    expect(useSim.getState().velocidad).toBe(3600)
    demo.avanzar(pasos[ANTES].duracionSegundos - 1)
    expect(useDemo.getState().paso).toBe(ANTES)
    demo.avanzar(1.5)
    expect(useDemo.getState().paso).toBe(ANTES + 1)
    demo.avanzar(pasos[ANTES + 1].duracionSegundos + 0.1)
    expect(useDemo.getState().paso).toBe(ANTES + 2)
    expect(useSim.getState().modoSalida).toBe('gravedad')
    demo.avanzar(pasos[ANTES + 2].duracionSegundos + 0.1)
    expect(useDemo.getState().paso).toBe(ANTES + 3)
    expect(useSim.getState().modoSalida).toBe('constante')
    expect(useSim.getState().salidaAjuste).toBe(2)
    expect(useDemo.getState().transcurrido).toBe(0)
  })

  it('recorre todos los pasos sin tocar nada y termina sola', () => {
    const demo = crear()
    demo.iniciar()
    const vistos = new Set<number>()
    for (let i = 0; i < 1000 && useDemo.getState().activa; i++) {
      vistos.add(useDemo.getState().paso)
      demo.avanzar(1)
    }
    expect([...vistos]).toEqual(pasos.map((_, i) => i))
    expect(useDemo.getState().activa).toBe(false)
  })

  it('siguiente y anterior respetan los límites; siguiente en el último paso sale', () => {
    const demo = crear()
    demo.iniciar()
    demo.anterior()
    expect(useDemo.getState().paso).toBe(0)
    demo.siguiente()
    expect(useDemo.getState().paso).toBe(1)
    demo.anterior()
    expect(useDemo.getState().paso).toBe(0)
    for (let i = 0; i < pasos.length - 1; i++) demo.siguiente()
    expect(useDemo.getState().paso).toBe(pasos.length - 1)
    demo.siguiente()
    expect(useDemo.getState().activa).toBe(false)
  })

  it('no hace nada si no está activa', () => {
    const demo = crear()
    demo.avanzar(100)
    demo.siguiente()
    expect(useDemo.getState().activa).toBe(false)
    expect(useDemo.getState().paso).toBe(0)
  })
})

describe('demo: salir', () => {
  it('deja el panel manual y la cámara como estaban', () => {
    const s = useSim.getState()
    s.elegirDia(3)
    s.fijarVelocidad(60)
    s.fijarModoSalida('gravedad')
    s.fijarSalidaAjuste(7)
    s.publicar({ hora: 5, volumen: 40 })
    useSim.setState({ corriendo: false })
    useEstado.getState().fijarCamara({ acimut: 2, elevacion: 0.9, distancia: 1.1 })
    const antes = { ...useSim.getState() }
    const camaraAntes = { ...useEstado.getState().camara }

    const demo = crear()
    demo.iniciar()
    alTanque(demo)
    demo.avanzar(pasos[ANTES].duracionSegundos + 1)
    expect(useSim.getState().dia).toBe(1)
    demo.salir()

    const ahora = useSim.getState()
    expect(useDemo.getState().activa).toBe(false)
    expect(ahora.dia).toBe(antes.dia)
    expect(ahora.velocidad).toBe(60)
    expect(ahora.modoSalida).toBe('gravedad')
    expect(ahora.salidaAjuste).toBe(7)
    expect(ahora.corriendo).toBe(false)
    expect(ahora.hora).toBe(5)
    expect(ahora.volumen).toBe(40)
    expect(ahora.nivel).toBeCloseTo(40 / tanque.area, 6)
    expect(useEstado.getState().camara).toEqual(camaraAntes)
  })

  it('enfoca la unidad de cada paso (vista general, rejas, ..., homogeneizador) y devuelve el foco anterior', () => {
    useEstado.setState({ foco: 'rafa' })
    const demo = crear()
    demo.iniciar()
    expect(useEstado.getState().foco).toBeNull()
    demo.siguiente()
    expect(useEstado.getState().foco).toBe('rejas')
    demo.siguiente()
    demo.siguiente()
    demo.siguiente()
    expect(useEstado.getState().foco).toBe('homogeneizador')
    demo.salir()
    expect(useEstado.getState().foco).toBe('rafa')
  })
})

describe('demo: órdenes de la interfaz', () => {
  it('atiende iniciar, siguiente, anterior y salir, y borra la orden', () => {
    const demo = crear()
    useDemo.getState().ordenar('iniciar')
    demo.atender()
    expect(useDemo.getState().activa).toBe(true)
    expect(useDemo.getState().orden).toBeNull()
    useDemo.getState().ordenar('siguiente')
    demo.atender()
    expect(useDemo.getState().paso).toBe(1)
    useDemo.getState().ordenar('anterior')
    demo.atender()
    expect(useDemo.getState().paso).toBe(0)
    useDemo.getState().ordenar('salir')
    demo.atender()
    expect(useDemo.getState().activa).toBe(false)
  })
})

describe('demo: el guion se edita sin tocar código', () => {
  it('cambiar un texto o una duración en el JSON cambia la demo', () => {
    const otro = structuredClone(pasos)
    otro[0].titulo = 'Otro título'
    otro[0].duracionSegundos = 99
    crear(otro).iniciar()
    expect(useDemo.getState().titulo).toBe('Otro título')
    expect(useDemo.getState().duracion).toBe(99)
  })
})
