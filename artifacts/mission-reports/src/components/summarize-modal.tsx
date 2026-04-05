import { useState } from "react";
import { X, Sparkles, Copy, RefreshCw, Loader2, CheckCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Range = "7d" | "30d";

type SummaryResult = {
  summary: string | null;
  label: string;
  postCount: number;
};

async function fetchSummary(range: Range): Promise<SummaryResult> {
  const res = await fetch("/api/summarize", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ range }),
  });
  if (!res.ok) throw new Error("Failed to generate summary");
  return res.json();
}

export function SummarizeModal({ onClose }: { onClose: () => void }) {
  const [range, setRange] = useState<Range>("30d");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate(r: Range = range) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSummary(r);
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRangeChange(r: Range) {
    setRange(r);
    setResult(null);
    setError(null);
  }

  async function copyToClipboard() {
    if (!result?.summary) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const bullets = result?.summary
    ? result.summary
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }}
        >
          <div className="p-2 bg-white/15 rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-extrabold text-white tracking-tight">Summarize Activity</h2>
            <p className="text-white/60 text-[12px] mt-0.5">AI-generated summary of your team's field updates</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 pt-5 pb-4 border-b border-border/60">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Time Period</p>
          <div className="flex gap-2">
            {(["7d", "30d"] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-[13px] font-semibold border transition-all",
                  range === r
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-foreground border-border/60 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                {r === "7d" ? "Last 7 Days" : "Last 30 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {!result && !loading && !error && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <p className="text-[14px] font-semibold text-foreground">Ready to summarize</p>
              <p className="text-muted-foreground text-[13px] mt-1">
                Generate a concise AI summary of your team's recent field updates.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-foreground">Generating summary…</p>
              <p className="text-muted-foreground text-[12px] mt-1">Reading your team's posts</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && !loading && (
            <>
              {result.postCount === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-[14px] font-semibold text-foreground">No posts found</p>
                  <p className="text-muted-foreground text-[13px] mt-1">
                    No team updates were posted during this period.
                  </p>
                </div>
              ) : (
                <div className="bg-[#F7F9FF] border border-primary/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">
                      Summary — {result.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground bg-white border border-border/60 px-2 py-0.5 rounded-full">
                      {result.postCount} post{result.postCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {bullets.map((line, i) => (
                      <p key={i} className="text-[13.5px] text-foreground leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/60 flex items-center gap-2">
          {result && !loading && result.postCount > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-1.5 text-[13px]"
              >
                {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generate()}
                disabled={loading}
                className="gap-1.5 text-[13px]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            </>
          )}
          <div className="flex-1" />
          <Button
            onClick={() => generate()}
            disabled={loading}
            className="gap-2 text-[13px] font-semibold"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> {result ? "Regenerate" : "Generate Summary"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
