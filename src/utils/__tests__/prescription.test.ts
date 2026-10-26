import { getExercise } from '@/constants/exercises';
import { getRoutine } from '@/constants/routines';
import { calculateRest, estimateRoutineMinutes, getPrescription } from '@/utils/prescription';

const squat = getExercise('squat');
const curl = getExercise('biceps-curl');
const plank = getExercise('plank');

describe('getPrescription', () => {
  it('uses heavy loads and long rests for strength on compound exercises', () => {
    expect(getPrescription(squat, 'performance', 'intermediate')).toEqual({
      sets: 3,
      target: { kind: 'reps', min: 4, max: 6 },
      rest: { min: 120, base: 180, max: 300 },
    });
  });

  it('gives advanced lifters a longer base rest on heavy compound exercises', () => {
    expect(getPrescription(squat, 'performance', 'advanced').rest.base).toBe(240);
    expect(getPrescription(squat, 'build-muscle', 'advanced').rest.base).toBe(150);
  });

  it('keeps beginners on 8–12 repetitions even with a strength goal', () => {
    expect(getPrescription(squat, 'performance', 'beginner').target).toEqual({
      kind: 'reps',
      min: 8,
      max: 12,
    });
  });

  it('uses short rests and high repetitions to lose fat', () => {
    const prescription = getPrescription(curl, 'lose-fat', 'beginner');

    expect(prescription.target).toEqual({ kind: 'reps', min: 15, max: 20 });
    expect(prescription.rest.base).toBeLessThan(60);
  });

  it('rests less on isolation exercises than on compound exercises', () => {
    for (const goal of ['performance', 'build-muscle', 'lose-fat', 'maintain'] as const) {
      expect(getPrescription(curl, goal, 'intermediate').rest.base).toBeLessThan(
        getPrescription(squat, goal, 'intermediate').rest.base
      );
    }
  });

  it('uses a hold time for time exercises', () => {
    expect(getPrescription(plank, 'maintain', 'beginner').target).toEqual({
      kind: 'time',
      seconds: 30,
    });
  });
});

describe('calculateRest', () => {
  const prescription = getPrescription(squat, 'build-muscle', 'intermediate'); // 90–120–180

  it('uses the base rest for a moderate set', () => {
    expect(calculateRest(prescription, { effort: 'moderate', reps: 10 })).toBe(120);
  });

  it('rests more after a hard set and less after an easy set', () => {
    expect(calculateRest(prescription, { effort: 'hard', reps: 10 })).toBe(150);
    expect(calculateRest(prescription, { effort: 'easy', reps: 10 })).toBe(90);
  });

  it('treats a set below the target repetitions as hard', () => {
    expect(calculateRest(prescription, { effort: 'easy', reps: 6 })).toBe(150);
  });

  it('stays inside the range of the exercise', () => {
    const strength = getPrescription(squat, 'performance', 'advanced'); // 120–240–300

    expect(calculateRest(strength, { effort: 'hard', reps: 5 })).toBe(300);
  });
});

describe('estimateRoutineMinutes', () => {
  it('estimates a realistic duration for a full body routine', () => {
    const routine = getRoutine('full-body-a')!;
    const minutes = estimateRoutineMinutes(routine, 'build-muscle', 'intermediate');

    expect(minutes).toBeGreaterThan(30);
    expect(minutes).toBeLessThan(75);
  });
});
