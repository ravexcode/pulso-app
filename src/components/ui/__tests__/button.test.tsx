import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders its title as an accessible button', async () => {
    await render(<Button title="Comenzar" />);

    expect(screen.getByRole('button', { name: 'Comenzar' })).toBeOnTheScreen();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button title="Comenzar" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Comenzar' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button title="Comenzar" onPress={onPress} disabled />);

    await fireEvent.press(screen.getByRole('button', { name: 'Comenzar' }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Comenzar' })).toBeDisabled();
  });
});
