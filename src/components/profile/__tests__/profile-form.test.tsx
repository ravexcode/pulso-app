import { fireEvent, render, screen } from '@testing-library/react-native';

import { ProfileForm } from '@/components/profile/profile-form';

describe('ProfileForm', () => {
  it('shows errors and does not submit an incomplete profile', async () => {
    const onSubmit = jest.fn(() => Promise.resolve());
    await render(<ProfileForm onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Crear perfil' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Escribe tu nombre/)).toBeOnTheScreen();
    expect(screen.getByText('Elige un objetivo.')).toBeOnTheScreen();
    expect(screen.getByText('Escribe tu altura entre 50–272 cm.')).toBeOnTheScreen();
  });

  it('formats the birth date while typing', async () => {
    await render(<ProfileForm onSubmit={jest.fn()} />);

    await fireEvent.changeText(screen.getByLabelText('Fecha de nacimiento'), '199804');

    expect(screen.getByLabelText('Fecha de nacimiento')).toHaveDisplayValue('1998-04');
  });

  it('shows the limits in the chosen units', async () => {
    await render(<ProfileForm onSubmit={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Imperial (lb, in)' }));

    expect(screen.getByText(/En pulgadas, sin zapatos/)).toBeOnTheScreen();
    expect(screen.getByText('Tu peso actual. Entre 44.1–881.8 lb.')).toBeOnTheScreen();
  });

  it('submits the profile in metric units', async () => {
    const onSubmit = jest.fn(() => Promise.resolve());
    await render(<ProfileForm onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Ana');
    await fireEvent.changeText(screen.getByLabelText('Fecha de nacimiento'), '19980412');
    await fireEvent.press(screen.getByRole('button', { name: 'Mujer' }));
    await fireEvent.changeText(screen.getByLabelText('Altura'), '168');
    await fireEvent.changeText(screen.getByLabelText('Peso corporal'), '61,5');
    await fireEvent.press(screen.getByRole('button', { name: 'Ganar músculo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Principiante' }));
    await fireEvent.press(screen.getByRole('button', { name: '4' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Crear perfil' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana',
      birthDate: '1998-04-12',
      sex: 'female',
      heightCm: 168,
      weightKg: 61.5,
      goal: 'build-muscle',
      level: 'beginner',
      units: 'metric',
      trainingDaysPerWeek: 4,
    });
  });
});
