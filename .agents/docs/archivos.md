# Índice de archivos

Inventario de los archivos versionados del proyecto, incluidos los documentos de esta carpeta. Los archivos locales generados (por ejemplo, `.expo/`, bases de datos de `.codegraph/` y `node_modules/`) no forman parte de este catálogo. Actualiza esta lista al añadir, eliminar o cambiar de propósito un archivo.

## Raíz

- `AGENTS.md` — Instrucciones para agentes: stack, flujo de trabajo y reglas visuales.
- `README.md` — Presentación e instrucciones de uso/configuración del proyecto.
- `LICENSE` — Términos de licencia del proyecto.
- `app.json` — Configuración de Expo y metadatos de la aplicación.
- `babel.config.js` — Configuración de Babel para transformar el código.
- `eas.json` — Perfiles de compilación y despliegue con Expo Application Services.
- `eslint.config.js` — Reglas y configuración de ESLint.
- `metro.config.js` — Configuración del empaquetador Metro.
- `nativewind-env.d.ts` — Declaraciones de tipos de NativeWind.
- `package.json` — Dependencias, scripts y configuración de Jest.
- `pnpm-lock.yaml` — Versiones bloqueadas de dependencias.
- `pnpm-workspace.yaml` — Configuración del workspace de pnpm.
- `tailwind.config.js` — Configuración de Tailwind y tokens de color.
- `tsconfig.json` — Configuración del compilador TypeScript.
- `.gitignore` — Archivos y directorios excluidos de Git.

## Agentes, editor y contribución

- `.agents/docs/archivos.md` — Este índice de archivos.
- `.agents/docs/carpetas.md` — Descripción breve de las carpetas del proyecto.
- `.claude/settings.json` — Ajustes del proyecto para Claude Code.
- `.codegraph/.gitignore` — Exclusiones de Git para artefactos de Codegraph.
- `.vscode/extensions.json` — Extensiones recomendadas para VS Code.
- `.vscode/settings.json` — Ajustes de VS Code para el proyecto.
- `.github/CONTRIBUTING.md` — Guía para contribuir.
- `.github/PULL_REQUEST_TEMPLATE.md` — Plantilla para solicitudes de cambios.
- `.github/SECURITY.md` — Instrucciones para reportar vulnerabilidades.
- `.github/policies/master.md` — Política asociada a la rama principal.
- `.github/workflows/android-build.yml` — Flujo de integración para compilar Android.
- `.github/workflows/pr.yml` — Flujo de integración para pull requests.

## Mock y scripts

- `__mocks__/expo-file-system.ts` — Mock de Expo FileSystem usado durante pruebas.
- `scripts/reset-project.js` — Script para reiniciar/limpiar la plantilla del proyecto.

## Assets

- `assets/app_icon.svg` — Icono vectorial de la aplicación.
- `assets/logo.svg` — Logotipo vectorial.
- `assets/logo_color.svg` — Logotipo vectorial en color.
- `assets/expo.icon/Assets/pulso-glyph.svg` — Glifo usado por el icono de Expo.
- `assets/expo.icon/icon.json` — Configuración del icono de Expo.
- `assets/images/android-icon-background.png` — Fondo del icono adaptativo de Android.
- `assets/images/android-icon-foreground.png` — Primer plano del icono adaptativo de Android.
- `assets/images/android-icon-monochrome.png` — Variante monocromática del icono Android.
- `assets/images/expo-badge-white.png` — Insignia de Expo en blanco.
- `assets/images/expo-badge.png` — Insignia de Expo.
- `assets/images/expo-logo.png` — Logotipo de Expo.
- `assets/images/favicon.png` — Favicon de la versión web.
- `assets/images/icon.png` — Icono principal de la aplicación.
- `assets/images/logo-glow.png` — Logotipo con efecto de brillo.
- `assets/images/react-logo.png` — Logotipo de React para recursos de demostración.
- `assets/images/react-logo@2x.png` — Logotipo de React en resolución 2x.
- `assets/images/react-logo@3x.png` — Logotipo de React en resolución 3x.
- `assets/images/splash-icon.png` — Icono de la pantalla de inicio.
- `assets/images/tutorial-web.png` — Imagen ilustrativa del tutorial web.
- `assets/images/tabIcons/explore.png` — Icono de pestaña Explorar.
- `assets/images/tabIcons/explore@2x.png` — Icono Explorar en resolución 2x.
- `assets/images/tabIcons/explore@3x.png` — Icono Explorar en resolución 3x.
- `assets/images/tabIcons/home.png` — Icono de pestaña Inicio.
- `assets/images/tabIcons/home@2x.png` — Icono Inicio en resolución 2x.
- `assets/images/tabIcons/home@3x.png` — Icono Inicio en resolución 3x.

