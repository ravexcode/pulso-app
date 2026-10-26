# Pulso

Pulso es una aplicación móvil personal para planificar y registrar entrenamientos de **bodybuilding**. El proyecto está pensado para uso propio: ayuda a organizar sesiones, ejercicios y progresión sin sustituir la orientación de un entrenador o profesional sanitario.

## Stack

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) y [React Native 0.88](https://reactnative.dev/)
- [React 19](https://react.dev/) con [TypeScript](https://www.typescriptlang.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/) para navegación basada en archivos
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/), Gesture Handler y Safe Area Context
- Expo Image, Constants, Device, Font, Linking, Splash Screen, Status Bar, Symbols, System UI y Web Browser
- [Expo UI](https://docs.expo.dev/versions/v58.0.0/sdk/ui/) para componentes nativos
- pnpm para gestión de dependencias y GitHub Actions para validaciones y builds Android

## Requisitos

- Node.js `22.13.x` o compatible con Expo SDK 58
- pnpm 10+
- Android Studio y un emulador Android, o un dispositivo Android con depuración habilitada
- Para builds en la nube: una cuenta de [Expo](https://expo.dev/) y `EXPO_TOKEN`

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd pulso-android
pnpm install
```

Inicia el proyecto con:

```bash
pnpm start          # menú de Expo
pnpm android        # abre en Android
pnpm web            # versión web
```

También puedes abrir el proyecto con Expo Go cuando las APIs usadas estén disponibles. Para módulos nativos o un entorno más cercano a producción, usa un development build.

## Desarrollo

Las pantallas viven en `src/app/` y siguen el enrutamiento basado en archivos de Expo Router. Los componentes reutilizables están en `src/components/`, los hooks en `src/hooks/` y los tokens visuales en `src/constants/`.

Antes de abrir un pull request:

```bash
pnpm lint
pnpm exec tsc --noEmit
```

## Build Android

Los builds Android se ejecutan con [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

El workflow de GitHub Actions de `.github/workflows/android-build.yml` ejecuta el mismo build al hacer push a `master` o manualmente. Configura el secreto `EXPO_TOKEN` en el repositorio antes de usarlo. El proyecto debe estar vinculado a un proyecto de Expo/EAS para builds no interactivos.

## Uso

1. Abre la app y revisa la sesión disponible.
2. Selecciona el grupo muscular y los ejercicios de la sesión.
3. Registra series, repeticiones, carga y notas.
4. Usa el historial para observar la progresión y ajustar el siguiente entrenamiento.

La información de entrenamiento es orientativa. Entrena dentro de tus límites y detente si sientes dolor o malestar.

## Licencia

Pulso se distribuye bajo una **licencia de uso personal y no comercial**. No está permitido vender, sublicenciar, redistribuir como producto comercial ni usar el proyecto para prestar servicios comerciales sin autorización escrita. Consulta [LICENSE](./LICENSE).

Las dependencias de terceros conservan sus propias licencias.

## Políticas del repositorio

- [Contribución](./.github/CONTRIBUTING.md)
- [Política de la rama master](./.github/policies/master.md)
- [Seguridad](./.github/SECURITY.md)
