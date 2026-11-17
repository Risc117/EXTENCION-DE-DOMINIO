import { useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo } from 'react'
import { GRADOS_MEDIA_VUELTA } from '../../nucleo/constantesViento'
import { useCalidad } from '../../estado/calidad'
import { usePersonal } from '../../estado/personal'
import { entorno } from '../entorno/datos'
import { Animal } from '../comun/Animal'
import { acumulados, sobreRuta, type Pose } from '../comun/rutaPlana'
import { estadoEnTiempo } from './cronograma'
import { rutas } from './datos'
import type { Punto } from './geometria'
import { barreraAbierta } from './horario'
import { olvidarVehiculos, vehiculosVisibles } from './registro'
import { paradasDe, rutaDeTecnico, rutaDeVehiculo } from './rutas'
import { usePresentes } from './usePresentes'

const rango = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Pose a lo largo de una ruta: el rumbo mira hacia donde va (al revés al volver). */
function poseEn(ruta: Punto[], acum: number[], d: number, sentido: 1 | -1): Pose {
  const p = sobreRuta(ruta, acum, d)
  return { x: p.x, y: p.y, rumbo: sentido === 1 ? p.rumbo : p.rumbo + Math.PI }
}

/** Técnicos que caminan por su ruta (una vereda a cada lado de la vía) y paran en las estructuras. */
function Tecnicos({ n, referencia }: { n: number; referencia: number }) {
  const { tecnico, tecnicos } = rutas
  const recorridos = useMemo(
    () =>
      [1, -1].flatMap((lado) =>
        tecnicos.map((t) => {
          const ruta = rutaDeTecnico(t, lado)
          const acum = acumulados(ruta)
          return { t, ruta, acum, largo: acum[acum.length - 1], paradas: paradasDe(t, ruta) }
        }),
      ),
    [tecnicos],
  )
  return (
    <>
      {rango(n).map((i) => {
        const r = recorridos[i % recorridos.length]
        return (
          <Animal
            key={`tecnico${i}`}
            modelo={tecnico.modelo}
            tamano={tecnico.tamano.valor}
            animacion={tecnico.animacionCaminar}
            animacionQuieto={tecnico.animacionParado}
            referencia={referencia}
            pose={(t) => {
              const e = estadoEnTiempo(r.largo, r.paradas, r.t.velocidad.valor, t, { fase: i / n })
              return { ...poseEn(r.ruta, r.acum, e.d, e.sentido), parado: e.parado }
            }}
          />
        )
      })}
    </>
  )
}

/** Vehículos que esperan fuera, entran por el portón, estacionan en el patio un momento y salen; los visibles se anotan para la barrera. */
function Vehiculos({ n, faros, referencia }: { n: number; faros: boolean; referencia: number }) {
  const recorridos = useMemo(
    () =>
      rutas.vehiculos.map((v) => {
        const ruta = rutaDeVehiculo(v)
        const acum = acumulados(ruta)
        return { v, ruta, acum, largo: acum[acum.length - 1] }
      }),
    [],
  )
  useEffect(() => olvidarVehiculos, [n])
  return (
    <>
      {recorridos.slice(0, n).map((r) => (
        <Animal
          key={r.v.id}
          modelo={r.v.modelo}
          tamano={r.v.tamano.valor}
          faros={faros ? rutas.faros.brillo.valor : 0}
          referencia={referencia}
          pose={(t) => {
            const e = estadoEnTiempo(r.largo, [], r.v.velocidad.valor, t, { espera: r.v.espera.valor, pausaFinal: r.v.pausaFinal.valor })
            const p = poseEn(r.ruta, r.acum, e.d, e.sentido)
            if (e.oculto) vehiculosVisibles.delete(r.v.id)
            else vehiculosVisibles.set(r.v.id, p)
            return { ...p, oculto: e.oculto }
          }}
        />
      ))}
    </>
  )
}

/** Sube la barrera cuando un vehículo visible está cerca de ella. */
function ControlBarrera() {
  useFrame(() => {
    const { desde, hasta } = entorno.barrera
    const centro = { x: (desde.x + hasta.x) / 2, y: (desde.y + hasta.y) / 2 }
    usePersonal.getState().fijarBarrera(barreraAbierta([...vehiculosVisibles.values()], centro, rutas.barrera.radioApertura.valor))
  })
  return null
}

/** Personas y vehículos de la planta, con el interruptor "Personas y vehículos" y el horario según el sol. */
export function Personal({ referencia }: { referencia: number }) {
  const visible = usePersonal((s) => s.visible)
  const calidad = useCalidad((s) => s.calidad)
  const presentes = usePresentes(rutas.cantidades.tecnicos[calidad], rutas.cantidades.vehiculos[calidad])
  const { tecnico, vigilante } = rutas
  useEffect(() => {
    if (!visible) olvidarVehiculos()
  }, [visible])
  if (!visible) return null
  const quieto: Pose = { x: vigilante.posicion.x, y: vigilante.posicion.y, rumbo: (vigilante.rumbo.valor * Math.PI) / GRADOS_MEDIA_VUELTA }
  return (
    <Suspense fallback={null}>
      <ControlBarrera />
      <Tecnicos n={presentes.tecnicos} referencia={referencia} />
      <Vehiculos n={presentes.vehiculos} faros={presentes.faros} referencia={referencia} />
      {presentes.vigilante && <Animal modelo={tecnico.modelo} tamano={tecnico.tamano.valor} animacion={tecnico.animacionVigilante} referencia={referencia} pose={() => quieto} />}
    </Suspense>
  )
}
