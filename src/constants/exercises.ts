import type { Exercise } from '@/types/workout';

const EXERCISE_LIST: Exercise[] = [
  // Gym, barbell
  {
    id: 'squat',
    name: 'Sentadilla con barra',
    muscles: 'Cuádriceps y glúteos',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'barbell',
  },
  {
    id: 'bench-press',
    name: 'Press de banca',
    muscles: 'Pecho, hombros y tríceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'barbell',
  },
  {
    id: 'barbell-row',
    name: 'Remo con barra',
    muscles: 'Espalda y bíceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'barbell',
  },
  {
    id: 'romanian-deadlift',
    name: 'Peso muerto rumano',
    muscles: 'Isquiotibiales y glúteos',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'barbell',
  },
  {
    id: 'deadlift',
    name: 'Peso muerto',
    muscles: 'Espalda baja, glúteos e isquiotibiales',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'barbell',
  },
  {
    id: 'overhead-press',
    name: 'Press militar',
    muscles: 'Hombros y tríceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'barbell',
  },
  // Gym, dumbbells
  {
    id: 'dumbbell-shoulder-press',
    name: 'Press de hombros con mancuernas',
    muscles: 'Hombros y tríceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'dumbbell',
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Press inclinado con mancuernas',
    muscles: 'Pecho superior y hombros',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'dumbbell',
  },
  {
    id: 'dumbbell-lunge',
    name: 'Zancadas con mancuernas',
    muscles: 'Cuádriceps y glúteos',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'dumbbell',
  },
  {
    id: 'lateral-raise',
    name: 'Elevaciones laterales',
    muscles: 'Hombros',
    kind: 'isolation',
    tracking: 'reps',
    equipment: 'dumbbell',
  },
  {
    id: 'biceps-curl',
    name: 'Curl de bíceps',
    muscles: 'Bíceps',
    kind: 'isolation',
    tracking: 'reps',
    equipment: 'dumbbell',
  },
  // Gym, machines
  {
    id: 'leg-press',
    name: 'Prensa de piernas',
    muscles: 'Cuádriceps y glúteos',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'machine',
  },
  {
    id: 'chest-press-machine',
    name: 'Press de pecho en máquina',
    muscles: 'Pecho y tríceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'machine',
  },
  {
    id: 'lat-pulldown',
    name: 'Jalón al pecho',
    muscles: 'Espalda y bíceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'machine',
  },
  {
    id: 'seated-cable-row',
    name: 'Remo sentado en polea',
    muscles: 'Espalda media y bíceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'machine',
  },
  {
    id: 'leg-curl',
    name: 'Curl femoral en máquina',
    muscles: 'Isquiotibiales',
    kind: 'isolation',
    tracking: 'reps',
    equipment: 'machine',
  },
  {
    id: 'triceps-pushdown',
    name: 'Extensión de tríceps en polea',
    muscles: 'Tríceps',
    kind: 'isolation',
    tracking: 'reps',
    equipment: 'machine',
  },
  // Bodyweight
  {
    id: 'bodyweight-squat',
    name: 'Sentadilla',
    muscles: 'Cuádriceps y glúteos',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'bodyweight',
  },
  {
    id: 'push-up',
    name: 'Flexiones',
    muscles: 'Pecho, hombros y tríceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'bodyweight',
  },
  {
    id: 'reverse-lunge',
    name: 'Zancada atrás',
    muscles: 'Cuádriceps y glúteos',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'bodyweight',
  },
  {
    id: 'pike-push-up',
    name: 'Flexiones pike',
    muscles: 'Hombros y tríceps',
    kind: 'compound',
    tracking: 'reps',
    equipment: 'bodyweight',
  },
  {
    id: 'glute-bridge',
    name: 'Puente de glúteos',
    muscles: 'Glúteos e isquiotibiales',
    kind: 'isolation',
    tracking: 'reps',
    equipment: 'bodyweight',
  },
  {
    id: 'superman',
    name: 'Superman',
    muscles: 'Espalda baja',
    kind: 'isolation',
    tracking: 'reps',
    equipment: 'bodyweight',
  },
  {
    id: 'plank',
    name: 'Plancha',
    muscles: 'Core',
    kind: 'isolation',
    tracking: 'time',
    equipment: 'bodyweight',
  },
];

export const EXERCISES: Readonly<Record<string, Exercise>> = Object.fromEntries(
  EXERCISE_LIST.map((exercise) => [exercise.id, exercise])
);

export function getExercise(id: string): Exercise {
  const exercise = EXERCISES[id];
  if (!exercise) {
    throw new Error(`Unknown exercise: ${id}`);
  }
  return exercise;
}

export function usesWeight(exercise: Exercise) {
  return exercise.equipment !== 'bodyweight';
}
