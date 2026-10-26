/**
 * Ready-made plans. Most have a single day that trains the whole body and repeats on every
 * training day, which the ACSM recommends for novice and intermediate lifters 2–3 days per
 * week. The upper / lower plan alternates two days, as the ACSM suggests for 4 days per week.
 * Exercises follow the ACSM order: large muscle groups and multi-joint exercises first, small
 * and single-joint ones last.
 *
 * Home plans only use bodyweight exercises, with a chair, a table or a mat at most.
 */

import type { Routine } from '@/types/workout';

export const ROUTINES: readonly Routine[] = [
  {
    id: 'full-body-beginner',
    name: 'Full Body Principiante',
    description: 'Máquinas guiadas para aprender los movimientos básicos con seguridad.',
    place: 'gym',
    level: 'beginner',
    days: [
      {
        focus: [],
        exerciseIds: [
          'leg-press',
          'chest-press-machine',
          'lat-pulldown',
          'dumbbell-shoulder-press',
          'leg-curl',
          'plank',
        ],
      },
    ],
  },
  {
    id: 'full-body-a',
    name: 'Full Body A',
    description: 'Básicos con barra: sentadilla, press de banca y remo. Altérnala con Full Body B.',
    place: 'gym',
    level: 'intermediate',
    days: [
      {
        focus: [],
        exerciseIds: [
          'squat',
          'bench-press',
          'barbell-row',
          'romanian-deadlift',
          'lateral-raise',
          'plank',
        ],
      },
    ],
  },
  {
    id: 'full-body-b',
    name: 'Full Body B',
    description: 'Peso muerto, press militar y jalón. Altérnala con Full Body A.',
    place: 'gym',
    level: 'intermediate',
    days: [
      {
        focus: [],
        exerciseIds: [
          'deadlift',
          'dumbbell-lunge',
          'incline-dumbbell-press',
          'lat-pulldown',
          'overhead-press',
          'biceps-curl',
          'triceps-pushdown',
        ],
      },
    ],
  },
  {
    id: 'full-body-home',
    name: 'Full Body en casa',
    description: 'Solo con tu peso corporal. Sin material y en poco espacio.',
    place: 'home',
    level: 'beginner',
    days: [
      {
        focus: [],
        exerciseIds: [
          'bodyweight-squat',
          'push-up',
          'reverse-lunge',
          'pike-push-up',
          'glute-bridge',
          'superman',
          'plank',
        ],
      },
    ],
  },
  {
    id: 'full-body-home-2',
    name: 'Full Body en casa II',
    description:
      'Más difícil que el plan básico: trabajo a una pierna y remo bajo una mesa. Solo necesitas una silla, una mesa y una esterilla.',
    place: 'home',
    level: 'intermediate',
    days: [
      {
        focus: [],
        exerciseIds: [
          'bulgarian-split-squat',
          'decline-push-up',
          'inverted-row',
          'single-leg-rdl',
          'chair-dip',
          'single-leg-glute-bridge',
          'side-plank',
          'dead-bug',
        ],
      },
    ],
  },
  {
    id: 'home-upper-lower',
    name: 'Superior / Inferior en casa',
    description:
      'Dos días que se alternan: tren superior y tren inferior. Pensado para 4 días por semana en casa.',
    place: 'home',
    level: 'intermediate',
    days: [
      {
        focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        exerciseIds: [
          'decline-push-up',
          'inverted-row',
          'pike-push-up',
          'underhand-inverted-row',
          'chair-dip',
          'prone-y-raise',
          'reverse-snow-angel',
        ],
      },
      {
        focus: ['legs', 'glutes', 'core'],
        exerciseIds: [
          'bulgarian-split-squat',
          'single-leg-rdl',
          'step-up',
          'lateral-lunge',
          'single-leg-glute-bridge',
          'calf-raise',
          'hollow-hold',
        ],
      },
    ],
  },
  {
    id: 'home-hiit-advanced',
    name: 'Casa intenso',
    description:
      'Saltos, flexiones exigentes y core. Para quien ya domina los básicos y quiere subir el ritmo.',
    place: 'home',
    level: 'advanced',
    days: [
      {
        focus: [],
        exerciseIds: [
          'jump-squat',
          'burpee',
          'bulgarian-split-squat',
          'diamond-push-up',
          'inverted-row',
          'pike-push-up',
          'mountain-climber',
          'hollow-hold',
          'plank-shoulder-tap',
        ],
      },
    ],
  },
];

export function getRoutine(id: string): Routine | undefined {
  return ROUTINES.find((routine) => routine.id === id);
}
