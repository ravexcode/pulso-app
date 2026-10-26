import { fireEvent, render as renderScreen, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RoutineEditor } from '@/components/workout/routine-editor';
import { EXERCISE_CATALOG } from '@/constants/exercises';
import type { CustomRoutineInput } from '@/utils/custom-routine';

// The body part palette uses gestures, which need the root view the app layout provides.
function render(element: ReactElement) {
  return renderScreen(<GestureHandlerRootView>{element}</GestureHandlerRootView>);
}

describe('RoutineEditor', () => {
  it('starts with the default number of days and lets the user change it', async () => {
    await render(<RoutineEditor onSave={jest.fn()} defaultDayCount={3} />);

    expect(screen.getByLabelText('3 días por semana')).toBeOnTheScreen();
    expect(screen.getByText('Empuje / Tirón / Pierna')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Añadir un día' }));
    expect(screen.getByLabelText('4 días por semana')).toBeOnTheScreen();
    expect(screen.getByText('Día 4')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Quitar un día' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar un día' }));
    expect(screen.getByLabelText('2 días por semana')).toBeOnTheScreen();
    expect(screen.queryByText('Día 3')).toBeNull();
  });

  it('filters the catalog of a day by equipment and shows what each exercise needs', async () => {
    await render(<RoutineEditor onSave={jest.fn()} defaultDayCount={1} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Añadir ejercicios al día 1' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Mancuernas' }));

    const dumbbellCount = EXERCISE_CATALOG.filter((item) => item.equipment === 'dumbbell').length;
    expect(screen.getByText(`${dumbbellCount} ejercicios`)).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Añadir Remo inclinado con mancuernas' })
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Añadir Sentadilla con barra' })).toBeNull();
    expect(screen.getAllByLabelText('Necesitas: Mancuernas, Banco plano').length).toBeGreaterThan(
      0
    );
  });

  it('sets the day focus by tapping a body part and then the day', async () => {
    await render(<RoutineEditor onSave={jest.fn()} defaultDayCount={2} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Espalda' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Añadir Espalda al foco del día 2' }));

    expect(
      screen.getByRole('button', { name: 'Quitar Espalda del foco del día 2' })
    ).toBeOnTheScreen();

    // The catalog of that day opens filtered by its focus.
    await fireEvent.press(screen.getByRole('button', { name: 'Añadir ejercicios al día 2' }));
    expect(screen.getByRole('button', { name: 'Añadir Jalón al pecho' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Añadir Press de banca' })).toBeNull();
  });

  it('adds many exercises, repeats one on another day, sorts and saves the week', async () => {
    const onSave = jest.fn((_input: CustomRoutineInput) => Promise.resolve());
    await render(<RoutineEditor onSave={onSave} defaultDayCount={2} />);

    await fireEvent.changeText(screen.getByLabelText('Nombre de la rutina'), 'Mi semana');
    await fireEvent.press(screen.getByRole('button', { name: 'Añadir ejercicios al día 1' }));
    const names = [
      'Curl de bíceps',
      'Sentadilla con barra',
      'Press de banca',
      'Remo con barra',
      'Prensa de piernas',
      'Peso muerto rumano',
      'Press militar',
      'Jalón al pecho',
      'Elevaciones laterales',
      'Curl femoral en máquina',
      'Extensión de cuádriceps',
      'Face pull',
      'Plancha',
    ];
    for (const name of names) {
      await fireEvent.press(screen.getByRole('button', { name: `Añadir ${name}` }));
    }
    expect(screen.getByText(`${names.length} ejercicios`)).toBeOnTheScreen();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Repetir Sentadilla con barra en otros días' })
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Sentadilla con barra en el día 2' }));
    expect(screen.getAllByText(/2 veces por semana/)).toHaveLength(2);

    await fireEvent.press(screen.getByRole('button', { name: 'Ordenar automáticamente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar rutina' }));

    const [input] = onSave.mock.calls[0];
    expect(input.name).toBe('Mi semana');
    // Upper / lower split: upper body on day 1, legs and core on day 2.
    expect(input.days[0].exerciseIds).toEqual(
      expect.arrayContaining(['bench-press', 'barbell-row', 'overhead-press', 'biceps-curl'])
    );
    expect(input.days[1].exerciseIds).toEqual(
      expect.arrayContaining(['squat', 'leg-press', 'leg-curl', 'plank'])
    );
    // The squat keeps its two days, and multi-joint exercises go first.
    expect(input.days.filter((day) => day.exerciseIds.includes('squat'))).toHaveLength(2);
    expect(input.days[0].exerciseIds[0]).not.toBe('biceps-curl');
  });

  it('warns when a body part is trained on consecutive days', async () => {
    await render(
      <RoutineEditor
        onSave={jest.fn()}
        initial={{
          name: 'Piernas',
          days: [
            { focus: [], exerciseIds: ['squat'] },
            { focus: [], exerciseIds: ['leg-press'] },
          ],
        }}
      />
    );

    expect(screen.getByText(/Piernas también se entrena el día 1/)).toBeOnTheScreen();
  });

  it('moves and removes exercises inside a day', async () => {
    const onSave = jest.fn(() => Promise.resolve());
    await render(
      <RoutineEditor
        initial={{
          name: 'Brazos',
          days: [{ focus: [], exerciseIds: ['biceps-curl', 'hammer-curl', 'face-pull'] }],
        }}
        onSave={onSave}
        onDelete={jest.fn(() => Promise.resolve())}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Bajar Curl de bíceps en el día 1' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar Face pull del día 1' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar rutina' }));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Brazos',
      days: [{ focus: [], exerciseIds: ['hammer-curl', 'biceps-curl'] }],
    });
    expect(screen.getByRole('button', { name: 'Eliminar rutina' })).toBeOnTheScreen();
  });

  it('asks for a name and at least one exercise', async () => {
    const onSave = jest.fn();
    await render(<RoutineEditor onSave={onSave} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Guardar rutina' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Ponle un nombre a tu rutina.')).toBeOnTheScreen();
    expect(screen.getByText('Añade al menos un ejercicio a algún día.')).toBeOnTheScreen();
  });
});
