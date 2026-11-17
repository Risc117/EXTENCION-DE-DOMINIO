import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry, Color, DoubleSide } from 'three'
import { leerColor } from '../../nucleo/colores'
import { CALIDAD_TERRENO_SALTO, OPACIDAD_TERRENO_CORTE, PROFUNDIDAD_FALDON, recortarCuadricula, terreno } from '../../nucleo/terreno'
import { useCalidad } from '../../estado/calidad'
import { useCorte } from '../../estado/flujo'
import { faldonTerreno, fraccionAltura, geometriaTerreno } from './geometriaTerreno'
import { superficieTerreno } from './superficie'
import { ventanaVisible } from './ventana'

/** Malla del terreno de la zona visible (río y planta) coloreada por altura, con un faldón que deja el borde limpio. Con el corte activo se vuelve translúcida para ver lo enterrado. */
export function Terreno({ referencia }: { referencia: number }) {
  const calidad = useCalidad((s) => s.calidad)
  const corteActivo = useCorte((s) => s.activo)
  const malla = useMemo(() => recortarCuadricula(superficieTerreno(CALIDAD_TERRENO_SALTO[calidad]), ventanaVisible()), [calidad])
  const colorFaldon = useMemo(() => leerColor('--color-terreno-bajo'), [])
  const faldon = useMemo(() => {
    const d = faldonTerreno(malla, referencia, PROFUNDIDAD_FALDON)
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(d.posiciones, 3))
    g.setIndex(new BufferAttribute(d.indices, 1))
    g.computeVertexNormals()
    return g
  }, [malla, referencia])
  const geometria = useMemo(() => {
    const d = geometriaTerreno(malla, referencia)
    const [bajo, alto] = [new Color(leerColor('--color-terreno-bajo')), new Color(leerColor('--color-terreno-alto'))]
    const minimo = terreno.cotaBase.valor
    const maximo = d.cotas.reduce((m, c) => Math.max(m, c), minimo)
    const colores = new Float32Array(d.cotas.length * 3)
    d.cotas.forEach((cota, i) => bajo.clone().lerp(alto, fraccionAltura(cota, minimo, maximo)).toArray(colores, i * 3))
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(d.posiciones, 3))
    g.setAttribute('color', new BufferAttribute(colores, 3))
    g.setIndex(new BufferAttribute(d.indices, 1))
    g.computeVertexNormals()
    return g
  }, [malla, referencia])
  useEffect(() => () => geometria.dispose(), [geometria])
  useEffect(() => () => faldon.dispose(), [faldon])
  return (
    <>
      <mesh geometry={faldon}>
        <meshStandardMaterial color={colorFaldon} side={DoubleSide} transparent={corteActivo} opacity={corteActivo ? OPACIDAD_TERRENO_CORTE : 1} depthWrite={!corteActivo} />
      </mesh>
      <mesh geometry={geometria}>
        <meshStandardMaterial
          vertexColors
          side={DoubleSide}
          transparent={corteActivo}
          opacity={corteActivo ? OPACIDAD_TERRENO_CORTE : 1}
          depthWrite={!corteActivo}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
    </>
  )
}
