import { useAuth } from "@/components/auth-provider";
import { Redirect, Link } from "wouter";
import {
  useGetStats, getGetStatsQueryKey,
  useListUsers, getListUsersQueryKey,
} from "@workspace/api-client-react";
import { Users, FileText, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-[26px] font-bold text-foreground leading-none">{value}</p>
          <p className="text-[12px] text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: users, isLoading: usersLoading } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "admin") return <Redirect href="/" />;

  const nonAdmins = users?.filter((u: any) => u.role !== "admin") ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of all users and activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statsLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total posts" value={stats?.totalPosts ?? 0} icon={<FileText className="h-4.5 w-4.5" />} />
            <StatCard label="Active users" value={nonAdmins.length} icon={<Users className="h-4.5 w-4.5" />} />
            <StatCard label="Admin" value={user.name.split(" ")[0]} icon={<Shield className="h-4.5 w-4.5" />} />
          </>
        )}
      </div>

      {/* User list */}
      <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-[14px] text-foreground">Users</h2>
          <span className="ml-auto text-[12px] text-muted-foreground">{nonAdmins.length} members</span>
        </div>

        {usersLoading ? (
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : nonAdmins.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No users yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {nonAdmins.map((u: any) => (
              <Link key={u.id} href={`/missionaries/${u.id}`}>
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer group">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-foreground group-hover:text-primary transition-colors">{u.name}</p>
                    <p className="text-[12px] text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-right">
                    {u.location && (
                      <p className="text-[12px] text-muted-foreground">{u.location}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/60">
                      Joined {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
