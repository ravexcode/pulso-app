import type { IconName } from '@/components/ui/icon';
import type { Effort, Equipment, Routine } from '@/types/workout';

/** Icons shared by several screens: SF Symbols on iOS, Material Symbols elsewhere. */
export const ICONS = {
  add: { ios: 'plus', android: 'add' },
  remove: { ios: 'minus', android: 'remove' },
  close: { ios: 'xmark', android: 'close' },
  check: { ios: 'checkmark', android: 'check' },
  checkCircle: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  chevron: { ios: 'chevron.right', android: 'chevron_right' },
  moveUp: { ios: 'arrow.up', android: 'arrow_upward' },
  moveDown: { ios: 'arrow.down', android: 'arrow_downward' },
  repeat: { ios: 'repeat', android: 'repeat' },
  play: { ios: 'play.fill', android: 'play_arrow' },
  stop: { ios: 'stop.fill', android: 'stop' },
  skip: { ios: 'forward.fill', android: 'skip_next' },
  timer: { ios: 'timer', android: 'timer' },
  clock: { ios: 'clock.fill', android: 'schedule' },
  calendar: { ios: 'calendar', android: 'calendar_month' },
  flame: { ios: 'flame.fill', android: 'local_fire_department' },
  trophy: { ios: 'trophy.fill', android: 'trophy' },
  info: { ios: 'info.circle', android: 'info' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
  edit: { ios: 'pencil', android: 'edit' },
  trash: { ios: 'trash', android: 'delete' },
  list: { ios: 'list.bullet', android: 'format_list_bulleted' },
  swap: { ios: 'arrow.left.arrow.right', android: 'swap_horiz' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome' },
  strength: { ios: 'figure.strengthtraining.traditional', android: 'fitness_center' },
  sets: { ios: 'square.stack.3d.up.fill', android: 'stacks' },
  weight: { ios: 'scalemass.fill', android: 'scale' },
  rest: { ios: 'pause.circle.fill', android: 'pause_circle' },
} as const satisfies Record<string, IconName>;

export const PLACE_ICONS: Record<Routine['place'], IconName> = {
  gym: { ios: 'dumbbell.fill', android: 'fitness_center' },
  home: { ios: 'house.fill', android: 'home' },
};

export const EQUIPMENT_ICONS: Record<Equipment, IconName> = {
  barbell: { ios: 'dumbbell.fill', android: 'fitness_center' },
  dumbbell: { ios: 'dumbbell.fill', android: 'fitness_center' },
  machine: { ios: 'gearshape.fill', android: 'settings' },
  cable: { ios: 'cable.connector', android: 'cable' },
  bodyweight: { ios: 'figure.strengthtraining.functional', android: 'sports_gymnastics' },
};

export const EFFORT_ICONS: Record<Effort, IconName> = {
  easy: { ios: 'gauge.with.dots.needle.33percent', android: 'speed' },
  moderate: { ios: 'gauge.with.dots.needle.67percent', android: 'speed' },
  hard: { ios: 'flame.fill', android: 'local_fire_department' },
};
