import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { Redirect, Link } from "wouter";
import {
  useGetStats, getGetStatsQueryKey,
  useListUsers, getListUsersQueryKey,
  useGetTimeline, getGetTimelineQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users, FileText, ThumbsUp, MessageCircle,
  Globe, Plus, X, Trash2,
  ChevronDown, Eye, EyeOff, Check, UserPlus, Mail, KeyRound, Copy, RefreshCw,
  ShieldCheck, Pencil, Settings2, Save, Loader2,
  BarChart3, Star, UserCog, BookOpen, MapPin, ImageIcon,
  Rss,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PostCard, type PostData } from "@/components/post-card";
import { format } from "date-fns";
// ─── helpers ───────────────────────────────────────────────────────────────

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...((options as any).headers ?? {}) },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}

// ─── Org Permissions ───────────────────────────────────────────────────────

type OrgPermissions = {
  canSubmitReports: boolean;
  canViewAllReports: boolean;
  canHighlightReports: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
};

const ORG_DEFAULT_PERMS: OrgPermissions = {
  canSubmitReports: true,
  canViewAllReports: false,
  canHighlightReports: false,
  canManageTeam: false,
  canViewAnalytics: false,
};

const ORG_ADMIN_PERMS: OrgPermissions = {
  canSubmitReports: true,
  canViewAllReports: true,
  canHighlightReports: true,
  canManageTeam: true,
  canViewAnalytics: true,
};

const ORG_PERM_META: { key: keyof OrgPermissions; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "canSubmitReports",    label: "Submit Reports",      desc: "Post mission reports to the feed",       icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: "canViewAllReports",   label: "View All Reports",    desc: "See reports from all team members",      icon: <Eye className="h-3.5 w-3.5" /> },
  { key: "canHighlightReports", label: "Highlight Reports",   desc: "Star / feature important updates",       icon: <Star className="h-3.5 w-3.5" /> },
  { key: "canManageTeam",       label: "Manage Team",         desc: "Add, edit and remove team members",      icon: <UserCog className="h-3.5 w-3.5" /> },
  { key: "canViewAnalytics",    label: "View Analytics",      desc: "Access stats and activity dashboards",   icon: <BarChart3 className="h-3.5 w-3.5" /> },
];

function parseOrgPerms(raw: string | null | undefined): OrgPermissions {
  if (!raw) return { ...ORG_DEFAULT_PERMS };
  try { return { ...ORG_DEFAULT_PERMS, ...JSON.parse(raw) }; } catch { return { ...ORG_DEFAULT_PERMS }; }
}

function OrgPermissionsEditor({
  perms,
  onChange,
  disabled,
}: {
  perms: OrgPermissions;
  onChange: (p: OrgPermissions) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {ORG_PERM_META.map(({ key, label, desc, icon }) => (
        <label
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: perms[key] ? "1.5px solid #C4B5FD" : "1.5px solid #E9E9E9",
            background: perms[key] ? "#FEFBFF" : "#F9FAFB",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            transition: "all 0.15s",
          }}
        >
          <div style={{ flexShrink: 0, color: perms[key] ? "#1085FD" : "#64748B" }}>
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#2B2B2B", margin: 0 }}>{label}</p>
            <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>{desc}</p>
          </div>
          <input
            type="checkbox"
            checked={perms[key]}
            disabled={disabled}
            onChange={e => onChange({ ...perms, [key]: e.target.checked })}
            style={{ width: 16, height: 16, cursor: disabled ? "not-allowed" : "pointer", accentColor: "#1085FD" }}
          />
        </label>
      ))}
    </div>
  );
}

// ─── Edit Role & Permissions Modal ─────────────────────────────────────────

