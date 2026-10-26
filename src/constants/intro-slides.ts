import type { SymbolViewProps } from 'expo-symbols';

export type IntroSlide = {
  key: string;
  title: string;
  description: string;
  /** `logo` shows the app logo; `symbol` shows an icon from `expo-symbols`. */
  visual: { kind: 'logo' } | { kind: 'symbol'; name: SymbolViewProps['name'] };
};

export const INTRO_SLIDES: readonly IntroSlide[] = [
  {
    key: 'welcome',
    title: 'Te damos la bienvenida a Pulso',
    description: 'Tu compañero para entrenar y mejorar un poco cada día.',
    visual: { kind: 'logo' },
  },
  {
    key: 'plan',
    title: 'Entrena con un plan',
    description: 'Rutinas adaptadas a tu objetivo, tu nivel y los días que puedes entrenar.',
    visual: {
      kind: 'symbol',
      name: {
        ios: 'figure.strengthtraining.traditional',
        android: 'fitness_center',
        web: 'fitness_center',
      },
    },
  },
  {
    key: 'progress',
    title: 'Mide tu progreso',
    description: 'Registra cada sesión y mira cómo avanzas semana a semana.',
    visual: {
      kind: 'symbol',
      name: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
    },
  },
];
