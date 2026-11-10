import { Escena } from './escena/Escena'
import { useEntrada } from './entrada'
import { useSimulacion } from './simulacion'
import { AvisoDemo } from './ui/AvisoDemo'
import { PanelAjusteGestos } from './ui/PanelAjusteGestos'
import { PanelGestos } from './ui/PanelGestos'
import { PanelSimulacion } from './ui/PanelSimulacion'

export function App() {
  useEntrada()
  useSimulacion()
  return (
    <>
      <Escena />
      <AvisoDemo />
      <PanelGestos />
      <PanelAjusteGestos />
      <PanelSimulacion />
    </>
  )
}
