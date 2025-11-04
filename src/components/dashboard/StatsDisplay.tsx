import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/appStore";
import { CheckCircle2, BrainCircuit, Coffee, Palette, Trophy } from "lucide-react";
import { useShallow } from 'zustand/react/shallow';
const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string | number, color: string }) => (
  <div className="flex items-center space-x-4 p-4 bg-background rounded-lg">
    <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);
export function StatsDisplay() {
  const tasks = useAppStore(useShallow((s) => s.user?.tasks ?? []));
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const totalPomodoros = tasks.reduce((sum, task) => sum + task.completedPomodoros, 0);
    const workPomodoros = tasks
      .filter(t => t.category === 'work')
      .reduce((sum, task) => sum + task.completedPomodoros, 0);
    const leisurePomodoros = tasks
      .filter(t => t.category === 'leisure')
      .reduce((sum, task) => sum + task.completedPomodoros, 0);
    const creativePomodoros = tasks
      .filter(t => t.category === 'creative')
      .reduce((sum, task) => sum + task.completedPomodoros, 0);
    return { totalTasks, totalPomodoros, workPomodoros, leisurePomodoros, creativePomodoros };
  }, [tasks]);
  return (
    <Card className="rounded-2xl shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-brand-yellow" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={CheckCircle2} title="Total Tasks" value={stats.totalTasks} color="text-green-500" />
          <StatCard icon={BrainCircuit} title="Work Pomodoros" value={stats.workPomodoros} color="text-brand-blue" />
          <StatCard icon={Coffee} title="Leisure Pomodoros" value={stats.leisurePomodoros} color="text-brand-yellow" />
          <StatCard icon={Palette} title="Creative Pomodoros" value={stats.creativePomodoros} color="text-brand-pink" />
          <div className="sm:col-span-2 lg:col-span-3">
             <StatCard icon={Trophy} title="Total Pomodoros Completed" value={stats.totalPomodoros} color="text-purple-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}