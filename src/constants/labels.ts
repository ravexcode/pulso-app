import type { Goal, Level, Sex, Units } from '@/types/user';
import type { BodyPart, Effort, Equipment, Requirement, Routine } from '@/types/workout';

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

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Máquinas',
  cable: 'Polea',
  bodyweight: 'Peso corporal',
};

export const REQUIREMENT_LABELS: Record<Requirement, string> = {
  barbell: 'Barra',
  plates: 'Discos',
  rack: 'Rack',
  bench: 'Banco plano',
  'incline-bench': 'Banco inclinado',
  dumbbells: 'Mancuernas',
  'leg-press': 'Prensa',
  'chest-press': 'Máquina de press',
  'leg-curl': 'Máquina de femoral',
  'leg-extension': 'Máquina de extensión',
  cable: 'Polea',
  'pull-up-bar': 'Barra de dominadas',
  mat: 'Esterilla',
};

/** Tag for exercises that need nothing. */
export const NO_REQUIREMENTS_LABEL = 'Sin material';

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  legs: 'Piernas',
  glutes: 'Glúteos',
  core: 'Core',
};
