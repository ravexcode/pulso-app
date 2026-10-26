import '@/global.css';

import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import { TrainingProvider } from '@/providers/training-provider';
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
  const { user, isLoading: isUserLoading } = useUser();
  const { isLoading: isTrainingLoading } = useTraining();
  const isLoading = isUserLoading || isTrainingLoading;
  const hasUser = user !== null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={hasUser}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="routine/[id]"
            options={{ headerShown: true, title: '', headerShadowVisible: false }}
          />
          <Stack.Screen name="workout/[routineId]" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!hasUser}>
          <Stack.Screen name="intro" />
          <Stack.Screen name="create-profile" />
        </Stack.Protected>
      </Stack>
      {/* The native splash stays until the saved data is read, so the intro never flashes. */}
      {!isLoading && <AnimatedSplashOverlay />}
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <UserProvider>
        <TrainingProvider>
          <RootNavigator />
        </TrainingProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
