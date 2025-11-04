import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Utensils } from "lucide-react";
export function PomodoroDisplay() {
  return (
    <Card className="rounded-2xl shadow-soft">
      <CardHeader>
        <CardTitle className="text-2xl">Focus Session</CardTitle>
        <CardDescription>Time to get things done!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center bg-muted/50 p-8 rounded-xl">
          <p className="text-7xl font-bold font-mono tabular-nums text-foreground">
            25:00
          </p>
          <p className="text-lg font-medium text-muted-foreground">
            Current Task: <span className="text-foreground">Build the UI</span>
          </p>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-semibold mb-3">Task Queue</h3>
          <div className="space-y-2">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">Read a book</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">Sketch an idea</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">No more tasks in queue.</p>
            </div>
          </div>
        </div>
        <Button variant="secondary" className="w-full">
          <Utensils className="mr-2 h-4 w-4" />
          Meal Button (Get a break!)
        </Button>
      </CardContent>
    </Card>
  );
}