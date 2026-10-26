import type { RoutineDay } from '@/types/workout';
import {
  createCustomRoutine,
  CUSTOM_ROUTINE_LIMITS,
  findRoutine,
  getRoutineExerciseIds,
  InvalidCustomRoutineError,
  parseCustomRoutine,
  sortByGuidelines,
  toRoutine,
  updateCustomRoutine,
  validateCustomRoutineInput,
} from '@/utils/custom-routine';

const now = new Date('2026-10-25T12:00:00.000Z');

const legs: RoutineDay = { focus: ['legs'], exerciseIds: ['squat', 'leg-curl'] };
const push: RoutineDay = { focus: ['chest'], exerciseIds: ['bench-press', 'squat'] };

describe('validateCustomRoutineInput', () => {
  it('accepts several days and repeats an exercise on different days', () => {
    expect(validateCustomRoutineInput({ name: 'Semana', days: [legs, push] })).toEqual([]);
  });

  it('accepts as many exercises as the user wants in a day', () => {
    const many = ['squat', 'bench-press', 'deadlift', 'pull-up', 'push-up', 'plank', 'leg-press'];
    const day = {
      focus: [],
      exerciseIds: [
        ...many,
        'goblet-squat',
        'face-pull',
        'hammer-curl',
        'leg-curl',
        'superman',
        'hip-thrust',
      ],
    };

    expect(validateCustomRoutineInput({ name: 'Todo', days: [day] })).toEqual([]);
  });

  it.each([
    [{ name: '  ', days: [legs] }, ['name']],
    [{ name: 'x'.repeat(CUSTOM_ROUTINE_LIMITS.nameMaxLength + 1), days: [legs] }, ['name']],
    [{ name: 'Semana', days: [] }, ['days']],
    [{ name: 'Semana', days: Array(8).fill(legs) }, ['days']],
    [{ name: 'Semana', days: [{ focus: [], exerciseIds: [] }] }, ['days']],
    [{ name: 'Semana', days: [{ focus: [], exerciseIds: ['squat', 'squat'] }] }, ['days']],
    [{ name: 'Semana', days: [{ focus: [], exerciseIds: ['flying-kick'] }] }, ['days']],
    [{ name: 'Semana', days: [{ focus: ['wings'], exerciseIds: ['squat'] }] }, ['days']],
  ])('rejects %p', (input, errors) => {
    expect(validateCustomRoutineInput(input)).toEqual(errors);
  });
});

describe('createCustomRoutine and updateCustomRoutine', () => {
  it('creates a routine with a trimmed name and timestamps', () => {
    expect(createCustomRoutine({ name: ' Semana ', days: [legs] }, now)).toEqual({
      id: `custom-${now.getTime()}`,
      name: 'Semana',
      days: [legs],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('updates the fields and keeps the id and creation date', () => {
    const routine = createCustomRoutine({ name: 'Semana', days: [legs] }, now);
    const later = new Date('2026-10-26T12:00:00.000Z');

    expect(updateCustomRoutine(routine, { name: 'Semana 2', days: [legs, push] }, later)).toEqual({
      ...routine,
      name: 'Semana 2',
      days: [legs, push],
      updatedAt: later.toISOString(),
    });
  });

  it('throws for invalid input', () => {
    expect(() => createCustomRoutine({ name: '', days: [] })).toThrow(InvalidCustomRoutineError);
  });
});

describe('parseCustomRoutine', () => {
  const routine = createCustomRoutine({ name: 'Semana', days: [legs, push] }, now);

  it('reads a valid routine', () => {
    expect(parseCustomRoutine(routine)).toEqual(routine);
  });

  it('turns a routine saved before week plans into a one-day plan', () => {
    const { days: _days, ...legacy } = routine;

    expect(parseCustomRoutine({ ...legacy, exerciseIds: ['squat', 'plank'] })).toEqual({
      ...legacy,
      days: [{ focus: [], exerciseIds: ['squat', 'plank'] }],
    });
  });

  it('rejects invalid data', () => {
    expect(parseCustomRoutine({ ...routine, createdAt: 'yesterday' })).toBeNull();
    expect(parseCustomRoutine(null)).toBeNull();
  });
});

describe('sortByGuidelines', () => {
  it('puts compound exercises first and keeps the order inside each group', () => {
    expect(sortByGuidelines(['biceps-curl', 'squat', 'lateral-raise', 'bench-press'])).toEqual([
      'squat',
      'bench-press',
      'biceps-curl',
      'lateral-raise',
    ]);
  });
});

describe('toRoutine and findRoutine', () => {
  const home = createCustomRoutine(
    { name: 'Casa', days: [{ focus: [], exerciseIds: ['push-up', 'plank'] }] },
    now
  );
  const gym = createCustomRoutine({ name: 'Gym', days: [legs, push] }, now);

  it('marks the routine as custom and works out the place', () => {
    expect(toRoutine(home)).toMatchObject({
      isCustom: true,
      place: 'home',
      description: '1 día por semana, con ejercicios elegidos por ti.',
    });
    expect(toRoutine(gym)).toMatchObject({ place: 'gym', days: [legs, push] });
  });

  it('lists every exercise of the week once', () => {
    expect(getRoutineExerciseIds(gym)).toEqual(['squat', 'leg-curl', 'bench-press']);
  });

  it('finds plans and custom routines', () => {
    expect(findRoutine('full-body-a', [home])?.name).toBe('Full Body A');
    expect(findRoutine(home.id, [home])?.name).toBe('Casa');
    expect(findRoutine('missing', [home])).toBeUndefined();
    expect(findRoutine(undefined, [home])).toBeUndefined();
  });
});
