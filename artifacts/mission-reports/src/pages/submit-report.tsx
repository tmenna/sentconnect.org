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
import { Plus, Trash2, Image as ImageIcon, Send, BookOpen, Info } from "lucide-react";
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

      const validPhotos = data.photos.filter(p => p.url);
      if (validPhotos.length > 0) {
        await Promise.all(
          validPhotos.map(photo =>
            addPhoto.mutateAsync({
              id: report.id,
              data: { url: photo.url, caption: photo.caption || null }
            })
          )
        );
      }

      toast({ title: "Report published successfully!" });
      setLocation(`/reports/${report.id}`);
    } catch {
      toast({
        title: "Error submitting report",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: "#1E293B",
    marginBottom: 6,
    display: "block",
    letterSpacing: "-0.01em",
  };

  const inputClass = "h-12 text-base border-gray-200 focus:border-[#111827] focus:ring-[#111827]/20 rounded-xl";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 0 48px" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F5F5F5", borderRadius: 999, padding: "5px 14px", marginBottom: 14 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#111827" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", letterSpacing: "0.06em" }}>MISSION REPORT</span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 8px" }}>
          File a Report
        </h1>
        <p style={{ fontSize: 16, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
          Share what God is doing in your area of ministry.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Core fields ── */}
          <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #F3F4F6", padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 22 }}>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={labelStyle}>Report Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. New Church Planted in Achi Village"
                      className={inputClass}
                      {...field}
                      data-testid="input-report-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={labelStyle}>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass} data-testid="select-report-category">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key} style={{ fontSize: 14 }}>{label}</SelectItem>
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
                    <FormLabel style={labelStyle}>Date</FormLabel>
                    <FormControl>
                      <Input type="date" className={inputClass} {...field} data-testid="input-report-date" />
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
                    <FormLabel style={labelStyle}>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Village, Region" className={inputClass} {...field} data-testid="input-report-location" />
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
                  <FormLabel style={labelStyle}>Report Body</FormLabel>
                  <FormDescription style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>
                    Share the story — what happened, how lives were impacted, what God is doing.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Write your report here..."
                      className="min-h-[240px] text-base leading-relaxed border-gray-200 focus:border-[#111827] focus:ring-[#111827]/20 rounded-xl"
                      {...field}
                      data-testid="input-report-desc"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── Mission Moment toggle ── */}
          <FormField
            control={form.control}
            name="isMissionMoment"
            render={({ field }) => (
              <div
                style={{
                  borderRadius: 16,
                  border: field.value ? "1.5px solid #C4B5FD" : "1.5px solid #E9E9E9",
                  background: field.value ? "#FEFBFF" : "#FFFFFF",
                  padding: "20px 24px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onClick={() => field.onChange(!field.value)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{
                    padding: 10,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: field.value ? "#111827" : "#F1F5F9",
                    color: field.value ? "#FFFFFF" : "#94A3B8",
                    transition: "all 0.15s",
                  }}>
                    <BookOpen style={{ width: 20, height: 20 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>Mark as Mission Moments</p>
                      <span title="A mission moment in a church context is a dedicated segment designed to highlight, celebrate, and pray for God's work in the world. It is typically a 3–5 minute story, video, or presentation that connects people to the broader mission—locally or globally.">
                        <Info style={{ width: 15, height: 15, color: "#94A3B8", cursor: "help" }} />
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
                      A 3–5 minute story that highlights, celebrates, and invites prayer for what God is doing locally or globally.
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <div style={{
                      width: 44,
                      height: 24,
                      borderRadius: 999,
                      background: field.value ? "#111827" : "#E2E8F0",
                      position: "relative",
                      transition: "background 0.2s",
                    }}>
                      <div style={{
                        position: "absolute",
                        top: 3,
                        left: field.value ? 23 : 3,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                        transition: "left 0.2s",
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          />

          {/* ── Photos ── */}
          <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E9E9E9", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <ImageIcon style={{ width: 18, height: 18, color: "#111827" }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>Photos & Videos</h3>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Paste image or video URLs (jpg, png, mp4, webm) to enrich your report.</p>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: 12, background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E9E9E9" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <FormField
                      control={form.control}
                      name={`photos.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://…" className="h-11 text-sm" {...field} />
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
                          <FormLabel style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Caption (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Describe this photo" className="h-11 text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      style={{ marginTop: 28, padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#374151", flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ url: "", caption: "" })}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 10,
                border: "1.5px dashed #D1D5DB",
                background: "transparent",
                color: "#111827",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F5F5F5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <Plus style={{ width: 16, height: 16 }} /> Add Photo
            </button>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "transparent", fontSize: 15, fontWeight: 600, color: "#475569", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={createReport.isPending}
              data-testid="btn-submit-report"
              style={{
                height: 48,
                padding: "0 28px",
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 12,
                background: "#111827",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(135,5,250,0.28)",
                letterSpacing: "-0.01em",
              }}
            >
              <Send style={{ width: 16, height: 16 }} />
              {createReport.isPending ? "Publishing…" : "Publish Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
