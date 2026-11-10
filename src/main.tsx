import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/tokens.css'
import './ui/estilos.css'
import { App } from './App'
import { useEstado } from './estado/almacen'
import { useSim } from './estado/simulacion'
import { unidades } from './unidades/registro'

useEstado.getState().fijarDatosDemo(unidades.some((u) => u.demo))
const hidraulica = unidades.find((u) => u.hidraulica)?.hidraulica
if (hidraulica) useSim.getState().fijarTanque(hidraulica)

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
