import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLoginUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect, useLocation } from "wouter";
import { ArrowLeftRight, LogIn } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const login = useLoginUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Welcome back!" });
        setLocation("/");
      },
      onError: () => {
        toast({ 
          title: "Login Failed", 
          description: "Invalid email or password.",
          variant: "destructive"
        });
      }
    }
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (isAuthenticated) return <Redirect href="/" />;

  function onSubmit(data: LoginFormValues) {
    login.mutate({ data });
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary/5 p-8 text-center border-b-2 border-border/40">
          <div className="bg-primary w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 text-primary-foreground shadow-md">
            <ArrowLeftRight className="h-7 w-7" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-primary mb-2">Missionary Tracking</p>
          <h1 className="text-3xl font-sans font-bold text-foreground tracking-tight">SentTrack</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your account.</p>
        </div>
        
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@mission.org" 
                        className="bg-background/50" 
                        autoComplete="email" 
                        {...field} 
                        data-testid="input-login-email" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-background/50" 
                        autoComplete="current-password" 
                        {...field} 
                        data-testid="input-login-password" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full mt-4 h-12 text-base font-medium gap-2" 
                disabled={login.isPending}
                data-testid="btn-login-submit"
              >
                <LogIn className="h-5 w-5" />
                {login.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Demo accounts:</p>
            <div className="mt-2 space-y-1">
              <p><strong className="text-foreground">Admin:</strong> admin@calvary.org / password123</p>
              <p><strong className="text-foreground">Missionary:</strong> james@mission.org / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
