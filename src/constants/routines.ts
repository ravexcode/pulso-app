/**
 * Full body plans. Each plan has a single day that trains the whole body and repeats on every
 * training day, which the ACSM recommends for novice and intermediate lifters 2–3 days per
 * week. Exercises follow the ACSM order: large muscle groups and multi-joint exercises first,
 * small and single-joint ones last.
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
];

export function getRoutine(id: string): Routine | undefined {
  return ROUTINES.find((routine) => routine.id === id);
}