## Aplicación (`src/`)

- `src/app/_layout.tsx` — Layout raíz y configuración de navegación de la aplicación.
- `src/app/create-profile.tsx` — Pantalla para crear el perfil de usuario.
- `src/app/intro.tsx` — Pantalla de introducción/onboarding.
- `src/app/(tabs)/_layout.tsx` — Layout y navegación del grupo de pestañas.
- `src/app/(tabs)/explore.tsx` — Pantalla Explorar.
- `src/app/(tabs)/index.tsx` — Pantalla principal de la pestaña Inicio.
- `src/components/animated-icon.module.css` — Estilos CSS del icono animado para web.
- `src/components/animated-icon.tsx` — Componente de icono animado nativo.
- `src/components/animated-icon.web.tsx` — Implementación web del icono animado.
- `src/components/app-tabs.tsx` — Navegación visual de pestañas para nativo.
- `src/components/app-tabs.web.tsx` — Navegación visual de pestañas para web.
- `src/components/external-link.tsx` — Componente para abrir enlaces externos.
- `src/components/hint-row.tsx` — Fila reutilizable para mostrar una sugerencia.
- `src/components/themed-text.tsx` — Texto adaptado al tema de la aplicación.
- `src/components/themed-view.tsx` — Contenedor adaptado al tema de la aplicación.
- `src/components/web-badge.tsx` — Insignia informativa para la experiencia web.
- `src/components/intro/intro-carousel.tsx` — Carrusel de pantallas de introducción.
- `src/components/intro/intro-slide-view.tsx` — Presentación de una diapositiva de introducción.
- `src/components/intro/page-indicator.tsx` — Indicador de página del carrusel.
- `src/components/ui/button.tsx` — Componente de botón reutilizable.
- `src/components/ui/collapsible.tsx` — Componente de contenido expandible/colapsable.
- `src/constants/intro-slides.ts` — Contenido y datos de las diapositivas de onboarding.
- `src/constants/palette.js` — Paleta de colores compartida por la aplicación.
- `src/constants/theme.ts` — Tokens y acceso tipado a colores del tema.
- `src/global.css` — Estilos globales y directivas de Tailwind/NativeWind.
- `src/hooks/use-color-scheme.ts` — Hook nativo para consultar el esquema de color.
- `src/hooks/use-color-scheme.web.ts` — Implementación web del hook de esquema de color.
- `src/hooks/use-theme.ts` — Hook para acceder al tema de la aplicación.
- `src/hooks/use-user.ts` — Hook para acceder al estado del usuario.
- `src/providers/user-provider.tsx` — Proveedor del estado y ciclo de vida del usuario.
- `src/storage/user-storage.ts` — Persistencia local de los datos del usuario.
- `src/styles.d.ts` — Declaraciones de tipos para estilos/CSS.
- `src/types/user.ts` — Tipos TypeScript del perfil de usuario.
- `src/utils/user-profile.ts` — Utilidades para crear y manejar perfiles de usuario.

## Pruebas

- `src/components/__tests__/themed-text.test.tsx` — Pruebas del componente de texto temático.
- `src/components/intro/__tests__/intro-carousel.test.tsx` — Pruebas del carrusel de introducción.
- `src/components/ui/__tests__/button.test.tsx` — Pruebas del botón reutilizable.
- `src/constants/__tests__/palette.test.ts` — Pruebas de consistencia/contraste de la paleta.
- `src/providers/__tests__/user-provider.test.tsx` — Pruebas del proveedor de usuario.
- `src/storage/__tests__/user-storage.test.ts` — Pruebas del almacenamiento de usuario.
- `src/utils/__tests__/user-profile.test.ts` — Pruebas de utilidades de perfil.
