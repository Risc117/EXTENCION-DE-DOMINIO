import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { BufferGeometry, DoubleSide, Float32BufferAttribute } from 'three'
import { leerColor } from '../../nucleo/colores'
import { ANCHO_MAXIMO_FRANJA, ELEVACION_VIA, ENTERRADO_BASE, LARGO_PATRON_RIO, PASO_ENTORNO, SEGMENTOS_CIRCULO } from '../../nucleo/constantesEntorno'
import { alturaTerreno } from '../comun/terrenoPlanta'
import { entorno } from './datos'
import { cintaEntreMargenes } from './franjas'
import { cintaVia, circuloSobreTerreno, cotasBase, type MallaPlana } from './geometria'
import { Losa } from './Losa'

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
  const camino = useMemo(() => aGeometria(cintaEntreMargenes(entorno.camino.margenesA, entorno.camino.margenB, PASO_ENTORNO, alturaTerreno, referencia, ELEVACION_VIA, LARGO_PATRON_RIO, ANCHO_MAXIMO_FRANJA)), [referencia])
  const cintas = useMemo(() => entorno.vias.map((v) => ({ id: v.id, geometria: aGeometria(cintaVia(v.eje, v.ancho.valor, alturaTerreno, referencia, PASO_ENTORNO)) })), [referencia])
  const losas = useMemo(() => {
    const losa = (id: string, poligono: { x: number; y: number }[], espesor: number) => {
      const { base, piso } = cotasBase(poligono, alturaTerreno)
      return { id, poligono, base: base - ENTERRADO_BASE - referencia, alto: piso + espesor - base + ENTERRADO_BASE }
    }
    const rotondas = entorno.rotondas.map((r) => {
      const poligono = circuloSobreTerreno(r.centro, r.radio.valor, SEGMENTOS_CIRCULO, alturaTerreno, 0, 0)
        .slice(0, -1)
        .map(([x, , z]) => ({ x, y: -z }))
      return losa(r.id, poligono, r.espesor.valor)
    })
    return [...entorno.superficies.map((s) => losa(s.id, s.poligono, s.espesor.valor)), ...rotondas]
  }, [referencia])
  const anillos = useMemo(() => entorno.radiosSeguridad.map((r) => ({ id: r.id, puntos: circuloSobreTerreno(r.centro, r.radio.valor, SEGMENTOS_CIRCULO, alturaTerreno, referencia, 0.15) })), [referencia])
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
