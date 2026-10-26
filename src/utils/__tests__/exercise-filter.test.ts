import { EXERCISE_CATALOG } from '@/constants/exercises';
import { filterExercises, getRequirements } from '@/utils/exercise-filter';

function names(equipment: Parameters<typeof filterExercises>[1]['equipment'], query = '') {
  return filterExercises(EXERCISE_CATALOG, { equipment, query }).map((exercise) => exercise.id);
}

describe('filterExercises', () => {
  it('shows every exercise without filters', () => {
    expect(names([])).toHaveLength(EXERCISE_CATALOG.length);
  });

  it('shows only the chosen equipment', () => {
    const dumbbellOnly = filterExercises(EXERCISE_CATALOG, { equipment: ['dumbbell'], query: '' });

    expect(dumbbellOnly.length).toBeGreaterThan(0);
    dumbbellOnly.forEach((exercise) => expect(exercise.equipment).toBe('dumbbell'));
  });

  it('combines several equipment types', () => {
    const ids = names(['barbell', 'cable']);

    expect(ids).toContain('squat');
    expect(ids).toContain('lat-pulldown');
    expect(ids).not.toContain('goblet-squat');
  });

  it('searches the name and the muscles, ignoring case and accents', () => {
    expect(names([], 'JALON')).toEqual(['lat-pulldown']);
    expect(names([], 'tricep')).toContain('triceps-pushdown');
    expect(names(['bodyweight'], 'gluteos')).toEqual(
      expect.arrayContaining(['bodyweight-squat', 'glute-bridge'])
    );
  });
});

describe('body part filter', () => {
  it('shows only the chosen body parts', () => {
    const back = filterExercises(EXERCISE_CATALOG, {
      equipment: ['dumbbell'],
      bodyParts: ['back'],
      query: '',
    });

    expect(back.map((exercise) => exercise.id)).toEqual(
      expect.arrayContaining(['one-arm-dumbbell-row', 'dumbbell-bent-over-row', 'dumbbell-pullover'])
    );
    back.forEach((exercise) => expect(exercise.bodyPart).toBe('back'));
  });
});

describe('getRequirements', () => {
  it('joins the requirements without repeats, in a stable order', () => {
    expect(getRequirements(['bench-press', 'squat', 'biceps-curl'])).toEqual([
      'barbell',
      'plates',
      'rack',
      'bench',
      'dumbbells',
    ]);
  });

  it('is empty for exercises that need nothing', () => {
    expect(getRequirements(['push-up', 'bodyweight-squat'])).toEqual([]);
  });
});
