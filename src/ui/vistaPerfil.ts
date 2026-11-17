import type { DatosPerfil, PuntoPerfil } from '../estado/perfil'
import { MIN_ANCHO_UNIDAD_PERFIL, PASO_MARCA_X_PERFIL, PASO_MARCA_Y_PERFIL } from '../nucleo/constantesPerfil'
import { TEXTO_PERFIL as T } from '../nucleo/textosPerfil'

export interface Marco {
  ancho: number
  alto: number
  izquierda: number
  derecha: number
  arriba: number
  abajo: number
}

export interface GeometriaPerfil {
  x: (s: number) => number
  y: (cota: number) => number
  terreno: string
  segmentos: { id: string; tipo: 'tubo' | 'unidad'; d: string }[]
  unidades: { id: string; nombre: string; x: number; ancho: number; yArriba: number; yAbajo: number; elegida: boolean; demo: boolean }[]
  buzones: { id: string; x: number; yTapa: number; yFondo: number; tapa: number; fondo: number; demo: boolean }[]
  marcasX: { valor: number; x: number }[]
  marcasY: { valor: number; y: number }[]
}

const camino = (puntos: PuntoPerfil[], x: (s: number) => number, y: (c: number) => number): string => puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.s).toFixed(1)} ${y(p.cota).toFixed(1)}`).join(' ')

/** Coordenadas de pantalla (px) del perfil dentro de un marco: progresiva hacia la derecha, cota hacia arriba. */
export function geometriaPerfil(p: DatosPerfil, m: Marco, elegida: string | null): GeometriaPerfil {
  const [ancho, alto] = [m.ancho - m.izquierda - m.derecha, m.alto - m.arriba - m.abajo]
  const x = (s: number) => m.izquierda + (s / p.largo) * ancho
  const y = (cota: number) => m.arriba + ((p.cotaMaxima - cota) / (p.cotaMaxima - p.cotaMinima)) * alto
  const pasoY = p.cotaMaxima - p.cotaMinima <= PASO_MARCA_Y_PERFIL.rangoCorto ? PASO_MARCA_Y_PERFIL.corto : PASO_MARCA_Y_PERFIL.largo
  const marcas = (desde: number, hasta: number, paso: number) => {
    const lista: number[] = []
    for (let v = Math.ceil(desde / paso) * paso; v <= hasta + 1e-9; v += paso) lista.push(v)
    return lista
  }
  return {
    x,
    y,
    terreno: camino(p.terreno, x, y),
    segmentos: p.segmentos.map((s) => ({ id: s.id, tipo: s.tipo, d: camino(s.puntos, x, y) })),
    unidades: p.unidades.map((u) => {
      const ancho = Math.max(x(u.hasta) - x(u.desde), MIN_ANCHO_UNIDAD_PERFIL)
      return { id: u.id, nombre: u.nombre, x: (x(u.desde) + x(u.hasta)) / 2 - ancho / 2, ancho, yArriba: y(u.corona), yAbajo: y(u.fondo), elegida: elegida === u.id, demo: u.demo }
    }),
    buzones: p.buzones.map((b) => ({ id: b.id, x: x(b.s), yTapa: y(b.tapa), yFondo: y(b.fondo), tapa: b.tapa, fondo: b.fondo, demo: b.demo })),
    marcasX: marcas(0, p.largo, PASO_MARCA_X_PERFIL).map((valor) => ({ valor, x: x(valor) })),
    marcasY: marcas(p.cotaMinima, p.cotaMaxima, pasoY).map((valor) => ({ valor, y: y(valor) })),
  }
}

export interface FilaTablaPerfil {
  nombre: string
  s: number
  /** Texto de la cota: "fondo a coronación" en una unidad, "tapa y fondo" en un buzón. */
  cotas: string
  ejemplo: boolean
}

/** Tabla alternativa al gráfico: unidades y buzones por progresiva (las unidades primero cuando coinciden). */
export function filasTablaPerfil(p: DatosPerfil): FilaTablaPerfil[] {
  const filas: (FilaTablaPerfil & { orden: number })[] = [
    ...p.unidades.map((u) => ({ nombre: u.nombre, s: u.desde, cotas: T.rangoUnidad(u.fondo.toFixed(2), u.corona.toFixed(2)), ejemplo: u.demo, orden: 0 })),
    ...p.buzones.map((b) => ({ nombre: b.id, s: b.s, cotas: T.cotasBuzon(b.tapa.toFixed(2), b.fondo.toFixed(2)), ejemplo: b.demo, orden: 1 })),
  ]
  return filas.sort((a, b) => a.s - b.s || a.orden - b.orden).map((f) => ({ nombre: f.nombre, s: f.s, cotas: f.cotas, ejemplo: f.ejemplo }))
}
