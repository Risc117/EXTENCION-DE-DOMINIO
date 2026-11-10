import { Escena } from './escena/Escena'
import { useEntrada } from './entrada'
import { useGuion, useParticulas, useSimulacion } from './simulacion'
import { AvisoDemo } from './ui/AvisoDemo'
import { Bienvenida } from './ui/Bienvenida'
import { Leyenda } from './ui/Leyenda'
import { PanelAjusteGestos } from './ui/PanelAjusteGestos'
import { PanelCalidad } from './ui/PanelCalidad'
import { PanelCorte } from './ui/PanelCorte'
import { PanelDemo } from './ui/PanelDemo'
import { PanelGestos } from './ui/PanelGestos'
import { PanelSimulacion } from './ui/PanelSimulacion'

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
        <PanelCorte />
        <PanelCalidad />
      </div>
      <PanelDemo />
      <PanelGestos />
      <PanelAjusteGestos />
      <PanelSimulacion />
      <Leyenda />
      <Bienvenida />
    </>
  )
}
