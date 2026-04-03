import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLoginUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Shuffle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const login = useLoginUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Welcome back!" });
      },
      onError: () => {
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          variant: "destructive"
        });
      }
    }
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
    </div>
  );
  if (isAuthenticated) return <Redirect href="/" />;

  function onSubmit(data: LoginFormValues) {
    login.mutate({ data });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary-foreground shadow-lg">
            <Shuffle className="h-7 w-7" />
          </div>
          <h1 className="text-[32px] font-bold text-foreground tracking-tight">SentTrack</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@mission.org"
                        autoComplete="email"
                        className="h-11"
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
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11"
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
                className="w-full h-11 text-[15px] font-semibold mt-1"
                disabled={login.isPending}
                data-testid="btn-login-submit"
              >
                {login.isPending ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground space-y-1.5">
          <p className="font-semibold text-muted-foreground/60 uppercase tracking-wide text-[10px]">Demo accounts</p>
          <p><span className="font-semibold text-foreground">Admin</span> · admin@calvary.org / password123</p>
          <p><span className="font-semibold text-foreground">Missionary</span> · james@mission.org / password123</p>
        </div>
      </div>
    </div>
  );
}
