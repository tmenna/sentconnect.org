import { useGetReport, getGetReportQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, type PostData } from "@/components/post-card";

export default function ReportDetail() {
  const params = useParams<{ id: string }>();
  const reportId = Number(params.id);

  const { data: report, isLoading, isError } = useGetReport(reportId, {
    query: { enabled: !!reportId, queryKey: getGetReportQueryKey(reportId) }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold text-foreground">Post not found</p>
        <Link href="/feed" className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to Feed
        </Link>
      </div>
    );
  }

  const post: PostData = {
    id: report.id,
    description: report.description,
    location: report.location,
    visibility: (report as any).visibility ?? "public",
    createdAt: report.createdAt,
    likeCount: (report as any).likeCount ?? 0,
    commentCount: (report as any).commentCount ?? 0,
    likedByMe: (report as any).likedByMe ?? false,
    author: (report as any).author ?? (report as any).missionary ?? { id: 0, name: "Unknown", avatarUrl: null },
    photos: (report as any).photos ?? [],
  };

  return (
    <div className="space-y-4">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        data-testid="link-back-timeline"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Feed
      </Link>

      <PostCard post={post} />
    </div>
  );
}
