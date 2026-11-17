import { describe, expect, it } from 'vitest'
import crudo from '../../../datos/ambiente.json'
import terreno from '../../../datos/terreno.json'
import { utmSurAGeograficas } from '../../nucleo/utm'
import { todasLasMedidas } from '../comun/medidas'
import { esquemaAmbiente } from './esquema'

const datos = esquemaAmbiente.parse(crudo)
const clon = () => structuredClone(crudo)

describe('datos/ambiente.json', () => {
  it('es válido y cada medida trae su fuente', () => {
    for (const m of todasLasMedidas(datos)) expect(m.fuente.length).toBeGreaterThan(10)
  })
  it('la latitud y la longitud son la conversión del origen UTM de datos/terreno.json (±0.001°)', () => {
    const p = utmSurAGeograficas(terreno.origenUtm.este, terreno.origenUtm.norte, 18)
    expect(datos.ubicacion.latitud.valor).toBeCloseTo(p.latitud, 3)
    expect(datos.ubicacion.longitud.valor).toBeCloseTo(p.longitud, 3)
    expect(terreno.origenUtm.zona).toContain('18')
  })
  it('las luminarias son las 7 del DXF (capa PTAR-LUMINARIA, ya restado el origen UTM), a lo largo de la vía interna', () => {
    const esperadas = [[-6.27, -75.29], [-9.82, -61.59], [-11.1, -44.48], [-11.27, -26.56], [-9.17, -10.12], [-0.22, 3.22], [11.01, 17.63]]
    expect(datos.luminarias.puntos.map((p) => [p.x, p.y])).toEqual(esperadas)
    expect(datos.luminarias.fuentePuntos).toContain('PTAR-LUMINARIA')
  })
  it('lo estimado es Dato de ejemplo: alturas y radios de las luminarias y el giro del norte (por confirmar)', () => {
    for (const m of [datos.luminarias.alturaPoste, datos.luminarias.radioPoste, datos.luminarias.radioLuz, datos.giroNorte]) expect(m.demo).toBe(true)
    expect(datos.giroNorte.fuente).toContain('POR CONFIRMAR')
    expect(datos.ubicacion.latitud.demo).not.toBe(true)
  })
  it('rechaza datos malos: sin fuente, latitud fuera de rango, mes 13 y poste sin altura', () => {
    const sin = clon()
    sin.ubicacion.latitud.fuente = ''
    expect(esquemaAmbiente.safeParse(sin).success).toBe(false)
    const lat = clon()
    lat.ubicacion.latitud.valor = -120
    expect(esquemaAmbiente.safeParse(lat).success).toBe(false)
    const mes = clon()
    mes.fecha.mes = 13
    expect(esquemaAmbiente.safeParse(mes).success).toBe(false)
    const poste = clon()
    poste.luminarias.alturaPoste.valor = 0
    expect(esquemaAmbiente.safeParse(poste).success).toBe(false)
  })
})
