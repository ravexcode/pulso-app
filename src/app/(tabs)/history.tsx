import { Text } from 'react-native';

import { Card, Screen } from '@/components/ui/screen';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import { formatDuration, toDisplayWeight, weightUnit } from '@/utils/format';
import { summarizeWorkout } from '@/utils/workout-log';

export default function HistoryScreen() {
  const { user } = useUser();
  const { history } = useTraining();

  if (!user) return null;

  return (
    <Screen title="Historial" subtitle="Tus entrenamientos guardados." hasTabBar>
      {history.length === 0 && (
        <Text className="text-base text-foreground-muted">
          Todavía no hay entrenamientos. Cuando termines uno, aparecerá aquí.
        </Text>
      )}
      {history.map((log) => {
        const summary = summarizeWorkout(log);
        return (
          <Card key={log.id}>
            <Text className="text-sm text-foreground-subtle">
              {new Date(log.startedAt).toLocaleDateString('es', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            <Text className="text-xl font-bold text-foreground">{log.routineName}</Text>
            <Text className="text-sm text-foreground-muted">
              {formatDuration(log.durationSec)} total · {summary.setCount} series · Descanso{' '}
              {formatDuration(summary.restSec)}
              {summary.volumeKg > 0 &&
                ` · ${Math.round(toDisplayWeight(summary.volumeKg, user.units))} ${weightUnit(user.units)}`}
            </Text>
          </Card>
        );
      })}
    </Screen>
  );
}
