import { describe, expect, it } from 'vitest'
import { datos, distancia, tramo, unidad } from './ayudaPruebas'

/** Unidades que todavía no tienen piezas de tubería propias: rejas, Parshall y la cámara de reparto (T16.4, paso 4). */
const SIN_TUBOS = [
  { unidad: 'rejas', tramo: 'T04', extremo: 'fin', maximo: 0.3 },
  { unidad: 'parshall', tramo: 'T05', extremo: 'ini', maximo: 0.4 },
  { unidad: 'camara-reparto', tramo: 'T12', extremo: 'fin', maximo: 0.6 },
  { unidad: 'camara-reparto', tramo: 'T13', extremo: 'ini', maximo: 0.4 },
] as const

describe('T16.4 · extremos que llegan a unidades sin piezas de tubería propias', () => {
  it('cada extremo queda a menos de unos 0.5 m del borde de su unidad (el DXF se detiene en la pared o poco antes)', () => {
    for (const c of SIN_TUBOS) {
      const t = tramo(c.tramo)
      const p = c.extremo === 'ini' ? t.trazado[0] : t.trazado[t.trazado.length - 1]
      const u = unidad(c.unidad)
      expect(distancia(p, u.posicion) - u.tamano / 2, `${c.tramo} en ${c.unidad}`).toBeLessThan(c.maximo)
    }
  })

  it('las alturas de esos extremos no vienen del perfil (no las trae) y quedan de ejemplo', () => {
    for (const c of SIN_TUBOS) {
      const t = datos.tramos.find((x) => x.id === c.tramo)!
      const cota = c.extremo === 'ini' ? t.cotaSalida : t.cotaLlegada
      expect(cota.demo, `${c.tramo} ${c.extremo}`).toBe(true)
      expect(cota.fuente).toContain('derivado')
    }
  })
})
