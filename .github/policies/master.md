# Política de la rama `master`

`master` es la rama estable y protegida del proyecto.

## Reglas

- No se hacen pushes directos; todo cambio entra mediante pull request.
- Cada pull request debe tener al menos una revisión aprobatoria.
- Debe pasar el workflow **Pull request checks** (lint y typecheck).
- Los conflictos deben resolverse antes de mezclar.
- Los cambios que afecten la compilación deben validarse también con el build Android cuando corresponda.
- Se recomienda usar `Squash and merge` para conservar un historial legible.
- No se mezclan secretos, credenciales, datos personales ni cambios que permitan uso comercial no autorizado.

## Configuración recomendada en GitHub

En **Settings → Branches → Branch protection rules**, configura `master` con:

- pull request obligatorio antes de mezclar;
- una aprobación obligatoria;
- status check obligatorio: `Lint and typecheck`;
- ramas actualizadas antes de mezclar;
- resolución obligatoria de conversaciones;
- bloqueo de force-push y eliminación de la rama.

Esta política documenta la configuración esperada; los controles efectivos dependen de la configuración del repositorio en GitHub.
