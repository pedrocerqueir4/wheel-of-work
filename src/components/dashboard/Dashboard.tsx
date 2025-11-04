import { PomodoroDisplay } from "@/components/pomodoro/PomodoroDisplay";
import { TaskManagement } from "@/components/tasks/TaskManagement";
import { WheelDisplay } from "@/components/wheel/WheelDisplay";
import { StatsDisplay } from "./StatsDisplay";
export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <WheelDisplay />
            <StatsDisplay />
            <TaskManagement />
          </div>
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <PomodoroDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}