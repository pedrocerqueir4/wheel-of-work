import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Utensils, Play, Pause, RotateCcw, SkipForward, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { AnimatePresence, motion } from "framer-motion";
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
export function PomodoroDisplay() {
  const timer = useAppStore((s) => s.timer);
  const pomodoroState = useAppStore((s) => s.pomodoroState);
  const taskQueue = useAppStore((s) => s.taskQueue);
  const currentTask = useAppStore((s) => s.currentTaskInSession);
  const startPomodoro = useAppStore((s) => s.startPomodoro);
  const pausePomodoro = useAppStore((s) => s.pausePomodoro);
  const resetPomodoro = useAppStore((s) => s.resetPomodoro);
  const skipTask = useAppStore((s) => s.skipTask);
  const pullLeisureTask = useAppStore((s) => s.pullLeisureTask);
  const clearTaskQueue = useAppStore((s) => s.clearTaskQueue);
  const isControlDisabled = pomodoroState === 'idle' && taskQueue.length === 0;
  const isSkipDisabled = !currentTask || pomodoroState === 'break';
  return (
    <Card className="rounded-2xl shadow-soft">
      <CardHeader>
        <CardTitle className="text-2xl">
          {pomodoroState === 'break' ? 'Break Time' : 'Focus Session'}
        </CardTitle>
        <CardDescription>
          {pomodoroState === 'break' ? 'Time to relax and recharge!' : 'Time to get things done!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center bg-muted/50 p-8 rounded-xl">
          <p className="text-7xl font-bold font-mono tabular-nums text-foreground">
            {formatTime(timer)}
          </p>
          <p className="text-lg font-medium text-muted-foreground h-7 mt-1">
            {currentTask ? (
              <>Current Task: <span className="text-foreground">{currentTask.title}</span></>
            ) : pomodoroState === 'break' ? (
              <span className="text-brand-yellow">Enjoy your break!</span>
            ) : (
              "No task in session"
            )}
          </p>
        </div>
        <div className="flex justify-center gap-2">
          {pomodoroState !== 'running' ? (
            <Button onClick={startPomodoro} disabled={isControlDisabled}>
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          ) : (
            <Button onClick={pausePomodoro} variant="outline">
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          <Button onClick={resetPomodoro} variant="ghost" disabled={isControlDisabled}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={skipTask} variant="ghost" disabled={isSkipDisabled}>
            <SkipForward className="mr-2 h-4 w-4" /> Skip
          </Button>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-semibold mb-3">Task Queue</h3>
          <div className="space-y-2 min-h-[120px]">
            <AnimatePresence>
              {taskQueue.length > 0 ? (
                taskQueue.map((task, index) => (
                  <motion.div
                    key={task.id + index} // Key needs to be unique even if same task is added twice
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg ${index === 0 ? 'bg-primary/10' : 'bg-muted/50'}`}
                  >
                    <p className={`font-medium ${index === 0 ? 'text-primary' : ''}`}>
                      {index + 1}. {task.title}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="p-3 bg-muted/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Spin the wheel to add tasks!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="w-full" onClick={pullLeisureTask}>
              <Utensils className="mr-2 h-4 w-4" />
              Meal Button
            </Button>
            <Button variant="destructive" className="w-full" onClick={clearTaskQueue} disabled={taskQueue.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Queue
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}