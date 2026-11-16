import { PROLONGACION_TUBO } from '../../nucleo/constantes'
import { todasLasMedidas } from '../comun/medidas'
import type { UnidadBase } from '../tipos'
import { disponer } from './disposicion'
import type { DatosSedimentador } from './esquema'
import { Sedimentador } from './Sedimentador'

/** Crea una unidad a partir de la descripción común: los dos sedimentadores usan los mismos datos y solo cambian el id, el nombre y la parte del caudal. */
export function crearUnidadSedimentador(datos: DatosSedimentador, id: string, nombre: string, fraccion = 1): UnidadBase {
  const s = disponer(datos)
  return {
    id,
    nombre,
    demo: todasLasMedidas(datos).some((m) => m.demo === true),
    // Con las tuberías de entrada y de purga, que sobresalen del canal.
    tamano: 2 * (s.radioCanalExterior + PROLONGACION_TUBO),
    Componente: () => <Sedimentador datos={datos} fraccion={fraccion} />,
  }
}
