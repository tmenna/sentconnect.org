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
import { Plus, Trash2, Image as ImageIcon, Send, FileText, Target } from "lucide-react";
import { format } from "date-fns";

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide more details in your report"),
  category: z.enum(["church_planting", "leadership_training", "humanitarian_work", "education", "other"]),
  reportDate: z.string(),
  location: z.string().optional(),
  peopleReached: z.coerce.number().int().min(0).optional().or(z.literal('')),
  leadersTrainer: z.coerce.number().int().min(0).optional().or(z.literal('')),
  communitiesServed: z.coerce.number().int().min(0).optional().or(z.literal('')),
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

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "other",
      reportDate: format(new Date(), "yyyy-MM-dd"),
      location: user?.location || "",
      peopleReached: "",
      leadersTrainer: "",
      communitiesServed: "",
      photos: [{ url: "", caption: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: "photos",
    control: form.control
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;
  if (user.role !== "missionary") return <Redirect href="/" />;

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
          peopleReached: data.peopleReached === "" ? null : Number(data.peopleReached),
          leadersTrainer: data.leadersTrainer === "" ? null : Number(data.leadersTrainer),
          communitiesServed: data.communitiesServed === "" ? null : Number(data.communitiesServed),
        }
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
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-serif font-bold text-foreground flex items-center justify-center sm:justify-start gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Write Field Report
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Share what God is doing in your area.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="bg-muted/20 pb-4 border-b border-border/40">
              <CardTitle className="text-xl">The Story</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Report Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Joyful Baptisms in the River" className="text-lg py-6 font-serif" {...field} data-testid="input-report-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus Area</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-report-category">
                            <SelectValue placeholder="Select category" />
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
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-report-date" />
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
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Village, Region" {...field} data-testid="input-report-location" />
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
                    <FormLabel className="text-base">Field Notes</FormLabel>
                    <FormDescription>Share the narrative. What happened? How were lives changed?</FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your story here..." 
                        className="min-h-[250px] text-base leading-relaxed p-4" 
                        {...field} 
                        data-testid="input-report-desc"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 pb-4 border-b border-border/40">
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Impact Metrics
              </CardTitle>
              <CardDescription>Optional quantitative data to track overall ministry progress.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="peopleReached"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>People Reached</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" min="0" {...field} data-testid="input-metric-people" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leadersTrainer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leaders Trained</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" min="0" {...field} data-testid="input-metric-leaders" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="communitiesServed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Communities Served</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" min="0" {...field} data-testid="input-metric-communities" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 pb-4 border-b border-border/40">
              <CardTitle className="text-xl flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Photos
              </CardTitle>
              <CardDescription>Attach image URLs to bring your story to life.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start bg-muted/30 p-4 rounded-lg border border-border/50">
                  <div className="flex-1 space-y-4 w-full">
                    <FormField
                      control={form.control}
                      name={`photos.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
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
                          <FormLabel className="text-xs">Caption (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Describe this photo" {...field} />
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
                      className="text-destructive hover:bg-destructive/10 sm:mt-8 self-end sm:self-auto"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-dashed"
                onClick={() => append({ url: "", caption: "" })}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Another Photo
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              className="gap-2 px-8" 
              disabled={createReport.isPending}
              data-testid="btn-submit-report"
            >
              <Send className="h-4 w-4" />
              {createReport.isPending ? "Publishing..." : "Publish Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
