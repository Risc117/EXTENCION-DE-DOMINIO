import { Escena } from './escena/Escena'
import { useEntrada } from './entrada'
import { useGuion, useParticulas, useSimulacion } from './simulacion'
import { AvisoDemo } from './ui/AvisoDemo'
import { Bienvenida } from './ui/Bienvenida'
import { DiagramaLinea } from './ui/DiagramaLinea'
import { IndicadorViento } from './ui/IndicadorViento'
import { Leyenda } from './ui/Leyenda'
import { PanelAjusteGestos } from './ui/PanelAjusteGestos'
import { PanelCalidadAgua } from './ui/PanelCalidadAgua'
import { PanelDemo } from './ui/PanelDemo'
import { PanelGestos } from './ui/PanelGestos'
import { PanelHerramientas } from './ui/PanelHerramientas'
import { PanelLodosBiogas } from './ui/PanelLodosBiogas'
import { PanelHora } from './ui/PanelHora'
import { PanelPerfil } from './ui/PanelPerfil'
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
      <div className="barra-hora">
        <PanelHora />
      </div>
      <IndicadorViento />
      <TarjetaUnidad />
      <div className="paneles-centro">
        <PanelPerfil />
        <DiagramaLinea />
      </div>
      <div className="paneles-derecha">
        <PanelCalidadAgua />
        <PanelLodosBiogas />
      </div>
      <Leyenda />
      <Bienvenida />
    </>
  )
}
