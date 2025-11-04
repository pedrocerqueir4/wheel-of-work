import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { Loader2 } from "lucide-react";
export function AuthDialog() {
  const isAuthDialogOpen = useAppStore((s) => s.isAuthDialogOpen);
  const closeAuthDialog = useAppStore((s) => s.closeAuthDialog);
  const login = useAppStore((s) => s.login);
  const isLoading = useAppStore((s) => s.isLoading);
  return (
    <Dialog open={isAuthDialogOpen} onOpenChange={closeAuthDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Wheel of Work!</DialogTitle>
          <DialogDescription>
            For now, just click below to log in with a mock account. Real authentication is coming soon!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-center text-muted-foreground">
            This will let you save your tasks and progress.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            onClick={() => login()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Login with Mock User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}