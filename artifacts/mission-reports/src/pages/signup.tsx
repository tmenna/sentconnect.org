import { useState } from "react";
import { Link, Redirect } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { Shuffle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Signup() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [orgName, setOrgName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/" />;

  function generateSubdomain(org: string) {
    return org.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, subdomain, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error ?? "Signup failed" });
        return;
      }
      queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      toast({ title: "Welcome to SentConnect!", description: `Your organization "${orgName}" is ready.` });
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      {/* Left panel */}
      <div
        className="hidden md:flex flex-col justify-between w-[460px] flex-shrink-0 relative overflow-hidden px-10 py-12 text-white"
        style={{ background: "linear-gradient(155deg, #0d1b5e 0%, #132272 45%, #1a3a9a 100%)" }}
      >
        {/* Subtle radial glow for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Top content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Shuffle className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">SentConnect</span>
          </div>

          {/* Subtle domain branding */}
          <p className="text-white/40 text-[11px] font-medium tracking-widest uppercase mb-8">
            www.sentconnect.org
          </p>

          <h2 className="text-[2.1rem] font-extrabold leading-[1.2] mb-5 tracking-tight text-white">
            Connect with your Global Partners<br />
            from{" "}
            <span style={{ color: "#00C4A7" }}>anywhere.</span>
          </h2>

          <p className="text-white/70 text-[15px] leading-relaxed max-w-[340px]">
            Create your organization's private space and receive updates from your Global Partners across different locations.
          </p>
        </div>

        {/* Bottom */}
        <p className="relative z-10 mt-6 text-white/30 text-xs">© SentConnect</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#132272] rounded-lg flex items-center justify-center">
              <Shuffle className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-[#132272]">SentConnect</span>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">Create your organization</h1>
          <p className="text-muted-foreground text-sm mb-6">You'll be the admin. Invite your team after setup.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-lg">
                {errors.general}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-foreground mb-1">Organization name</label>
              <Input
                value={orgName}
                onChange={e => {
                  setOrgName(e.target.value);
                  if (!subdomain) setSubdomain(generateSubdomain(e.target.value));
                }}
                placeholder="Calvary Community Church"
                required
                className="h-10"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-foreground mb-1">Subdomain</label>
              <div className="flex items-center gap-0 border border-input rounded-lg overflow-hidden h-10 focus-within:ring-2 focus-within:ring-ring">
                <input
                  value={subdomain}
                  onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="calvary"
                  required
                  className="flex-1 px-3 text-[13px] outline-none bg-transparent"
                />
                <span className="px-3 text-[12px] text-muted-foreground bg-muted h-full flex items-center border-l border-input">
                  .sentconnect.org
                </span>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wide mb-3">Your account</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">Full name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Mitchell" required className="h-10" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">Email</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.org" required className="h-10" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">Password</label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required className="h-10" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-[hsl(171,100%,34%)] hover:bg-[hsl(171,100%,28%)] text-white font-bold rounded-lg text-[15px]"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</> : "Create Organization"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-[hsl(171,100%,34%)] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
