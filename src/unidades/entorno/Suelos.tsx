import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { BufferGeometry, DoubleSide, Float32BufferAttribute } from 'three'
import { leerColor } from '../../nucleo/colores'
import { ANCHO_MAXIMO_FRANJA, ELEVACION_VIA, LARGO_PATRON_RIO, PASO_ENTORNO, SEGMENTOS_CIRCULO } from '../../nucleo/constantesEntorno'
import { alturaNivelada, terrenoNivelado } from './terrenoNivelado'
import { entorno } from './datos'
import { cintaEntreMargenes } from './franjas'
import { cintaVia, circuloSobreTerreno, type MallaPlana } from './geometria'
import { losaPavimento, poligonoCirculo } from './nivelacion'
import { Losa } from '../comun/Losa'

const aGeometria = (m: MallaPlana): BufferGeometry => {
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(m.posiciones, 3))
  g.setIndex(m.indices)
  g.computeVertexNormals()
  return g
}

/** Vías (cintas sobre el terreno), camino de acceso, rotonda, estacionamiento, patio de maniobras y radio de seguridad del grupo electrógeno. */
export function Suelos({ referencia }: { referencia: number }) {
  const [via, pavimento, seguridad, caminoColor] = useMemo(() => ['--color-via', '--color-pavimento', '--color-radio-seguridad', '--color-camino'].map(leerColor), [])
  const camino = useMemo(() => aGeometria(cintaEntreMargenes(entorno.camino.margenesA, entorno.camino.margenB, PASO_ENTORNO, alturaNivelada, referencia, ELEVACION_VIA, LARGO_PATRON_RIO, ANCHO_MAXIMO_FRANJA)), [referencia])
  const cintas = useMemo(() => entorno.vias.map((v) => ({ id: v.id, geometria: aGeometria(cintaVia(v.eje, v.ancho.valor, terrenoNivelado().vias[v.id]?.cinta ?? alturaNivelada, referencia, PASO_ENTORNO)) })), [referencia])
  // Pavimentos a ras: losa delgada con su espesor enterrado bajo el terreno nivelado, sin paredes (T16.8.3).
  const losas = useMemo(() => {
    const losa = (id: string, poligono: { x: number; y: number }[], cotaPiso: number, espesor: number) => {
      const l = losaPavimento(cotaPiso, espesor)
      return { id, poligono, base: l.base - referencia, alto: l.alto }
    }
    const rotondas = entorno.rotondas.map((r) => losa(r.id, poligonoCirculo(r.centro, r.radio.valor), r.cotaPiso.valor, r.espesor.valor))
    return [...entorno.superficies.map((s) => losa(s.id, s.poligono, s.cotaPiso.valor, s.espesor.valor)), ...rotondas]
  }, [referencia])
  const anillos = useMemo(() => entorno.radiosSeguridad.map((r) => ({ id: r.id, puntos: circuloSobreTerreno(r.centro, r.radio.valor, SEGMENTOS_CIRCULO, alturaNivelada, referencia, 0.15) })), [referencia])
  return (
    <group>
      {cintas.map((c) => (
        <mesh key={c.id} geometry={c.geometria}>
          <meshStandardMaterial color={via} side={DoubleSide} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      <mesh geometry={camino}>
        <meshStandardMaterial color={caminoColor} side={DoubleSide} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      {losas.map((l) => (
        <Losa key={l.id} poligono={l.poligono} base={l.base} alto={l.alto} color={pavimento} />
      ))}
      {anillos.map((a) => (
        <Line key={a.id} points={a.puntos} color={seguridad} lineWidth={2} />
      ))}
    </group>
  )
}
