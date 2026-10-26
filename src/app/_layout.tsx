import '@/global.css';

import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';
import { UserProvider } from '@/providers/user-provider';

void SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: Colors.dark.backgroundSelected,
  },
};

function RootNavigator() {
  const { user, isLoading } = useUser();
  const hasUser = user !== null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={hasUser}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!hasUser}>
          <Stack.Screen name="intro" />
          <Stack.Screen name="create-profile" />
        </Stack.Protected>
      </Stack>
      {/* The native splash stays until the profile is read, so the intro never flashes. */}
      {!isLoading && <AnimatedSplashOverlay />}
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </ThemeProvider>
  );
}
