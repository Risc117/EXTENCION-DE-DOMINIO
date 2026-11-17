import { TEXTO_DATO_EJEMPLO } from '../nucleo/constantes'
import { TEXTO_LODOS_BIOGAS as T } from '../nucleo/textos'
import type { DatosLodosVivo, ProduccionVivo } from '../estado/lodosBiogas'

export interface FilaLodosBiogas {
  etiqueta: string
  valor: string
}

/** Cantidades por día de biogás y lodo del RAFA: solo lo que está en las hojas de cálculo (los volúmenes de lodo, corregidos, llevan "Dato de ejemplo"). */
export function filasLodosBiogas(p: ProduccionVivo | null, d: DatosLodosVivo | null): FilaLodosBiogas[] {
  if (!p || !d) return []
  const ejemplo = d.volumenEsEjemplo ? `${T.separador}${TEXTO_DATO_EJEMPLO}` : ''
  return [
    { etiqueta: T.biogas, valor: `${p.biogasM3dia.toFixed(1)} ${T.unidadDia} (${p.biogasM3h.toFixed(2)} ${T.unidadHora})` },
    { etiqueta: T.lodoSolidos, valor: `${p.lodoKgDia.toFixed(2)} ${T.solidosDia}` },
    { etiqueta: T.lodoHumedo(d.concentracionHumedo), valor: `${p.lodoHumedoM3dia.toFixed(2)} ${T.unidadDia}${ejemplo}` },
    { etiqueta: T.lodoDeshidratado(d.concentracionDeshidratado), valor: `${p.lodoDeshidratadoM3dia.toFixed(3)} ${T.unidadDia}${ejemplo}` },
    { etiqueta: T.lechos, valor: T.lechosValor(d.lechosAreaM2.toFixed(1), d.lechosCicloDias) },
    { etiqueta: T.sedimentadores, valor: T.sinDato },
  ]
}
