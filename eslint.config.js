import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import boundaries from 'eslint-plugin-boundaries'

// Unidades de la PTAR: cada una vive en src/unidades/<unidad>/ y solo puede usar lo compartido de src/unidades/comun/ (y los datos de planta/).
const unidadesPtar = ['homogeneizador', 'bombeo', 'rejas', 'desarenador', 'parshall', 'marcador']

const capas = ['nucleo', 'simulacion', 'estado', 'entrada', 'escena', 'unidades', 'ui']

// Qué capas puede importar cada capa. Todo lo demás está prohibido.
const permitidas = {
  nucleo: [],
  estado: ['nucleo'],
  simulacion: ['nucleo', 'estado'],
  entrada: ['nucleo', 'estado'],
  unidades: ['nucleo', 'estado'],
  escena: ['nucleo', 'estado', 'unidades'],
  ui: ['nucleo', 'estado'],
}

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, boundaries },
    settings: {
      'import/resolver': { node: { extensions: ['.ts', '.tsx', '.js', '.json'] } },
      'boundaries/elements': [
        ...capas.map((tipo) => ({ type: tipo, pattern: `src/${tipo}` })),
        { type: 'raiz', pattern: 'src/*.{ts,tsx}' },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'boundaries/dependencies': [
        2,
        {
          default: 'disallow',
          policies: [
            ...capas.map((tipo) => ({
              from: { element: { type: tipo } },
              allow: { to: { element: { types: [tipo, ...permitidas[tipo]] } } },
            })),
            { from: { element: { type: 'raiz' } }, allow: { to: { element: { types: [...capas, 'raiz'] } } } },
          ],
        },
      ],
    },
  },
  ...unidadesPtar.map((u) => ({
    files: [`src/unidades/${u}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: unidadesPtar.filter((o) => o !== u).flatMap((o) => [`../${o}`, `../${o}/**`, `**/unidades/${o}/**`]),
              message: 'Una unidad no importa de otra: lo compartido va en src/unidades/comun/.',
            },
          ],
        },
      ],
    },
  })),
)
