import { TEXTO_DATO_EJEMPLO } from '../nucleo/constantes'
import { useEstado } from '../estado/almacen'

export function AvisoDemo() {
  const hayDatosDemo = useEstado((s) => s.hayDatosDemo)
  if (!hayDatosDemo) return null
  return <div className="aviso-demo">{TEXTO_DATO_EJEMPLO}</div>
}
