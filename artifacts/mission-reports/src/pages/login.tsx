import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLoginUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect, Link } from "wouter";
import { Shuffle, MapPin, BookOpen, Building } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: BookOpen, text: "Share updates from the field" },
  { icon: MapPin, text: "See where work is happening" },
  { icon: Building, text: "Stay informed across teams and activities" },
];

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
        toast({ title: "Sign in failed", description: "Check your email and password.", variant: "destructive" });
      }
    }
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
    </div>
  );
  if (isAuthenticated) return <Redirect href="/" />;

  function onSubmit(data: LoginFormValues) {
    login.mutate({ data });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand Panel */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col text-white p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #0d1b5e 0%, #132272 45%, #1a3a9a 100%)" }}
      >
        {/* Radial glow — matches signup page */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10 mb-6">
          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <Shuffle className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">SentConnect</span>
        </div>

        {/* Domain — matches signup */}
        <p className="relative z-10 text-white/40 text-[11px] font-medium tracking-widest uppercase mb-8">
          www.sentconnect.org
        </p>

        {/* Headline + description */}
        <div className="relative z-10 max-w-xs">
          <h2 className="text-[2rem] font-extrabold leading-snug mb-3 tracking-tight text-white">
            Stay connected with your{" "}
            <span style={{ color: "#00C4A7" }}>field teams.</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            A simple platform for organizations to receive updates from teams working across different locations.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bible verse */}
        <div className="relative z-10 mt-auto border-l-2 border-white/15 pl-4">
          <p className="text-white/40 text-sm italic leading-relaxed">
            "Declare his glory among the nations, his marvelous works among all the peoples!"
          </p>
          <p className="text-white/25 text-xs mt-1.5 font-medium">— Psalm 96:3</p>
        </div>

        {/* Footer — matches signup */}
        <p className="relative z-10 mt-6 text-white/30 text-xs">© SentConnect</p>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F7FA] px-6 py-12">
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="bg-primary p-2 rounded-xl text-white">
            <Shuffle className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">SentConnect</span>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your account to continue.</p>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@mission.org"
                          autoComplete="email"
                          className="h-10 text-sm"
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
                      <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="h-10 text-sm"
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
                  className="w-full h-10 text-sm font-semibold mt-1"
                  disabled={login.isPending}
                  data-testid="btn-login-submit"
                >
                  {login.isPending ? "Signing in…" : "Sign In"}
                </Button>
              </form>
            </Form>
            <p className="text-center mt-4">
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
