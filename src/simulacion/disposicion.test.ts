import { describe, expect, it } from 'vitest'
import crudo from '../../datos/linea.json'
import { disponerLinea } from './disposicion'
import { esquemaLinea } from './lineaEsquema'

const nodos = esquemaLinea.parse(crudo).nodos
const lugar = Object.fromEntries(disponerLinea(nodos).map((n) => [n.id, n]))

describe('disponerLinea', () => {
  it('pone la entrada en la columna 0 y cada unidad después de las que le mandan agua', () => {
    expect(lugar.bombeo.columna).toBe(0)
    for (const n of nodos) for (const d of n.destinos) expect(lugar[d.id].columna, `${n.id} → ${d.id}`).toBeGreaterThan(lugar[n.id].columna)
  })
  it('los dos sedimentadores quedan en la misma columna y en filas distintas', () => {
    expect(lugar['sedimentador-1'].columna).toBe(lugar['sedimentador-2'].columna)
    expect(lugar['sedimentador-1'].fila).not.toBe(lugar['sedimentador-2'].fila)
  })
  it('la salida es la última columna', () => {
    const ultima = Math.max(...Object.values(lugar).map((n) => n.columna))
    expect(lugar.salida.columna).toBe(ultima)
  })
})
