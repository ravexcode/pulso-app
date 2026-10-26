import { useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { Chip } from '@/components/ui/chip';
import { BODY_PART_LABELS } from '@/constants/labels';
import { BODY_PARTS, type BodyPart } from '@/types/workout';

/** Point in window coordinates. */
export type DragPoint = { x: number; y: number };

type DragHandlers = {
  onDragStart: () => void;
  onDragMove: (point: DragPoint) => void;
  onDrop: (part: BodyPart, point: DragPoint) => void;
};

type DraggablePartProps = DragHandlers & {
  part: BodyPart;
  isArmed: boolean;
  onTap: () => void;
};

/** Chip that can be dragged after a short press. A tap selects it instead. */
function DraggablePart({
  part,
  isArmed,
  onTap,
  onDragStart,
  onDragMove,
  onDrop,
}: DraggablePartProps) {
  const [offset] = useState(() => new Animated.ValueXY());
  const [isDragging, setIsDragging] = useState(false);

  const pan = usePanGesture({
    // Callbacks run on the JS thread: they only move one chip and call React state setters.
    runOnJS: true,
    activateAfterLongPress: 200,
    onActivate: () => {
      setIsDragging(true);
      onDragStart();
    },
    onUpdate: (event) => {
      offset.setValue({ x: event.translationX, y: event.translationY });
      onDragMove({ x: event.absoluteX, y: event.absoluteY });
    },
    onDeactivate: (event) => {
      if (!event.canceled) onDrop(part, { x: event.absoluteX, y: event.absoluteY });
    },
    onFinalize: () => {
      setIsDragging(false);
      Animated.timing(offset, {
        toValue: { x: 0, y: 0 },
        duration: 150,
        useNativeDriver: false,
      }).start();
    },
  });

  const style = {
    zIndex: isDragging ? 10 : 0,
    transform: [
      { translateX: offset.x },
      { translateY: offset.y },
      { scale: isDragging ? 1.1 : 1 },
    ],
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <Chip
          label={BODY_PART_LABELS[part]}
          selected={isArmed}
          accessibilityHint="Toca para elegirla y luego toca un día, o mantén pulsado y arrastra."
          onPress={onTap}
        />
      </Animated.View>
    </GestureDetector>
  );
}

type BodyPartPaletteProps = DragHandlers & {
  /** Part chosen with a tap, waiting for the user to pick a day. */
  armedPart?: BodyPart;
  onArm: (part: BodyPart | undefined) => void;
};

/** Body parts the user drags onto a day to set its focus. */
export function BodyPartPalette({ armedPart, onArm, ...handlers }: BodyPartPaletteProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground-muted">Partes del cuerpo</Text>
      <View className="flex-row flex-wrap gap-2">
        {BODY_PARTS.map((part) => (
          <DraggablePart
            key={part}
            part={part}
            isArmed={part === armedPart}
            onTap={() => onArm(part === armedPart ? undefined : part)}
            {...handlers}
          />
        ))}
      </View>
      <Text className="text-sm text-foreground-subtle">
        Mantén pulsada una parte y arrástrala a un día para marcar su foco. También puedes tocarla y
        después tocar «Añadir al foco» en el día.
      </Text>
    </View>
  );
}
