import { getRoutine } from '@/constants/routines';
import type { Routine } from '@/types/workout';
import {
  createSession,
  getRemainingRest,
  getTotalSets,
  planRoutine,
  sessionReducer,
  toWorkoutLog,
  type SessionAction,
  type SessionState,
} from '@/utils/workout-session';

const routine: Routine = {
  id: 'test',
  name: 'Test',
  description: '',
  place: 'gym',
  level: 'beginner',
  exerciseIds: ['squat', 'plank'],
};

// Beginner + build-muscle: squat 2 × 8–12 (rest 90–120–180), plank 2 × 30 s.
const plan = planRoutine(routine, 'build-muscle', 'beginner');
const start = 1_000_000;

function run(actions: SessionAction[], state = createSession(routine, plan, start)): SessionState {
  return actions.reduce(sessionReducer, state);
}

describe('workout session', () => {
  it('starts ready on the first set of the first exercise', () => {
    const state = createSession(routine, plan, start);

    expect(state.phase).toEqual({ name: 'ready' });
    expect(state.exerciseIndex).toBe(0);
    expect(state.setNumber).toBe(1);
    expect(getTotalSets(plan)).toBe(4);
  });

  it('times the set and starts the calculated rest when the set ends', () => {
    const state = run([
      { type: 'startSet', now: start + 5_000 },
      { type: 'endSet', now: start + 45_000 },
      { type: 'logSet', effort: 'hard', reps: 10, weightKg: 60 },
    ]);

    expect(state.sets).toEqual([
      {
        exerciseId: 'squat',
        exerciseName: 'Sentadilla con barra',
        setNumber: 1,
        reps: 10,
        weightKg: 60,
        workSec: 40,
        effort: 'hard',
        restSuggestedSec: 150,
      },
    ]);
    // Rest counts from the end of the set, not from when it was logged.
    expect(state.phase).toEqual({
      name: 'resting',
      restStartedAt: start + 45_000,
      restEndsAt: start + 45_000 + 150_000,
    });
    expect(state.setNumber).toBe(2);
    expect(getRemainingRest(state.phase, start + 95_000)).toBe(100);
  });

  it('saves the rest really taken when the next set starts', () => {
    const state = run([
      { type: 'startSet', now: start },
      { type: 'endSet', now: start + 30_000 },
      { type: 'logSet', effort: 'moderate', reps: 12 },
      { type: 'startSet', now: start + 30_000 + 95_000 },
    ]);

    expect(state.sets[0].restTakenSec).toBe(95);
    expect(state.phase).toEqual({ name: 'working', setStartedAt: start + 125_000 });
  });

  it('adjusts the rest without ending it before it started', () => {
    const resting = run([
      { type: 'startSet', now: start },
      { type: 'endSet', now: start + 30_000 },
      { type: 'logSet', effort: 'moderate', reps: 12 },
    ]);

    const longer = sessionReducer(resting, { type: 'adjustRest', seconds: 15 });
    expect(getRemainingRest(longer.phase, start + 30_000)).toBe(135);

    const shortest = run(Array(20).fill({ type: 'adjustRest', seconds: -15 }), resting);
    expect(getRemainingRest(shortest.phase, start + 30_000)).toBe(0);
  });

  it('moves to the next exercise and finishes after the last set', () => {
    const doSet = (at: number, extra: Partial<SessionAction> = {}): SessionAction[] => [
      { type: 'startSet', now: at },
      { type: 'endSet', now: at + 30_000 },
      { type: 'logSet', effort: 'moderate', reps: 10, ...extra } as SessionAction,
    ];

    const afterSquat = run([...doSet(start), ...doSet(start + 200_000)]);
    expect(afterSquat.exerciseIndex).toBe(1);
    expect(afterSquat.setNumber).toBe(1);

    const finished = run([...doSet(start + 400_000), ...doSet(start + 600_000)], afterSquat);
    expect(finished.phase).toEqual({ name: 'finished', finishedAt: start + 630_000 });
    // Plank sets record time, not repetitions.
    expect(finished.sets[2].reps).toBeUndefined();
    expect(finished.sets[2].workSec).toBe(30);
  });

  it('ignores actions that do not fit the current phase', () => {
    const state = createSession(routine, plan, start);

    expect(sessionReducer(state, { type: 'endSet', now: start })).toBe(state);
    expect(sessionReducer(state, { type: 'logSet', effort: 'easy', reps: 5 })).toBe(state);
    expect(sessionReducer(state, { type: 'adjustRest', seconds: 15 })).toBe(state);
  });

  it('discards an unlogged set when the workout ends early', () => {
    const state = run([
      { type: 'startSet', now: start },
      { type: 'endSet', now: start + 30_000 },
      { type: 'logSet', effort: 'easy', reps: 12 },
      { type: 'startSet', now: start + 100_000 },
      { type: 'finish', now: start + 120_000 },
    ]);

    expect(state.sets).toHaveLength(1);
    expect(state.phase).toEqual({ name: 'finished', finishedAt: start + 120_000 });
  });

  it('builds the workout log', () => {
    const state = run([
      { type: 'startSet', now: start },
      { type: 'endSet', now: start + 30_000 },
      { type: 'logSet', effort: 'easy', reps: 12 },
      { type: 'finish', now: start + 60_000 },
    ]);

    expect(toWorkoutLog(state)).toEqual({
      id: String(start),
      routineId: 'test',
      routineName: 'Test',
      startedAt: new Date(start).toISOString(),
      endedAt: new Date(start + 60_000).toISOString(),
      durationSec: 60,
      sets: state.sets,
    });
    expect(state.sets[0].restTakenSec).toBe(30);
  });

  it('plans every exercise of a real routine', () => {
    const fullBody = getRoutine('full-body-home')!;

    expect(planRoutine(fullBody, 'maintain', 'beginner')).toHaveLength(fullBody.exerciseIds.length);
  });
});
