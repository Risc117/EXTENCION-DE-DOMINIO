import { useEstado } from '../estado/almacen'
import type { EstadoGestos } from '../estado/almacen'
import { TEXTO_GESTOS } from '../nucleo/textos'

export function PanelGestos() {
  const gestos = useEstado((s) => s.gestos)
  const pedidos = useEstado((s) => s.gestosPedidos)
  const manoDetectada = useEstado((s) => s.manoDetectada)
  const pausado = useEstado((s) => s.pausado)
  const pedirGestos = useEstado((s) => s.pedirGestos)
  const mensaje = MENSAJES[gestos]

  return (
    <div className="panel-gestos">
      <button type="button" onClick={() => pedirGestos(!pedidos)} disabled={gestos === 'iniciando'}>
        {pedidos ? TEXTO_GESTOS.desactivar : TEXTO_GESTOS.activar}
      </button>
      {gestos === 'activo' && (
        <span className={manoDetectada ? 'mano mano-si' : 'mano mano-no'}>
          {manoDetectada ? TEXTO_GESTOS.manoSi : TEXTO_GESTOS.manoNo}
        </span>
      )}
      {gestos === 'activo' && pausado && <span className="mano mano-pausa">{TEXTO_GESTOS.pausado}</span>}
      {mensaje && <p className="mensaje-gestos">{mensaje}</p>}
    </div>
  )
}

const MENSAJES: Record<EstadoGestos, string | null> = {
  apagado: null,
  iniciando: TEXTO_GESTOS.iniciando,
  activo: null,
  denegado: TEXTO_GESTOS.denegado,
  error: TEXTO_GESTOS.error,
}
