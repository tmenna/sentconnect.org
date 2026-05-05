import { useState, useEffect } from "react";
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
  Globe, Plus, X, RefreshCw, Trash2,
  ChevronDown, Eye, EyeOff, Check, Copy, UserPlus,
  ShieldCheck, Pencil, Settings2, Save, Loader2,
  BarChart3, Star, UserCog, BookOpen, MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { type PostData } from "@/components/post-card";
import { FeedGridCard, PostDetailModal } from "@/components/feed-grid";
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
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
            perms[key]
              ? "bg-blue-50/50 border-blue-200"
              : "bg-muted/20 border-border/40 hover:bg-muted/40"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className={`flex-shrink-0 ${perms[key] ? "text-primary" : "text-muted-foreground"}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">{desc}</p>
          </div>
          <input
            type="checkbox"
            checked={perms[key]}
            disabled={disabled}
            onChange={e => onChange({ ...perms, [key]: e.target.checked })}
            className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
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
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-lg">{error}</div>
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
                    ? { background: "#8705FA", color: "#fff", borderColor: "#8705FA", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
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
              <p className="text-[11px] text-amber-600 mt-1.5">You cannot change your own role.</p>
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
              style={{ background: "#059669" }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#047857"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#059669"; }}
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
        <p className="text-[28px] font-extrabold leading-none" style={{ color: "#111827" }}>{value}</p>
        <p className="text-[13px] mt-1 font-medium" style={{ color: "#9CA3AF" }}>{label}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F3E8FF", color: "#6B04C8", border: "1px solid #C7D2FE" }}>
      <ShieldCheck className="h-3 w-3" /> Admin
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F3E8FF", color: "#8705FA", border: "1px solid #D8B4FE" }}>
      <Globe className="h-3 w-3" /> Field User
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active
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
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2 rounded-lg">
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
              style={{ background: "#059669" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#047857"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#059669"; }}
            >
              {loading ? "Creating…" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Reset Link Modal ──────────────────────────────────────────────────────

function ResetLinkModal({ link, onClose }: { link: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const fullLink = `${window.location.origin}${link}`;
  function copy() {
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[15px]">Password Reset Link</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <p className="text-[13px] text-muted-foreground">Share this link with the team member. It expires in 24 hours.</p>
        <div className="bg-muted/60 rounded-xl px-3 py-2 text-[12px] font-mono break-all border border-border/40">{fullLink}</div>
        <div className="flex gap-3 border-t border-border/40 pt-4 mt-2">
          <button onClick={onClose} className="flex-1 h-11 px-4 text-sm font-semibold border border-border/60 rounded-lg hover:bg-muted transition-colors">Close</button>
          <button
            onClick={copy}
            className="flex-1 h-11 flex items-center justify-center gap-1.5 px-4 text-sm font-semibold text-white rounded-lg transition-colors"
            style={{ background: "#059669" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#047857"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#059669"; }}
          >
            {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy link</>}
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
          <div className="p-2 bg-red-50 rounded-xl"><Trash2 className="h-5 w-5 text-red-500" /></div>
          <div>
            <h2 className="font-bold text-[15px]">Remove team member?</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">This will permanently remove <strong>{userName}</strong>.</p>
          </div>
        </div>
        {isAdmin && !error && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-[12px] rounded-xl px-3 py-2.5">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>This user is an <strong>Admin</strong>. Removal will be blocked if they are the only administrator in this organization.</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl px-3 py-2.5">
            <Trash2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading || !!error}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-60 transition"
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
  const [resetLink, setResetLink] = useState<string | null>(null);
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

  async function generateResetLink() {
    setBusy(true);
    try {
      const data = await apiFetch(`/admin/users/${u.id}/reset-password`, { method: "POST" });
      setResetLink(data.resetLink);
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
      {resetLink && (
        <ResetLinkModal link={resetLink} onClose={() => setResetLink(null)} />
      )}
      {showEditPerms && (
        <EditRolePermissionsModal
          user={u}
          isSelf={isSelf}
          onClose={() => setShowEditPerms(false)}
          onUpdated={() => { setShowEditPerms(false); onUpdated(); }}
        />
      )}
      <tr className="border-b transition-colors" style={{ borderColor: "#F1F5F9" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FAFBFD"} onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
        {/* User */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 rounded-xl">
              <AvatarImage src={u.avatarUrl ?? undefined} />
              <AvatarFallback className="font-bold text-[14px] rounded-xl" style={u.role === "admin" ? { background: "#F3E8FF", color: "#6B04C8" } : { background: "#F3E8FF", color: "#8705FA" }}>
                {u.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-tight" style={{ color: "#111827" }}>{u.name}</p>
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
        <td className="px-5 py-4 hidden lg:table-cell">
          <span className="text-[13px]" style={{ color: "#9CA3AF" }}>
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
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
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
            {/* Reset password */}
            <button
              title="Generate reset link"
              onClick={generateResetLink}
              disabled={busy}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#6B7280" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
              onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#6B7280"; }}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {/* Delete */}
            {!isSelf && (
              <button
                title="Remove member"
                onClick={() => setShowDeleteModal(true)}
                disabled={busy}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "#6B7280" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#EF4444"; }}
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
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: users, isLoading: usersLoading } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });
  const { data: timelineData, isLoading: feedLoading } = useGetTimeline(
    { limit: 50 },
    {
      query: {
        enabled: activeTab === "feed",
        queryKey: getGetTimelineQueryKey({ limit: 50 }),
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
    if (filterDateFrom) {
      const from = new Date(filterDateFrom); from.setHours(0, 0, 0, 0);
      if (new Date(post.createdAt) < from) return false;
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo); to.setHours(23, 59, 59, 999);
      if (new Date(post.createdAt) > to) return false;
    }
    return true;
  });
  const hasFilters = filterUserId || filterDateFrom || filterDateTo;
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

      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-start gap-4 mb-7">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F3E8FF" }}>
            <Users className="h-5 w-5" style={{ color: "#6B04C8" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 4 }}>
              Global Partners
            </h1>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 14 }}>
              Manage your team and track mission activity.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 999, padding: "4px 12px" }}>
                {usersLoading ? "—" : allUsers.length} <span style={{ fontWeight: 400, color: "#475569" }}>Members</span>
              </span>
              <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: "#8705FA", background: "#F3E8FF", border: "1px solid #D8B4FE", borderRadius: 999, padding: "4px 12px" }}>
                {usersLoading ? "—" : countriesCount} <span style={{ fontWeight: 400, color: "#475569" }}>Countries</span>
              </span>
            </div>
          </div>
          <Avatar className="h-9 w-9 flex-shrink-0" style={{ border: "1.5px solid #E8EEF8" }}>
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback style={{ background: "#F3E8FF", color: "#8705FA", fontWeight: 700, fontSize: 13 }}>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center" style={{ borderBottom: "1px solid #D8B4FE" }}>
          {[
            { id: "team", label: "Manage Team", badge: !usersLoading ? allUsers.length : null },
            { id: "feed", label: "Updates", badge: null },
            { id: "countries", label: "Countries", badge: !usersLoading && countriesCount > 0 ? countriesCount : null },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="transition-all duration-150"
                style={{
                  paddingBottom: 12,
                  paddingTop: 4,
                  marginRight: 24,
                  marginBottom: -1,
                  fontSize: 14,
                  fontWeight: active ? 700 : 400,
                  color: active ? "#8705FA" : "#94A3B8",
                  border: "none",
                  borderBottom: active ? "2px solid #8705FA" : "2px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  letterSpacing: active ? "-0.01em" : "normal",
                }}
              >
                {tab.label}
                {tab.badge != null && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: active ? "#F3E8FF" : "transparent",
                      color: active ? "#8705FA" : "#94A3B8",
                      borderRadius: 999,
                      padding: "1px 7px",
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab: Team ── */}
        {activeTab === "team" && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search by name or email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[180px] text-[15px] border rounded-xl px-4 py-3 outline-none bg-white transition-all duration-200"
                style={{ borderColor: "#E5E7EB", height: "48px" }}
                onFocus={e => { e.target.style.borderColor = "#6B7280"; e.target.style.boxShadow = "0 0 0 2px rgba(107,114,128,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
              />
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 text-[14px] font-semibold text-white rounded-xl whitespace-nowrap transition-all duration-200 hover:-translate-y-px"
                style={{ backgroundColor: "#059669", height: "44px", boxShadow: "0 2px 8px rgba(5,150,105,0.20)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#047857"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(5,150,105,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#059669"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(5,150,105,0.20)"; }}
              >
                <Plus className="h-4 w-4" />
                Add Team Member
              </button>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "#F1F5F9" }}>
                        <th className="px-5 py-3.5 text-left text-[13px] font-medium tracking-wide" style={{ color: "#9CA3AF" }}>Member</th>
                        <th className="px-5 py-3.5 text-left text-[13px] font-medium tracking-wide hidden sm:table-cell" style={{ color: "#9CA3AF" }}>Role</th>
                        <th className="px-5 py-3.5 text-left text-[13px] font-medium tracking-wide hidden md:table-cell" style={{ color: "#9CA3AF" }}>Status</th>
                        <th className="px-5 py-3.5 text-left text-[13px] font-medium tracking-wide hidden lg:table-cell" style={{ color: "#9CA3AF" }}>Joined</th>
                        <th className="px-5 py-3.5 text-right text-[13px] font-medium tracking-wide" style={{ color: "#9CA3AF" }}>Actions</th>
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
          <div className="space-y-4">

            {/* Feed sub-tabs */}
            <div className="flex items-center" style={{ borderBottom: "1px solid #D8B4FE" }}>
              {[
                { id: "all", label: "All Posts", count: !feedLoading ? allFeedPosts.length : null },
                { id: "moments", label: "Mission Moments", count: !feedLoading && missionMomentsCount > 0 ? missionMomentsCount : null },
              ].map(tab => {
                const active = feedMomentFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFeedMomentFilter(tab.id as any)}
                    className="transition-all duration-150"
                    style={{
                      paddingBottom: 12,
                      paddingTop: 4,
                      marginRight: 24,
                      marginBottom: -1,
                      fontSize: 14,
                      fontWeight: active ? 700 : 400,
                      color: active ? "#8705FA" : "#94A3B8",
                      border: "none",
                      borderBottom: active ? "2px solid #8705FA" : "2px solid transparent",
                      background: "transparent",
                      cursor: "pointer",
                      letterSpacing: active ? "-0.01em" : "normal",
                    }}
                  >
                    {tab.label}
                    {tab.count != null && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          background: active ? "#F3E8FF" : "transparent",
                          color: active ? "#8705FA" : "#94A3B8",
                          borderRadius: 999,
                          padding: "1px 7px",
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            <div className="bg-white border border-border/60 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Team member</label>
                  <select
                    value={filterUserId}
                    onChange={e => setFilterUserId(e.target.value)}
                    className="w-full text-[13px] border border-border/60 rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">All members</option>
                    {nonAdmins.map((u: any) => (
                      <option key={u.id} value={String(u.id)}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">From</label>
                  <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                    className="w-full text-[13px] border border-border/60 rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">To</label>
                  <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                    className="w-full text-[13px] border border-border/60 rounded-lg px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {hasFilters && (
                  <button
                    onClick={() => { setFilterUserId(""); setFilterDateFrom(""); setFilterDateTo(""); }}
                    className="text-[12px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 whitespace-nowrap pb-1.5"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              {hasFilters && (
                <p className="text-[12px] text-muted-foreground mt-2">
                  Showing {displayedFeedPosts.length} of {rawFeedPosts.length} posts
                </p>
              )}
            </div>

            {feedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <Skeleton className="w-full aspect-[4/3]" />
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-2.5 w-24" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedFeedPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
                {feedMomentFilter === "moments" ? (
                  <>
                    <Star className="h-10 w-10 mx-auto text-amber-300/50 mb-3" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedFeedPosts.map((post, i) => (
                  <FeedGridCard
                    key={post.id}
                    post={post}
                    onClick={() => setSelectedPostIndex(i)}
                  />
                ))}
              </div>
            )}

            {/* Post detail modal */}
            {selectedPostIndex !== null && displayedFeedPosts[selectedPostIndex] && (
              <PostDetailModal
                post={displayedFeedPosts[selectedPostIndex]}
                allPosts={displayedFeedPosts}
                postIndex={selectedPostIndex}
                onNavigate={setSelectedPostIndex}
                onClose={() => setSelectedPostIndex(null)}
                onDelete={(id) => {
                  setFeedPosts(prev => prev ? prev.filter(p => p.id !== id) : null);
                  setSelectedPostIndex(null);
                }}
              />
            )}
          </div>
        )}

        {/* ── Tab: Countries ── */}
        {activeTab === "countries" && (
          <div className="space-y-4">
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
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0" style={{ background: "#F3E8FF" }}>
                        <MapPin className="h-4 w-4" style={{ color: "#8705FA" }} />
                      </div>
                      <div>
                        <p className="font-bold text-[15px] text-foreground">{country}</p>
                        {city && <p className="text-[12px] text-muted-foreground mt-0.5">{city}</p>}
                      </div>
                      <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F3E8FF", color: "#8705FA" }}>
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

    </>
  );
}
