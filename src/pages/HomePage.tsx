import { AppHeader } from "@/components/layout/AppHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/store/appStore";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { ToyBrick } from "lucide-react";
function LandingContent() {
  const openAuthDialog = useAppStore((s) => s.openAuthDialog);
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-pink flex items-center justify-center shadow-lg floating">
          <ToyBrick className="w-12 h-12 text-white" />
        </div>
      </div>
      <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
        Stop Wondering, Start Doing
      </h1>
      <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
        Wheel of Work helps you decide what to focus on next with a fun spin,
        powered by the Pomodoro technique to keep you productive.
      </p>
      <Button size="lg" className="mt-8" onClick={openAuthDialog}>
        Get Started for Free
      </Button>
    </div>
  );
}
export function HomePage() {
  const user = useAppStore((s) => s.user);
  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <AppHeader />
      <main className="flex-1 flex flex-col">
        {user ? <Dashboard /> : <LandingContent />}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        Built with ❤️ at Cloudflare
      </footer>
      <AuthDialog />
      <ThemeToggle className="fixed bottom-4 right-4" />
      <Toaster richColors closeButton />
    </div>
  );
}