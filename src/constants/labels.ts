import type { Goal, Level, Sex, Units } from '@/types/user';
import type { Effort, Routine } from '@/types/workout';

export const SEX_LABELS: Record<Sex, string> = {
  male: 'Hombre',
  female: 'Mujer',
  other: 'Otro',
};

export const GOAL_LABELS: Record<Goal, string> = {
  'lose-fat': 'Perder grasa',
  'build-muscle': 'Ganar músculo',
  maintain: 'Mantenerme',
  performance: 'Fuerza y rendimiento',
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export const UNIT_LABELS: Record<Units, string> = {
  metric: 'Métrico (kg, cm)',
  imperial: 'Imperial (lb, in)',
};

export const PLACE_LABELS: Record<Routine['place'], string> = {
  gym: 'Gimnasio',
  home: 'Casa',
};

export const EFFORT_LABELS: Record<Effort, { title: string; hint: string }> = {
  easy: { title: 'Fácil', hint: 'Me sobraban 3 o más repeticiones' },
  moderate: { title: 'Exigente', hint: 'Me sobraban 1 o 2 repeticiones' },
  hard: { title: 'Al límite', hint: 'No podía hacer ni una más' },
};
