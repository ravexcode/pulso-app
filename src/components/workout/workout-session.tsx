import { useEffect, useReducer, useRef, useState } from 'react';
import { ScrollView, Text, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Card } from '@/components/ui/screen';
import { SetLogger, type SetResult } from '@/components/workout/set-logger';
import { WorkoutSummary } from '@/components/workout/workout-summary';
import { EQUIPMENT_ICONS, ICONS } from '@/constants/icons';
import { EFFORT_LABELS } from '@/constants/labels';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import type { Units } from '@/types/user';
import type { Routine, SetTarget, WorkoutLog } from '@/types/workout';
import { confirmDestructive } from '@/utils/confirm';
import { formatDuration, formatRest } from '@/utils/format';
import { getLastWeightKg } from '@/utils/workout-log';
import {
  createSession,
  getRemainingRest,
  getTotalSets,
  sessionReducer,
  toWorkoutLog,
  type PlannedExercise,
} from '@/utils/workout-session';

const REST_STEP_SEC = 15;

type WorkoutSessionProps = {
  routine: Routine;
  /** Day of the routine to train. */
  dayIndex: number;
  plan: PlannedExercise[];
  units: Units;
  /** Past workouts, newest first, used to pre-fill weights. */
  history: readonly WorkoutLog[];
  onSave: (log: WorkoutLog) => Promise<void>;
  onExit: () => void;
};

function describeTarget(target: SetTarget) {
  return target.kind === 'time'
    ? `Objetivo: ${target.seconds} s`
    : `Objetivo: ${target.min}–${target.max} repeticiones`;
}

function BigTimer({ seconds, label }: { seconds: number; label: string }) {
  return (
    <View className="items-center gap-1 py-2">
      <Text className="text-[13px] font-semibold uppercase tracking-wide text-foreground-subtle">
        {label}
      </Text>
      <Text
        accessibilityLabel={`${label}: ${formatDuration(seconds)}`}
        className="text-7xl font-bold text-foreground"
        style={{ fontVariant: ['tabular-nums'] }}>
        {formatDuration(seconds)}
      </Text>
    </View>
  );
}

/** One dot per set of the exercise: done sets are filled and the current one is outlined. */
function SetDots({ total, current }: { total: number; current: number }) {
  return (
    <View
      accessible
      accessibilityLabel={`Serie ${current} de ${total}`}
      className="flex-row gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          className={`h-2 flex-1 rounded-full ${index + 1 < current ? 'bg-accent' : index + 1 === current ? 'bg-accent-800' : 'bg-background-400'}`}
        />
      ))}
    </View>
  );
}

