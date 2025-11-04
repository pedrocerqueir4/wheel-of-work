import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
export function WheelDisplay() {
  return (
    <Card className="rounded-2xl shadow-soft overflow-hidden">
      <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center space-y-6">
        <div className="relative w-full max-w-sm aspect-square">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Wheel segments */}
            <circle cx="50" cy="50" r="48" fill="rgb(251 191 36)" stroke="#fff" strokeWidth="2" />
            <path d="M 50 50 L 50 2 A 48 48 0 0 1 91.4 26.6 L 50 50 Z" fill="rgb(96 165 250)" />
            <path d="M 50 50 L 91.4 26.6 A 48 48 0 0 1 91.4 73.4 L 50 50 Z" fill="rgb(236 72 153)" />
            <path d="M 50 50 L 91.4 73.4 A 48 48 0 0 1 50 98 L 50 50 Z" fill="rgb(96 165 250)" />
            <path d="M 50 50 L 50 98 A 48 48 0 0 1 8.6 73.4 L 50 50 Z" fill="rgb(236 72 153)" />
            <path d="M 50 50 L 8.6 73.4 A 48 48 0 0 1 8.6 26.6 L 50 50 Z" fill="rgb(251 191 36)" />
            <path d="M 50 50 L 8.6 26.6 A 48 48 0 0 1 50 2 L 50 50 Z" fill="rgb(96 165 250)" />
            {/* Center circle */}
            <circle cx="50" cy="50" r="10" fill="#fff" />
            <circle cx="50" cy="50" r="8" fill="hsl(var(--background))" />
          </svg>
          {/* Pointer */}
          <div className="absolute top-[-4px] left-1/2 -translate-x-1/2" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))" }}>
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 36L23.2583 18L0.74167 18L12 36Z" fill="#FFFFFF"/>
              <path d="M12 0L24 18H0L12 0Z" fill="hsl(var(--foreground))"/>
            </svg>
          </div>
        </div>
        <Button size="lg" className="px-10 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-95 bg-brand-pink hover:bg-brand-pink/90 text-white">
          <Zap className="mr-2 h-5 w-5" />
          Spin the Wheel!
        </Button>
      </CardContent>
    </Card>
  );
}