import { render, screen } from '@testing-library/react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

describe('ThemedText', () => {
  it('renders its children with the theme text color', async () => {
    await render(<ThemedText>Hola</ThemedText>);

    expect(screen.getByText('Hola')).toHaveStyle({ color: Colors.dark.text });
  });

  it('uses the requested theme color', async () => {
    await render(<ThemedText themeColor="textSecondary">Secundario</ThemedText>);

    expect(screen.getByText('Secundario')).toHaveStyle({ color: Colors.dark.textSecondary });
  });
});
