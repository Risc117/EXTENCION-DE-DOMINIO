import { Escena } from './escena/Escena'
import { useEntrada } from './entrada'
import { useGuion, useParticulas, useSimulacion } from './simulacion'
import { AvisoDemo } from './ui/AvisoDemo'
import { Bienvenida } from './ui/Bienvenida'
import { DiagramaLinea } from './ui/DiagramaLinea'
import { Leyenda } from './ui/Leyenda'
import { PanelAjusteGestos } from './ui/PanelAjusteGestos'
import { PanelDemo } from './ui/PanelDemo'
import { PanelGestos } from './ui/PanelGestos'
import { PanelHerramientas } from './ui/PanelHerramientas'
import { PanelSimulacion } from './ui/PanelSimulacion'
import { TarjetaUnidad } from './ui/TarjetaUnidad'

export function App() {
  useEntrada()
  useSimulacion()
  useParticulas()
  useGuion()
  return (
    <>
      <Escena />
      <AvisoDemo />
      <div className="herramientas">
        <PanelHerramientas />
      </div>
      <PanelDemo />
      <PanelGestos />
      <PanelAjusteGestos />
      <PanelSimulacion />
      <TarjetaUnidad />
      <DiagramaLinea />
      <Leyenda />
      <Bienvenida />
    </>
  )
}
