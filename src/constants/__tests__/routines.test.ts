import { EXERCISE_CATALOG, EXERCISES } from '@/constants/exercises';
import { ROUTINES } from '@/constants/routines';
import { BODY_PARTS } from '@/types/workout';
import { getRoutineExerciseIds } from '@/utils/custom-routine';
import { isHomeExercise } from '@/utils/exercise-filter';

describe('routines', () => {
  it('has unique ids', () => {
    const ids = ROUTINES.map((routine) => routine.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(ROUTINES.map((routine) => [routine.name, routine] as const))(
    '%s only uses known exercises',
    (_, routine) => {
      getRoutineExerciseIds(routine).forEach((id) => expect(EXERCISES[id]).toBeDefined());
    }
  );

  it.each(ROUTINES.map((routine) => [routine.name, routine] as const))(
    '%s puts compound exercises before isolation exercises',
    (_, routine) => {
      routine.days.forEach((day) => {
        const kinds = day.exerciseIds.map((id) => EXERCISES[id].kind);
        const firstIsolation = kinds.indexOf('isolation');

        if (firstIsolation >= 0) {
          expect(kinds.slice(firstIsolation)).not.toContain('compound');
        }
      });
    }
  );

  it('home routines only use bodyweight exercises', () => {
    ROUTINES.filter((routine) => routine.place === 'home').forEach((routine) => {
      getRoutineExerciseIds(routine).forEach((id) =>
        expect(EXERCISES[id].equipment).toBe('bodyweight')
      );
    });
  });
});

describe('exercise catalog', () => {
  const exercises = Object.values(EXERCISES);

  it('has unique ids', () => {
    expect(exercises).toHaveLength(EXERCISE_CATALOG.length);
  });

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

describe('dumbbell back exercises', () => {
  it('offers several back exercises that only need dumbbells and a bench at most', () => {
    const backWithDumbbells = Object.values(EXERCISES).filter(
      (exercise) => exercise.bodyPart === 'back' && exercise.equipment === 'dumbbell'
    );

    expect(backWithDumbbells.length).toBeGreaterThanOrEqual(6);
  });
});

describe('home exercises', () => {
  const homeExercises = EXERCISE_CATALOG.filter(isHomeExercise);

  it.each(BODY_PARTS.map((part) => [part]))('trains %s with home exercises', (part) => {
    expect(homeExercises.some((exercise) => exercise.bodyPart === part)).toBe(true);
  });

  it('offers at least 30 home exercises', () => {
    expect(homeExercises.length).toBeGreaterThanOrEqual(30);
  });

  it('home routines only need things found at home', () => {
    ROUTINES.filter((routine) => routine.place === 'home').forEach((routine) => {
      getRoutineExerciseIds(routine).forEach((id) => expect(isHomeExercise(EXERCISES[id])).toBe(true));
    });
  });
});
