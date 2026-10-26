import {
  createCustomRoutine,
  CUSTOM_ROUTINE_LIMITS,
  findRoutine,
  InvalidCustomRoutineError,
  isCustomRoutine,
  sortByGuidelines,
  toRoutine,
  updateCustomRoutine,
  validateCustomRoutineInput,
} from '@/utils/custom-routine';

const now = new Date('2026-10-25T12:00:00.000Z');

describe('validateCustomRoutineInput', () => {
  it('accepts a name and known exercises', () => {
    expect(validateCustomRoutineInput({ name: 'Pierna', exerciseIds: ['squat'] })).toEqual([]);
  });

  it.each([
    [{ name: '  ', exerciseIds: ['squat'] }, ['name']],
    [
      { name: 'x'.repeat(CUSTOM_ROUTINE_LIMITS.nameMaxLength + 1), exerciseIds: ['squat'] },
      ['name'],
    ],
    [{ name: 'Pierna', exerciseIds: [] }, ['exerciseIds']],
    [{ name: 'Pierna', exerciseIds: ['squat', 'squat'] }, ['exerciseIds']],
    [{ name: 'Pierna', exerciseIds: ['flying-kick'] }, ['exerciseIds']],
    [
      { name: 'Pierna', exerciseIds: Array(CUSTOM_ROUTINE_LIMITS.maxExercises + 1).fill('x') },
      ['exerciseIds'],
    ],
  ])('rejects %p', (input, errors) => {
    expect(validateCustomRoutineInput(input)).toEqual(errors);
  });
});

describe('createCustomRoutine and updateCustomRoutine', () => {
  it('creates a routine with a trimmed name and timestamps', () => {
    expect(createCustomRoutine({ name: ' Pierna ', exerciseIds: ['squat'] }, now)).toEqual({
      id: `custom-${now.getTime()}`,
      name: 'Pierna',
      exerciseIds: ['squat'],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('updates the fields and keeps the id and creation date', () => {
    const routine = createCustomRoutine({ name: 'Pierna', exerciseIds: ['squat'] }, now);
    const later = new Date('2026-10-26T12:00:00.000Z');

    expect(
      updateCustomRoutine(routine, { name: 'Pierna 2', exerciseIds: ['leg-press'] }, later)
    ).toEqual({
      ...routine,
      name: 'Pierna 2',
      exerciseIds: ['leg-press'],
      updatedAt: later.toISOString(),
    });
  });

  it('throws for invalid input', () => {
    expect(() => createCustomRoutine({ name: '', exerciseIds: [] })).toThrow(
      InvalidCustomRoutineError
    );
  });
});

describe('isCustomRoutine', () => {
  it('checks data read from disk', () => {
    const routine = createCustomRoutine({ name: 'Pierna', exerciseIds: ['squat'] }, now);

    expect(isCustomRoutine(routine)).toBe(true);
    expect(isCustomRoutine({ ...routine, createdAt: 'yesterday' })).toBe(false);
    expect(isCustomRoutine(null)).toBe(false);
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
  const home = createCustomRoutine({ name: 'Casa', exerciseIds: ['push-up', 'plank'] }, now);
  const gym = createCustomRoutine({ name: 'Gym', exerciseIds: ['push-up', 'goblet-squat'] }, now);

  it('marks the routine as custom and works out the place', () => {
    expect(toRoutine(home)).toMatchObject({
      isCustom: true,
      place: 'home',
      description: '2 ejercicios elegidos por ti.',
    });
    expect(toRoutine(gym).place).toBe('gym');
  });

  it('finds plans and custom routines', () => {
    expect(findRoutine('full-body-a', [home])?.name).toBe('Full Body A');
    expect(findRoutine(home.id, [home])?.name).toBe('Casa');
    expect(findRoutine('missing', [home])).toBeUndefined();
    expect(findRoutine(undefined, [home])).toBeUndefined();
  });
});
