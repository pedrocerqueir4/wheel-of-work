import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { LogIn, LogOut, ToyBrick } from "lucide-react";
export function AppHeader() {
  const user = useAppStore((s) => s.user);
  const openAuthDialog = useAppStore((s) => s.openAuthDialog);
  const logout = useAppStore((s) => s.logout);
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ToyBrick className="h-8 w-8 text-brand-blue" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              Wheel of Work
            </h1>
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Hi, {user.name}!
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={openAuthDialog}>
                <LogIn className="mr-2 h-4 w-4" />
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}