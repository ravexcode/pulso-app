import { EXERCISES } from '@/constants/exercises';
import { ROUTINES } from '@/constants/routines';

describe('routines', () => {
  it('has unique ids', () => {
    const ids = ROUTINES.map((routine) => routine.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(ROUTINES.map((routine) => [routine.name, routine] as const))(
    '%s only uses known exercises',
    (_, routine) => {
      routine.exerciseIds.forEach((id) => expect(EXERCISES[id]).toBeDefined());
    }
  );

  it.each(ROUTINES.map((routine) => [routine.name, routine] as const))(
    '%s puts compound exercises before isolation exercises',
    (_, routine) => {
      const kinds = routine.exerciseIds.map((id) => EXERCISES[id].kind);
      const firstIsolation = kinds.indexOf('isolation');

      if (firstIsolation >= 0) {
        expect(kinds.slice(firstIsolation)).not.toContain('compound');
      }
    }
  );

  it('home routines only use bodyweight exercises', () => {
    ROUTINES.filter((routine) => routine.place === 'home').forEach((routine) => {
      routine.exerciseIds.forEach((id) => expect(EXERCISES[id].equipment).toBe('bodyweight'));
    });
  });
});

describe('exercise catalog', () => {
  const exercises = Object.values(EXERCISES);

  it('lists the requirements of every equipment exercise', () => {
    exercises
      .filter((exercise) => exercise.equipment !== 'bodyweight')
      .forEach((exercise) => expect(exercise.requires.length).toBeGreaterThan(0));
  });

  it('does not repeat requirements', () => {
    exercises.forEach((exercise) =>
      expect(new Set(exercise.requires).size).toBe(exercise.requires.length)
    );
  });
});
