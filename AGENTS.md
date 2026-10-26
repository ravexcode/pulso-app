# Pulso

- Description: This is a app built for personal improvement. Training
- Stack: ReactNative + NativeWind + pnpm
- Workflow: Always follow this workflow: 
  - Plan: Create a plan before building nothing, you must consider the app requirements, dependences and stack. Create a to-do list for follow the plan step by step
  - Build: Start building considerin the plan
  - Verify: Run typecheck `pnpm lint`, then jest for testing your changes `pnpm jest`
  - Done: Mark as done.

## Project structure

Set a folder by the things that that do, for example: /src/components for app components or /src/layouts for Layouts like Dashboard

## Colors

The app is dark only. The palette lives in `src/constants/palette.js` and feeds both Tailwind (`tailwind.config.js`) and `src/constants/theme.ts`. Never hardcode hex values in components: use the Tailwind classes (`bg-background`, `text-foreground`, `bg-accent-200`, ...) or `Colors` from `theme.ts`.

Scales go from lighter (100) to darker (900).

| Token | DEFAULT | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|-------|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| `accent` | `#FAFAFA` | `#FAFAFA` | `#E9E9E9` | `#D9D9D9` | `#C8C8C8` | `#B8B8B8` | `#A7A7A7` | `#969696` | `#868686` | `#757575` |
| `background` | `#010101` | `#3D3D3D` | `#363636` | `#2E2E2E` | `#272727` | `#1F1F1F` | `#181818` | `#101010` | `#090909` | `#010101` |

Text (`foreground`) adapts to the surface it sits on:

| Token | Value | Use |
|-------|-------|-----|
| `foreground` | `#FAFAFA` | Main text on `background` |
| `foreground-muted` | `#C8C8C8` | Secondary text |
| `foreground-subtle` | `#969696` | Hints, disabled text |
| `foreground-inverse` | `#010101` | Text on `accent` surfaces |

Rules:
- Every `accent` step keeps at least 4.5:1 contrast on `background` (WCAG AA). Keep it when adding colors; `src/constants/__tests__/palette.test.ts` checks it.
- Lighter `background` steps are elevated surfaces (cards, selected items).
- Tailwind `darkMode` is `'class'`. Do not switch it to `'media'`: NativeWind's web runtime throws `Cannot manually set color scheme, as dark mode is type 'media'`. Do not use `dark:` variants, the app has a single theme.
