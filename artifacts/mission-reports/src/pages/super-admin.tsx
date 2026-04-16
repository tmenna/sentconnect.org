import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  Building2, Users, FileText, CheckCircle2, XCircle,
  Loader2, Globe, ShieldCheck, UserCog, Search,
  Plus, Lock, Unlock, Ban, UserCheck, KeyRound, ChevronDown,
  ShieldAlert, Shield, Edit3, X, Save, Eye, EyeOff,
  Trash2, AlertTriangle, Settings2, BookOpen, Star, FileOutput, BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgWithStats = {
  id: number;
  name: string;
  subdomain: string;
  plan: string;
  status: string;
  createdAt: string;
  userCount: number;
  postCount: number;
};

type PlatformStats = {
  totalOrgs: number;
  totalUsers: number;
  totalPosts: number;
};

type Permissions = {
  canViewOrganizations: boolean;
  canManageOrganizations: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canResetPasswords: boolean;
  canLockUnlockUsers: boolean;
  canSuspendUsers: boolean;
  canImpersonateUsers: boolean;
};

type PlatformUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  organizationId: number | null;
  organization: string | null;
  permissions: string | null;
  createdAt: string;
  avatarUrl: string | null;
  location: string | null;
};

const DEFAULT_PERMS: Permissions = {
  canViewOrganizations: false,
  canManageOrganizations: false,
  canViewUsers: false,
  canManageUsers: false,
  canResetPasswords: false,
  canLockUnlockUsers: false,
  canSuspendUsers: false,
  canImpersonateUsers: false,
};

