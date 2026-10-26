import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { WeekStrip } from '@/components/home/week-strip';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ListRow, ListSection } from '@/components/ui/list';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Card, Screen } from '@/components/ui/screen';
import { StatTile } from '@/components/ui/stat-tile';
import { getExercise } from '@/constants/exercises';
import { ICONS, PLACE_ICONS } from '@/constants/icons';
import { BODY_PART_LABELS, GOAL_LABELS } from '@/constants/labels';
import { Colors } from '@/constants/theme';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import { findRoutine } from '@/utils/custom-routine';
import { formatDuration } from '@/utils/format';
import { estimateDayMinutes, getPrescription } from '@/utils/prescription';
import {
  countWorkoutsThisWeek,
  getNextDayIndex,
  getWeekActivity,
  getWeekStreak,
  summarizeWeek,
  summarizeWorkout,
} from '@/utils/workout-log';

function formatToday(now: Date) {
  return now.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { activeRoutineId, customRoutines, history } = useTraining();

  if (!user) return null;

  const now = new Date();
  const routine = findRoutine(activeRoutineId ?? undefined, customRoutines);
  const doneThisWeek = countWorkoutsThisWeek(history, now);
  const weeklyGoal = user.trainingDaysPerWeek;
  const week = summarizeWeek(history, now);
  const streak = getWeekStreak(history, weeklyGoal, now);
  const lastWorkout = history[0];
  const nextDay = routine ? getNextDayIndex(history, routine) : 0;
  const today = routine?.days[nextDay];
  const isGoalReached = doneThisWeek >= weeklyGoal;

  return (
    <Screen
      eyebrow={formatToday(now)}
      title={`Hola, ${user.name}`}
      subtitle={`Objetivo: ${GOAL_LABELS[user.goal]}`}
      hasTabBar>
      <Card>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-sm font-semibold text-foreground-muted">Esta semana</Text>
            <Text className="text-3xl font-bold text-foreground">
              {doneThisWeek} de {weeklyGoal}
            </Text>
            <Text className="text-sm text-foreground-subtle">
              {isGoalReached
                ? '¡Objetivo semanal cumplido!'
                : `Te ${weeklyGoal - doneThisWeek === 1 ? 'falta 1 entrenamiento' : `faltan ${weeklyGoal - doneThisWeek} entrenamientos`}`}
            </Text>
          </View>
          {isGoalReached && <Icon name={ICONS.trophy} size="large" label="Objetivo cumplido" />}
        </View>
        <ProgressBar value={doneThisWeek} max={weeklyGoal} label="Entrenamientos de la semana" />
        <WeekStrip activity={getWeekActivity(history, now)} todayIndex={(now.getDay() + 6) % 7} />
      </Card>

      <View className="flex-row flex-wrap gap-3">
        <StatTile
          icon={ICONS.flame}
          label="Racha"
          value={`${streak} ${streak === 1 ? 'semana' : 'semanas'}`}
        />
        <StatTile icon={ICONS.clock} label="Min. semana" value={String(week.minutes)} />
      </View>

      {routine && today ? (
        <View className="gap-3">
          <Card>
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-400">
                <Icon name={PLACE_ICONS[routine.place]} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground-muted">
                  {routine.days.length > 1
                    ? `Hoy toca: día ${nextDay + 1} de ${routine.days.length}`
                    : 'Hoy toca'}
                </Text>
                <Text className="text-xl font-bold text-foreground" numberOfLines={2}>
                  {routine.name}
                </Text>
              </View>
            </View>
            <Text className="text-sm text-foreground-subtle">
              {today.exerciseIds.length} ejercicios · ~
              {estimateDayMinutes(today.exerciseIds, user.goal, user.level)} min
              {today.focus.length > 0 &&
                ` · ${today.focus.map((part) => BODY_PART_LABELS[part]).join(', ')}`}
            </Text>
            <Button
              title={routine.days.length > 1 ? `Empezar día ${nextDay + 1}` : 'Empezar entrenamiento'}
              icon={ICONS.play}
              onPress={() =>
                router.push({
                  pathname: '/workout/[routineId]',
                  params: { routineId: routine.id, day: String(nextDay) },
                })
              }
            />
          </Card>

          <ListSection title="Ejercicios de hoy">
            {today.exerciseIds.map((id, index) => {
              const exercise = getExercise(id);
              const { sets, target } = getPrescription(exercise, user.goal, user.level);
              return (
                <ListRow
                  key={id}
                  badge={String(index + 1)}
                  title={exercise.name}
                  subtitle={exercise.muscles}
                  value={
                    target.kind === 'time'
                      ? `${sets} × ${target.seconds} s`
                      : `${sets} × ${target.min}–${target.max}`
                  }
                />
              );
            })}
          </ListSection>
        </View>
      ) : (
        <Card className="items-center py-8">
          <Icon name={ICONS.strength} size="xlarge" color={Colors.dark.textSecondary} />
          <Text className="text-center text-2xl font-bold text-foreground">Elige tu rutina</Text>
          <Text className="text-center text-base text-foreground-muted">
            Usa un plan para el gimnasio o para casa, o arma tu rutina con tus ejercicios.
          </Text>
          <Button
            title="Ver rutinas"
            icon={ICONS.list}
            className="self-stretch"
            onPress={() => router.push('/routines')}
          />
        </Card>
      )}

      <ListSection>
        {routine && (
          <ListRow
            icon={ICONS.swap}
            title="Cambiar rutina"
            subtitle={routine.name}
            showChevron
            onPress={() => router.push('/routines')}
          />
        )}
        {lastWorkout && (
          <ListRow
            icon={ICONS.clock}
            title="Último entrenamiento"
            subtitle={`${lastWorkout.routineName} · ${new Date(lastWorkout.startedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}`}
            value={`${formatDuration(lastWorkout.durationSec)} · ${summarizeWorkout(lastWorkout).setCount} series`}
            showChevron
            onPress={() => router.push('/history')}
          />
        )}
      </ListSection>
    </Screen>
  );
}
