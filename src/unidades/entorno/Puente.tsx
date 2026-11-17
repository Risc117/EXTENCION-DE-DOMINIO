import { useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute, Quaternion, Vector3 } from 'three'
import { leerColor } from '../../nucleo/colores'
import { ELEVACION_VIA, PUENTE_ESTACIONES } from '../../nucleo/constantesEntorno'
import { entorno } from './datos'
import { puente } from './datosPuente'
import { calcularPuente } from './cruceCamino'
import { cotaTablero, estaciones, mallaTablero, postesBaranda } from './puenteMalla'
import { alturaNivelada } from './terrenoNivelado'

const EJE_X = new Vector3(1, 0, 0)
const MARGEN_ESTRIBO = 0.4

/** Puente donde el camino de acceso cruza el río Picoy: tablero de orilla a orilla a la cota del camino (con una joroba para quedar sobre el agua), baranda y estribos. Interpretación: el DXF no lo dibuja. */
export function Puente({ referencia }: { referencia: number }) {
  const [tablero, baranda, estribo] = useMemo(() => ['--color-pavimento', '--color-baranda', '--color-muro'].map(leerColor), [])
  const obra = useMemo(() => {
    const g = calcularPuente(entorno.camino, entorno.rio, puente.extensionSobreOrilla.valor)
    const cota = (x: number, y: number) => alturaNivelada(x, y) - referencia + ELEVACION_VIA
    const [ci, cf] = [cota(g.inicio.x, g.inicio.y), cota(g.fin.x, g.fin.y)]
    const est = estaciones(g.inicio, g.fin, PUENTE_ESTACIONES)
    const cotas = est.map((e) => cotaTablero(e.t, ci, cf, puente.joroba.valor))
    const malla = mallaTablero(g.inicio, g.fin, g.normal, g.ancho, cotas, puente.espesorTablero.valor)
    const geometria = new BufferGeometry()
    geometria.setAttribute('position', new Float32BufferAttribute(malla.posiciones, 3))
    geometria.setIndex(malla.indices)
    geometria.computeVertexNormals()
    const punto = (t: number, lado: number, alto: number): Vector3 => {
      const [x, y] = [g.inicio.x + (g.fin.x - g.inicio.x) * t, g.inicio.y + (g.fin.y - g.inicio.y) * t]
      const desplazamiento = lado * (g.ancho / 2 - puente.ladoPoste.valor / 2)
      return new Vector3(x + g.normal.x * desplazamiento, cotaTablero(t, ci, cf, puente.joroba.valor) + alto, -(y + g.normal.y * desplazamiento))
    }
    const postes = postesBaranda(g.inicio, g.fin, puente.separacionPostes.valor)
    const alto = puente.alturaBaranda.valor
    const pasamanos = ([1, -1] as const).flatMap((lado) => {
      const ts = postes.filter((p) => p.lado === lado).map((p) => p.t)
      return ts.slice(1).map((t, i) => {
        const [a, b] = [punto(ts[i], lado, alto), punto(t, lado, alto)]
        return { posicion: a.clone().add(b).multiplyScalar(0.5), giro: new Quaternion().setFromUnitVectors(EJE_X, b.clone().sub(a).normalize()), largo: a.distanceTo(b) }
      })
    })
    const estribos = ([[g.inicio, 0, 1], [g.fin, 1, -1]] as const).flatMap(([p, t, sentido]) => {
      const arriba = cotaTablero(t, ci, cf, puente.joroba.valor) - puente.espesorTablero.valor
      const abajo = cota(p.x, p.y) - ELEVACION_VIA - puente.profundidadEstribo.valor
      if (arriba <= abajo) return []
      const [cx, cy] = [p.x + g.direccion.x * sentido * (puente.largoEstribo.valor / 2), p.y + g.direccion.y * sentido * (puente.largoEstribo.valor / 2)]
      return [{ posicion: [cx, (arriba + abajo) / 2, -cy] as [number, number, number], alto: arriba - abajo }]
    })
    return { geometria, giroEstribo: Math.atan2(g.direccion.y, g.direccion.x), ancho: g.ancho, postes: postes.map((p) => ({ ...p, base: punto(p.t, p.lado, 0) })), pasamanos, estribos }
  }, [referencia])
  const { lado, alturaBaranda: alto } = { lado: puente.ladoPoste.valor, alturaBaranda: puente.alturaBaranda.valor }
  return (
    <group>
      <mesh geometry={obra.geometria}>
        <meshStandardMaterial color={tablero} />
      </mesh>
      {obra.postes.map((p, i) => (
        <mesh key={i} position={[p.base.x, p.base.y + alto / 2, p.base.z]}>
          <boxGeometry args={[lado, alto, lado]} />
          <meshStandardMaterial color={baranda} />
        </mesh>
      ))}
      {obra.pasamanos.map((r, i) => (
        <mesh key={i} position={r.posicion} quaternion={r.giro}>
          <boxGeometry args={[r.largo, lado, lado]} />
          <meshStandardMaterial color={baranda} />
        </mesh>
      ))}
      {obra.estribos.map((e, i) => (
        <mesh key={i} position={e.posicion} rotation={[0, obra.giroEstribo, 0]}>
          <boxGeometry args={[puente.largoEstribo.valor, e.alto, obra.ancho + 2 * MARGEN_ESTRIBO]} />
          <meshStandardMaterial color={estribo} />
        </mesh>
      ))}
    </group>
  )
}
