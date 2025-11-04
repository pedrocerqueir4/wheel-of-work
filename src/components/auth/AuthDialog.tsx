import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const authSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
});
type AuthFormValues = z.infer<typeof authSchema>;
export function AuthDialog() {
  const isAuthDialogOpen = useAppStore((s) => s.isAuthDialogOpen);
  const closeAuthDialog = useAppStore((s) => s.closeAuthDialog);
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const isLoading = useAppStore((s) => s.isLoading);
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { username: "" },
  });
  const handleLogin = (values: AuthFormValues) => {
    login(values.username);
  };
  const handleRegister = (values: AuthFormValues) => {
    register(values.username);
  };
  return (
    <Dialog open={isAuthDialogOpen} onOpenChange={closeAuthDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Wheel of Work!</DialogTitle>
          <DialogDescription>
            Login to save your tasks or create a new account.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="register">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}