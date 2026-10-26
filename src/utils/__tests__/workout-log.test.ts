import type { Routine, WorkoutLog } from '@/types/workout';
import {
  countWorkoutsThisWeek,
  getLastWeightKg,
  getNextDayIndex,
  getStartOfWeek,
  isWorkoutLog,
  summarizeWorkout,
} from '@/utils/workout-log';

function makeLog(startedAt: string, overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: startedAt,
    routineId: 'full-body-a',
    routineName: 'Full Body A',
    startedAt,
    endedAt: startedAt,
    durationSec: 3000,
    sets: [
      {
        exerciseId: 'squat',
        exerciseName: 'Sentadilla con barra',
        setNumber: 1,
        reps: 10,
        weightKg: 60,
        workSec: 40,
        effort: 'moderate',
        restSuggestedSec: 120,
        restTakenSec: 130,
      },
      {
        exerciseId: 'squat',
        exerciseName: 'Sentadilla con barra',
        setNumber: 2,
        reps: 8,
        weightKg: 62.5,
        workSec: 35,
        effort: 'hard',
        restSuggestedSec: 150,
      },
    ],
    ...overrides,
  };
}

describe('isWorkoutLog', () => {
  it('accepts a valid log', () => {
    expect(isWorkoutLog(makeLog('2026-10-20T10:00:00.000Z'))).toBe(true);
  });

  it('rejects invalid data', () => {
    expect(isWorkoutLog(null)).toBe(false);
    expect(isWorkoutLog(makeLog('not a date'))).toBe(false);
    const log = makeLog('2026-10-20T10:00:00.000Z');
    expect(isWorkoutLog({ ...log, sets: [{ ...log.sets[0], effort: 'extreme' }] })).toBe(false);
  });
});

describe('summarizeWorkout', () => {
  it('adds up sets, work, rest and volume', () => {
    expect(summarizeWorkout(makeLog('2026-10-20T10:00:00.000Z'))).toEqual({
      setCount: 2,
      workSec: 75,
      restSec: 130,
      volumeKg: 10 * 60 + 8 * 62.5,
    });
  });
});

describe('weeks', () => {
  // Sunday 25 October 2026, local time.
  const now = new Date(2026, 9, 25, 18, 0);

  it('starts the week on Monday', () => {
    expect(getStartOfWeek(now)).toEqual(new Date(2026, 9, 19, 0, 0));
  });

  it('counts only the workouts of the current week', () => {
    const history = [
      makeLog(new Date(2026, 9, 25, 9).toISOString()),
      makeLog(new Date(2026, 9, 19, 7).toISOString()),
      makeLog(new Date(2026, 9, 18, 20).toISOString()),
    ];

    expect(countWorkoutsThisWeek(history, now)).toBe(2);
  });
});

describe('getLastWeightKg', () => {
  it('returns the most recent weight for the exercise', () => {
    const history = [makeLog('2026-10-22T10:00:00.000Z'), makeLog('2026-10-20T10:00:00.000Z')];

    expect(getLastWeightKg(history, 'squat')).toBe(62.5);
    expect(getLastWeightKg(history, 'bench-press')).toBeUndefined();
  });
});

describe('getNextDayIndex', () => {
  const routine: Routine = {
    id: 'week',
    name: 'Semana',
    description: '',
    place: 'gym',
    days: [
      { focus: [], exerciseIds: ['squat'] },
      { focus: [], exerciseIds: [] },
      { focus: [], exerciseIds: ['bench-press'] },
    ],
  };
  const trained = (index: number, routineId = 'week') =>
    makeLog('2026-10-20T10:00:00.000Z', { routineId, day: { index, count: 3 } });

  it('starts on the first day', () => {
    expect(getNextDayIndex([], routine)).toBe(0);
  });

  it('goes to the next day with exercises and wraps around the week', () => {
    expect(getNextDayIndex([trained(0)], routine)).toBe(2);
    expect(getNextDayIndex([trained(2)], routine)).toBe(0);
  });

  it('ignores other routines', () => {
    expect(getNextDayIndex([trained(0, 'other')], routine)).toBe(0);
  });
});
