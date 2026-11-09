/** Lee un color definido en src/ui/tokens.css (ej.: "--color-muro"). */
export function leerColor(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}
