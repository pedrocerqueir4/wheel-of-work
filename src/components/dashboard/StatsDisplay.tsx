import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/appStore";
import { BrainCircuit, Coffee, Palette, Trophy } from "lucide-react";
import { useShallow } from 'zustand/react/shallow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyProgressChart } from "./DailyProgressChart";
const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string | number, color: string }) => (
  <div className="flex items-center space-x-4 p-4 bg-background rounded-lg">
    <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);
export function StatsDisplay() {
  const completedTasks = useAppStore(useShallow((s) => s.user?.completedTasks ?? []));
  const stats = useMemo(() => {
    const totalPomodoros = completedTasks.length; // Each completed task is one pomodoro session
    const workPomodoros = completedTasks.filter(t => t.category === 'work').length;
    const leisurePomodoros = completedTasks.filter(t => t.category === 'leisure').length;
    const creativePomodoros = completedTasks.filter(t => t.category === 'creative').length;
    return { totalPomodoros, workPomodoros, leisurePomodoros, creativePomodoros };
  }, [completedTasks]);
  return (
    <Card className="rounded-2xl shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-brand-yellow" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overall">Overall Stats</TabsTrigger>
            <TabsTrigger value="daily">Daily Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="overall" className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <StatCard icon={BrainCircuit} title="Work Pomodoros" value={stats.workPomodoros} color="text-brand-blue" />
              <StatCard icon={Coffee} title="Leisure Pomodoros" value={stats.leisurePomodoros} color="text-brand-yellow" />
              <StatCard icon={Palette} title="Creative Pomodoros" value={stats.creativePomodoros} color="text-brand-pink" />
              <div className="sm:col-span-2 lg:col-span-1">
                 <StatCard icon={Trophy} title="Total Pomodoros" value={stats.totalPomodoros} color="text-purple-500" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="daily" className="pt-6">
            <DailyProgressChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}