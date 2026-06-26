
'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getGroupAnalytics, type GroupAnalytics } from '@/lib/database';
import { handleAsyncError } from '@/lib/error-utils';
import { cn } from '@/lib/utils';
import {
  ActiveDonutSector,
  ActiveRadialSector,
  chartHoverContainerClass,
  ScalableBarShape,
  ScalableLineDot,
  type ScalableBarShapeProps,
} from '@/components/chart-hover-shapes';

interface HabitAnalyticsProps {
  groupId: string;
  className?: string;
  refreshKey?: number;
}

function useChartProgress(resetKey: string | number) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1000;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    setProgress(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [resetKey]);

  return progress;
}

function computeYAxisMax(values: number[]): number {
  const max = Math.max(0, ...values);
  if (max === 0) return 1;
  if (max <= 1) return 1;
  return Math.ceil(max);
}

function computeYAxisTicks(max: number): number[] {
  if (max <= 1) return [0, 1];
  return Array.from({ length: max + 1 }, (_, index) => index);
}

const axisChartMargin = { top: 6, right: 8, left: 2, bottom: 0 };

export function HabitAnalytics({ groupId, className, refreshKey = 0 }: HabitAnalyticsProps) {
  const [scope, setScope] = React.useState<'personal' | 'group'>('personal');
  const [analytics, setAnalytics] = React.useState<GroupAnalytics | null>(null);
  const [hoveredBarKey, setHoveredBarKey] = React.useState<string | null>(null);
  const [hoveredLineKey, setHoveredLineKey] = React.useState<string | null>(null);
  const [activeDonutIndex, setActiveDonutIndex] = React.useState<number | undefined>();
  const [activeRadialIndex, setActiveRadialIndex] = React.useState<number | undefined>();
  const progress = useChartProgress(`${groupId}-${refreshKey}`);

  React.useEffect(() => {
    if (!groupId) {
      setAnalytics(null);
      return;
    }

    getGroupAnalytics(groupId)
      .then(setAnalytics)
      .catch((error) => {
        handleAsyncError(error, {
          title: 'Could not load analytics',
          context: 'dashboard.analytics',
        });
      });
  }, [groupId, refreshKey]);

  React.useEffect(() => {
    setActiveDonutIndex(undefined);
    setActiveRadialIndex(undefined);
    setHoveredBarKey(null);
    setHoveredLineKey(null);
  }, [groupId, refreshKey, analytics]);

  const personalChartConfig = React.useMemo(() => {
    if (!analytics) return {} satisfies ChartConfig;
    return Object.fromEntries(
      analytics.personalHabits.map((habit) => [
        habit.id,
        { label: habit.name, color: habit.color },
      ]),
    ) satisfies ChartConfig;
  }, [analytics]);

  const groupChartConfig = React.useMemo(() => {
    if (!analytics) return {} satisfies ChartConfig;
    return Object.fromEntries(
      analytics.users.map((user) => [
        user.userId,
        { label: user.name, color: user.color },
      ]),
    ) satisfies ChartConfig;
  }, [analytics]);

  const animatedPersonal = React.useMemo(() => {
    if (!analytics) return [];
    return analytics.personalDaily.map((row) => {
      const next: Record<string, string | number> = {
        date: row.date,
        label: row.label,
        points: 0,
      };

      for (const habit of analytics.personalHabits) {
        const value = Number((Number(row[habit.id] ?? 0) * progress).toFixed(3));
        next[habit.id] = value;
        next.points = Number(
          (Number(next.points) + value).toFixed(3),
        );
      }

      return next;
    });
  }, [analytics, progress]);

  const animatedGroup = React.useMemo(() => {
    if (!analytics) return [];
    return analytics.groupDaily.map((row) => {
      const next: Record<string, string | number> = {
        date: row.date,
        label: row.label,
      };
      for (const user of analytics.users) {
        next[user.userId] = Number(
          ((Number(row[user.userId] ?? 0) * progress).toFixed(2)),
        );
      }
      return next;
    });
  }, [analytics, progress]);

  const animatedRadial = React.useMemo(
    () =>
      (analytics?.streakProgress ?? []).map((item) => ({
        ...item,
        fill: item.color,
        animatedProgress: Math.round(item.progress * progress),
      })),
    [analytics?.streakProgress, progress],
  );

  const animatedDonut = React.useMemo(
    () =>
      (analytics?.scoreComposition ?? []).map((item) => {
        const animatedPoints = Number((item.points * progress).toFixed(2));
        return {
          ...item,
          animatedPoints,
          // Recharts omits zero-value sectors; keep a tiny slice during animation
          // so tooltip/active-shape logic always has sectors to reference.
          chartValue: animatedPoints > 0 ? animatedPoints : 0.001,
        };
      }),
    [analytics?.scoreComposition, progress],
  );

  const safeDonutIndex =
    activeDonutIndex != null && activeDonutIndex < animatedDonut.length
      ? activeDonutIndex
      : undefined;
  const safeRadialIndex =
    activeRadialIndex != null && activeRadialIndex < animatedRadial.length
      ? activeRadialIndex
      : undefined;

  const personalYMax = computeYAxisMax(
    animatedPersonal.map((row) => Number(row.points ?? 0)),
  );
  const groupYMax = computeYAxisMax(
    animatedGroup.flatMap((row) =>
      (analytics?.users ?? []).map((user) => Number(row[user.userId] ?? 0)),
    ),
  );

  const activeYMax = scope === 'personal' ? personalYMax : groupYMax;
  const yTicks = computeYAxisTicks(activeYMax);

  if (!analytics || analytics.streakProgress.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        'flex flex-col border-border/60 shadow-sm lg:min-h-0 lg:overflow-hidden',
        className,
      )}
    >
      <CardHeader className="shrink-0 px-3 py-2">
        <CardTitle className="text-sm font-semibold">Weekly activity</CardTitle>
      </CardHeader>

      <CardContent className="grid flex-1 grid-cols-1 gap-3 p-2 pt-0 sm:gap-2 lg:grid-cols-2">
        <div className="flex min-h-[11rem] flex-col rounded-md border bg-muted/20 p-2 sm:min-h-[9rem]">
          <div className="mb-1.5 flex shrink-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium leading-tight">
                {scope === 'personal' ? 'Your daily points' : 'Group daily points'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Last 7 days · Y-axis: points
              </p>
            </div>
            <Select value={scope} onValueChange={(v) => setScope(v as 'personal' | 'group')}>
              <SelectTrigger className="h-7 w-[6.75rem] shrink-0 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-end">
            {scope === 'personal' ? (
              <ChartContainer
                config={personalChartConfig}
                className={cn(
                  'aspect-auto h-full min-h-[6.5rem] w-full [&_.recharts-responsive-container]:!h-full',
                  chartHoverContainerClass,
                )}
              >
                <BarChart
                  data={animatedPersonal}
                  accessibilityLayer
                  margin={axisChartMargin}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    height={20}
                  />
                  <YAxis
                    domain={[0, activeYMax]}
                    ticks={yTicks}
                    allowDecimals={activeYMax <= 1}
                    width={28}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => String(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value} pts`, '']}
                      />
                    }
                  />
                  <Legend content={<ChartLegendContent nameKey="dataKey" />} />
                  {analytics.personalHabits.map((habit, index, habits) => (
                    <Bar
                      key={habit.id}
                      dataKey={habit.id}
                      name={habit.id}
                      stackId="personal"
                      fill={habit.color}
                      shape={(props: unknown) => (
                        <ScalableBarShape
                          {...(props as ScalableBarShapeProps)}
                          habitId={habit.id}
                          activeHoverKey={hoveredBarKey}
                          onHoverChange={setHoveredBarKey}
                        />
                      )}
                      radius={
                        index === habits.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]
                      }
                      maxBarSize={28}
                      isAnimationActive
                      animationDuration={1000}
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            ) : (
              <ChartContainer
                config={groupChartConfig}
                className={cn(
                  'aspect-auto h-full min-h-[6.5rem] w-full [&_.recharts-responsive-container]:!h-full',
                  chartHoverContainerClass,
                )}
              >
                <LineChart
                  data={animatedGroup}
                  accessibilityLayer
                  margin={axisChartMargin}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    height={20}
                  />
                  <YAxis
                    domain={[0, activeYMax]}
                    ticks={yTicks}
                    allowDecimals={activeYMax <= 1}
                    width={28}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => String(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value} pts`, '']}
                      />
                    }
                  />
                  <Legend content={<ChartLegendContent nameKey="dataKey" />} />
                  {analytics.users.map((user) => (
                    <Line
                      key={user.userId}
                      type="monotone"
                      dataKey={user.userId}
                      name={user.userId}
                      stroke={user.color}
                      strokeWidth={hoveredLineKey?.startsWith(`${user.userId}-`) ? 2.75 : 2}
                      dot={({ key, ...dotProps }) => (
                        <ScalableLineDot
                          key={key}
                          {...dotProps}
                          dataKey={user.userId}
                          activeHoverKey={hoveredLineKey}
                          onHoverChange={setHoveredLineKey}
                        />
                      )}
                      activeDot={{
                        r: 8,
                        strokeWidth: 2,
                        fill: user.color,
                        stroke: user.color,
                      }}
                      isAnimationActive
                      animationDuration={1000}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
          <div className="flex min-h-[12rem] flex-col rounded-md border bg-muted/20 p-1.5 sm:min-h-[9rem]">
            <div className="shrink-0 px-0.5">
              <p className="text-[11px] font-medium leading-tight">Streak vs target</p>
              <p className="text-[10px] text-muted-foreground">
                Weekly goal progress per habit
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <ChartContainer
                config={Object.fromEntries(
                  animatedRadial.map((item) => [
                    item.id,
                    { label: item.name, color: item.color },
                  ]),
                ) satisfies ChartConfig}
                className={cn(
                  'aspect-square h-[min(100%,7.5rem)] w-[min(100%,7.5rem)]',
                  chartHoverContainerClass,
                )}
              >
                <RadialBarChart
                  data={animatedRadial}
                  innerRadius="28%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  cx="50%"
                  cy="50%"
                >
                  <RadialBar
                    dataKey="animatedProgress"
                    name="animatedProgress"
                    cornerRadius={4}
                    isAnimationActive
                    animationDuration={1000}
                    activeIndex={safeRadialIndex}
                    activeShape={safeRadialIndex != null ? ActiveRadialSector : undefined}
                    onMouseEnter={(_, index) => setActiveRadialIndex(index)}
                    onMouseLeave={() => setActiveRadialIndex(undefined)}
                  >
                    {animatedRadial.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </RadialBar>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, _name, item) => {
                          const payload = item.payload as (typeof animatedRadial)[number];
                          return [
                            `${value}% (${payload.completed}/${payload.goal})`,
                            payload.name,
                          ];
                        }}
                      />
                    }
                  />
                </RadialBarChart>
              </ChartContainer>
            </div>
            <ul className="mt-1 max-h-[3.5rem] space-y-0.5 overflow-y-auto px-0.5 scrollbar-thin">
              {animatedRadial.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-1.5 text-[10px] leading-tight"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {item.animatedProgress}%
                    {item.targetReached ? ' ✓' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-h-[12rem] flex-col rounded-md border bg-muted/20 p-1.5 sm:min-h-[9rem]">
            <div className="shrink-0 px-0.5">
              <p className="text-[11px] font-medium leading-tight">7-day score mix</p>
              <p className="text-[10px] text-muted-foreground">
                Points earned by habit this week
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              {animatedDonut.length > 0 ? (
                <ChartContainer
                  config={Object.fromEntries(
                    animatedDonut.map((item) => [
                      item.id,
                      { label: item.name, color: item.color },
                    ]),
                  ) satisfies ChartConfig}
                  className={cn(
                    'aspect-square h-[min(100%,7.5rem)] w-[min(100%,7.5rem)]',
                    chartHoverContainerClass,
                  )}
                >
                  <PieChart>
                    <Pie
                      data={animatedDonut}
                      dataKey="chartValue"
                      nameKey="name"
                      innerRadius="48%"
                      outerRadius="82%"
                      strokeWidth={1}
                      cx="50%"
                      cy="50%"
                      isAnimationActive={false}
                      activeIndex={safeDonutIndex}
                      activeShape={safeDonutIndex != null ? ActiveDonutSector : undefined}
                      onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                      onMouseLeave={() => setActiveDonutIndex(undefined)}
                    >
                      {animatedDonut.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(_value, name, item) => {
                            const payload = item.payload as (typeof animatedDonut)[number];
                            return [`${payload.animatedPoints} pts`, name];
                          }}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="px-2 text-center text-[10px] text-muted-foreground">
                  No points logged yet
                </p>
              )}
            </div>
            <ul className="mt-1 max-h-[3.5rem] space-y-0.5 overflow-y-auto px-0.5 scrollbar-thin">
              {animatedDonut.length > 0 ? (
                animatedDonut.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-1.5 text-[10px] leading-tight"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {item.animatedPoints} pts
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-[10px] text-muted-foreground">No points logged yet</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
