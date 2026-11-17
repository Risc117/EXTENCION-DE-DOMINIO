import { TEXTO_DATO_EJEMPLO } from '../nucleo/constantes'
import { MARCO_PERFIL, TEXTO_EJE_PERFIL as P } from '../nucleo/constantesPerfil'
import { TEXTO_PERFIL as T } from '../nucleo/textosPerfil'
import { useEstado } from '../estado/almacen'
import { useBombeo } from '../estado/bombeo'
import { usePerfil } from '../estado/perfil'
import { useSeleccion } from '../estado/seleccion'
import { useSim } from '../estado/simulacion'
import { filasTablaPerfil, geometriaPerfil } from './vistaPerfil'

/** Perfil hidráulico: corte longitudinal de la línea de agua con el terreno, las tuberías, las unidades y los buzones; un clic en una unidad lleva la cámara a ella. */
export function PanelPerfil() {
  const perfil = usePerfil((s) => s.perfil)
  const elegida = useSeleccion((s) => s.id)
  const seleccionar = useSeleccion((s) => s.seleccionar)
  const irA = useEstado((s) => s.irA)
  const nivelHomogeneizador = useSim((s) => s.nivel)
  const nivelBombeo = useBombeo((s) => s.nivel)
  if (!perfil) return null
  const m = MARCO_PERFIL
  const g = geometriaPerfil(perfil, m, elegida)
  // Nivel de agua en vivo: solo el homogeneizador y la estación de bombeo lo tienen simulado.
  const nivelDe = (id: string): number | null => (id === 'homogeneizador' ? nivelHomogeneizador : id === 'bombeo' ? nivelBombeo : null)
  return (
    <details className="perfil-hidraulico">
      <summary>{T.titulo}</summary>
      {perfil.hayEjemplo && <p className="perfil-hidraulico__nota">{T.notaEjemplo(TEXTO_DATO_EJEMPLO)}</p>}
      <svg viewBox={`0 0 ${m.ancho} ${m.alto}`} role="img" aria-label={T.titulo} className="perfil-hidraulico__grafico">
        {g.marcasY.map((t) => (
          <g key={`y${t.valor}`}>
            <line x1={m.izquierda} x2={m.ancho - m.derecha} y1={t.y} y2={t.y} className="perfil-hidraulico__rejilla" />
            <text x={m.izquierda - P.margenY} y={t.y + P.bajaY} textAnchor="end" className="perfil-hidraulico__texto">
              {t.valor}
            </text>
          </g>
        ))}
        {g.marcasX.map((t) => (
          <text key={`x${t.valor}`} x={t.x} y={m.alto - P.marcaX} textAnchor="middle" className="perfil-hidraulico__texto">
            {t.valor}
          </text>
        ))}
        <text x={m.ancho / 2} y={m.alto - P.tituloX} textAnchor="middle" className="perfil-hidraulico__texto">
          {T.ejeX}
        </text>
        <text x={P.ejeYx} y={P.ejeYy} className="perfil-hidraulico__texto">
          {T.ejeY}
        </text>
        <path d={g.terreno} className="perfil-hidraulico__terreno" fill="none" />
        {g.unidades.map((u, i) => {
          const nivel = nivelDe(perfil.unidades[i].id)
          const cota = nivel === null ? null : g.y(perfil.unidades[i].fondo + nivel)
          return (
            <g key={u.id} className="perfil-hidraulico__unidad" onClick={() => { seleccionar(u.id); irA(u.id) }} role="button" aria-pressed={u.elegida}>
              <rect x={u.x} y={u.yArriba} width={u.ancho} height={Math.max(u.yAbajo - u.yArriba, 1)} className={u.elegida ? 'perfil-hidraulico__barra perfil-hidraulico__barra--elegida' : 'perfil-hidraulico__barra'}>
                <title>{T.tooltipUnidad(u.nombre, T.rangoUnidad(perfil.unidades[i].fondo.toFixed(2), perfil.unidades[i].corona.toFixed(2)), u.demo ? TEXTO_DATO_EJEMPLO : null)}</title>
              </rect>
              {cota !== null && <rect x={u.x} y={cota} width={u.ancho} height={Math.max(u.yAbajo - cota, 0)} className="perfil-hidraulico__agua" />}
            </g>
          )
        })}
        {g.segmentos.map((s) => (
          <path key={s.id} d={s.d} fill="none" className={s.tipo === 'tubo' ? 'perfil-hidraulico__tubo' : 'perfil-hidraulico__paso'} />
        ))}
        {g.buzones.map((b) => (
          <g key={b.id}>
            <line x1={b.x} x2={b.x} y1={b.yTapa} y2={b.yFondo} className="perfil-hidraulico__buzon" />
            <title>{T.tooltipBuzon(b.id, T.cotasBuzon(b.tapa.toFixed(2), b.fondo.toFixed(2)), b.demo ? TEXTO_DATO_EJEMPLO : null)}</title>
          </g>
        ))}
      </svg>
      <ul className="perfil-hidraulico__leyenda">
        {([['terreno', T.terreno], ['tubo', T.tubo], ['paso', T.paso], ['barra', T.unidad], ['agua', T.agua], ['buzon', T.buzon]] as const).map(([clase, texto]) => (
          <li key={clase}>
            <span className={`perfil-hidraulico__muestra perfil-hidraulico__muestra--${clase}`} /> {texto}
          </li>
        ))}
      </ul>
      <details className="perfil-hidraulico__tabla">
        <summary>{T.tabla}</summary>
        <table>
          <thead>
            <tr>
              <th>{T.progresiva}</th>
              <th>{T.elemento}</th>
              <th>{T.cotas}</th>
            </tr>
          </thead>
          <tbody>
            {filasTablaPerfil(perfil).map((f) => (
              <tr key={`${f.nombre}-${f.s}`}>
                <td>{f.s.toFixed(1)}</td>
                <th scope="row">{f.nombre}</th>
                <td>
                  {f.cotas}
                  {f.ejemplo ? `${T.separador}${TEXTO_DATO_EJEMPLO}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </details>
  )
}
