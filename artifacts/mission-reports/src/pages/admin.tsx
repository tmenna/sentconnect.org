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
  Users, FileText, Heart, MessageCircle,
  Globe, Plus, X, RefreshCw, Trash2,
  ChevronDown, Eye, EyeOff, Check, Copy, UserPlus,
  ShieldCheck, Pencil, Settings2, Save, Loader2,
  BarChart3, Star, UserCog, BookOpen, MapPin, PenSquare, Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
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
              ? "bg-gray-50 border-gray-200"
              : "bg-muted/30 border-border/40 hover:bg-muted/50"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className={`flex-shrink-0 ${perms[key] ? "text-gray-800" : "text-muted-foreground"}`}>
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
            className="h-4 w-4 rounded accent-gray-800 cursor-pointer"
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
                    ? { background: "#0268CE", color: "#fff", borderColor: "#0268CE", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
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

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-[13px] font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
              style={{ background: "#0268CE", color: "#fff" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0155a5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0268CE"; }}
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
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: "#EEF2FF", color: "#4338CA" }}>
      <ShieldCheck className="h-3 w-3" /> Admin
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: "#F3F4F6", color: "#374151" }}>
      <Globe className="h-3 w-3" /> Field User
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: "#F9FAFB", color: "#6B7280" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
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

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-60 transition"
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
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors">Close</button>
          <button
            onClick={copy}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:opacity-90 transition"
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
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={u.avatarUrl ?? undefined} />
              <AvatarFallback className="font-semibold text-[14px]" style={{ background: "#F3F4F6", color: "#374151" }}>
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

        {/* ── Global Partners banner ── */}
        <div
          className="relative -mx-4 sm:-mx-8 -mt-8 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0047A8 0%, #0268CE 60%, #1A80E0 100%)",
            borderRadius: "16px",
          }}
        >

          {/* World map continent silhouettes */}
          <svg
            aria-hidden
            className="pointer-events-none select-none absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 900 120"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.18 }}
          >
            <g fill="white">
              {/* North America */}
              <path d="M 32,10 L 65,13 L 102,18 L 145,36 L 158,28 L 178,20 L 208,9 L 248,21 L 282,37 L 308,44 L 322,37 L 308,43 L 285,47 L 268,53 L 256,62 L 252,70 L 238,76 L 225,78 L 212,74 L 198,71 L 182,68 L 165,65 L 152,61 L 143,41 L 118,27 L 78,19 Z" />
              {/* Greenland */}
              <path d="M 296,7 L 322,4 L 350,7 L 360,14 L 350,21 L 325,24 L 305,19 Z" />
              {/* South America */}
              <path d="M 256,84 L 278,78 L 302,78 L 322,84 L 364,98 L 356,108 L 342,118 L 318,128 L 304,133 L 293,138 L 283,149 L 280,156 L 276,149 L 268,136 L 258,122 L 250,110 L 247,98 L 248,90 Z" />
              {/* Europe */}
              <path d="M 428,28 L 448,20 L 470,16 L 494,18 L 512,13 L 522,19 L 514,27 L 502,31 L 492,37 L 507,41 L 512,48 L 502,52 L 488,52 L 474,50 L 458,52 L 448,50 L 438,47 L 430,41 Z" />
              {/* Africa */}
              <path d="M 435,52 L 464,49 L 480,49 L 502,52 L 517,58 L 530,67 L 537,80 L 537,94 L 530,107 L 520,120 L 506,130 L 492,134 L 477,131 L 462,122 L 450,110 L 440,97 L 435,82 L 432,67 Z" />
              {/* Madagascar */}
              <path d="M 518,110 L 526,106 L 531,112 L 529,121 L 521,123 L 516,117 Z" />
              {/* Asia – main body */}
              <path d="M 514,17 L 562,9 L 628,7 L 702,7 L 762,14 L 812,21 L 860,17 L 882,24 L 872,32 L 852,38 L 828,45 L 802,50 L 778,52 L 754,58 L 732,65 L 716,76 L 700,82 L 682,78 L 660,75 L 648,82 L 632,78 L 614,72 L 597,68 L 580,62 L 562,56 L 546,50 L 537,44 L 530,38 L 517,32 Z" />
              {/* Arabian Peninsula */}
              <path d="M 557,65 L 572,62 L 588,64 L 595,72 L 590,80 L 578,82 L 565,78 L 558,72 Z" />
              {/* India */}
              <path d="M 622,72 L 642,68 L 657,72 L 657,83 L 646,89 L 635,86 L 624,80 Z" />
              {/* SE Asia peninsula */}
              <path d="M 700,80 L 722,75 L 740,78 L 744,86 L 734,91 L 716,89 L 705,85 Z" />
              {/* Japan */}
              <path d="M 800,44 L 810,41 L 820,45 L 817,52 L 810,54 L 801,50 Z" />
              {/* Australia */}
              <path d="M 736,102 L 760,97 L 780,97 L 802,100 L 820,105 L 834,113 L 837,123 L 829,131 L 813,136 L 790,137 L 768,133 L 750,126 L 738,116 Z" />
              {/* New Zealand */}
              <path d="M 848,120 L 856,115 L 862,119 L 860,128 L 853,130 L 848,125 Z" />
            </g>
          </svg>

          {/* Banner content */}
          <div className="relative z-10 px-6 sm:px-8 pt-7 pb-6">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <h1 className="font-bold leading-tight tracking-tight" style={{ fontSize: 28, color: "#fff" }}>
                  Global Partners
                </h1>
                <p className="mt-1" style={{ fontSize: 14, color: "rgba(255,255,255,0.78)" }}>
                  Manage your team and track mission activity.
                </p>
              </div>
              <Avatar className="h-10 w-10 flex-shrink-0 mt-0.5" style={{ border: "2.5px solid rgba(255,255,255,0.45)" }}>
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="font-bold text-[14px]" style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Stat boxes */}
            <div className="flex gap-3 mt-5">
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.15)", minWidth: 140 }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(57,188,122,0.25)" }}>
                  <Users className="h-4 w-4" style={{ color: "#39BC7A" }} />
                </div>
                <div>
                  <p className="font-black leading-none" style={{ fontSize: 22, color: "#fff" }}>
                    {usersLoading ? "—" : allUsers.length}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>Team Members</p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.15)", minWidth: 140 }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.18)" }}>
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-black leading-none" style={{ fontSize: 22, color: "#fff" }}>
                    {usersLoading ? "—" : countriesCount}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>Countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1" style={{ borderBottom: "1px solid #E9E9E9" }}>
          {[
            { id: "team", label: "Manage Team", icon: <Users className="h-3.5 w-3.5" />, badge: !usersLoading ? allUsers.length : null },
            { id: "feed", label: "Updates", icon: <Heart className="h-3.5 w-3.5" />, badge: null },
            { id: "countries", label: "Countries", icon: <MapPin className="h-3.5 w-3.5" />, badge: !usersLoading && countriesCount > 0 ? countriesCount : null },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2 px-1 pb-3 pt-1 mr-5 text-[14px] font-semibold border-b-2 -mb-px transition-all duration-200"
                style={{
                  borderColor: active ? "#0268CE" : "transparent",
                  color: active ? "#0268CE" : "#9CA3AF",
                }}
              >
                {tab.icon}
                {tab.label}
                {tab.badge != null && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: active ? "#EFF6FF" : "#F3F4F6", color: active ? "#0268CE" : "#6B7280" }}
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
                style={{ backgroundColor: "#0268CE", height: "48px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#0155a5"; e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#0268CE"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Missions Feed hero card */}
            <div
              className="relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0047A8 0%, #0268CE 60%, #1A80E0 100%)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 24px rgba(2,104,206,0.18)",
              }}
            >
              <svg aria-hidden className="pointer-events-none select-none absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 900 120" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.18 }}>
                <g fill="white">
                  <path d="M 32,10 L 65,13 L 102,18 L 145,36 L 158,28 L 178,20 L 208,9 L 248,21 L 282,37 L 308,44 L 322,37 L 308,43 L 285,47 L 268,53 L 256,62 L 252,70 L 238,76 L 225,78 L 212,74 L 198,71 L 182,68 L 165,65 L 152,61 L 143,41 L 118,27 L 78,19 Z" />
                  <path d="M 435,52 L 464,49 L 480,49 L 502,52 L 517,58 L 530,67 L 537,80 L 537,94 L 530,107 L 520,120 L 506,130 L 492,134 L 477,131 L 462,122 L 450,110 L 440,97 L 435,82 L 432,67 Z" />
                  <path d="M 514,17 L 562,9 L 628,7 L 702,7 L 762,14 L 812,21 L 860,17 L 882,24 L 872,32 L 852,38 L 828,45 L 802,50 L 778,52 L 754,58 L 732,65 L 716,76 L 700,82 L 682,78 L 660,75 L 648,82 L 632,78 L 614,72 L 597,68 L 580,62 L 562,56 L 546,50 L 537,44 L 530,38 L 517,32 Z" />
                </g>
              </svg>
              <div className="relative z-10 px-8 pt-7 pb-7">
                <h1 className="font-bold leading-tight tracking-tight" style={{ fontSize: 30, color: "#fff" }}>Missions Feed</h1>
                <p className="mt-1" style={{ fontSize: 14, color: "rgba(255,255,255,0.78)" }}>Stay connected. Share what God is doing in the field.</p>
                <div className="flex gap-3 mt-5">
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.15)", minWidth: 140 }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(57,188,122,0.25)" }}>
                      <PenSquare className="h-4 w-4" style={{ color: "#39BC7A" }} />
                    </div>
                    <div>
                      <p className="font-black leading-none" style={{ fontSize: 22, color: "#fff" }}>{feedLoading ? "—" : allFeedPosts.length}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>Posts Shared</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.15)", minWidth: 160 }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,214,0,0.18)" }}>
                      <Star className="h-4 w-4" style={{ color: "#FFD600", fill: "#FFD600" }} />
                    </div>
                    <div>
                      <p className="font-black leading-none" style={{ fontSize: 22, color: "#fff" }}>{feedLoading ? "—" : missionMomentsCount}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>Mission Moments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Composer */}
            <PostComposer
              onPost={(newPost) => setFeedPosts(prev => [newPost, ...(prev ?? (timelineData?.reports as PostData[] ?? []))])}
            />

            {/* Feed sub-tabs */}
            <div className="flex items-center gap-1" style={{ borderBottom: "1px solid #E9E9E9" }}>
              {[
                { id: "all", label: "All Posts", icon: <Send className="h-3.5 w-3.5" />, count: !feedLoading ? allFeedPosts.length : null, activeColor: "#0268CE", activeBg: "#EFF6FF" },
                { id: "moments", label: "Mission Moments", icon: <Star className="h-3.5 w-3.5" style={{ fill: feedMomentFilter === "moments" ? "#DB1C4F" : "none", color: feedMomentFilter === "moments" ? "#DB1C4F" : "currentColor" }} />, count: !feedLoading && missionMomentsCount > 0 ? missionMomentsCount : null, activeColor: "#DB1C4F", activeBg: "#FFF1F4" },
              ].map(tab => {
                const active = feedMomentFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFeedMomentFilter(tab.id as any)}
                    className="flex items-center gap-2 px-1 pb-3 pt-1 mr-5 text-[14px] font-semibold border-b-2 -mb-px transition-all duration-200"
                    style={{
                      borderColor: active ? tab.activeColor : "transparent",
                      color: active ? tab.activeColor : "#9CA3AF",
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count != null && (
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: active ? tab.activeBg : "#F3F4F6", color: active ? tab.activeColor : "#6B7280" }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
              {!feedLoading && (
                <span className="ml-auto pb-3 text-[13px]" style={{ color: "#9CA3AF" }}>
                  {displayedFeedPosts.length} result{displayedFeedPosts.length !== 1 ? "s" : ""}
                </span>
              )}
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
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-border/50 overflow-hidden p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
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
              <div className="space-y-4">
                {displayedFeedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={(id) => setFeedPosts(prev => prev ? prev.filter(p => p.id !== id) : null)}
                  />
                ))}
              </div>
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
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0" style={{ background: "#EFF6FF" }}>
                        <MapPin className="h-4 w-4" style={{ color: "#0268CE" }} />
                      </div>
                      <div>
                        <p className="font-bold text-[15px] text-foreground">{country}</p>
                        {city && <p className="text-[12px] text-muted-foreground mt-0.5">{city}</p>}
                      </div>
                      <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#0268CE" }}>
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
