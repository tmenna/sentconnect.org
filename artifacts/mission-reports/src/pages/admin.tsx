import { useAuth } from "@/components/auth-provider";
import { Redirect, Link } from "wouter";
import { 
  useGetStats, getGetStatsQueryKey, 
  useListReports, getListReportsQueryKey,
  useListUsers, getListUsersQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Target, Heart, FileText, Activity, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/constants";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [filterMissionary, setFilterMissionary] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: stats } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  const { data: activity } = useGetRecentActivity({ limit: 5 }, {
    query: { queryKey: getGetRecentActivityQueryKey({ limit: 5 }) }
  });

  const { data: missionaries } = useListUsers({ role: "missionary" }, {
    query: { queryKey: getListUsersQueryKey({ role: "missionary" }) }
  });

  const { data: reports, isLoading: loadingReports } = useListReports(
    { 
      missionaryId: filterMissionary !== "all" ? Number(filterMissionary) : null,
      category: filterCategory !== "all" ? filterCategory as any : null,
      limit: 20
    },
    { 
      query: { 
        queryKey: getListReportsQueryKey({ 
          missionaryId: filterMissionary !== "all" ? Number(filterMissionary) : null,
          category: filterCategory !== "all" ? filterCategory as any : null,
          limit: 20
        }) 
      } 
    }
  );

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "admin") return <Redirect href="/" />;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Global ministry impact and recent activities.</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-full"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Missionaries</p>
                <h3 className="text-2xl font-bold font-serif">{stats.totalMissionaries}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-full"><FileText className="h-6 w-6" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <h3 className="text-2xl font-bold font-serif">{stats.totalReports}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 text-green-600 rounded-full"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">People Reached</p>
                <h3 className="text-2xl font-bold font-serif">{stats.totalPeopleReached.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-600 rounded-full"><Target className="h-6 w-6" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leaders Trained</p>
                <h3 className="text-2xl font-bold font-serif">{stats.totalLeadersTrained.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Field Reports</CardTitle>
                  <CardDescription>All submitted reports</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filterMissionary} onValueChange={setFilterMissionary}>
                    <SelectTrigger className="w-[160px]" data-testid="filter-missionary">
                      <SelectValue placeholder="All Missionaries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Missionaries</SelectItem>
                      {missionaries?.map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[160px]" data-testid="filter-category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingReports ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">Loading reports...</div>
              ) : reports && reports.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4">
                      <Avatar className="h-10 w-10 mt-1">
                        <AvatarImage src={report.missionary.avatarUrl || undefined} />
                        <AvatarFallback>{report.missionary.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Link href={`/reports/${report.id}`} className="font-medium hover:text-primary transition-colors truncate">
                            {report.title}
                          </Link>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(report.reportDate), "MMM d")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Link href={`/missionaries/${report.missionaryId}`} className="hover:text-foreground">
                            {report.missionary.name}
                          </Link>
                          <span>•</span>
                          <span className="truncate">{report.location || 'Unknown location'}</span>
                        </div>
                        <Badge variant={CATEGORY_COLORS[report.category]} className="text-xs px-2 py-0.5 font-normal">
                          {CATEGORY_LABELS[report.category]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">No reports match the selected filters.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activity && activity.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {activity.map((report) => (
                    <Link key={`activity-${report.id}`} href={`/reports/${report.id}`} className="block p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-primary/10 rounded-full p-1.5 text-primary shrink-0">
                          <FileText className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium text-foreground">{report.missionary.name}</span> published a new report: <span className="font-medium">{report.title}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(report.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">No recent activity.</div>
              )}
            </CardContent>
          </Card>
          
          {stats && stats.reportsByCategory && (
            <Card>
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg">Reports by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {stats.reportsByCategory.map(cat => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{CATEGORY_LABELS[cat.category] || cat.category}</span>
                        <span className="font-medium">{cat.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.max(2, (cat.count / stats.totalReports) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
      </div>
    </div>
  );
}