function parsePerms(raw: string | null | undefined): Permissions {
  if (!raw) return { ...DEFAULT_PERMS };
  try { return { ...DEFAULT_PERMS, ...JSON.parse(raw) }; } catch { return { ...DEFAULT_PERMS }; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

function roleBadge(role: string) {
  if (role === "super_admin") return { bg: "bg-purple-100 text-purple-700", label: "Super Admin" };
  if (role === "platform_admin") return { bg: "bg-indigo-100 text-indigo-700", label: "Platform Admin" };
  if (role === "platform_manager") return { bg: "bg-sky-100 text-sky-700", label: "Platform Manager" };
  if (role === "admin") return { bg: "bg-blue-100 text-blue-700", label: "Admin" };
  return { bg: "bg-slate-100 text-slate-600", label: role.replace(/_/g, " ") };
}

function statusBadge(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-700";
  if (status === "locked") return "bg-amber-100 text-amber-700";
  if (status === "suspended") return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-600";
}

const isPlatformRole = (role: string) =>
  ["super_admin", "platform_admin", "platform_manager"].includes(role);

const PERM_LABELS: { key: keyof Permissions; label: string }[] = [
  { key: "canViewOrganizations", label: "View Organizations" },
  { key: "canManageOrganizations", label: "Manage Organizations" },
  { key: "canViewUsers", label: "View All Users" },
  { key: "canManageUsers", label: "Manage Users" },
  { key: "canResetPasswords", label: "Reset Passwords" },
  { key: "canLockUnlockUsers", label: "Lock / Unlock Users" },
  { key: "canSuspendUsers", label: "Suspend / Unsuspend Users" },
  { key: "canImpersonateUsers", label: "Impersonate Users" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 flex items-center gap-4">
      <div className="p-3 bg-[#132272]/8 rounded-xl text-[#132272]">{icon}</div>
      <div>
        <p className="text-[13px] text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
        active ? "bg-[#132272] text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      }`}
    >
      {children}
    </button>
  );
}

function PermissionsEditor({
  perms,
  onChange,
  disabled,
}: {
  perms: Permissions;
  onChange: (perms: Permissions) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {PERM_LABELS.map(({ key, label }) => (
        <label key={key} className={`flex items-center gap-2.5 p-2.5 rounded-lg border border-border/50 cursor-pointer select-none transition-colors ${perms[key] ? "bg-[#132272]/5 border-[#132272]/20" : "bg-muted/20"} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/40"}`}>
          <input
            type="checkbox"
            checked={perms[key]}
            disabled={disabled}
            onChange={e => onChange({ ...perms, [key]: e.target.checked })}
            className="w-4 h-4 accent-[#132272]"
          />
          <span className="text-[12px] font-medium text-foreground">{label}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Confirm Delete Dialog (inline) ──────────────────────────────────────────

function ConfirmDeleteModal({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  loading,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
              <p className="text-[13px] text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 text-[13px] font-semibold border border-border/60 rounded-lg hover:bg-muted/40 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Organization Modal ────────────────────────────────────────────────

function CreateOrgModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (org: OrgWithStats) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", subdomain: "", plan: "free" });
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  function validateSlug(val: string) {
    if (!val) return null;
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(val) && val.length > 1) return "Only lowercase letters, numbers, hyphens; must start/end with letter or number";
    return null;
  }

  function handleNameChange(name: string) {
    const auto = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setForm(f => ({ ...f, name, subdomain: f.subdomain || auto }));
  }

  function handleSubdomainChange(val: string) {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlugError(validateSlug(cleaned));
    setForm(f => ({ ...f, subdomain: cleaned }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateSlug(form.subdomain);
    if (err) { setSlugError(err); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/orgs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to create organization");
      }
      const org = await res.json();
      toast({ title: `Organization "${org.name}" created` });
      onCreated({ ...org, userCount: 0, postCount: 0 });
    } catch (err: any) {
      toast({ title: err.message ?? "Failed to create organization", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-foreground">New Organization</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Creates a new tenant with its own subdomain</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Organization Name</label>
            <input
              required
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Calvary Church"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Subdomain</label>
            <div className="flex items-center gap-0">
              <input
                required
                value={form.subdomain}
                onChange={e => handleSubdomainChange(e.target.value)}
                className="flex-1 px-3 py-2.5 text-[13px] border border-border/60 rounded-l-lg bg-white outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                placeholder="calvary"
                minLength={2}
              />
              <span className="px-3 py-2.5 text-[12px] text-muted-foreground bg-muted/50 border border-l-0 border-border/60 rounded-r-lg whitespace-nowrap">
                .sentconnect.org
              </span>
            </div>
            {slugError && <p className="text-[11px] text-red-600 mt-1">{slugError}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Plan</label>
            <select
              value={form.plan}
              onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-semibold border border-border/60 rounded-lg hover:bg-muted/40 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !!slugError}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#132272] text-white rounded-lg hover:bg-[#132272]/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create Platform User Modal ───────────────────────────────────────────────

function CreatePlatformUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: PlatformUser) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "platform_manager" });
  const [perms, setPerms] = useState<Permissions>({ ...DEFAULT_PERMS });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          permissions: form.role === "platform_manager" ? perms : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create user");
      }
      const user = await res.json();
      toast({ title: "Platform user created successfully" });
      onCreated(user);
    } catch (err: any) {
      toast({ title: err.message ?? "Failed to create user", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border/60 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-[15px] font-bold text-foreground">Add Platform User</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Create a new platform-level account</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Full Name</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="jane@sentconnect.org"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Password</label>
            <div className="relative">
              <input
                required
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 pr-10 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Min. 8 characters"
                minLength={8}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="platform_admin">Platform Admin — full access</option>
              <option value="platform_manager">Platform Manager — permission-based access</option>
            </select>
          </div>

          {form.role === "platform_manager" && (
            <div>
              <p className="text-[12px] font-semibold text-foreground mb-2">Permissions</p>
              <PermissionsEditor perms={perms} onChange={setPerms} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-semibold border border-border/60 rounded-lg hover:bg-muted/40 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#132272] text-white rounded-lg hover:bg-[#132272]/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Permissions Modal ───────────────────────────────────────────────────

function EditPermissionsModal({
  user,
  onClose,
  onUpdated,
}: {
  user: PlatformUser;
  onClose: () => void;
  onUpdated: (user: PlatformUser) => void;
}) {
  const { toast } = useToast();
  const [perms, setPerms] = useState<Permissions>(parsePerms(user.permissions));
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/super-admin/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          permissions: role === "platform_manager" ? perms : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      toast({ title: "User updated" });
      onUpdated(updated);
    } catch {
      toast({ title: "Failed to update user", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border/60 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-[15px] font-bold text-foreground">Edit {user.name}</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="platform_admin">Platform Admin — full access</option>
              <option value="platform_manager">Platform Manager — permission-based</option>
            </select>
          </div>

          {role === "platform_manager" && (
            <div>
              <p className="text-[12px] font-semibold text-foreground mb-2">Permissions</p>
              <PermissionsEditor perms={perms} onChange={setPerms} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-semibold border border-border/60 rounded-lg hover:bg-muted/40 transition-colors">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#132272] text-white rounded-lg hover:bg-[#132272]/90 transition-colors disabled:opacity-50"
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

// ─── Reset Password Result Modal ──────────────────────────────────────────────

function ResetLinkModal({ resetUrl, onClose }: { resetUrl: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(resetUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">Password Reset Link</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-[13px] text-muted-foreground">Share this link with the user. It expires in 1 hour.</p>
          <div className="flex gap-2">
            <input readOnly value={resetUrl} className="flex-1 px-3 py-2 text-[12px] border border-border/60 rounded-lg bg-muted/30 text-foreground font-mono truncate" />
            <button onClick={copy} className={`px-3 py-2 text-[12px] font-semibold rounded-lg border transition-colors ${copied ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white border-border/60 hover:bg-muted/40"}`}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button onClick={onClose} className="w-full px-4 py-2.5 text-[13px] font-semibold bg-[#132272] text-white rounded-lg hover:bg-[#132272]/90 transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Action Menu ──────────────────────────────────────────────────────────────

function UserActionMenu({
  user,
  currentUserId,
  onAction,
  isSelf,
  canDelete,
  callerRole,
}: {
  user: PlatformUser;
  currentUserId: number;
  onAction: (action: string, user: PlatformUser) => void;
  isSelf?: boolean;
  canDelete?: boolean;
  callerRole?: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleOpen() {
    if (isSelf) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(v => !v);
  }

  useEffect(() => {
    if (!open) return;
    function onScroll() { setOpen(false); }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  const isOrgUser = !isPlatformRole(user.role);

  const actions = [
    { id: "reset-password", label: "Reset Password", icon: KeyRound, color: "text-foreground" },
    ...(user.status === "locked"
      ? [{ id: "unlock", label: "Unlock Account", icon: Unlock, color: "text-emerald-600" }]
      : [{ id: "lock", label: "Lock Account", icon: Lock, color: "text-amber-600" }]),
    ...(user.status === "suspended"
      ? [{ id: "unsuspend", label: "Unsuspend", icon: UserCheck, color: "text-emerald-600" }]
      : [{ id: "suspend", label: "Suspend", icon: Ban, color: "text-orange-600" }]),
    ...(isOrgUser
      ? [{ id: "edit-org-user", label: "Edit Role & Permissions", icon: Settings2, color: "text-[#132272]" }]
      : [{ id: "edit", label: "Edit Platform Role", icon: Settings2, color: "text-[#132272]" }]
    ),
    { id: "assign-org", label: "Assign to Organization", icon: Building2, color: "text-foreground" },
    ...(isOrgUser ? [{ id: "impersonate", label: "Sign in as", icon: UserCog, color: "text-[#132272]" }] : []),
    ...(canDelete && user.role !== "super_admin" && (callerRole === "super_admin" || isOrgUser)
      ? [{ id: "delete", label: "Delete User", icon: Trash2, color: "text-red-600" }]
      : []),
  ];

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={isSelf}
        title={isSelf ? "Cannot act on your own account" : undefined}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Actions <ChevronDown className="h-3 w-3" />
      </button>
      {open && menuPos && (
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[999] bg-white border border-border/60 rounded-xl shadow-xl py-1 min-w-[176px]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {actions.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => { setOpen(false); onAction(id, user); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium hover:bg-muted/50 transition-colors ${color}`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Org Permissions (shared with admin panel) ───────────────────────────────

type OrgPermissions = {
  canSubmitReports: boolean;
  canViewAllReports: boolean;
  canHighlightReports: boolean;
  canManageTeam: boolean;
  canExportData: boolean;
  canViewAnalytics: boolean;
};

const ORG_DEFAULT_PERMS: OrgPermissions = {
  canSubmitReports: true,
  canViewAllReports: false,
  canHighlightReports: false,
  canManageTeam: false,
  canExportData: false,
  canViewAnalytics: false,
};

const ORG_ADMIN_PERMS: OrgPermissions = {
  canSubmitReports: true,
  canViewAllReports: true,
  canHighlightReports: true,
  canManageTeam: true,
  canExportData: true,
  canViewAnalytics: true,
};

const ORG_PERM_META: { key: keyof OrgPermissions; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "canSubmitReports",    label: "Submit Reports",    desc: "Post mission reports to the feed",     icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: "canViewAllReports",   label: "View All Reports",  desc: "See reports from all team members",    icon: <Eye className="h-3.5 w-3.5" /> },
  { key: "canHighlightReports", label: "Highlight Reports", desc: "Star / feature important updates",     icon: <Star className="h-3.5 w-3.5" /> },
  { key: "canManageTeam",       label: "Manage Team",       desc: "Add, edit and remove team members",    icon: <UserCog className="h-3.5 w-3.5" /> },
  { key: "canExportData",       label: "Export Data",       desc: "Download reports as CSV or PDF",       icon: <FileOutput className="h-3.5 w-3.5" /> },
  { key: "canViewAnalytics",    label: "View Analytics",    desc: "Access stats and activity dashboards", icon: <BarChart3 className="h-3.5 w-3.5" /> },
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
              ? "bg-[#132272]/5 border-[#132272]/20"
              : "bg-muted/30 border-border/40 hover:bg-muted/50"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className={`flex-shrink-0 ${perms[key] ? "text-[#132272]" : "text-muted-foreground"}`}>{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">{desc}</p>
          </div>
          <input
            type="checkbox"
            checked={perms[key]}
            disabled={disabled}
            onChange={e => onChange({ ...perms, [key]: e.target.checked })}
            className="h-4 w-4 rounded accent-[#132272] cursor-pointer"
          />
        </label>
      ))}
    </div>
  );
}

// ─── Edit Org User Modal (role + permissions) ─────────────────────────────────

function EditOrgUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: PlatformUser;
  onClose: () => void;
  onUpdated: (updated: PlatformUser) => void;
}) {
  const { toast } = useToast();
  const [role, setRole] = useState<"admin" | "field_user">(user.role === "admin" ? "admin" : "field_user");
  const [perms, setPerms] = useState<OrgPermissions>(
    user.role === "admin" ? { ...ORG_ADMIN_PERMS } : parseOrgPerms(user.permissions)
  );
  const [saving, setSaving] = useState(false);

  const isAdmin = role === "admin";

  function handleRoleChange(newRole: "admin" | "field_user") {
    setRole(newRole);
    if (newRole === "admin") setPerms({ ...ORG_ADMIN_PERMS });
    else setPerms(parseOrgPerms(user.permissions));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/super-admin/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          permissions: isAdmin ? null : perms,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to update");
      }
      const updated = await res.json();
      toast({ title: `${user.name} updated successfully` });
      onUpdated(updated);
    } catch (err: any) {
      toast({ title: err.message ?? "Update failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#132272]/10 rounded-lg">
              <Settings2 className="h-4 w-4 text-[#132272]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-foreground">Role & Permissions</h2>
              <p className="text-[11px] text-muted-foreground">{user.name} · {user.organization}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Role switcher */}
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-2">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(["field_user", "admin"] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
                    role === r
                      ? "bg-[#132272] text-white border-[#132272] shadow-sm"
                      : "bg-white text-foreground border-border/60 hover:border-[#132272]/30 hover:bg-[#132272]/5"
                  }`}
                >
                  {r === "admin"
                    ? <><ShieldCheck className="h-4 w-4 flex-shrink-0" /> Admin</>
                    : <><Globe className="h-4 w-4 flex-shrink-0" /> Field User</>
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-semibold text-foreground">Permissions</label>
              {isAdmin && (
                <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  All granted (Admin)
                </span>
              )}
            </div>
            <OrgPermissionsEditor perms={perms} onChange={setPerms} disabled={isAdmin} />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 text-[13px] font-semibold border border-border/60 rounded-lg hover:bg-muted/40 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#132272] text-white rounded-lg hover:bg-[#132272]/90 transition-colors disabled:opacity-50"
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

// ─── Create Org User Modal ────────────────────────────────────────────────────

function CreateOrgUserModal({
  org,
  onClose,
  onCreated,
}: {
  org: OrgWithStats;
  onClose: () => void;
  onCreated: (user: PlatformUser) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "field_user" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organizationId: org.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create user");
      }
      const user = await res.json();
      toast({ title: `${form.name} added to ${org.name}` });
      onCreated(user);
    } catch (err: any) {
      toast({ title: err.message ?? "Failed to create user", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-foreground">Add User to Organization</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 className="h-3 w-3 text-[#00C4A7]" />
              <p className="text-[12px] text-muted-foreground font-medium">{org.name}</p>
              <span className="text-[11px] text-muted-foreground/60">·</span>
              <a href={`/${org.subdomain}/`} target="_blank" rel="noreferrer" className="text-[11px] text-[#132272] font-mono hover:underline">/{org.subdomain}/</a>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Full Name</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="jane@example.org"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Password</label>
            <div className="relative">
              <input
                required
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 pr-10 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Min. 8 characters"
                minLength={8}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="field_user">Field User — can submit reports</option>
              <option value="admin">Admin — manages this organization</option>
            </select>
          </div>
          <div className="rounded-lg bg-[#132272]/5 border border-[#132272]/10 px-4 py-3 text-[12px] text-[#132272]/80 flex items-start gap-2">
            <Globe className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>This user will log in at <strong className="font-mono">/{org.subdomain}/login</strong> with the credentials you set above.</span>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 text-[13px] font-semibold border border-border/60 rounded-lg hover:bg-muted/40 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#00C4A7] text-white rounded-lg hover:bg-[#00C4A7]/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add to {org.name}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Assign Org Modal ─────────────────────────────────────────────────────────

function AssignOrgModal({
  user,
  orgs,
  onClose,
  onUpdated,
}: {
  user: PlatformUser;
  orgs: OrgWithStats[];
  onClose: () => void;
  onUpdated: (user: PlatformUser) => void;
}) {
  const { toast } = useToast();
  const [orgId, setOrgId] = useState<string>(
    user.organizationId !== null ? String(user.organizationId) : ""
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        organizationId: orgId === "" ? null : Number(orgId),
      };
      const res = await fetch(`/api/super-admin/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to update");
      }
      const updated = await res.json();
      toast({
        title: orgId === ""
          ? `${user.name} removed from organization`
          : `${user.name} assigned to ${orgs.find(o => o.id === Number(orgId))?.name ?? "org"}`,
      });
      onUpdated(updated);
    } catch (err: any) {
      toast({ title: err.message ?? "Update failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const current = orgs.find(o => o.id === user.organizationId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-foreground">Assign Organization</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {current && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[12px] font-medium text-foreground">Currently in: {current.name}</p>
                <p className="text-[11px] text-muted-foreground">{current.subdomain}.sentconnect.org</p>
              </div>
            </div>
          )}
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1">
              Select Organization
            </label>
            <select
              value={orgId}
              onChange={e => setOrgId(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] border border-border/60 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">— No Organization (platform user) —</option>
              {orgs.map(o => (
                <option key={o.id} value={String(o.id)}>
                  {o.name} ({o.subdomain}) · {o.userCount} users
                </option>
              ))}
            </select>
          </div>
          {orgId !== "" && (
            <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Will be accessible at{" "}
              <a
                href={`/${orgs.find(o => o.id === Number(orgId))?.subdomain ?? ""}/`}
                target="_blank"
                rel="noreferrer"
                className="text-[#132272] underline font-mono"
              >
                /{orgs.find(o => o.id === Number(orgId))?.subdomain}/
              </a>
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 text-[13px] font-semibold border border-border/60 rounded-lg hover:bg-muted/40 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#132272] text-white rounded-lg hover:bg-[#132272]/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SuperAdminPanel() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"platform-users" | "orgs" | "users">("platform-users");
  const [orgs, setOrgs] = useState<OrgWithStats[] | null>(null);
  const [allUsers, setAllUsers] = useState<PlatformUser[] | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [actionPending, setActionPending] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [confirmDeleteOrg, setConfirmDeleteOrg] = useState<OrgWithStats | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<PlatformUser | null>(null);
  const [assigningOrgUser, setAssigningOrgUser] = useState<PlatformUser | null>(null);
  const [editingOrgUser, setEditingOrgUser] = useState<PlatformUser | null>(null);
  const [addingUserToOrg, setAddingUserToOrg] = useState<OrgWithStats | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, orgsData, usersData] = await Promise.all([
        fetch("/api/super-admin/stats", { credentials: "include" }).then(r => r.json()),
        fetch("/api/super-admin/orgs", { credentials: "include" }).then(r => r.ok ? r.json() : []),
        fetch("/api/super-admin/users", { credentials: "include" }).then(r => r.ok ? r.json() : []),
      ]);
      setStats(statsData);
      setOrgs(Array.isArray(orgsData) ? orgsData : []);
      setAllUsers(Array.isArray(usersData) ? usersData : []);
    } catch {
      // silently degrade
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user && isPlatformRole(user.role)) {
      loadData();
    }
  }, [isLoading, user, loadData]);

  // ─── Org Actions ────────────────────────────────────────────────────────────

  async function toggleOrgStatus(org: OrgWithStats) {
    setToggling(org.id);
    try {
      const newStatus = org.status === "active" ? "inactive" : "active";
      const res = await fetch(`/api/super-admin/orgs/${org.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setOrgs(prev => prev ? prev.map(o => o.id === org.id ? { ...o, status: updated.status } : o) : null);
      toast({ title: `Organization ${newStatus === "active" ? "activated" : "deactivated"}` });
    } catch {
      toast({ title: "Failed to update organization", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  }

  async function deleteOrg(org: OrgWithStats) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/super-admin/orgs/${org.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to delete organization");
      }
      setOrgs(prev => prev ? prev.filter(o => o.id !== org.id) : null);
      setStats(prev => prev ? { ...prev, totalOrgs: prev.totalOrgs - 1 } : null);
      setConfirmDeleteOrg(null);
      toast({ title: `Organization "${org.name}" deleted` });
    } catch (err: any) {
      toast({ title: err.message ?? "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  async function deleteUser(targetUser: PlatformUser) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/super-admin/users/${targetUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to delete user");
      }
      setAllUsers(prev => prev ? prev.filter(u => u.id !== targetUser.id) : null);
      setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : null);
      setConfirmDeleteUser(null);
      toast({ title: `User "${targetUser.name}" deleted` });
    } catch (err: any) {
      toast({ title: err.message ?? "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  // ─── User Actions ────────────────────────────────────────────────────────────

  async function handleUserAction(action: string, targetUser: PlatformUser) {
    if (action === "impersonate") {
      await impersonate(targetUser);
      return;
    }
    if (action === "edit") {
      setEditingUser(targetUser);
      return;
    }
    if (action === "delete") {
      setConfirmDeleteUser(targetUser);
      return;
    }
    if (action === "assign-org") {
      setAssigningOrgUser(targetUser);
      return;
    }
    if (action === "edit-org-user") {
      setEditingOrgUser(targetUser);
      return;
    }

    setActionPending(targetUser.id);
    try {
      let url = `/api/super-admin/users/${targetUser.id}`;
      let method = "POST";
      let body: object | undefined;

      if (action === "reset-password") {
        url = `/api/super-admin/users/${targetUser.id}/reset-password`;
      } else if (["lock", "unlock", "suspend", "unsuspend"].includes(action)) {
        url = `/api/super-admin/users/${targetUser.id}/${action}`;
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Action failed");
      }
      const data = await res.json();

      if (action === "reset-password") {
        setResetLink(data.resetUrl);
      } else {
        const updatedUser: PlatformUser = data.user;
        setAllUsers(prev => prev ? prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u) : prev);
        toast({ title: `User ${action}ed successfully` });
      }
    } catch (err: any) {
      toast({ title: err.message ?? "Action failed", variant: "destructive" });
    } finally {
      setActionPending(null);
    }
  }

  async function impersonate(targetUser: PlatformUser) {
    setActionPending(targetUser.id);
    try {
      const res = await fetch(`/api/super-admin/impersonate/${targetUser.id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: `Now impersonating ${targetUser.name}` });
      const orgSubdomain = (orgs ?? []).find(o => o.name === targetUser.organization)?.subdomain;
      window.location.href = orgSubdomain ? `/${orgSubdomain}/` : "/";
    } catch {
      toast({ title: "Impersonation failed", variant: "destructive" });
      setActionPending(null);
    }
  }

  async function deactivatePlatformUser(targetUser: PlatformUser) {
    setActionPending(targetUser.id);
    try {
      const res = await fetch(`/api/super-admin/users/${targetUser.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetUser.status === "active" ? "inactive" : "active" }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setAllUsers(prev => prev ? prev.map(u => u.id === updated.id ? { ...u, ...updated } : u) : prev);
      toast({ title: `User ${updated.status === "active" ? "activated" : "deactivated"}` });
    } catch {
      toast({ title: "Failed to update user", variant: "destructive" });
    } finally {
      setActionPending(null);
    }
  }

  // ─── Derived data ─────────────────────────────────────────────────────────────

  const platformUsers = (allUsers ?? []).filter(u => isPlatformRole(u.role));

  const filteredUsers = (allUsers ?? []).filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.organization ?? "").toLowerCase().includes(q)
    );
  });

  const usersByOrg = filteredUsers.reduce<Record<string, PlatformUser[]>>((acc, u) => {
    const key = u.organization ?? "No Organization";
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});

  const orgSubdomainMap = (orgs ?? []).reduce<Record<string, string>>((acc, o) => {
    acc[o.name] = o.subdomain;
    return acc;
  }, {});

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Modals */}
      {showCreateModal && (
        <CreatePlatformUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={u => {
            setAllUsers(prev => prev ? [...prev, u] : [u]);
            setShowCreateModal(false);
          }}
        />
      )}
      {editingUser && (
        <EditPermissionsModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={u => {
            setAllUsers(prev => prev ? prev.map(x => x.id === u.id ? { ...x, ...u } : x) : prev);
            setEditingUser(null);
          }}
        />
      )}
      {resetLink && <ResetLinkModal resetUrl={resetLink} onClose={() => setResetLink(null)} />}
      {showCreateOrg && (
        <CreateOrgModal
          onClose={() => setShowCreateOrg(false)}
          onCreated={org => {
            setOrgs(prev => prev ? [...prev, org] : [org]);
            setStats(prev => prev ? { ...prev, totalOrgs: prev.totalOrgs + 1 } : null);
            setShowCreateOrg(false);
          }}
        />
      )}
      {confirmDeleteOrg && (
        <ConfirmDeleteModal
          title={`Delete "${confirmDeleteOrg.name}"?`}
          description={`This will permanently delete the organization and clear the org reference from all its users and posts. This cannot be undone.`}
          confirmLabel="Delete Organization"
          loading={deleting}
          onConfirm={() => deleteOrg(confirmDeleteOrg)}
          onClose={() => setConfirmDeleteOrg(null)}
        />
      )}
      {confirmDeleteUser && (
        <ConfirmDeleteModal
          title={`Delete "${confirmDeleteUser.name}"?`}
          description={`This permanently removes the user account and all their session data. Their posts will remain but be anonymized. This cannot be undone.`}
          confirmLabel="Delete User"
          loading={deleting}
          onConfirm={() => deleteUser(confirmDeleteUser)}
          onClose={() => setConfirmDeleteUser(null)}
        />
      )}
      {assigningOrgUser && (
        <AssignOrgModal
          user={assigningOrgUser}
          orgs={orgs ?? []}
          onClose={() => setAssigningOrgUser(null)}
          onUpdated={updated => {
            setAllUsers(prev => prev ? prev.map(u => u.id === updated.id ? { ...u, ...updated } : u) : prev);
            setAssigningOrgUser(null);
          }}
        />
      )}
      {editingOrgUser && (
        <EditOrgUserModal
          user={editingOrgUser}
          onClose={() => setEditingOrgUser(null)}
          onUpdated={updated => {
            setAllUsers(prev => prev ? prev.map(u => u.id === updated.id ? { ...u, ...updated } : u) : prev);
            setEditingOrgUser(null);
          }}
        />
      )}
      {addingUserToOrg && (
        <CreateOrgUserModal
          org={addingUserToOrg}
          onClose={() => setAddingUserToOrg(null)}
          onCreated={newUser => {
            setAllUsers(prev => prev ? [newUser, ...prev] : [newUser]);
            setOrgs(prev => prev ? prev.map(o =>
              o.id === addingUserToOrg.id ? { ...o, userCount: o.userCount + 1 } : o
            ) : prev);
            setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers + 1 } : null);
            setAddingUserToOrg(null);
          }}
        />
      )}

      {/* Header */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #132272 0%, #1e3a8a 100%)" }}
      >
        <div className="p-3 bg-white/15 rounded-xl">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-[20px] font-extrabold text-white tracking-tight">Platform Admin</h1>
          <p className="text-white/65 text-sm mt-0.5">
            Global view — no organization filter applied.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wide">Signed in as</span>
          <span className="text-[13px] font-semibold text-white/90">{user?.name}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${roleBadge(user?.role ?? "").bg}`}>
            {roleBadge(user?.role ?? "").label}
          </span>
        </div>
      </div>

      {/* Platform Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-border/60 animate-pulse" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Organizations" value={stats.totalOrgs} icon={<Building2 className="h-5 w-5" />} />
          <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Total Posts" value={stats.totalPosts} icon={<FileText className="h-5 w-5" />} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 w-fit border border-border/40">
        <TabButton active={activeTab === "platform-users"} onClick={() => setActiveTab("platform-users")}>
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Platform Users</span>
        </TabButton>
        <TabButton active={activeTab === "orgs"} onClick={() => setActiveTab("orgs")}>
          <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Organizations</span>
        </TabButton>
        <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> All Users</span>
        </TabButton>
      </div>

      {/* ─── Tab: Platform Users ──────────────────────────────────────────────── */}
      {activeTab === "platform-users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-foreground">Platform Team</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Manage super admins, platform admins, and platform managers</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold bg-[#132272] text-white rounded-lg hover:bg-[#132272]/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Platform User
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-border/60 animate-pulse" />)}
            </div>
          ) : platformUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
              <ShieldAlert className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm font-semibold text-foreground">No platform users yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
              {platformUsers.map((u, idx) => {
                const badge = roleBadge(u.role);
                const isSelf = u.id === user?.id;
                const perms = u.role === "platform_manager" ? parsePerms(u.permissions) : null;

                return (
                  <div key={u.id} className={`px-5 py-4 ${idx < platformUsers.length - 1 ? "border-b border-border/40" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={u.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-[11px] font-bold bg-[#132272]/10 text-[#132272]">
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-foreground">{u.name}</span>
                          {isSelf && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#132272]/10 text-[#132272]">You</span>}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.bg}`}>{badge.label}</span>
                          {u.status !== "active" && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusBadge(u.status)}`}>
                              {u.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {u.role === "platform_manager" && !isSelf && (
                          <button
                            onClick={() => setEditingUser(u)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/50 transition-colors"
                          >
                            <Edit3 className="h-3 w-3" /> Edit
                          </button>
                        )}
                        {u.role !== "super_admin" && !isSelf && (
                          <>
                            <button
                              onClick={() => deactivatePlatformUser(u)}
                              disabled={actionPending === u.id}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                                u.status === "active"
                                  ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                                  : "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                              } disabled:opacity-40`}
                            >
                              {actionPending === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : u.status === "active" ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                              {u.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                            {user?.role === "super_admin" && (
                              <button
                                onClick={() => setConfirmDeleteUser(u)}
                                title="Delete user"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-border/50 hover:border-red-200 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {perms && (
                      <div className="mt-2 ml-12 flex flex-wrap gap-1">
                        {PERM_LABELS.filter(p => perms[p.key]).map(p => (
                          <span key={p.key} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                            {p.label}
                          </span>
                        ))}
                        {PERM_LABELS.filter(p => perms[p.key]).length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic">No permissions assigned</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Organizations ───────────────────────────────────────────────── */}
      {activeTab === "orgs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-foreground">Organizations</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Manage all tenant organizations and their subdomains</p>
            </div>
            {user?.role === "super_admin" && (
              <button
                onClick={() => setShowCreateOrg(true)}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold bg-[#132272] text-white rounded-lg hover:bg-[#132272]/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New Organization
              </button>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-border/60 animate-pulse" />)}
            </div>
          ) : !orgs || orgs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm font-semibold text-foreground">No organizations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orgs.map(org => (
                <div key={org.id} className="bg-white rounded-xl border border-border/60 shadow-sm px-5 py-4 flex items-center gap-4">
                  <div className="p-2.5 bg-muted/50 rounded-lg flex-shrink-0">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[14px] text-foreground truncate">{org.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${org.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {org.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[12px] text-muted-foreground">
                      <a
                        href={`/${org.subdomain}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:text-[#132272] hover:underline transition-colors"
                        title={`Open ${org.name} portal`}
                      >
                        <Globe className="h-3 w-3" />/{org.subdomain}/
                      </a>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{org.userCount} users</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{org.postCount} posts</span>
                      <span>Created {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setAddingUserToOrg(org)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#00C4A7]/10 text-[#00C4A7] hover:bg-[#00C4A7]/20 border border-[#00C4A7]/20 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add User
                    </button>
                    <a
                      href={`/${org.subdomain}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#132272]/5 text-[#132272] hover:bg-[#132272]/10 border border-[#132272]/10 transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5" /> Open
                    </a>
                    <button
                      onClick={() => toggleOrgStatus(org)}
                      disabled={toggling === org.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                        org.status === "active"
                          ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      {toggling === org.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : org.status === "active" ? <><XCircle className="h-3.5 w-3.5" /> Suspend</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Activate</>}
                    </button>
                    {user?.role === "super_admin" && (
                      <button
                        onClick={() => setConfirmDeleteOrg(org)}
                        title="Delete organization"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-border/50 hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: All Users ───────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or organization…"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-border/60 rounded-xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-border/60 animate-pulse" />)}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border py-16 text-center shadow-sm">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm font-semibold text-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(usersByOrg).map(([orgName, orgUsers]) => {
                const subdomain = orgSubdomainMap[orgName];
                return (
                  <div key={orgName}>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">{orgName}</span>
                      {subdomain && <span className="text-[11px] text-muted-foreground/60">{subdomain}.sentconnect.org</span>}
                    </div>
                    <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                      {orgUsers.map((u, idx) => {
                        const badge = roleBadge(u.role);
                        const isSelf = u.id === user?.id;
                        return (
                          <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${idx < orgUsers.length - 1 ? "border-b border-border/40" : ""}`}>
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={u.avatarUrl ?? undefined} />
                              <AvatarFallback className="text-[11px] font-bold bg-[#132272]/10 text-[#132272]">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] font-semibold text-foreground truncate">{u.name}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.bg}`}>{badge.label}</span>
                                {u.status !== "active" && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusBadge(u.status)}`}>
                                    {u.status}
                                  </span>
                                )}
                              </div>
                              <p className="text-[12px] text-muted-foreground truncate">{u.email}</p>
                            </div>
                            {actionPending === u.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
                            ) : (
                              <UserActionMenu
                                user={u}
                                currentUserId={user?.id ?? 0}
                                onAction={handleUserAction}
                                isSelf={isSelf}
                                canDelete={user?.role === "super_admin" || user?.role === "platform_admin"}
                                callerRole={user?.role}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <p className="text-[12px] text-muted-foreground text-right">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} across {Object.keys(usersByOrg).length} organization{Object.keys(usersByOrg).length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
