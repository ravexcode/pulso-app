import { getExercise } from '@/constants/exercises';
import type { RoutineDay } from '@/types/workout';
import {
  addFocus,
  autoSortWeek,
  createEmptyDays,
  getExerciseDays,
  getRecoveryWarnings,
  getSplitTemplate,
  getTrainedParts,
  moveExercise,
  removeFocus,
  setDayCount,
  toggleExercise,
} from '@/utils/week-plan';

const day = (exerciseIds: string[], focus: RoutineDay['focus'] = []): RoutineDay => ({
  focus,
  exerciseIds,
});

describe('day count', () => {
  it('adds empty days', () => {
    expect(setDayCount([day(['squat'])], 3)).toEqual([day(['squat']), day([]), day([])]);
  });

  it('moves the exercises and focus of removed days to the last day that stays', () => {
    const days = [day(['squat'], ['legs']), day(['bench-press'], ['chest']), day(['squat'])];

    expect(setDayCount(days, 1)).toEqual([day(['squat', 'bench-press'], ['legs', 'chest'])]);
  });

  it('keeps the count between 1 and 7', () => {
    expect(setDayCount(createEmptyDays(2), 0)).toHaveLength(1);
    expect(setDayCount(createEmptyDays(2), 9)).toHaveLength(7);
  });
});

describe('editing days', () => {
  it('adds and removes focus without repeats', () => {
    const days = addFocus(addFocus(createEmptyDays(2), 1, 'back'), 1, 'back');

    expect(days[1].focus).toEqual(['back']);
    expect(removeFocus(days, 1, 'back')[1].focus).toEqual([]);
  });

  it('repeats an exercise on several days and removes it from one', () => {
    let days = toggleExercise(createEmptyDays(3), 0, 'squat');
    days = toggleExercise(days, 2, 'squat');

    expect(getExerciseDays(days, 'squat')).toEqual([0, 2]);
    expect(getExerciseDays(toggleExercise(days, 0, 'squat'), 'squat')).toEqual([2]);
  });

  it('moves an exercise inside its day', () => {
    const days = [day(['squat', 'bench-press', 'plank'])];

    expect(moveExercise(days, 0, 0, 1)[0].exerciseIds).toEqual(['bench-press', 'squat', 'plank']);
    expect(moveExercise(days, 0, 0, -1)).toEqual(days);
  });

  it('lists the body parts a day trains', () => {
    expect(getTrainedParts(day(['plank', 'squat', 'bench-press']))).toEqual([
      'chest',
      'legs',
      'core',
    ]);
  });
});

describe('getSplitTemplate', () => {
  it.each([
    [1, 'Cuerpo completo'],
    [2, 'Superior / Inferior'],
    [3, 'Empuje / Tirón / Pierna'],
    [4, 'Superior / Inferior, dos veces'],
  ])('recommends a split for %p days', (count, name) => {
    const template = getSplitTemplate(count);

    expect(template.name).toBe(name);
    expect(template.days).toHaveLength(count);
  });
});

describe('autoSortWeek', () => {
  it('splits the exercises into push, pull and legs for 3 days', () => {
    const days = [
      day(['biceps-curl', 'bench-press', 'squat', 'barbell-row', 'triceps-pushdown', 'leg-press']),
      day([]),
      day([]),
    ];

    const sorted = autoSortWeek(days);

    expect(sorted.map((item) => item.exerciseIds)).toEqual([
      ['bench-press', 'triceps-pushdown'],
      ['barbell-row', 'biceps-curl'],
      ['squat', 'leg-press'],
    ]);
    expect(sorted[0].focus).toEqual(['chest', 'shoulders', 'triceps']);
  });

  it('keeps how many times an exercise repeats and spreads the repeats apart', () => {
    // Squat twice a week, upper/lower twice: it should go on both lower days (2 and 4).
    const days = [day(['squat', 'bench-press']), day(['squat']), day([]), day([])];

    const sorted = autoSortWeek(days);

    expect(getExerciseDays(sorted, 'squat')).toEqual([1, 3]);
    expect(getExerciseDays(sorted, 'bench-press')).toHaveLength(1);
  });

  it('puts multi-joint exercises first inside each day', () => {
    const sorted = autoSortWeek([day(['plank', 'lateral-raise', 'squat', 'push-up'])]);

    const kinds = sorted[0].exerciseIds.map((id) => getExercise(id).kind);
    expect(kinds).toEqual(['compound', 'compound', 'isolation', 'isolation']);
  });

  it('does not lose exercises that fit no day of the split', () => {
    const days = [day(['plank', 'superman', 'bench-press']), day([])];

    const sorted = autoSortWeek(days);

    expect(sorted.flatMap((item) => item.exerciseIds).sort()).toEqual(
      ['bench-press', 'plank', 'superman'].sort()
    );
  });
});

describe('getRecoveryWarnings', () => {
  it('warns when a body part is trained on consecutive days', () => {
    const days = [day(['squat']), day(['leg-press', 'bench-press']), day(['push-up'])];

    expect(getRecoveryWarnings(days)).toEqual([
      { dayIndex: 1, previousDayIndex: 0, parts: ['legs'] },
      { dayIndex: 2, previousDayIndex: 1, parts: ['chest'] },
    ]);
  });

  it('does not warn when the groups change every day', () => {
    expect(getRecoveryWarnings([day(['squat']), day(['bench-press'])])).toEqual([]);
  });
});
