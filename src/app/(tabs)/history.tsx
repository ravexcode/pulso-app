import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ListRow, ListSection } from '@/components/ui/list';
import { Card, Screen } from '@/components/ui/screen';
import { StatTile } from '@/components/ui/stat-tile';
import { ICONS } from '@/constants/icons';
import { Colors } from '@/constants/theme';
import { useTraining } from '@/hooks/use-training';
import { useUser } from '@/hooks/use-user';
import { formatDuration, toDisplayWeight, weightUnit } from '@/utils/format';
import { groupByMonth, summarizeWorkout } from '@/utils/workout-log';

function monthTitle(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('es', { month: 'long', year: 'numeric' });
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { history } = useTraining();

  if (!user) return null;

  const totalMinutes = Math.round(history.reduce((total, log) => total + log.durationSec, 0) / 60);

  return (
    <Screen title="Historial" subtitle="Tus entrenamientos guardados." hasTabBar>
      {history.length === 0 ? (
        <Card className="items-center py-8">
          <Icon name={ICONS.calendar} size="xlarge" color={Colors.dark.textSecondary} />
          <Text className="text-center text-xl font-bold text-foreground">
            Todavía no hay entrenamientos
          </Text>
          <Text className="text-center text-base text-foreground-muted">
            Cuando termines uno, aparecerá aquí con su duración, series y volumen.
          </Text>
          <Button
            title="Ir a entrenar"
            icon={ICONS.play}
            className="self-stretch"
            onPress={() => router.navigate('/')}
          />
        </Card>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          <StatTile icon={ICONS.strength} label="Entrenamientos" value={String(history.length)} />
          <StatTile icon={ICONS.clock} label="Minutos" value={String(totalMinutes)} />
        </View>
      )}

      {groupByMonth(history).map((group) => (
        <ListSection key={group.key} title={monthTitle(group.key)}>
          {group.logs.map((log) => {
            const summary = summarizeWorkout(log);
            const date = new Date(log.startedAt).toLocaleDateString('es', {
              weekday: 'long',
              day: 'numeric',
            });
            const details = [`${summary.setCount} series`, `descanso ${formatDuration(summary.restSec)}`];
            if (summary.volumeKg > 0) {
              details.push(
                `${Math.round(toDisplayWeight(summary.volumeKg, user.units))} ${weightUnit(user.units)}`
              );
            }
            return (
              <ListRow
                key={log.id}
                icon={ICONS.strength}
                title={`${log.routineName}${log.day && log.day.count > 1 ? ` · Día ${log.day.index + 1}` : ''}`}
                subtitle={`${date[0].toUpperCase()}${date.slice(1)} · ${details.join(' · ')}`}
                value={formatDuration(log.durationSec)}
              />
            );
          })}
        </ListSection>
      ))}
    </Screen>
  );
}
