---
description: Ejecuta un ticket o subticket de tickets/ de punta a punta con el flujo del proyecto.
argument-hint: [ID, por ejemplo T1 o T2.1]
disable-model-invocation: true
---
1. Lee tickets/$ARGUMENTS.md completo. Si falta algo, pregunta.
2. Propón un plan corto en lenguaje simple y espera el OK.
3. Escribe las pruebas primero y luego el código.
4. Corre npm run lint, npm run typecheck y npm test; muestra el resultado.
5. Pasa qa-revisor.
   - OBSERVADO: escribe los subtickets en tickets/ y dile al usuario cuál sigue.
   - APROBADO: haz el commit "[$ARGUMENTS] ..." con rutas explícitas.
6. Termina diciendo qué se ve ahora y cómo probarlo con npm run dev.
