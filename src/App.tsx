import { Escena } from './escena/Escena'
import { useEntrada } from './entrada'
import { AvisoDemo } from './ui/AvisoDemo'
import { PanelAjusteGestos } from './ui/PanelAjusteGestos'
import { PanelGestos } from './ui/PanelGestos'

export function App() {
  useEntrada()
  return (
    <>
      <Escena />
      <AvisoDemo />
      <PanelGestos />
      <PanelAjusteGestos />
    </>
  )
}
