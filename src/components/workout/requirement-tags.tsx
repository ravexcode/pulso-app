import { Text, View } from 'react-native';

import { NO_REQUIREMENTS_LABEL, REQUIREMENT_LABELS } from '@/constants/labels';
import type { Requirement } from '@/types/workout';

type RequirementTagsProps = {
  requirements: readonly Requirement[];
};

/** What an exercise or routine needs, as pill tags. */
export function RequirementTags({ requirements }: RequirementTagsProps) {
  const labels =
    requirements.length === 0
      ? [NO_REQUIREMENTS_LABEL]
      : requirements.map((requirement) => REQUIREMENT_LABELS[requirement]);

  return (
    <View
      accessible
      accessibilityLabel={`Necesitas: ${labels.join(', ')}`}
      className="flex-row flex-wrap gap-2">
      {labels.map((label) => (
        <View key={label} className="rounded-full bg-background-400 px-3 py-1">
          <Text className="text-xs font-semibold text-foreground-muted">{label}</Text>
        </View>
      ))}
    </View>
  );
}
