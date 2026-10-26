import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message: string;
  /** Text of the button that runs the action, like "Eliminar". */
  confirmLabel: string;
};

/**
 * Asks before a destructive action. Resolves `true` when the user confirms. The web uses the
 * browser dialog because `Alert` does nothing there.
 */
export function confirmDestructive({ title, message, confirmLabel }: ConfirmOptions) {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${title}\n\n${message}`) ?? true);
  }
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
