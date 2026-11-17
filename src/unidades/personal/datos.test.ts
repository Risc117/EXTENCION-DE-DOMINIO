import { describe, expect, it } from 'vitest'
import creditosCrudos from '../../../datos/creditos.json'
import { todasLasMedidas } from '../comun/medidas'
import { rutas } from './datos'
import { esquemaRutas } from './esquema'

describe('datos de rutas', () => {
  it('todo lo estimado es Dato de ejemplo', () => {
    const medidas = todasLasMedidas(rutas)
    expect(medidas.length).toBeGreaterThan(20)
    for (const m of medidas) expect(m.demo).toBe(true)
    expect(rutas.vigilante.posicion.demo).toBe(true)
  })
  it('los modelos de técnicos y vehículos existen en los créditos como CC0', () => {
    for (const nombre of [rutas.tecnico.modelo, ...rutas.vehiculos.map((v) => v.modelo)]) {
      const c = creditosCrudos.modelos.find((m) => m.archivo === `public/modelos/${nombre}`)
      expect(c?.licencia).toMatch(/CC0/)
      expect(c?.autor).toBeTruthy()
    }
  })
  it('el esquema rechaza una ruta sin tramos, más vehículos en calidad baja que en alta y una pausa en cero', () => {
    const a = structuredClone(rutas)
    a.vehiculos[0].tramos = []
    expect(esquemaRutas.safeParse(a).success).toBe(false)
    const b = structuredClone(rutas)
    b.cantidades.vehiculos.baja = 9
    expect(esquemaRutas.safeParse(b).success).toBe(false)
    const c = structuredClone(rutas)
    c.tecnicos[0].paradas[0].pausa.valor = 0
    expect(esquemaRutas.safeParse(c).success).toBe(false)
  })
  it('hay 4 técnicos y 2 vehículos en calidad alta, y menos en baja', () => {
    expect(rutas.cantidades.tecnicos).toMatchObject({ alta: 4, baja: 2 })
    expect(rutas.cantidades.vehiculos).toMatchObject({ alta: 2, baja: 1 })
  })
})
