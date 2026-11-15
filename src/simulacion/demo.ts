import { useEstado } from '../estado/almacen'
import { INICIO_DEMO, useDemo, type AccionDemo, type PasoDemo, type Respaldo } from '../estado/demo'
import { useSim } from '../estado/simulacion'
import type { Hidrograma } from './hidrograma'
import { textoConValores, valoresDemo } from './guion'

/** La demo cuenta la historia del homogeneizador: la cámara se enfoca en él. */
const UNIDAD_DEMO = 'homogeneizador'

function aplicarAccion(a: AccionDemo) {
  const s = useSim.getState()
  if (a.dia !== undefined) s.elegirDia(a.dia)
  if (a.velocidad !== undefined) s.fijarVelocidad(a.velocidad)
  if (a.modoSalida !== undefined) s.fijarModoSalida(a.modoSalida)
  if (a.salidaAjuste !== undefined) s.fijarSalidaAjuste(a.salidaAjuste)
}

function tomarRespaldo(): Respaldo {
  const s = useSim.getState()
  return {
    dia: s.dia,
    velocidad: s.velocidad,
    modoSalida: s.modoSalida,
    salidaAjuste: s.salidaAjuste,
    corriendo: s.corriendo,
    hora: s.hora,
    volumen: s.volumen,
    camara: { ...useEstado.getState().camara },
    foco: useEstado.getState().foco,
  }
}

function restaurar(r: Respaldo) {
  const area = useSim.getState().tanque?.area
  useSim.setState({
    dia: r.dia,
    velocidad: r.velocidad,
    modoSalida: r.modoSalida,
    salidaAjuste: r.salidaAjuste,
    corriendo: r.corriendo,
    hora: r.hora,
    volumen: r.volumen,
    ...(area ? { nivel: r.volumen / area } : {}),
  })
  useEstado.getState().fijarCamara(r.camara)
  useEstado.setState({ foco: r.foco })
}

/**
 * Control de la demo guiada. Aplica cada paso al estado (simulación y cámara), igual que el mouse y los gestos.
 * `avanzar` lo llama el reloj con los segundos reales que pasaron.
 */
export function crearControlDemo(pasos: PasoDemo[], hidro: Hidrograma) {
  const ir = (i: number) => {
    const p = pasos[i]
    aplicarAccion(p.accion)
    useEstado.setState({ foco: UNIDAD_DEMO })
    useEstado.getState().fijarCamara(p.vista)
    const { tanque, dia } = useSim.getState()
    const texto = tanque ? textoConValores(p.texto, valoresDemo(tanque, hidro, dia)) : p.texto
    const titulo = tanque ? textoConValores(p.titulo, valoresDemo(tanque, hidro, dia)) : p.titulo
    useDemo.setState({ paso: i, transcurrido: 0, duracion: p.duracionSegundos, titulo, texto })
  }

  const salir = () => {
    const { activa, respaldo } = useDemo.getState()
    if (!activa) return
    if (respaldo) restaurar(respaldo)
    useDemo.setState({ ...INICIO_DEMO, bienvenida: false, total: pasos.length })
  }

  const iniciar = () => {
    if (useDemo.getState().activa || !useSim.getState().tanque) return
    useDemo.setState({ activa: true, bienvenida: false, total: pasos.length, respaldo: tomarRespaldo() })
    useSim.setState({ corriendo: true })
    ir(0)
  }

  const siguiente = () => {
    const d = useDemo.getState()
    if (!d.activa) return
    if (d.paso < pasos.length - 1) ir(d.paso + 1)
    else salir()
  }

  const anterior = () => {
    const d = useDemo.getState()
    if (d.activa && d.paso > 0) ir(d.paso - 1)
  }

  const avanzar = (dt: number) => {
    const d = useDemo.getState()
    if (!d.activa) return
    if (d.transcurrido + dt >= d.duracion) siguiente()
    else useDemo.setState({ transcurrido: d.transcurrido + dt })
  }

  /** Atiende la orden que dejó la interfaz, si hay una. */
  const atender = () => {
    const { orden } = useDemo.getState()
    if (!orden) return
    useDemo.setState({ orden: null })
    ;({ iniciar, siguiente, anterior, salir })[orden]()
  }

  return { iniciar, siguiente, anterior, salir, avanzar, atender }
}
