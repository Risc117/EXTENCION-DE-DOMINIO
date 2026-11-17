import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TEXTO_HERRAMIENTAS as T } from '../nucleo/textos'
import { PanelHerramientas } from './PanelHerramientas'

const html = renderToString(createElement(PanelHerramientas))

describe('cajón de herramientas', () => {
  it('es un solo cajón plegable con un título, abierto al principio', () => {
    expect(html).toContain(T.titulo)
    expect(html).toMatch(/<details[^>]*class="cajon"[^>]*open/)
  })

  it('reúne los grupos de opciones de vista, cada uno plegable', () => {
    for (const g of [T.grupoUnidades, T.grupoCorte, T.grupoCapas, T.grupoAnotaciones, T.grupoCalidad]) expect(html, g).toContain(`<summary>${g}</summary>`)
    expect((html.match(/<details/g) ?? []).length).toBeGreaterThanOrEqual(6)
  })

  it('el grupo de unidades empieza abierto y los demás cerrados, para no llenar la pantalla', () => {
    expect(html).toMatch(new RegExp(`<details[^>]*open[^>]*><summary>${T.grupoUnidades}</summary>`))
    for (const g of [T.grupoCorte, T.grupoCapas, T.grupoAnotaciones, T.grupoCalidad]) expect(html).not.toMatch(new RegExp(`<details[^>]*open[^>]*><summary>${g}</summary>`))
  })

  it('trae todos los botones de antes: corte, accesorios, tuberías, terreno, curvas, cotas, etiquetas y calidad', () => {
    for (const t of ['Ver corte', 'Ocultar accesorios', 'Ocultar tuberías', 'Ocultar terreno', 'Ocultar curvas de nivel', 'Cotas', 'Etiquetas', 'Vista general']) expect(html, t).toContain(t)
    expect(html).toContain(T.siempreActivar)
  })
})
