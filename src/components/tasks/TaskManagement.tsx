import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/appStore";
import type { Task, TaskCategory } from "@shared/types";
import { Plus, Trash2, Briefcase, Coffee, Brush } from "lucide-react";
const categoryConfig = {
  work: { icon: Briefcase, color: "text-brand-blue" },
  leisure: { icon: Coffee, color: "text-brand-yellow" },
  creative: { icon: Brush, color: "text-brand-pink" },
};
function TaskItem({ task }: { task: Task }) {
  const deleteTask = useAppStore((s) => s.deleteTask);
  const Icon = categoryConfig[task.category].icon;
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${categoryConfig[task.category].color}`} />
        <span className="font-medium">{task.title}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => deleteTask(task.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
export function TaskManagement() {
  const tasks = useAppStore((s) => s.user?.tasks) ?? [];
  const addTask = useAppStore((s) => s.addTask);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeTab, setActiveTab] = useState<TaskCategory>("work");
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim(), category: activeTab });
      setNewTaskTitle("");
    }
  };
  const filteredTasks = (category: TaskCategory) =>
    tasks.filter((t) => t.category === category);
  return (
    <Card className="rounded-2xl shadow-soft">
      <CardHeader>
        <CardTitle>Manage Your Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaskCategory)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="leisure">Leisure</TabsTrigger>
            <TabsTrigger value="creative">Creative</TabsTrigger>
          </TabsList>
          <form onSubmit={handleAddTask} className="flex gap-2 my-4">
            <Input
              placeholder={`Add a new ${activeTab} task...`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-4 space-y-2 min-h-[120px]">
            {Object.keys(categoryConfig).map((cat) => (
              <TabsContent key={cat} value={cat}>
                {filteredTasks(cat as TaskCategory).length > 0 ? (
                  filteredTasks(cat as TaskCategory).map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No {cat} tasks yet. Add one above!
                  </p>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}