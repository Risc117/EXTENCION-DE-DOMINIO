import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/tokens.css'
import './ui/estilos.css'
import { App } from './App'
import { useEstado } from './estado/almacen'
import { useBombeo } from './estado/bombeo'
import { useFlujo } from './estado/flujo'
import { useSim } from './estado/simulacion'
import { unidades } from './unidades/registro'

useEstado.getState().fijarDatosDemo(unidades.some((u) => u.demo))
useEstado.getState().fijarUnidadesEnfocables(unidades.map((u) => ({ id: u.id, nombre: u.nombre })))
const hidraulica = unidades.find((u) => u.hidraulica)?.hidraulica
if (hidraulica) useSim.getState().fijarTanque(hidraulica)
const bombeo = unidades.find((u) => u.bombeo)?.bombeo
if (bombeo) useBombeo.getState().fijarParametros(bombeo)
const flujo = unidades.find((u) => u.flujo)?.flujo
if (flujo) useFlujo.getState().fijarFlujo(flujo)

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
