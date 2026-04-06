import { useState } from "react";
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
  Globe, Sparkles, Plus, X, RefreshCw, Trash2,
  ChevronDown, Eye, EyeOff, Check, Copy, UserPlus,
  ShieldCheck, Pencil,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
        boxShadow: shadow,
        transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
        cursor: isClickable ? "pointer" : undefined,
      }}
      className={[
        "bg-white rounded-2xl border border-border/60 shadow-sm p-5 flex items-center gap-4",
        isClickable ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" : "",
      ].join(" ")}
    >
      <div className={`p-3 rounded-xl flex-shrink-0 ${accent ?? "bg-primary/10 text-primary"}`}>{icon}</div>
      <div>
        <p className="text-[28px] font-extrabold text-foreground leading-none">{value}</p>
        <p className="text-[12px] text-muted-foreground mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full">
      <ShieldCheck className="h-3 w-3" /> Admin
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
      <Globe className="h-3 w-3" /> Field User
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
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

function DeleteConfirmModal({ userName, onConfirm, onClose, loading }: {
  userName: string; onConfirm: () => void; onClose: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-border/60 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-xl"><Trash2 className="h-5 w-5 text-red-500" /></div>
          <div>
            <h2 className="font-bold text-[15px]">Remove team member?</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">This will permanently delete <strong>{userName}</strong>.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-semibold border border-border/60 rounded-xl hover:bg-muted transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
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

function TeamRow({ u, onUpdated, onDeleted }: { u: any; onUpdated: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(u.bio ?? "");

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
    try {
      await fetch(`/api/admin/users/${u.id}`, { method: "DELETE", credentials: "include" });
      setShowDeleteModal(false);
      onDeleted();
    } catch (err: any) {
      alert(err.message);
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
          onConfirm={deleteUser}
          onClose={() => setShowDeleteModal(false)}
          loading={busy}
        />
      )}
      {resetLink && (
        <ResetLinkModal link={resetLink} onClose={() => setResetLink(null)} />
      )}
      <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors">
        {/* User */}
        <td className="px-4 py-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
              <AvatarImage src={u.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {u.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground leading-none">{u.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{u.email}</p>
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
        <td className="px-4 py-3 hidden sm:table-cell">
          <RoleBadge role={u.role} />
        </td>
        {/* Status */}
        <td className="px-4 py-3 hidden md:table-cell">
          <StatusBadge status={u.status} />
        </td>
        {/* Joined */}
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="text-[12px] text-muted-foreground">
            {format(new Date(u.createdAt), "MMM d, yyyy")}
          </span>
        </td>
        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 justify-end">
            {/* Toggle status */}
            <button
              title={u.status === "active" ? "Deactivate" : "Activate"}
              onClick={toggleStatus}
              disabled={busy}
              className={`p-1.5 rounded-lg transition-colors text-[11px] font-semibold ${
                u.status === "active"
                  ? "hover:bg-amber-50 text-amber-600"
                  : "hover:bg-emerald-50 text-emerald-600"
              }`}
            >
              {u.status === "active" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            {/* Reset password */}
            <button
              title="Generate reset link"
              onClick={generateResetLink}
              disabled={busy}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            {/* Delete */}
            <button
              title="Remove member"
              onClick={() => setShowDeleteModal(true)}
              disabled={busy}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"team" | "feed">("team");
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedPosts, setFeedPosts] = useState<PostData[] | null>(null);
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: stats, isLoading: statsLoading } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: users, isLoading: usersLoading } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });
  const { data: timelineData, isLoading: feedLoading } = useGetTimeline(
    { limit: 50 },
    {
      query: {
        enabled: activeTab === "feed",
        queryKey: getGetTimelineQueryKey({ limit: 50 }),
        onSuccess: (data: any) => {
          if (feedPosts === null) setFeedPosts(data?.reports ?? []);
        },
      },
    }
  );

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
  const firstName = user.name.split(" ")[0];

  return (
    <>
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdded={refreshUsers}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Welcome Banner */}
        <div
          className="rounded-2xl px-6 py-5 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }}
        >
          <div className="p-3 bg-white/15 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-[20px] font-extrabold text-white tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-white/65 text-sm mt-0.5">Here's what your team has been up to.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Avatar className="h-10 w-10 ring-2 ring-white/30">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-white/20 text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statsLoading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              <StatCard label="Total Posts" value={stats?.totalPosts ?? 0} icon={<FileText className="h-5 w-5" />} accent="bg-blue-50 text-blue-600" onClick={() => setActiveTab("feed")} />
              <StatCard label="Field Users" value={nonAdmins.length} icon={<Users className="h-5 w-5" />} accent="bg-emerald-50 text-emerald-600" onClick={() => setActiveTab("team")} />
              <StatCard
                label="Countries"
                value={new Set(nonAdmins.map((u: any) => u.location?.split(",").pop()?.trim()).filter(Boolean)).size || "—"}
                icon={<Globe className="h-5 w-5" />}
                accent="bg-violet-50 text-violet-600"
                onClick={() => setActiveTab("team")}
              />
              <StatCard label="Your Role" value="Admin" icon={<Sparkles className="h-5 w-5" />} accent="bg-amber-50 text-amber-600" />
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border/60">
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === "team" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Team
              {!usersLoading && (
                <span className="ml-0.5 text-[11px] bg-muted px-1.5 py-0.5 rounded-full font-medium">
                  {allUsers.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === "feed" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              Activity Feed
            </span>
          </button>
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
                className="flex-1 min-w-[180px] text-sm border border-border/60 rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-primary/30 bg-white transition"
              />
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm whitespace-nowrap"
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
                      <tr className="bg-muted/40 border-b border-border/40">
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Member</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Role</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Status</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Joined</th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeam.map((u: any) => (
                        <TeamRow
                          key={u.id}
                          u={u}
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
                  Showing {allFeedPosts.length} of {rawFeedPosts.length} posts
                </p>
              )}
            </div>

            {feedLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-border/60 shadow-sm p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ))}
              </div>
            ) : allFeedPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
                <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="font-semibold text-sm text-foreground">{hasFilters ? "No posts match your filters" : "No posts yet"}</p>
                <p className="text-muted-foreground text-xs mt-1">{hasFilters ? "Try adjusting your filters above." : "Team updates will appear here once posted."}</p>
              </div>
            ) : (
              allFeedPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={(id) => setFeedPosts(prev => prev ? prev.filter(p => p.id !== id) : null)}
                />
              ))
            )}
          </div>
        )}

      </div>
    </>
  );
}
