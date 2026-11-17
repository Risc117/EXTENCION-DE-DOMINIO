import { Suspense, useMemo } from 'react'
import { useCalidad } from '../../estado/calidad'
import { GRADOS_MEDIA_VUELTA } from '../../nucleo/constantesViento'
import { useVida } from '../../estado/vida'
import { centroDe, vida } from './datos'
import { Animal } from './Animal'
import { Moscas } from './Moscas'
import { Pasto } from './Pasto'
import { posicionEnCirculo, posicionEnRuta } from './reparto'

const rango = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Perro, palomas, aves y garza de datos/vida.json (de ejemplo): cada uno con su ruta; menos animales en calidad baja. */
function Animales({ referencia }: { referencia: number }) {
  const calidad = useCalidad((s) => s.calidad)
  const c = vida.cantidades
  const lecho = useMemo(() => centroDe(vida.paloma.lecho), [])
  return (
    <>
      {rango(c.perros[calidad]).map((i) => (
        <Animal key={`perro${i}`} modelo={vida.perro.modelo} tamano={vida.perro.tamano.valor} animacion={vida.perro.animacion} referencia={referencia} pose={(t) => posicionEnRuta(vida.pasto.franja.puntos, vida.perro.velocidad.valor, t, i / c.perros[calidad])} />
      ))}
      {rango(c.palomas[calidad]).map((i) => (
        <Animal key={`paloma${i}`} modelo={vida.paloma.modelo} tamano={vida.paloma.tamano.valor} animacion={vida.paloma.animacion} referencia={referencia} pose={(t) => posicionEnCirculo(lecho, vida.paloma.radio.valor, vida.paloma.velocidad.valor, t, i / c.palomas[calidad])} />
      ))}
      {rango(c.aves[calidad]).map((i) => (
        <Animal key={`ave${i}`} modelo={vida.ave.modelo} tamano={vida.ave.tamano.valor} altura={vida.ave.altura.valor} aletea referencia={referencia} pose={(t) => posicionEnCirculo(vida.ave.centro, vida.ave.radio.valor, vida.ave.velocidad.valor, t, i / c.aves[calidad])} />
      ))}
      <Animal modelo={vida.garza.modelo} tamano={vida.garza.tamano.valor} referencia={referencia} pose={() => ({ ...vida.garza.posicion, rumbo: (vida.garza.rumbo.valor * Math.PI) / GRADOS_MEDIA_VUELTA })} />
    </>
  )
}

/** La vida de la planta (pasto, animales y moscas), con el interruptor "Vida". */
export function Vida({ referencia }: { referencia: number }) {
  const visible = useVida((s) => s.visible)
  if (!visible) return null
  return (
    <Suspense fallback={null}>
      <Pasto referencia={referencia} />
      <Animales referencia={referencia} />
      <Moscas referencia={referencia} />
    </Suspense>
  )
}
