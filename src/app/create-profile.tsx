import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder: the profile form is not built yet.
export default function CreateProfileScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-3 bg-background px-8">
      <Text accessibilityRole="header" className="text-center text-3xl font-bold text-foreground">
        Crea tu perfil
      </Text>
      <Text className="text-center text-base text-foreground-muted">Próximamente.</Text>
    </SafeAreaView>
  );
}
