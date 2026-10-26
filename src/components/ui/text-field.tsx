import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors } from '@/constants/theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  /** Explains what to write, shown under the field while there is no error. */
  hint?: string;
  error?: string;
  /** Text shown after the value, like a unit. */
  suffix?: string;
};

export function TextField({
  label,
  hint,
  error,
  suffix,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderClass = error
    ? 'border-accent'
    : isFocused
      ? 'border-accent-600'
      : 'border-background-300';
  const message = error ?? hint;

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground-muted">{label}</Text>
      <View
        className={`flex-row items-center rounded-full border bg-background-600 px-5 ${borderClass}`}>
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={hint}
          placeholderTextColor={Colors.dark.textSubtle}
          selectionColor={Colors.dark.accent}
          className="flex-1 py-3 text-base text-foreground"
          // The browser focus ring is removed: the border of the field shows the focus instead.
          style={[{ outlineWidth: 0 }, style]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {suffix && <Text className="text-base text-foreground-subtle">{suffix}</Text>}
      </View>
      {message && (
        <Text className={`text-sm ${error ? 'text-foreground' : 'text-foreground-subtle'}`}>
          {message}
        </Text>
      )}
    </View>
  );
}
