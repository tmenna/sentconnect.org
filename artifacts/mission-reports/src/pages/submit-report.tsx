import { useAuth } from "@/components/auth-provider";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReport, useAddReportPhoto } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect, useLocation } from "wouter";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Plus, Trash2, Image as ImageIcon, Send, BookOpen, MapPin, Calendar, Tag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const initials = user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 16px 56px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Composer card */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

        {/* Top bar */}
        <div style={{ padding: "18px 20px 0", borderBottom: "1px solid #F1F5F9", paddingBottom: 14 }}>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>Share an Update</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>

            {/* Author row + main textarea */}
            <div style={{ padding: "16px 20px 0" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar style={{ width: 42, height: 42, flexShrink: 0 }}>
                  <AvatarImage src={user.avatarUrl ?? undefined} />
                  <AvatarFallback style={{ background: "#4F0A90", color: "#fff", fontSize: 14, fontWeight: 700 }}>{initials}</AvatarFallback>
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: "0 0 2px" }}>{user.name}</p>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem style={{ margin: 0 }}>
                        <FormControl>
                          <textarea
                            placeholder="What's happening in your field?"
                            {...field}
                            data-testid="input-report-desc"
                            style={{
                              width: "100%",
                              minHeight: 120,
                              border: "none",
                              outline: "none",
                              resize: "none",
                              fontSize: 15,
                              lineHeight: 1.65,
                              color: "#0F172A",
                              background: "transparent",
                              padding: 0,
                              marginTop: 6,
                              fontFamily: "inherit",
                            }}
                          />
                        </FormControl>
                        <FormMessage style={{ fontSize: 12 }} />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Title + compact meta row */}
            <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem style={{ margin: 0 }}>
                    <FormControl>
                      <input
                        placeholder="Give your update a title…"
                        {...field}
                        data-testid="input-report-title"
                        style={{
                          width: "100%",
                          height: 40,
                          padding: "0 14px",
                          borderRadius: 10,
                          border: "1px solid #E5E7EB",
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#0F172A",
                          background: "#F9FAFB",
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </FormControl>
                    <FormMessage style={{ fontSize: 12 }} />
                  </FormItem>
                )}
              />

              {/* Row: Category | Date | Location */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem style={{ margin: 0, flex: "1 1 140px", minWidth: 0 }}>
                      <FormControl>
                        <div style={{ position: "relative" }}>
                          <Tag style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#9CA3AF", pointerEvents: "none" }} />
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger
                              data-testid="select-report-category"
                              style={{ height: 36, paddingLeft: 28, fontSize: 13, borderRadius: 8, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151" }}
                            >
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key} style={{ fontSize: 13 }}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reportDate"
                  render={({ field }) => (
                    <FormItem style={{ margin: 0, flex: "1 1 130px", minWidth: 0 }}>
                      <FormControl>
                        <div style={{ position: "relative" }}>
                          <Calendar style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#9CA3AF", pointerEvents: "none", zIndex: 1 }} />
                          <input
                            type="date"
                            {...field}
                            data-testid="input-report-date"
                            style={{ width: "100%", height: 36, paddingLeft: 28, paddingRight: 10, borderRadius: 8, border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: 13, color: "#374151", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem style={{ margin: 0, flex: "1 1 130px", minWidth: 0 }}>
                      <FormControl>
                        <div style={{ position: "relative" }}>
                          <MapPin style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#9CA3AF", pointerEvents: "none" }} />
                          <input
                            placeholder="Location"
                            {...field}
                            data-testid="input-report-location"
                            style={{ width: "100%", height: 36, paddingLeft: 28, paddingRight: 10, borderRadius: 8, border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: 13, color: "#374151", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Photos section */}
            <div style={{ padding: "14px 20px 0" }}>
              <div style={{ borderRadius: 12, border: "1px solid #F1F5F9", background: "#FAFAFA", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ImageIcon style={{ width: 14, height: 14, color: "#94A3B8" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Photos & Videos</span>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <FormField
                        control={form.control}
                        name={`photos.${index}.url`}
                        render={({ field }) => (
                          <FormItem style={{ margin: 0 }}>
                            <FormControl>
                              <input placeholder="Image / video URL" {...field} style={{ width: "100%", height: 34, padding: "0 10px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", fontSize: 12, color: "#374151", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                            </FormControl>
                            <FormMessage style={{ fontSize: 11 }} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`photos.${index}.caption`}
                        render={({ field }) => (
                          <FormItem style={{ margin: 0 }}>
                            <FormControl>
                              <input placeholder="Caption (optional)" {...field} style={{ width: "100%", height: 32, padding: "0 10px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", fontSize: 12, color: "#374151", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    {index > 0 && (
                      <button type="button" onClick={() => remove(index)} style={{ padding: 6, marginTop: 2, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: "#9CA3AF", flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#9CA3AF"; }}>
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => append({ url: "", caption: "" })}
                  style={{ height: 32, borderRadius: 8, border: "1px dashed #D1D5DB", background: "transparent", color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "background 0.12s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F1F5F9"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <Plus style={{ width: 13, height: 13 }} /> Add photo
                </button>
              </div>
            </div>

            {/* Mission Moment toggle */}
            <FormField
              control={form.control}
              name="isMissionMoment"
              render={({ field }) => (
                <div style={{ padding: "12px 20px 0" }}>
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: field.value ? "1px solid #C4B5FD" : "1px solid #F1F5F9",
                      background: field.value ? "#FEFBFF" : "#FAFAFA",
                      cursor: "pointer",
                      transition: "all 0.12s",
                      textAlign: "left",
                    }}
                  >
                    <BookOpen style={{ width: 16, height: 16, color: field.value ? "#4F0A90" : "#94A3B8", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: field.value ? "#4F0A90" : "#374151" }}>Mark as Mission Moment</span>
                    <div style={{ width: 36, height: 20, borderRadius: 999, background: field.value ? "#4F0A90" : "#E2E8F0", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
                      <div style={{ position: "absolute", top: 2, left: field.value ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                    </div>
                  </button>
                </div>
              )}
            />

            {/* Actions */}
            <div style={{ padding: "16px 20px 18px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #F1F5F9", marginTop: 14 }}>
              <button
                type="button"
                onClick={() => window.history.back()}
                style={{ padding: "0 18px", height: 40, borderRadius: 10, border: "1px solid #E5E7EB", background: "transparent", fontSize: 14, fontWeight: 600, color: "#64748B", cursor: "pointer", transition: "background 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >Cancel</button>
              <Button
                type="submit"
                disabled={createReport.isPending}
                data-testid="btn-submit-report"
                style={{ flex: 1, height: 40, fontSize: 14, fontWeight: 700, borderRadius: 10, background: "#4F0A90", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 3px 12px rgba(79,10,144,0.3)", letterSpacing: "-0.01em", border: "none" }}
              >
                <Send style={{ width: 14, height: 14 }} />
                {createReport.isPending ? "Publishing…" : "Post Update"}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
