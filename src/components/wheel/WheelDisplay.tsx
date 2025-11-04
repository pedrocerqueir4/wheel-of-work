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
import { Slider } from "@/components/ui/slider";
import { useShallow } from 'zustand/react/shallow';
const categoryColors: Record<TaskCategory, string> = {
  work: "rgb(96 165 250)",
  leisure: "rgb(251 191 36)",
  creative: "rgb(236 72 153)",
};
const getPath = (startAngle: number, endAngle: number, radius: number) => {
  const start = { x: 50 + radius * Math.cos(startAngle), y: 50 + radius * Math.sin(startAngle) };
  const end = { x: 50 + radius * Math.cos(endAngle), y: 50 + radius * Math.sin(endAngle) };
  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(" ");
};
const getSegmentPath = (startAngle: number, endAngle: number) => {
  const start = { x: 50 + 48 * Math.cos(startAngle), y: 50 + 48 * Math.sin(startAngle) };
  const end = { x: 50 + 48 * Math.cos(endAngle), y: 50 + 48 * Math.sin(endAngle) };
  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
  return ["M", 50, 50, "L", start.x, start.y, "A", 48, 48, 0, largeArcFlag, 1, end.x, end.y, "Z"].join(" ");
};
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
export function WheelDisplay() {
  const { tasks, taskQueue, wheelMode, advancedCategories, advancedModeWeights, spinningTargetTask } = useAppStore(
    useShallow((s) => ({
      tasks: s.user?.tasks ?? [],
      taskQueue: s.taskQueue,
      wheelMode: s.wheelMode,
      advancedCategories: s.advancedModeCategories,
      advancedModeWeights: s.advancedModeWeights,
      spinningTargetTask: s.spinningTargetTask,
    }))
  );
  const setWheelMode = useAppStore((s) => s.setWheelMode);
  const spinWheelAction = useAppStore((s) => s.spinWheel);
  const confirmSpinResult = useAppStore((s) => s.confirmSpinResult);
  const toggleAdvancedCategory = useAppStore((s) => s.toggleAdvancedCategory);
  const setAdvancedWeight = useAppStore((s) => s.setAdvancedWeight);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const handleWeightChange = (category: TaskCategory, value: number[]) => {
    const newWeight = value[0];
    const otherCategories = (Object.keys(advancedModeWeights) as TaskCategory[]).filter(c => c !== category);
    const currentTotal = Object.values(advancedModeWeights).reduce((sum, w) => sum + w, 0);
    const remainingWeight = 100 - newWeight;
    if (otherCategories.length > 0) {
      const otherTotal = currentTotal - advancedModeWeights[category];
      otherCategories.forEach(cat => {
        const proportion = otherTotal > 0 ? advancedModeWeights[cat] / otherTotal : 1 / otherCategories.length;
        const adjustedWeight = Math.round(remainingWeight * proportion);
        setAdvancedWeight(cat, adjustedWeight);
      });
    }
    setAdvancedWeight(category, newWeight);
    // Final normalization pass to ensure it's exactly 100
    const finalWeights = { ...useAppStore.getState().advancedModeWeights, [category]: newWeight };
    const finalTotal = Object.values(finalWeights).reduce((sum, w) => sum + w, 0);
    if (finalTotal !== 100 && otherCategories.length > 0) {
      const diff = 100 - finalTotal;
      setAdvancedWeight(otherCategories[0], finalWeights[otherCategories[0]] + diff);
    }
  };
  const filteredTasks = useMemo(() => {
    const queuedTaskIds = new Set(taskQueue.map(t => t.id));
    // During spin, keep the target task in the wheel for visual feedback
    const availableTasks = tasks.filter(t => !queuedTaskIds.has(t.id) || t.id === spinningTargetTask?.id);
    switch (wheelMode) {
      case 'hard-working': return availableTasks.filter(t => t.category === 'work');
      case 'time-to-work': return availableTasks.filter(t => t.category === 'work' || t.category === 'creative');
      case 'advanced':
        const enabled = Object.keys(advancedCategories).filter(k => advancedCategories[k as TaskCategory]) as TaskCategory[];
        return availableTasks.filter(t => enabled.includes(t.category));
      case 'normal': default: return availableTasks;
    }
  }, [tasks, wheelMode, advancedCategories, taskQueue, spinningTargetTask]);
  const segments = useMemo(() => {
    if (filteredTasks.length === 0) return [];
    let cumulativeAngle = -Math.PI / 2;
    if (wheelMode === 'advanced') {
      const tasksByCat = filteredTasks.reduce((acc, task) => {
        if (!acc[task.category]) acc[task.category] = [];
        acc[task.category].push(task);
        return acc;
      }, {} as Record<TaskCategory, Task[]>);
      const enabledWeights = (Object.keys(advancedModeWeights) as TaskCategory[])
        .filter(cat => advancedCategories[cat] && tasksByCat[cat]?.length > 0)
        .reduce((acc, cat) => ({ ...acc, [cat]: advancedModeWeights[cat] }), {} as Record<TaskCategory, number>);
      const totalWeight = Object.values(enabledWeights).reduce((sum, w) => sum + w, 0);
      if (totalWeight === 0) return [];
      const result: any[] = [];
      (Object.keys(tasksByCat) as TaskCategory[]).forEach(cat => {
        const catTasks = tasksByCat[cat];
        const catWeight = enabledWeights[cat] ?? 0;
        const angleForCat = (catWeight / totalWeight) * 2 * Math.PI;
        const anglePerTask = angleForCat / catTasks.length;
        catTasks.forEach(task => {
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + anglePerTask;
          result.push({
            path: getSegmentPath(startAngle, endAngle),
            textPath: getPath(startAngle, endAngle, 30),
            color: categoryColors[task.category],
            task,
            startAngle,
            endAngle,
          });
          cumulativeAngle = endAngle;
        });
      });
      return result;
    } else {
      if (filteredTasks.length === 1) {
        const task = filteredTasks[0];
        const startAngle = -Math.PI / 2;
        const endAngle = 3 * Math.PI / 2;
        return [{
          path: getSegmentPath(startAngle, endAngle),
          textPath: getPath(startAngle, endAngle, 30),
          color: categoryColors[task.category],
          task,
          startAngle,
          endAngle,
        }];
      }
      const anglePerSegment = (2 * Math.PI) / filteredTasks.length;
      return filteredTasks.map((task, i) => {
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + anglePerSegment;
        cumulativeAngle = endAngle;
        return {
          path: getSegmentPath(startAngle, endAngle),
          textPath: getPath(startAngle, endAngle, 30),
          color: categoryColors[task.category],
          task,
          startAngle,
          endAngle,
        };
      });
    }
  }, [filteredTasks, wheelMode, advancedModeWeights, advancedCategories]);
  const handleSpin = () => {
    if (isSpinning || segments.length === 0) return;
    const selectedTask = spinWheelAction();
    if (!selectedTask) return;
    const selectedSegment = segments.find(s => s.task.id === selectedTask.id);
    if (!selectedSegment) return;
    const { startAngle, endAngle } = selectedSegment;
    const middleAngle = (startAngle + endAngle) / 2;
    const randomOffset = (Math.random() - 0.5) * (endAngle - startAngle) * 0.8;
    const targetAngleRad = middleAngle + randomOffset;
    const targetAngleDeg = (targetAngleRad * 180) / Math.PI;
    const pointerCorrection = 90;
    const finalTargetDeg = 360 - targetAngleDeg - pointerCorrection;
    const fullSpins = 5;
    const newRotation = rotation - (rotation % 360) + (360 * fullSpins) + finalTargetDeg;
    setIsSpinning(true);
    setRotation(newRotation);
  };
  const onSpinComplete = () => {
    setIsSpinning(false);
    confirmSpinResult();
  };
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
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Advanced Settings</h4>
                  <p className="text-sm text-muted-foreground">Select categories and their weights.</p>
                </div>
                <div className="grid gap-4">
                  {(Object.keys(categoryColors) as TaskCategory[]).map(cat => (
                    <div key={cat} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id={cat} checked={advancedCategories[cat]} onCheckedChange={() => toggleAdvancedCategory(cat)} />
                        <Label htmlFor={cat} className="capitalize flex-1">{cat}</Label>
                        <span className="text-sm font-medium w-12 text-right">{advancedModeWeights[cat]}%</span>
                      </div>
                      <Slider
                        disabled={!advancedCategories[cat]}
                        value={[advancedModeWeights[cat]]}
                        onValueChange={(v) => handleWeightChange(cat, v)}
                        max={100}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="relative w-full max-w-sm aspect-square">
          <motion.div className="w-full h-full" animate={{ rotate: rotation }} transition={{ type: "spring", stiffness: 20, damping: 15, mass: 2 }} onAnimationComplete={onSpinComplete}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                {segments.map((segment, i) => (
                  <path key={`textpath-${segment.task.id}-${i}`} id={`textpath-${segment.task.id}-${i}`} d={segment.textPath} />
                ))}
              </defs>
              <AnimatePresence>
                {segments.length > 0 ? (
                  segments.map((segment, i) => (
                    <motion.g key={segment.task.id + i}>
                      <motion.path d={segment.path} fill={segment.color} stroke="#fff" strokeWidth="2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3, delay: i * 0.05 }} />
                      <text dy="-4" fill="#fff" style={{ fontSize: '4px', fontWeight: 'bold', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                        <textPath href={`#textpath-${segment.task.id}-${i}`} startOffset="50%" textAnchor="middle">
                          {truncateText(segment.task.title, 15)}
                        </textPath>
                      </text>
                    </motion.g>
                  ))
                ) : (
                  <circle cx="50" cy="50" r="48" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
                )}
              </AnimatePresence>
              <circle cx="50" cy="50" r="10" fill="#fff" stroke="hsl(var(--border))" strokeWidth="0.5" />
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