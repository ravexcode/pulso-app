import { fireEvent, render, screen } from '@testing-library/react-native';

import { RoutineEditor } from '@/components/workout/routine-editor';
import { EXERCISE_CATALOG } from '@/constants/exercises';

describe('RoutineEditor', () => {
  it('filters the catalog by equipment and shows what each exercise needs', async () => {
    await render(<RoutineEditor onSave={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Mancuernas' }));

    const dumbbellCount = EXERCISE_CATALOG.filter((item) => item.equipment === 'dumbbell').length;
    expect(screen.getByText(`${dumbbellCount} ejercicios`)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Añadir Sentadilla goblet' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Añadir Sentadilla con barra' })).toBeNull();
    expect(screen.getAllByLabelText('Necesitas: Mancuernas, Banco plano').length).toBeGreaterThan(
      0
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Todo' }));
    expect(screen.getByText(`${EXERCISE_CATALOG.length} ejercicios`)).toBeOnTheScreen();
  });

  it('builds, sorts and saves a routine', async () => {
    const onSave = jest.fn(() => Promise.resolve());
    await render(<RoutineEditor onSave={onSave} />);

    await fireEvent.changeText(screen.getByLabelText('Nombre de la rutina'), 'Mi rutina');
    await fireEvent.press(screen.getByRole('button', { name: 'Añadir Curl de bíceps' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Añadir Sentadilla con barra' }));

    expect(screen.getByText('Tus ejercicios (2/12)')).toBeOnTheScreen();
    expect(screen.getByLabelText('Necesitas: Barra, Discos, Rack, Mancuernas')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Ordenar según las guías' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar rutina' }));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Mi rutina',
      exerciseIds: ['squat', 'biceps-curl'],
    });
  });

  it('moves and removes exercises', async () => {
    const onSave = jest.fn(() => Promise.resolve());
    await render(
      <RoutineEditor
        initial={{ name: 'Brazos', exerciseIds: ['biceps-curl', 'hammer-curl', 'face-pull'] }}
        onSave={onSave}
        onDelete={jest.fn(() => Promise.resolve())}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Bajar Curl de bíceps' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar Face pull de la rutina' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar rutina' }));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Brazos',
      exerciseIds: ['hammer-curl', 'biceps-curl'],
    });
    expect(screen.getByRole('button', { name: 'Eliminar rutina' })).toBeOnTheScreen();
  });

  it('asks for a name and at least one exercise', async () => {
    const onSave = jest.fn();
    await render(<RoutineEditor onSave={onSave} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Guardar rutina' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Ponle un nombre a tu rutina.')).toBeOnTheScreen();
    expect(screen.getByText('Añade al menos un ejercicio.')).toBeOnTheScreen();
  });
});
