import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/tokens.css'
import './ui/estilos.css'
import { App } from './App'
import { useEstado } from './estado/almacen'
import { unidades } from './unidades/registro'

useEstado.getState().fijarDatosDemo(unidades.some((u) => u.demo))

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
