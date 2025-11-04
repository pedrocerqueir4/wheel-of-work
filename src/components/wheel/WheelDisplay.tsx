import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Zap, BrainCircuit, Coffee, Palette, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/appStore";
import type { Task, TaskCategory, WheelMode } from "@shared/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useShallow } from 'zustand/react/shallow';
const categoryColors: Record<TaskCategory, string> = {
  work: "rgb(96 165 250)",
  leisure: "rgb(251 191 36)",
  creative: "rgb(236 72 153)",
};
const getPath = (startAngle: number, endAngle: number) => {
  const start = { x: 50 + 48 * Math.cos(startAngle), y: 50 + 48 * Math.sin(startAngle) };
  const end = { x: 50 + 48 * Math.cos(endAngle), y: 50 + 48 * Math.sin(endAngle) };
  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
  return ["M", 50, 50, "L", start.x, start.y, "A", 48, 48, 0, largeArcFlag, 1, end.x, end.y, "Z"].join(" ");
};
export function WheelDisplay() {
  const tasks = useAppStore(useShallow((s) => s.user?.tasks ?? []));
  const wheelMode = useAppStore((s) => s.wheelMode);
  const setWheelMode = useAppStore((s) => s.setWheelMode);
  const spinWheelAction = useAppStore((s) => s.spinWheel);
  const advancedCategories = useAppStore((s) => s.advancedModeCategories);
  const toggleAdvancedCategory = useAppStore((s) => s.toggleAdvancedCategory);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const filteredTasks = useMemo(() => {
    switch (wheelMode) {
      case 'hard-working': return tasks.filter(t => t.category === 'work');
      case 'time-to-work': return tasks.filter(t => t.category === 'work' || t.category === 'creative');
      case 'advanced':
        const enabled = Object.keys(advancedCategories).filter(k => advancedCategories[k as TaskCategory]) as TaskCategory[];
        return tasks.filter(t => enabled.includes(t.category));
      case 'normal': default: return tasks;
    }
  }, [tasks, wheelMode, advancedCategories]);
  const handleSpin = () => {
    if (isSpinning || filteredTasks.length === 0) return;
    const selectedTask = spinWheelAction();
    if (!selectedTask) return;
    const selectedIndex = filteredTasks.findIndex(t => t.id === selectedTask.id);
    const totalTasks = filteredTasks.length;
    const anglePerTask = 360 / totalTasks;
    const randomOffset = (Math.random() - 0.5) * anglePerTask * 0.8;
    const targetAngle = 360 - (selectedIndex * anglePerTask + anglePerTask / 2) + randomOffset;
    const fullSpins = 5;
    const newRotation = rotation + (360 * fullSpins) + targetAngle;
    setIsSpinning(true);
    setRotation(newRotation);
  };
  const segments = useMemo(() => {
    const numTasks = filteredTasks.length;
    if (numTasks === 0) return [];
    const anglePerSegment = (2 * Math.PI) / numTasks;
    return filteredTasks.map((task, i) => ({
      path: getPath(i * anglePerSegment - Math.PI / 2, (i + 1) * anglePerSegment - Math.PI / 2),
      color: categoryColors[task.category],
      task,
    }));
  }, [filteredTasks]);
  return (
    <Card className="rounded-2xl shadow-soft overflow-hidden">
      <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center space-y-6">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <ToggleGroup type="single" value={wheelMode} onValueChange={(v: WheelMode) => v && setWheelMode(v)} aria-label="Wheel Mode">
            <ToggleGroupItem value="hard-working" aria-label="Hard-working mode"><BrainCircuit className="h-4 w-4 mr-2" /> Hard-Working</ToggleGroupItem>
            <ToggleGroupItem value="time-to-work" aria-label="Time-to-work mode"><Palette className="h-4 w-4 mr-2" /> Time-to-Work</ToggleGroupItem>
            <ToggleGroupItem value="normal" aria-label="Normal mode"><Coffee className="h-4 w-4 mr-2" /> Normal</ToggleGroupItem>
          </ToggleGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={wheelMode === 'advanced' ? 'default' : 'outline'} onClick={() => setWheelMode('advanced')} className="gap-2">
                <Settings className="h-4 w-4" /> Advanced
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Advanced Settings</h4>
                  <p className="text-sm text-muted-foreground">Select categories to include.</p>
                </div>
                <div className="grid gap-2">
                  {(Object.keys(categoryColors) as TaskCategory[]).map(cat => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox id={cat} checked={advancedCategories[cat]} onCheckedChange={() => toggleAdvancedCategory(cat)} />
                      <Label htmlFor={cat} className="capitalize">{cat}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="relative w-full max-w-sm aspect-square">
          <motion.div className="w-full h-full" animate={{ rotate: rotation }} transition={{ type: "spring", stiffness: 20, damping: 15, mass: 2 }} onAnimationComplete={() => setIsSpinning(false)}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <AnimatePresence>
                {segments.length > 0 ? (
                  segments.map((segment, i) => (
                    <motion.path key={segment.task.id + i} d={segment.path} fill={segment.color} stroke="#fff" strokeWidth="2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3, delay: i * 0.05 }} />
                  ))
                ) : (
                  <circle cx="50" cy="50" r="48" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
                )}
              </AnimatePresence>
              <circle cx="50" cy="50" r="10" fill="#fff" />
              <circle cx="50" cy="50" r="8" fill="hsl(var(--background))" />
            </svg>
          </motion.div>
          <div className="absolute top-[-4px] left-1/2 -translate-x-1/2" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))" }}>
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 36L23.2583 18L0.74167 18L12 36Z" fill="#FFFFFF"/>
              <path d="M12 0L24 18H0L12 0Z" fill="hsl(var(--foreground))"/>
            </svg>
          </div>
        </div>
        <Button size="lg" className="px-10 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active-scale-95 bg-brand-pink hover:bg-brand-pink/90 text-white" onClick={handleSpin} disabled={isSpinning || filteredTasks.length === 0}>
          <Zap className="mr-2 h-5 w-5" />
          {isSpinning ? "Spinning..." : "Spin the Wheel!"}
        </Button>
      </CardContent>
    </Card>
  );
}