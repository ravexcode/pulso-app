import { ProfileForm } from '@/components/profile/profile-form';
import { Screen } from '@/components/ui/screen';
import { useUser } from '@/hooks/use-user';

export default function CreateProfileScreen() {
  const { createUser } = useUser();

  // Once the profile exists, the root layout guard shows the main tabs.
  return (
    <Screen
      title="Crea tu perfil"
      subtitle="Lo usamos para ajustar series, repeticiones y descansos.">
      <ProfileForm onSubmit={createUser} />
    </Screen>
  );
}
