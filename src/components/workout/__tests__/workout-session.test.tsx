import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { WorkoutSession } from '@/components/workout/workout-session';
import type { Routine } from '@/types/workout';
import { planRoutine } from '@/utils/workout-session';

const routine: Routine = {
  id: 'test',
  name: 'Rutina de prueba',
  description: '',
  place: 'gym',
  level: 'beginner',
  exerciseIds: ['squat'],
};

// Beginner + build-muscle: squat 2 × 8–12, base rest 120 s.
const plan = planRoutine(routine, 'build-muscle', 'beginner');

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers({ now: new Date('2026-10-25T10:00:00.000Z') });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('WorkoutSession', () => {
  it('times the sets, calculates the rest and saves the workout', async () => {
    const onSave = jest.fn(() => Promise.resolve());
    const onExit = jest.fn();
    await render(
      <WorkoutSession
        routine={routine}
        plan={plan}
        units="metric"
        history={[]}
        onSave={onSave}
        onExit={onExit}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Empezar serie' }));
    await advance(42_000);
    expect(screen.getByLabelText('Serie en curso: 0:42')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Terminar serie' }));
    expect(screen.getByText('Duración de la serie: 0:42')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Peso'), '60');
    await fireEvent.press(screen.getByRole('button', { name: 'Al límite' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar serie' }));

    // Hard set: 120 s × 1.25 = 150 s.
    expect(screen.getByLabelText('Descanso: 2:30')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '+15 s' }));
    expect(screen.getByLabelText('Descanso: 2:45')).toBeOnTheScreen();

    await advance(165_000);
    expect(screen.getByLabelText('Descanso terminado: 0:00')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Empezar serie' }));
    await advance(30_000);
    await fireEvent.press(screen.getByRole('button', { name: 'Terminar serie' }));
    // The weight of the previous set is pre-filled.
    expect(screen.getByLabelText('Peso')).toHaveDisplayValue('60');
    await fireEvent.press(screen.getByRole('button', { name: 'Exigente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar serie' }));

    expect(screen.getByText('¡Entrenamiento completado!')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar entrenamiento' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const [log] = onSave.mock.calls[0] as unknown as [import('@/types/workout').WorkoutLog];
    expect(log.sets).toHaveLength(2);
    expect(log.sets[0]).toMatchObject({ weightKg: 60, reps: 12, workSec: 42, restTakenSec: 165 });
    expect(onExit).toHaveBeenCalled();
  });

  it('needs an effort before saving a set', async () => {
    await render(
      <WorkoutSession
        routine={routine}
        plan={plan}
        units="metric"
        history={[]}
        onSave={jest.fn()}
        onExit={jest.fn()}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Empezar serie' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Terminar serie' }));

    expect(screen.getByRole('button', { name: 'Guardar serie' })).toBeDisabled();
  });

  it('lets the user end early and discard the workout', async () => {
    const onSave = jest.fn();
    const onExit = jest.fn();
    await render(
      <WorkoutSession
        routine={routine}
        plan={plan}
        units="metric"
        history={[]}
        onSave={onSave}
        onExit={onExit}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Terminar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salir' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onExit).toHaveBeenCalled();
  });
});
