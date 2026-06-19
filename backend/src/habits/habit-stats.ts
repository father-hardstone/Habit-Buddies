import {
  differenceInHours,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
  subDays,
} from 'date-fns';

export type HabitLoggingRules = {
  allowMultipleLogsPerDay: boolean;
  dailyLogLimit: number;
  goal: number;
};

export type CompletionRecord = {
  loggedAt: Date;
  points: number | string;
};

export function toDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function clampDailyLogLimit(limit: number): number {
  return Math.min(10, Math.max(1, limit));
}

export function pointsPerLog(habit: HabitLoggingRules): number {
  if (habit.allowMultipleLogsPerDay) {
    return 1 / clampDailyLogLimit(habit.dailyLogLimit);
  }
  return 1;
}

export function isInCurrentWeek(date: Date, referenceDate = new Date()): boolean {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
  return isWithinInterval(date, { start: weekStart, end: weekEnd });
}

export function computeStreak(completedDates: string[]): number {
  if (completedDates.length === 0) {
    return 0;
  }

  const dateSet = new Set(completedDates);
  const today = toDateString();
  let cursor = dateSet.has(today) ? new Date() : subDays(new Date(), 1);

  let streak = 0;
  while (dateSet.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function datesWithActivity(completions: CompletionRecord[]): string[] {
  return [...new Set(completions.map((entry) => toDateString(entry.loggedAt)))];
}

export function computeWeeklyLogCount(
  completions: CompletionRecord[],
  referenceDate = new Date(),
): number {
  return completions.filter((entry) =>
    isInCurrentWeek(entry.loggedAt, referenceDate),
  ).length;
}

export function computeWeeklyPoints(
  completions: CompletionRecord[],
  referenceDate = new Date(),
): number {
  return completions
    .filter((entry) => isInCurrentWeek(entry.loggedAt, referenceDate))
    .reduce((sum, entry) => sum + Number(entry.points), 0);
}

export function aggregateDailyCounts(
  completions: CompletionRecord[],
): { date: string; completed: number }[] {
  const map = new Map<string, number>();
  for (const entry of completions) {
    const date = toDateString(entry.loggedAt);
    map.set(date, (map.get(date) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([date, completed]) => ({ date, completed }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function canLogHabit(
  habit: HabitLoggingRules,
  completions: CompletionRecord[],
  now = new Date(),
): { allowed: boolean; reason?: string } {
  const weekCount = computeWeeklyLogCount(completions, now);
  if (weekCount >= habit.goal) {
    return { allowed: false, reason: 'Weekly goal already met' };
  }

  if (!habit.allowMultipleLogsPerDay) {
    const sorted = [...completions].sort(
      (a, b) => b.loggedAt.getTime() - a.loggedAt.getTime(),
    );
    const last = sorted[0];
    if (last && differenceInHours(now, last.loggedAt) < 24) {
      return { allowed: false, reason: 'Cannot log again within 24 hours' };
    }
    return { allowed: true };
  }

  const today = toDateString(now);
  const todayCount = completions.filter(
    (entry) => toDateString(entry.loggedAt) === today,
  ).length;
  const limit = clampDailyLogLimit(habit.dailyLogLimit);
  if (todayCount >= limit) {
    return { allowed: false, reason: `Daily limit of ${limit} reached` };
  }

  return { allowed: true };
}

export function computeWeeklyCompleted(
  logs: { completedDate: string; completed: number }[],
  referenceDate = new Date(),
): number {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

  return logs
    .filter((log) => {
      const day = parseISO(log.completedDate);
      return isWithinInterval(day, { start: weekStart, end: weekEnd });
    })
    .reduce((sum, log) => sum + log.completed, 0);
}
