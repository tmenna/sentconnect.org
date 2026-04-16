import { useAuth } from "@/components/auth-provider";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReport, useAddReportPhoto } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect, useLocation } from "wouter";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Image as ImageIcon, Send, FileText, BookOpen, Info } from "lucide-react";
import { format } from "date-fns";

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide more details in your report"),
  category: z.enum(["church_planting", "leadership_training", "humanitarian_work", "education", "other"]),
  reportDate: z.string(),
  location: z.string().optional(),
  isMissionMoment: z.boolean().default(false),
  photos: z.array(z.object({
    url: z.string().url("Must be a valid URL"),
    caption: z.string().optional()
  }))
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function SubmitReport() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const createReport = useCreateReport();
  const addPhoto = useAddReportPhoto();

  const urlCategory = new URLSearchParams(window.location.search).get("category") ?? "other";
  const validCategories = ["church_planting", "leadership_training", "humanitarian_work", "education", "other"];
  const preselectedCategory = validCategories.includes(urlCategory) ? urlCategory : "other";

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      category: preselectedCategory as ReportFormValues["category"],
      reportDate: format(new Date(), "yyyy-MM-dd"),
      location: user?.location || "",
      isMissionMoment: false,
      photos: [{ url: "", caption: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: "photos",
    control: form.control
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "missionary" && user.role !== "field_user") return <Redirect href="/" />;

  async function onSubmit(data: ReportFormValues) {
    try {
      const report = await createReport.mutateAsync({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          reportDate: new Date(data.reportDate).toISOString(),
          missionaryId: user!.id,
          location: data.location || null,
          isMissionMoment: data.isMissionMoment,
        } as any
      });

      // Add photos if provided
      const validPhotos = data.photos.filter(p => p.url);
      if (validPhotos.length > 0) {
        await Promise.all(
          validPhotos.map(photo => 
            addPhoto.mutateAsync({
              id: report.id,
              data: {
                url: photo.url,
                caption: photo.caption || null
              }
            })
          )
        );
      }

      toast({ title: "Report published successfully!" });
      setLocation(`/reports/${report.id}`);
    } catch (error) {
      toast({ 
        title: "Error submitting report", 
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">File a Report</h1>
        <p className="text-sm text-muted-foreground mt-1">Share what God is doing in your area of ministry.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Report Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. New Church Planted in Achi Village"
                      className="h-10 text-sm"
                      {...field}
                      data-testid="input-report-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm" data-testid="select-report-category">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-10 text-sm" {...field} data-testid="input-report-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Village, Region" className="h-10 text-sm" {...field} data-testid="input-report-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Report Body</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    Share the story — what happened, how lives were impacted, what God is doing.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Write your report here..."
                      className="min-h-[220px] text-sm leading-relaxed"
                      {...field}
                      data-testid="input-report-desc"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Mission Moment toggle */}
          <FormField
            control={form.control}
            name="isMissionMoment"
            render={({ field }) => (
              <div
                className={`rounded-xl border shadow-sm p-5 cursor-pointer transition-all ${
                  field.value
                    ? "border-[#132272]/30 bg-[#132272]/[0.03]"
                    : "bg-white border-border"
                }`}
                onClick={() => field.onChange(!field.value)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                    field.value ? "bg-[#132272] text-white" : "bg-muted/50 text-muted-foreground"
                  }`}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[14px] font-bold text-foreground">Mark as Mission Moments</p>
                      <span title="A mission moment in a church context is a dedicated segment designed to highlight, celebrate, and pray for God's work in the world. It is typically a 3–5 minute story, video, or presentation that connects people to the broader mission—locally or globally.">
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      A 3–5 minute story that highlights, celebrates, and invites prayer for what God is doing locally or globally.
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-10 h-6 rounded-full transition-all relative ${
                      field.value ? "bg-[#132272]" : "bg-muted"
                    }`}>
                      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        field.value ? "left-5" : "left-1"
                      }`} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          />

          <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" /> Photos & Videos
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Paste image or video URLs (jpg, png, mp4, webm) to enrich your report.</p>
              </div>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start bg-muted/40 p-4 rounded-lg border border-border">
                <div className="flex-1 space-y-3 w-full">
                  <FormField
                    control={form.control}
                    name={`photos.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://…" className="h-9 text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`photos.${index}.caption`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Caption (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Describe this photo" className="h-9 text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/8 sm:mt-6 self-end sm:self-auto flex-shrink-0"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs border-dashed text-muted-foreground hover:text-foreground"
              onClick={() => append({ url: "", caption: "" })}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Photo
            </Button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 px-5 text-sm font-semibold gap-1.5"
              disabled={createReport.isPending}
              data-testid="btn-submit-report"
            >
              <Send className="h-3.5 w-3.5" />
              {createReport.isPending ? "Publishing…" : "Publish Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
