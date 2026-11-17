import type { ReactNode } from 'react'
import { TEXTO_HERRAMIENTAS as T } from '../nucleo/textos'
import { PanelAccesorios } from './PanelAccesorios'
import { PanelAnotaciones } from './PanelAnotaciones'
import { PanelCalidad } from './PanelCalidad'
import { PanelConexiones } from './PanelConexiones'
import { PanelCorte } from './PanelCorte'
import { PanelTerreno } from './PanelTerreno'
import { PanelUnidades } from './PanelUnidades'

function Grupo({ titulo, abierto = false, children }: { titulo: string; abierto?: boolean; children: ReactNode }) {
  return (
    <details className="cajon__grupo" open={abierto}>
      <summary>{titulo}</summary>
      {children}
    </details>
  )
}

/** Cajón de herramientas: todas las opciones de vista en un solo cajón plegable, agrupadas. Solo "Ir a" empieza abierto. */
export function PanelHerramientas() {
  return (
    <details className="cajon" open>
      <summary>{T.titulo}</summary>
      <Grupo titulo={T.grupoUnidades} abierto>
        <PanelUnidades />
      </Grupo>
      <Grupo titulo={T.grupoCorte}>
        <PanelCorte />
      </Grupo>
      <Grupo titulo={T.grupoCapas}>
        <PanelAccesorios />
        <PanelConexiones />
        <PanelTerreno />
      </Grupo>
      <Grupo titulo={T.grupoAnotaciones}>
        <PanelAnotaciones />
      </Grupo>
      <Grupo titulo={T.grupoCalidad}>
        <PanelCalidad />
      </Grupo>
    </details>
  )
}
