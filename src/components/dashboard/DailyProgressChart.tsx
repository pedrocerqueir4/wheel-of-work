import { useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { useShallow } from 'zustand/react/shallow';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfToday, subDays } from 'date-fns';
import type { CompletedTask } from "@shared/types";
const categoryColors = {
  work: "rgb(96 165 250)",
  leisure: "rgb(251 191 36)",
  creative: "rgb(236 72 153)",
};
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    return (
      <div className="p-3 bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg text-sm">
        <p className="font-bold mb-2">{label}</p>
        <div className="space-y-1">
          {payload.slice().reverse().map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                <span className="capitalize text-muted-foreground">{entry.name}</span>
              </div>
              <span className="ml-4 font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
        <div className="border-t my-2"></div>
        <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{total}</span>
        </div>
      </div>
    );
  }
  return null;
};
export function DailyProgressChart() {
  const completedTasks = useAppStore(useShallow((s) => s.user?.completedTasks ?? []));
  const chartData = useMemo(() => {
    const today = startOfToday();
    // Generate dates for the last 7 days including today
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();
    const dailyData = new Map<string, { work: number; leisure: number; creative: number }>();
    // Initialize map with 0 values for the last 7 days
    last7Days.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      dailyData.set(dateKey, { work: 0, leisure: 0, creative: 0 });
    });
    // Populate with data from completed tasks
    completedTasks.forEach((task: CompletedTask) => {
      const dateKey = format(new Date(task.completedAt), 'yyyy-MM-dd');
      if (dailyData.has(dateKey)) {
        const dayData = dailyData.get(dateKey)!;
        // Assuming each completion is 1 pomodoro for simplicity in this chart
        dayData[task.category] += 1; 
      }
    });
    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date: format(parseISO(date), 'MMM d'),
      ...data,
    }));
  }, [completedTasks]);
  const hasData = useMemo(() => chartData.some(d => d.work > 0 || d.leisure > 0 || d.creative > 0), [chartData]);
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <p className="text-muted-foreground">
          No activity in the last 7 days. <br/> Complete some tasks to see your progress!
        </p>
      </div>
    );
  }
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 4 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
          <Bar dataKey="work" stackId="a" fill={categoryColors.work} name="Work" radius={[4, 4, 0, 0]} />
          <Bar dataKey="leisure" stackId="a" fill={categoryColors.leisure} name="Leisure" radius={[0, 0, 0, 0]} />
          <Bar dataKey="creative" stackId="a" fill={categoryColors.creative} name="Creative" radius={[0, 0, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}