function EditRolePermissionsModal({
  user: targetUser,
  isSelf,
  onClose,
  onUpdated,
}: {
  user: any;
  isSelf: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [role, setRole] = useState<"admin" | "field_user">(targetUser.role === "admin" ? "admin" : "field_user");
  const [perms, setPerms] = useState<OrgPermissions>(
    targetUser.role === "admin" ? { ...ORG_ADMIN_PERMS } : parseOrgPerms(targetUser.permissions)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = role === "admin";

  function handleRoleChange(newRole: "admin" | "field_user") {
    setRole(newRole);
    if (newRole === "admin") setPerms({ ...ORG_ADMIN_PERMS });
    else setPerms(parseOrgPerms(targetUser.permissions));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/admin/users/${targetUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          role,
          permissions: isAdmin ? null : perms,
        }),
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <Settings2 className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h2 className="font-bold text-[15px] text-foreground">Role & Permissions</h2>
              <p className="text-[11px] text-muted-foreground">{targetUser.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 text-[13px] px-3 py-2 rounded-lg">{error}</div>
          )}

          {/* Role switcher */}
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-2">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(["field_user", "admin"] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  disabled={isSelf && r !== "admin"}
                  onClick={() => handleRoleChange(r)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={role === r
                    ? { background: "#1085FD", color: "#fff", borderColor: "#1085FD", boxShadow: "0 1px 3px rgba(0,89,214,0.2)" }
                    : { background: "#fff", color: undefined, borderColor: undefined }
                  }
                >
                  {r === "admin"
                    ? <><ShieldCheck className="h-4 w-4 flex-shrink-0" /> Admin</>
                    : <><Globe className="h-4 w-4 flex-shrink-0" /> Field User</>
                  }
                </button>
              ))}
            </div>
            {isSelf && (
              <p className="text-[11px] text-gray-600 mt-1.5">You cannot change your own role.</p>
            )}
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-semibold text-foreground">Permissions</label>
              {isAdmin && (
                <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  All permissions granted (Admin)
                </span>
              )}
            </div>
            <OrgPermissionsEditor perms={perms} onChange={setPerms} disabled={isAdmin} />
          </div>

          <div className="flex gap-3 border-t border-border/40 pt-4 mt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-11 px-4 text-[13px] font-semibold border border-border/60 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 h-11 flex items-center justify-center gap-2 px-4 text-[13px] font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ background: "#374151" }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#000000"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#374151"; }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent, onClick }: {
  label: string; value: number | string; icon: React.ReactNode; accent?: string; onClick?: () => void;
}) {
  const isClickable = Boolean(onClick);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const transform = isClickable
    ? pressed ? "translateY(0px)" : hovered ? "translateY(-4px)" : "translateY(0px)"
    : undefined;
  const shadow = isClickable && hovered && !pressed
    ? "0 8px 24px rgba(0,0,0,0.10)"
    : undefined;

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); } : undefined}
      onMouseEnter={() => isClickable && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => isClickable && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        transform,
        border: "1px solid #E9E9E9",
        boxShadow: shadow ?? "0 4px 16px rgba(0,0,0,0.07)",
        transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
        cursor: isClickable ? "pointer" : undefined,
      }}
      className={[
        "bg-white rounded-2xl p-5 flex items-center gap-4",
        isClickable ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" : "",
      ].join(" ")}
    >
      <div className={`p-3 rounded-xl flex-shrink-0 ${accent ?? "bg-primary/10 text-primary"}`}>{icon}</div>
      <div>
        <p className="text-[28px] font-extrabold leading-none" style={{ color: "#2B2B2B" }}>{value}</p>
        <p className="text-[13px] mt-1 font-medium" style={{ color: "#9CA3AF" }}>{label}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F5F5F5", color: "#2B2B2B", border: "1px solid #C7D2FE" }}>
      <ShieldCheck className="h-3 w-3" /> Admin
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F5F5F5", color: "#2B2B2B", border: "1px solid #D1D5DB" }}>
      <Globe className="h-3 w-3" /> Field User
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#ECFDF5", color: "#374151", border: "1px solid #A7F3D0" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> Inactive
    </span>
  );
}

// ─── Add User Modal ────────────────────────────────────────────────────────

function AddUserModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"field_user" | "admin">("field_user");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function generatePassword() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    setPassword(Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
    setShowPw(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-bold text-[15px] text-foreground">Add Team Member</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 text-[13px] px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Full name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Maria Santos"
              className="w-full text-sm border border-border/60 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="maria@example.org"
              className="w-full text-sm border border-border/60 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                required
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full text-sm border border-border/60 rounded-lg px-3 py-2 pr-20 outline-none focus:ring-2 focus:ring-primary/30 transition font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground"
                  title={showPw ? "Hide" : "Show"}
                >
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-[11px] font-semibold text-primary hover:underline whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={e => setRole(e.target.value as "field_user" | "admin")}
                className="w-full text-sm border border-border/60 rounded-lg px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-primary/30 appearance-none bg-background transition"
              >
                <option value="field_user">Field User (Missionary)</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-1 border-t border-border/40 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 h-11 text-sm font-semibold border border-border/60 rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 px-4 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition-colors"
              style={{ background: "#374151" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#000000"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#374151"; }}
            >
              {loading ? "Creating…" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Manage Password Modal ─────────────────────────────────────────────────

function ManagePasswordModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [setPwBusy, setSetPwBusy] = useState(false);
  const [setPwDone, setSetPwDone] = useState(false);
  const [setPwError, setSetPwError] = useState<string | null>(null);

  const [genBusy, setGenBusy] = useState(false);
  const [genResult, setGenResult] = useState<{ tempPassword: string; via: "email" | "shown" } | null>(null);
  const [copied, setCopied] = useState(false);

  async function setPassword() {
    if (newPw.length < 8) { setSetPwError("Password must be at least 8 characters."); return; }
    setSetPwBusy(true); setSetPwError(null);
    try {
      await apiFetch(`/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ newPassword: newPw }),
      });
      setSetPwDone(true);
      setNewPw("");
      setTimeout(() => setSetPwDone(false), 3000);
    } catch (err: any) {
      setSetPwError(err.message ?? "Failed to set password.");
    } finally {
      setSetPwBusy(false);
    }
  }

  async function generatePassword(action: "email" | "generate") {
    setGenBusy(true); setGenResult(null);
    try {
      const data = await apiFetch(`/admin/users/${user.id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setGenResult({ tempPassword: data.tempPassword ?? "", via: action });
    } catch (err: any) {
      alert(err.message ?? "Failed to generate password.");
    } finally {
      setGenBusy(false);
    }
  }

  function copyPassword() {
    if (!genResult) return;
    navigator.clipboard.writeText(genResult.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ background: "#F5F5F5" }}>
              <KeyRound className="h-4 w-4" style={{ color: "#2B2B2B" }} />
            </div>
            <div>
              <p className="font-bold text-[14px]" style={{ color: "#2B2B2B" }}>Manage Password</p>
              <p className="text-[12px]" style={{ color: "#9CA3AF" }}>{user.name} · {user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Section 1 — Set specific password */}
          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "#6B7280" }}>Set a specific password</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPw}
                  onChange={e => { setNewPw(e.target.value); setSetPwError(null); }}
                  placeholder="New password (min 8 chars)"
                  className="w-full h-10 px-3 pr-10 text-[13px] border border-border/60 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <button
                onClick={setPassword}
                disabled={setPwBusy || newPw.length < 1}
                className="h-10 px-4 text-[13px] font-semibold text-white rounded-xl disabled:opacity-50 transition-colors flex items-center gap-1.5"
                style={{ background: setPwDone ? "#374151" : "#1085FD" }}
              >
                {setPwBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : setPwDone ? <><Check className="h-3.5 w-3.5" /> Saved</> : "Set Password"}
              </button>
            </div>
            {setPwError && <p className="text-[12px] text-gray-600">{setPwError}</p>}
          </div>

          <div className="border-t border-border/40" />

          {/* Section 2 — Generate temp password */}
          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "#6B7280" }}>Generate temporary password</p>
            <div className="flex gap-2">
              <button
                onClick={() => generatePassword("email")}
                disabled={genBusy}
                className="flex-1 h-10 flex items-center justify-center gap-1.5 text-[13px] font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                style={{ color: "#374151" }}
              >
                {genBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                Generate &amp; Email
              </button>
              <button
                onClick={() => generatePassword("generate")}
                disabled={genBusy}
                className="flex-1 h-10 flex items-center justify-center gap-1.5 text-[13px] font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                style={{ color: "#374151" }}
              >
                {genBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Generate &amp; Show
              </button>
            </div>

            {genResult && (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                {genResult.via === "email" ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
                    <Check className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <p className="text-[13px] text-gray-800 font-medium">Temporary password sent to <strong>{user.email}</strong></p>
                  </div>
                ) : (
                  <div className="px-4 py-3" style={{ background: "#F8FAFD" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "#9CA3AF" }}>Temporary Password — share with user</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[18px] font-bold tracking-widest" style={{ color: "#2B2B2B", fontFamily: "monospace" }}>
                        {genResult.tempPassword}
                      </code>
                      <button
                        onClick={copyPassword}
                        className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold rounded-lg border border-border/60 hover:bg-muted transition-colors"
                        style={{ color: copied ? "#374151" : "#374151" }}
                      >
                        {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                      </button>
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: "#9CA3AF" }}>This is now the user's active password. Ask them to change it after signing in.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/40 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-[13px] font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────

function DeleteConfirmModal({ userName, role, onConfirm, onClose, loading, error }: {
  userName: string; role?: string; onConfirm: () => void; onClose: () => void; loading: boolean; error?: string | null;
}) {
  const isAdmin = role === "admin";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-border/60 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-xl"><Trash2 className="h-5 w-5 text-gray-500" /></div>
          <div>
            <h2 className="font-bold text-[15px]">Remove team member?</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">This will permanently remove <strong>{userName}</strong>.</p>
          </div>
        </div>
        {isAdmin && !error && (
          <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 text-gray-800 text-[12px] rounded-xl px-3 py-2.5">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-600" />
            <span>This user is an <strong>Admin</strong>. Removal will be blocked if they are the only administrator in this organization.</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 text-gray-700 text-[12px] rounded-xl px-3 py-2.5">
            <Trash2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading || !!error}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-60 transition"
          >
            {loading ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Team Table Row ────────────────────────────────────────────────────────

function TeamRow({ u, currentUserId, onUpdated, onDeleted }: { u: any; currentUserId: number; onUpdated: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showEditPerms, setShowEditPerms] = useState(false);
  const [showManagePassword, setShowManagePassword] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(u.bio ?? "");
  const isSelf = u.id === currentUserId;

  async function toggleStatus() {
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: u.status === "active" ? "inactive" : "active" }),
      });
      onUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser() {
    setBusy(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(data?.error ?? `Request failed (${res.status})`);
        return;
      }
      setShowDeleteModal(false);
      onDeleted();
    } catch (err: any) {
      setDeleteError(err.message ?? "An unexpected error occurred");
    } finally {
      setBusy(false);
    }
  }

  async function saveBio() {
    setBusy(true);
    try {
      await apiFetch(`/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ bio: bioText.trim() || null }),
      });
      setEditingBio(false);
      onUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          userName={u.name}
          role={u.role}
          onConfirm={deleteUser}
          onClose={() => { setShowDeleteModal(false); setDeleteError(null); }}
          loading={busy}
          error={deleteError}
        />
      )}
      {showEditPerms && (
        <EditRolePermissionsModal
          user={u}
          isSelf={isSelf}
          onClose={() => setShowEditPerms(false)}
          onUpdated={() => { setShowEditPerms(false); onUpdated(); }}
        />
      )}
      {showManagePassword && (
        <ManagePasswordModal user={u} onClose={() => setShowManagePassword(false)} />
      )}
      <tr className="border-b transition-colors" style={{ borderColor: "#F1F5F9" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FAFBFD"} onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
        {/* User */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 rounded-xl">
              <AvatarImage src={u.avatarUrl ?? undefined} />
              <AvatarFallback className="font-bold text-[14px] rounded-xl" style={u.role === "admin" ? { background: "#F5F5F5", color: "#2B2B2B" } : { background: "#F5F5F5", color: "#2B2B2B" }}>
                {u.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-tight" style={{ color: "#2B2B2B" }}>{u.name}</p>
              <p className="text-[13px] mt-0.5" style={{ color: "#9CA3AF" }}>{u.email}</p>
              {editingBio ? (
                <div className="mt-1.5 space-y-1.5">
                  <textarea
                    value={bioText}
                    onChange={e => setBioText(e.target.value.slice(0, 250))}
                    rows={2}
                    maxLength={250}
                    autoFocus
                    placeholder="Short summary (max 250 chars)"
                    className="w-full text-[12px] border border-border/60 rounded-lg px-2 py-1.5 resize-none outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    disabled={busy}
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={saveBio}
                      disabled={busy}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-60 transition"
                    >
                      <Check className="h-3 w-3" /> Save
                    </button>
                    <button
                      onClick={() => { setEditingBio(false); setBioText(u.bio ?? ""); }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground border border-border/60 rounded-lg hover:bg-muted transition"
                    >
                      Cancel
                    </button>
                    <span className="text-[10px] text-muted-foreground ml-auto">{bioText.length}/250</span>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex items-start gap-1.5 group/bio">
                  {u.bio ? (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed flex-1">{u.bio}</p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/50 italic flex-1">No summary</p>
                  )}
                  <button
                    onClick={() => setEditingBio(true)}
                    title="Edit summary"
                    className="opacity-0 group-hover/bio:opacity-100 transition-opacity p-0.5 hover:text-primary text-muted-foreground flex-shrink-0"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </td>
        {/* Role */}
        <td className="px-5 py-4 hidden sm:table-cell">
          <RoleBadge role={u.role} />
        </td>
        {/* Status */}
        <td className="px-5 py-4 hidden md:table-cell">
          <StatusBadge status={u.status} />
        </td>
        {/* Joined */}
        <td className="px-5 py-4 hidden sm:table-cell" style={{ whiteSpace: "nowrap" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: "#1085FD",
              color: "#ffffff",
              borderRadius: 999,
              padding: "3px 10px",
              display: "inline-block",
              lineHeight: 1.6,
            }}
          >
            {format(new Date(u.createdAt), "MMM d, yyyy")}
          </span>
        </td>
        {/* Actions */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-1 justify-end">
            {/* Edit role & permissions */}
            <button
              title="Edit role & permissions"
              onClick={() => setShowEditPerms(true)}
              disabled={busy}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#6B7280" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#2B2B2B"; }}
              onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#6B7280"; }}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
            {/* Toggle status */}
            <button
              title={u.status === "active" ? "Deactivate" : "Activate"}
              onClick={toggleStatus}
              disabled={busy}
              className="p-2 rounded-lg transition-colors"
              style={{ color: u.status === "active" ? "#D97706" : "#10B981" }}
              onMouseEnter={e => { e.currentTarget.style.background = u.status === "active" ? "#FFFBEB" : "#ECFDF5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = ""; }}
            >
              {u.status === "active" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {/* Manage password */}
            <button
              title="Manage password"
              onClick={() => setShowManagePassword(true)}
              disabled={busy}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#6B7280" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F5F5F5"; e.currentTarget.style.color = "#2B2B2B"; }}
              onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#6B7280"; }}
            >
              <KeyRound className="h-4 w-4" />
            </button>
            {/* Delete */}
            {!isSelf && (
              <button
                title="Remove member"
                onClick={() => setShowDeleteModal(true)}
                disabled={busy}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "#6B7280" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.color = "#374151"; }}
                onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#6B7280"; }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

// ─── Mobile Team Card ──────────────────────────────────────────────────────

function MobileTeamCard({ u, currentUserId, onUpdated, onDeleted }: { u: any; currentUserId: number; onUpdated: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showEditPerms, setShowEditPerms] = useState(false);
  const [showManagePassword, setShowManagePassword] = useState(false);
  const isSelf = u.id === currentUserId;

  async function toggleStatus() {
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: u.status === "active" ? "inactive" : "active" }),
      });
      onUpdated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser() {
    setBusy(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(data?.error ?? `Request failed (${res.status})`);
        return;
      }
      setShowDeleteModal(false);
      onDeleted();
    } catch (err: any) {
      setDeleteError(err.message ?? "An unexpected error occurred");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          userName={u.name}
          role={u.role}
          onConfirm={deleteUser}
          onClose={() => { setShowDeleteModal(false); setDeleteError(null); }}
          loading={busy}
          error={deleteError}
        />
      )}
      {showEditPerms && (
        <EditRolePermissionsModal
          user={u}
          isSelf={isSelf}
          onClose={() => setShowEditPerms(false)}
          onUpdated={() => { setShowEditPerms(false); onUpdated(); }}
        />
      )}
      {showManagePassword && (
        <ManagePasswordModal user={u} onClose={() => setShowManagePassword(false)} />
      )}

      <div className="px-4 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
        {/* Top: avatar + name/email */}
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 flex-shrink-0 rounded-xl">
            <AvatarImage src={u.avatarUrl ?? undefined} />
            <AvatarFallback className="font-bold text-[14px] rounded-xl" style={{ background: "#F5F5F5", color: "#2B2B2B" }}>
              {u.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-tight" style={{ color: "#2B2B2B" }}>{u.name}</p>
            <p className="text-[13px] mt-0.5 truncate" style={{ color: "#9CA3AF" }}>{u.email}</p>
          </div>
        </div>

        {/* Meta: role + status + joined */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RoleBadge role={u.role} />
          <StatusBadge status={u.status} />
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>
            Joined {format(new Date(u.createdAt), "MMM d, yyyy")}
          </span>
        </div>

        {/* Bio */}
        {u.bio && (
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "#6B7280" }}>{u.bio}</p>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowEditPerms(true)}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
            style={{ background: "#F3F4F6", color: "#374151" }}
          >
            <Settings2 className="h-3.5 w-3.5" /> Edit Role
          </button>
          <button
            onClick={toggleStatus}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
            style={{ background: u.status === "active" ? "#FFFBEB" : "#ECFDF5", color: u.status === "active" ? "#D97706" : "#10B981" }}
          >
            {u.status === "active" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {u.status === "active" ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={() => setShowManagePassword(true)}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
            style={{ background: "#F3F4F6", color: "#374151" }}
          >
            <KeyRound className="h-3.5 w-3.5" /> Password
          </button>
          {!isSelf && (
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ background: "#FEF2F2", color: "#EF4444" }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseLocation(loc: string): { city: string; country: string } {
  const parts = loc.split(",").map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { country: parts[parts.length - 1], city: parts.slice(0, parts.length - 1).join(", ") };
  }
  return { country: loc.trim(), city: "" };
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"team" | "feed" | "countries">("feed");
  const [feedMomentFilter, setFeedMomentFilter] = useState<"all" | "moments">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedPosts, setFeedPosts] = useState<PostData[] | null>(null);
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useGetStats({ query: { queryKey: getGetStatsQueryKey(), staleTime: 5 * 60 * 1000 } });
  const { data: users, isLoading: usersLoading } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}), staleTime: 2 * 60 * 1000 } });
  const { data: timelineData, isLoading: feedLoading } = useGetTimeline(
    { limit: 50 },
    {
      query: {
        enabled: activeTab === "feed",
        queryKey: getGetTimelineQueryKey({ limit: 50 }),
        staleTime: 3 * 60 * 1000,
      },
    }
  );

  useEffect(() => {
    if (feedPosts === null && timelineData?.reports) {
      setFeedPosts(timelineData.reports as PostData[]);
    }
  }, [timelineData, feedPosts]);

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "admin") return <Redirect href="/" />;

  function refreshUsers() {
    queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
  }

  const allUsers: any[] = users ?? [];
  const nonAdmins = allUsers.filter((u: any) => u.role !== "admin");
  const filteredTeam = searchQuery.trim()
    ? allUsers.filter((u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allUsers;

  const rawFeedPosts: PostData[] = feedPosts ?? (timelineData?.reports ?? []) as PostData[];
  const allFeedPosts = rawFeedPosts.filter(post => {
    if (filterUserId && String(post.author.id) !== filterUserId) return false;
    return true;
  });
  const hasFilters = !!filterUserId;
  const missionMomentsCount = allFeedPosts.filter(p => p.isMissionMoment).length;

  // Countries tab data — group field users by country parsed from their location
  const fieldUsersWithLocation = allUsers.filter((u: any) => u.role !== "admin" && u.location?.trim());
  const countriesMap = new Map<string, { city: string; members: any[] }>();
  for (const u of fieldUsersWithLocation) {
    const { city, country } = parseLocation(u.location);
    if (!countriesMap.has(country)) countriesMap.set(country, { city, members: [] });
    countriesMap.get(country)!.members.push(u);
  }
  const countriesList = Array.from(countriesMap.entries())
    .map(([country, { city, members }]) => ({ country, city, members }))
    .sort((a, b) => a.country.localeCompare(b.country));
  const countriesCount = countriesList.length;
  const displayedFeedPosts = feedMomentFilter === "moments"
    ? allFeedPosts.filter(p => p.isMissionMoment)
    : allFeedPosts;
  const firstName = user.name.split(" ")[0];

  return (
    <>
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdded={refreshUsers}
        />
      )}

      {/* ── Mobile top bar — hidden on md+ ── */}
      <div className="md:hidden" style={{ background: "#fff", borderBottom: "1px solid #e8eaed", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: "#111", letterSpacing: "-0.03em", margin: 0 }}>Missions Feed</p>
            <p style={{ fontSize: 12, color: "#8899A6", margin: "2px 0 0" }}>{user.organization ?? "Admin"}</p>
          </div>
          <Link href="/submit" style={{ textDecoration: "none" }}>
            <div role="button" style={{ background: "#1085FD", color: "#fff", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <FileText style={{ width: 14, height: 14 }} /> Reports
            </div>
          </Link>
        </div>
        <div style={{ display: "flex", gap: 2, overflowX: "auto", padding: "0 12px" }}>
          {([
            { id: "feed" as const, label: "Updates", Icon: Rss },
            { id: "team" as const, label: "Members", Icon: Users },
          ]).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                  padding: "8px 12px", border: "none",
                  borderBottom: active ? "2px solid #1085FD" : "2px solid transparent",
                  background: "transparent", color: active ? "#1085FD" : "#6B7280",
                  fontSize: 14, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <Icon strokeWidth={active ? 2.2 : 1.8} style={{ width: 16, height: 16 }} />
                {label}
                {id === "team" && !usersLoading && (
                  <span style={{ fontSize: 10, fontWeight: 600, background: active ? "#EEF4FF" : "#f1f3f5", color: active ? "#1085FD" : "#64748B", borderRadius: 999, padding: "1px 6px" }}>
                    {allUsers.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-[600px] mx-auto w-full" style={{ maxWidth: 1140, background: "#fff" }}>

        {/* ── Sidebar — hidden on mobile ── */}
        <aside className="hidden md:flex flex-col" style={{
          width: 260, flexShrink: 0,
          background: "#fff",
          padding: "28px 12px 20px",
          borderRight: "1px solid #e8eaed",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>

          {/* Brand header */}
          <div style={{ marginBottom: 32, padding: "0 10px" }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.25 }}>
              Missions Feed
            </p>
            <p style={{ fontSize: 13, color: "#8899A6", margin: "3px 0 0" }}>
              {user.organization ?? "Admin"}
            </p>
          </div>

          {/* Nav items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            {([
              { id: "feed"     as const, label: "Updates",         Icon: Rss },
              { id: "team"     as const, label: "User Management", Icon: Users },
            ]).map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", textAlign: "left",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: active ? "#EEF4FF" : "transparent",
                    color: "#111",
                    fontSize: 16,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "background 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f1f3f5"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Icon strokeWidth={active ? 2.2 : 1.8} style={{ width: 22, height: 22, flexShrink: 0 }} />
                  {label}
                  {id === "team" && !usersLoading && (
                    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, background: "#f1f3f5", color: "#64748B", borderRadius: 999, padding: "1px 7px" }}>
                      {allUsers.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* New Post button */}
          <Link href="/submit" style={{ textDecoration: "none", marginBottom: 20 }}>
            <div
              role="button"
              style={{
                width: "100%", height: 44,
                borderRadius: 999,
                background: "#1085FD",
                color: "#fff",
                fontSize: 15, fontWeight: 700,
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1085FD"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1085FD"; }}
            >
              <FileText style={{ width: 16, height: 16 }} />
              View Reports
            </div>
          </Link>

          {/* User chip */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#1085FD", flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</p>
              <p style={{ fontSize: 11.5, color: "#8899A6", margin: 0 }}>{user.role}</p>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0, background: "#fff" }} className="space-y-4 p-4 md:p-7 md:pl-3.5">

        {/* ── Tab: Team ── */}
        {activeTab === "team" && (
          <div className="space-y-4">
            {/* Toolbar — label left, controls right */}
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 0 }}>
              <div className="flex items-center" style={{ paddingBottom: 12, paddingTop: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2B2B2B" }}>
                  Team Members
                </span>
                {!usersLoading && (
                  <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, background: "#F1F5F9", color: "#64748B", borderRadius: 999, padding: "1px 8px" }}>
                    {allUsers.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pb-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="text-[13px] border rounded-lg px-3 h-8 bg-white outline-none transition-all"
                  style={{ borderColor: searchQuery ? "#000000" : "#E5E7EB", minWidth: 200 }}
                  onFocus={e => { e.target.style.borderColor = "#1085FD"; e.target.style.boxShadow = "0 0 0 2px rgba(0,89,214,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = searchQuery ? "#000000" : "#E5E7EB"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-4 text-[13px] font-semibold text-white rounded-lg whitespace-nowrap transition-all duration-200 hover:-translate-y-px"
                  style={{ backgroundColor: "#374151", height: "32px", boxShadow: "0 2px 8px rgba(5,150,105,0.20)" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#000000"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#374151"; }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Member
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
              {usersLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-2.5 w-48" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredTeam.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="font-semibold text-sm text-foreground">
                    {searchQuery ? "No members match your search" : "No team members yet"}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {searchQuery ? "Try a different name or email." : 'Click "Add Team Member" to get started.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile card list — visible only below sm */}
                  <div className="sm:hidden">
                    {filteredTeam.map((u: any) => (
                      <MobileTeamCard
                        key={u.id}
                        u={u}
                        currentUserId={user.id}
                        onUpdated={refreshUsers}
                        onDeleted={refreshUsers}
                      />
                    ))}
                  </div>

                  {/* Desktop table — hidden below sm */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "#F1F5F9" }}>
                          <th className="px-5 py-4 text-left" style={{ color: "#64748B", fontWeight: 700, letterSpacing: "0.05em", fontSize: 11, textTransform: "uppercase" }}>Member</th>
                          <th className="px-5 py-4 text-left hidden sm:table-cell" style={{ color: "#64748B", fontWeight: 700, letterSpacing: "0.05em", fontSize: 11, textTransform: "uppercase" }}>Role</th>
                          <th className="px-5 py-4 text-left hidden md:table-cell" style={{ color: "#64748B", fontWeight: 700, letterSpacing: "0.05em", fontSize: 11, textTransform: "uppercase" }}>Status</th>
                          <th className="px-5 py-4 text-left hidden sm:table-cell" style={{ color: "#1085FD", fontWeight: 700, letterSpacing: "0.05em", fontSize: 11, textTransform: "uppercase" }}>Joined</th>
                          <th className="px-5 py-4 text-right" style={{ color: "#64748B", fontWeight: 700, letterSpacing: "0.05em", fontSize: 11, textTransform: "uppercase" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeam.map((u: any) => (
                          <TeamRow
                            key={u.id}
                            u={u}
                            currentUserId={user.id}
                            onUpdated={refreshUsers}
                            onDeleted={refreshUsers}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {!usersLoading && filteredTeam.length > 0 && (
              <p className="text-[12px] text-muted-foreground text-right">
                {filteredTeam.length} member{filteredTeam.length !== 1 ? "s" : ""}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            )}
          </div>
        )}

        {/* ── Tab: Activity Feed ── */}
        {activeTab === "feed" && (
          <div className="max-w-[700px] mx-auto space-y-4">

            {/* ── Sub-tabs + Filters on one row ── */}
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 0 }}>
              {/* Sub-tabs */}
              <div className="flex items-center gap-0">
                {[
                  { id: "all", label: "All Posts", count: !feedLoading ? allFeedPosts.length : null },
                ].map(tab => {
                  const active = feedMomentFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFeedMomentFilter(tab.id as any)}
                      className="transition-all duration-150 flex-shrink-0"
                      style={{
                        paddingBottom: 16,
                        paddingTop: 16,
                        paddingLeft: 6,
                        paddingRight: 6,
                        marginRight: 28,
                        marginBottom: -2,
                        fontSize: 16,
                        fontWeight: active ? 800 : 500,
                        color: active ? "#1085FD" : "#64748B",
                        border: "none",
                        borderBottom: active ? "2.5px solid #1085FD" : "2.5px solid transparent",
                        background: "transparent",
                        cursor: "pointer",
                        letterSpacing: active ? "-0.02em" : "normal",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tab.label}
                      {tab.count != null && (
                        <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 700, background: active ? "#EFF6FF" : "#F8FAFC", color: active ? "#1085FD" : "#64748B", borderRadius: 999, padding: "2px 10px" }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filter — member only */}
              <div className="flex items-center gap-2 pb-2">
                <select
                  value={filterUserId}
                  onChange={e => setFilterUserId(e.target.value)}
                  className="border rounded-xl px-3 bg-white outline-none transition-all"
                  style={{ fontSize: 16, fontWeight: filterUserId ? 700 : 500, height: 44, borderColor: filterUserId ? "#1085FD" : "#E5E7EB", color: filterUserId ? "#1085FD" : "#64748B", minWidth: 160 }}
                >
                  <option value="">All members</option>
                  {nonAdmins.map((u: any) => (
                    <option key={u.id} value={String(u.id)}>{u.name}</option>
                  ))}
                </select>
                {hasFilters && (
                  <button
                    onClick={() => setFilterUserId("")}
                    className="text-[12px] font-semibold text-violet-500 hover:text-violet-700 transition-colors whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {feedLoading ? (
              <div className="overflow-hidden" style={{ borderTop: "1px solid #E5E7EB" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-5 space-y-3" style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    {i === 1 && <Skeleton className="h-48 w-full rounded-lg" />}
                  </div>
                ))}
              </div>
            ) : displayedFeedPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
                {feedMomentFilter === "moments" ? (
                  <>
                    <Star className="h-10 w-10 mx-auto text-gray-300/50 mb-3" />
                    <p className="font-semibold text-sm text-foreground">No Mission Moments yet</p>
                    <p className="text-muted-foreground text-xs mt-1">Team members can mark posts as Mission Moments when sharing updates.</p>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                    <p className="font-semibold text-sm text-foreground">{hasFilters ? "No posts match your filters" : "No posts yet"}</p>
                    <p className="text-muted-foreground text-xs mt-1">{hasFilters ? "Try adjusting your filters above." : "Team updates will appear here once posted."}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-hidden" style={{ borderTop: "1px solid #E5E7EB" }}>
                {displayedFeedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    hideViewPost
                    onDelete={(id) => setFeedPosts(prev => prev ? prev.filter(p => p.id !== id) : null)}
                    flat
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Countries ── */}
        {activeTab === "countries" && (
          <div className="space-y-4">
            {/* Toolbar — label left, count right */}
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 0 }}>
              <div className="flex items-center" style={{ paddingBottom: 12, paddingTop: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2B2B2B" }}>
                  Team Locations
                </span>
                {!usersLoading && countriesCount > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, background: "#F1F5F9", color: "#64748B", borderRadius: 999, padding: "1px 8px" }}>
                    {countriesCount} {countriesCount === 1 ? "country" : "countries"}
                  </span>
                )}
              </div>
              {!usersLoading && countriesList.length > 0 && (
                <div className="pb-2">
                  <span style={{ fontSize: 12, color: "#64748B" }}>
                    {countriesList.reduce((n: number, c: any) => n + c.members.length, 0)} missionaries deployed
                  </span>
                </div>
              )}
            </div>

            {usersLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                    <div className="space-y-2 pt-1">
                      <Skeleton className="h-10 w-full rounded-xl" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : countriesList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-border py-20 text-center shadow-sm">
                <MapPin className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="font-semibold text-sm text-foreground">No locations recorded yet</p>
                <p className="text-muted-foreground text-xs mt-1">Team members with a location set on their profile will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {countriesList.map(({ country, city, members }) => (
                  <div key={country} className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    {/* Country header */}
                    <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0" style={{ background: "#F5F5F5" }}>
                        <MapPin className="h-4 w-4" style={{ color: "#2B2B2B" }} />
                      </div>
                      <div>
                        <p className="font-bold text-[15px] text-foreground">{country}</p>
                        {city && <p className="text-[12px] text-muted-foreground mt-0.5">{city}</p>}
                      </div>
                      <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F5F5F5", color: "#2B2B2B" }}>
                        {members.length} {members.length === 1 ? "member" : "members"}
                      </span>
                    </div>

                    {/* Members list */}
                    <div className="divide-y divide-border/30">
                      {members.map((m: any) => {
                        const initials = m.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                        return (
                          <div key={m.id} className="px-5 py-3.5 flex items-start gap-3">
                            <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
                              <AvatarImage src={m.avatarUrl ?? undefined} alt={m.name} className="object-cover" />
                              <AvatarFallback className="text-[13px] font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[13px] text-foreground leading-snug">{m.name}</p>
                              {m.bio ? (
                                <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{m.bio}</p>
                              ) : (
                                <p className="text-[12px] italic text-muted-foreground/60 mt-0.5">No description added yet</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        </div>
      </div>

    </>
  );
}