export function WorkoutSession({
  routine,
  dayIndex,
  plan,
  units,
  history,
  onSave,
  onExit,
}: WorkoutSessionProps) {
  const [state, dispatch] = useReducer(sessionReducer, undefined, () =>
    createSession(routine, dayIndex, plan, Date.now())
  );
  const [isSaving, setIsSaving] = useState(false);
  const { phase } = state;
  const isFinished = phase.name === 'finished';
  const now = useNow(!isFinished);
  const remainingRest = getRemainingRest(phase, now);
  const isRestOver = phase.name === 'resting' && remainingRest === 0;

  // Vibrates once when the rest countdown reaches zero.
  const hasVibrated = useRef(false);
  useEffect(() => {
    if (phase.name !== 'resting') {
      hasVibrated.current = false;
    } else if (isRestOver && !hasVibrated.current) {
      hasVibrated.current = true;
      Vibration.vibrate(500);
    }
  }, [phase.name, isRestOver]);

  if (isFinished) {
    const log = toWorkoutLog(state);
    const save = async () => {
      setIsSaving(true);
      try {
        await onSave(log);
        onExit();
      } finally {
        setIsSaving(false);
      }
    };
    const discard = async () => {
      const confirmed =
        log.sets.length === 0 ||
        (await confirmDestructive({
          title: '¿Descartar entrenamiento?',
          message: `Se perderán las ${log.sets.length} series registradas.`,
          confirmLabel: 'Descartar',
        }));
      if (confirmed) onExit();
    };
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <View className="w-full p-6" style={{ maxWidth: MaxContentWidth }}>
            <WorkoutSummary
              log={log}
              units={units}
              isSaving={isSaving}
              onSave={() => void save()}
              onDiscard={() => void discard()}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const { exercise, prescription } = plan[state.exerciseIndex];
  const totalSets = getTotalSets(plan);
  const lastSet = state.sets.at(-1);
  const lastWeightInSession = [...state.sets]
    .reverse()
    .find((set) => set.exerciseId === exercise.id && set.weightKg !== undefined)?.weightKg;
  const initialWeightKg = lastWeightInSession ?? getLastWeightKg(history, exercise.id);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ alignItems: 'center' }}>
        <View className="w-full gap-6 p-6" style={{ maxWidth: MaxContentWidth }}>
          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                  {routine.name}
                  {routine.days.length > 1 && ` · Día ${dayIndex + 1}`}
                </Text>
                <Text
                  className="text-sm text-foreground-subtle"
                  style={{ fontVariant: ['tabular-nums'] }}>
                  {formatDuration((now - state.startedAt) / 1000)} · Serie {state.sets.length + 1}{' '}
                  de {totalSets}
                </Text>
              </View>
              <Button
                title="Terminar"
                icon={ICONS.stop}
                variant="secondary"
                size="small"
                onPress={() => dispatch({ type: 'finish', now: Date.now() })}
              />
            </View>
            <ProgressBar
              value={state.sets.length}
              max={totalSets}
              label="Series completadas"
              size="small"
            />
          </View>

          <Card>
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-400">
                <Icon name={EQUIPMENT_ICONS[exercise.equipment]} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-foreground-subtle">
                  {phase.name === 'resting' ? 'Siguiente' : 'Ejercicio'} {state.exerciseIndex + 1}{' '}
                  de {plan.length}
                </Text>
                <Text className="text-2xl font-bold text-foreground">{exercise.name}</Text>
              </View>
            </View>
            <Text className="text-sm text-foreground-muted">{exercise.muscles}</Text>
            <SetDots total={prescription.sets} current={state.setNumber} />
            <Text className="text-base text-foreground">
              Serie {state.setNumber} de {prescription.sets} · {describeTarget(prescription.target)}
            </Text>
          </Card>

          {phase.name === 'ready' && (
            <Button
              title="Empezar serie"
              icon={ICONS.play}
              onPress={() => dispatch({ type: 'startSet', now: Date.now() })}
            />
          )}

          {phase.name === 'working' && (
            <>
              <BigTimer seconds={(now - phase.setStartedAt) / 1000} label="Serie en curso" />
              {prescription.target.kind === 'time' && (
                <ProgressBar
                  value={(now - phase.setStartedAt) / 1000}
                  max={prescription.target.seconds}
                  label="Tiempo objetivo"
                />
              )}
              <Button
                title="Terminar serie"
                icon={ICONS.stop}
                onPress={() => dispatch({ type: 'endSet', now: Date.now() })}
              />
            </>
          )}

          {phase.name === 'logging' && (
            <SetLogger
              key={`${state.exerciseIndex}-${state.setNumber}`}
              exercise={exercise}
              target={prescription.target}
              workSec={Math.round((phase.setEndedAt - phase.setStartedAt) / 1000)}
              units={units}
              initialWeightKg={initialWeightKg}
              onSave={(result: SetResult) => dispatch({ type: 'logSet', ...result })}
            />
          )}

          {phase.name === 'resting' && (
            <>
              <BigTimer
                seconds={remainingRest}
                label={isRestOver ? 'Descanso terminado' : 'Descanso'}
              />
              <ProgressBar
                value={remainingRest}
                max={(phase.restEndsAt - phase.restStartedAt) / 1000}
                label="Descanso restante"
              />
              {lastSet && (
                <View className="flex-row items-center justify-center gap-1.5">
                  <Icon name={ICONS.timer} size="small" color={Colors.dark.textSecondary} />
                  <Text className="text-sm text-foreground-muted">
                    Sugerido: {formatRest(lastSet.restSuggestedSec)} · Serie{' '}
                    {EFFORT_LABELS[lastSet.effort].title.toLowerCase()}
                  </Text>
                </View>
              )}
              <View className="flex-row gap-3">
                <Button
                  className="flex-1"
                  title={`−${REST_STEP_SEC} s`}
                  variant="secondary"
                  onPress={() => dispatch({ type: 'adjustRest', seconds: -REST_STEP_SEC })}
                />
                <Button
                  className="flex-1"
                  title={`+${REST_STEP_SEC} s`}
                  variant="secondary"
                  onPress={() => dispatch({ type: 'adjustRest', seconds: REST_STEP_SEC })}
                />
              </View>
              <Button
                title={isRestOver ? 'Empezar serie' : 'Saltar descanso y empezar'}
                icon={isRestOver ? ICONS.play : ICONS.skip}
                variant={isRestOver ? 'primary' : 'secondary'}
                onPress={() => dispatch({ type: 'startSet', now: Date.now() })}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
