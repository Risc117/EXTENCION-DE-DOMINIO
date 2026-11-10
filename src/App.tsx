import { Escena } from './escena/Escena'
import { useEntrada } from './entrada'
import { useParticulas, useSimulacion } from './simulacion'
import { AvisoDemo } from './ui/AvisoDemo'
import { PanelAjusteGestos } from './ui/PanelAjusteGestos'
import { Leyenda } from './ui/Leyenda'
import { PanelCorte } from './ui/PanelCorte'
import { PanelGestos } from './ui/PanelGestos'
import { PanelSimulacion } from './ui/PanelSimulacion'

export function App() {
  useEntrada()
  useSimulacion()
  useParticulas()
  return (
    <>
      <Escena />
      <AvisoDemo />
      <PanelGestos />
      <PanelAjusteGestos />
      <PanelSimulacion />
      <PanelCorte />
      <Leyenda />
    </>
  )
}
