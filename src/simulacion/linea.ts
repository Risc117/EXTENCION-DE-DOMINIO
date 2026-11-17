import type { ModoSalida, ParametrosTanque } from '../estado/simulacion'
import { pasoBalance } from './balance'
import { esquemaLinea, retencionSegundos, type DatosNodo } from './lineaEsquema'
import { crearRetraso } from './retraso'
import { caudalSalida } from './salida'

/** Lo que pasó en una unidad durante un paso (caudales en L/s). */
export interface MedidaNodo {
  entrada: number
  salida: number
}

export interface ResultadoLinea {
  /** Caudal que entra a la planta. */
  entrada: number
  /** Caudal que sale de la planta (el de la última unidad de la lista). */
  salida: number
  nodos: Record<string, MedidaNodo>
  /** Nivel (m) y rebose (L/s) del homogeneizador. */
  nivel: number
  rebose: number
}

export interface OpcionesLinea {
  /** Medidas del homogeneizador (salen de datos/homogeneizador.json). */
  tanque: ParametrosTanque
  /** Modo de salida del homogeneizador; puede ser una función para seguir los cambios de la interfaz. */
  modo: ModoSalida | (() => ModoSalida)
  /** Caudal de salida elegido a mano (L/s), o null para usar el promedio del día. */
  ajuste?: () => number | null
}

export interface Linea {
  /** Avanza `dt` segundos con el caudal `entrada` (L/s); `promedioDia` solo lo usa el homogeneizador en modo constante. */
  paso: (entrada: number, dt: number, promedioDia: number) => ResultadoLinea
  /** Vuelve todo al arranque: tanque vacío y sin caudales en tránsito. */
  reiniciar: () => void
}

interface Unidad {
  id: string
  destinos: DatosNodo['destinos']
  /** transferir: caudal de entrada → caudal de salida, en este paso. */
  transferir: (entrada: number, dt: number, promedioDia: number) => number
}

interface EstadoTanque {
  volumen: number
  rebose: number
}

function crearUnidad(n: DatosNodo, o: OpcionesLinea, estado: EstadoTanque): Unidad {
  if (n.tipo === 'homogeneizador') {
    return {
      id: n.id,
      destinos: n.destinos,
      transferir: (q, dt, promedio) => {
        const deseado = caudalSalida(typeof o.modo === 'function' ? o.modo() : o.modo, estado.volumen / o.tanque.area, promedio, o.ajuste?.() ?? null, o.tanque)
        const r = pasoBalance(estado.volumen, q, deseado, dt, o.tanque)
        estado.volumen = r.volumen
        estado.rebose = r.caudalRebose
        return r.caudalSalida
      },
    }
  }
  const retraso = crearRetraso(retencionSegundos(n))
  return { id: n.id, destinos: n.destinos, transferir: (q, dt) => retraso.paso(q, dt) }
}

/** Arma la línea de agua desde datos/linea.json: la salida de cada unidad es la entrada de las siguientes. */
export function crearLinea(crudo: unknown, opciones: OpcionesLinea): Linea {
  const datos = esquemaLinea.parse(crudo)
  const estado: EstadoTanque = { volumen: 0, rebose: 0 }
  const construir = () => datos.nodos.map((n) => crearUnidad(n, opciones, estado))
  let unidades = construir()
  const ultima = datos.nodos[datos.nodos.length - 1].id
  return {
    paso(entradaPlanta, dt, promedioDia) {
      const llega = new Map<string, number>([[datos.entrada, entradaPlanta]])
      const nodos: Record<string, MedidaNodo> = {}
      for (const u of unidades) {
        const entrada = llega.get(u.id) ?? 0
        const salida = u.transferir(entrada, dt, promedioDia)
        nodos[u.id] = { entrada, salida }
        for (const d of u.destinos) llega.set(d.id, (llega.get(d.id) ?? 0) + salida * d.fraccion)
      }
      return {
        entrada: entradaPlanta,
        salida: nodos[ultima].salida,
        nodos,
        nivel: estado.volumen / opciones.tanque.area,
        rebose: estado.rebose,
      }
    },
    reiniciar() {
      estado.volumen = 0
      estado.rebose = 0
      unidades = construir()
    },
  }
}
