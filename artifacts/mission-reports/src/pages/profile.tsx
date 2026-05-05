import { useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { User, MapPin, Building, Camera, Loader2, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpload } from "@workspace/object-storage-web";

/* ── Schemas ── */
const adminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  orgName: z.string().min(2, "Organization name must be at least 2 characters"),
  orgAddress: z.string().optional(),
});
type AdminFormValues = z.infer<typeof adminSchema>;

const fieldUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  organization: z.string().optional(),
});
type FieldUserFormValues = z.infer<typeof fieldUserSchema>;

/* ── Shared upload + save logic ── */
function useProfileUpload(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const updateUser = useUpdateUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Saved" });
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
      onError: () => {
        toast({ title: "Could not save", variant: "destructive" });
      },
    },
  });

  const { uploadFile, isUploading } = useUpload({
    onSuccess: async (response) => {
      const avatarUrl = `/api/storage${response.objectPath}`;
      setPreviewUrl(avatarUrl);
      updateUser.mutate({ id: userId, data: { avatarUrl } });
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" }); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be smaller than 10 MB", variant: "destructive" }); return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    await uploadFile(file);
  }

  return { fileInputRef, previewUrl, isUploading, updateUser, handleFileChange };
}

/* ── Admin / Org view ── */
function AdminProfile() {
  const { user } = useAuth();
  const { fileInputRef, previewUrl, isUploading, updateUser, handleFileChange } = useProfileUpload(user!.id);

  const nameParts = (user!.name || "").split(" ");
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    values: {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      orgName: user!.organization || "",
      orgAddress: user!.location || "",
    },
  });

  function onSubmit(data: AdminFormValues) {
    updateUser.mutate({
      id: user!.id,
      data: {
        name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
        organization: data.orgName || null,
        location: data.orgAddress || null,
        bio: null,
      },
    });
  }

  const displayAvatar = previewUrl ?? user!.avatarUrl ?? undefined;
  const initials = user!.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "O";

  return (
    <div className="max-w-lg mx-auto py-6">
      <div className="flex items-start gap-4 mb-7">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
          <Building2 className="h-5 w-5" style={{ color: "#0268CE" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 4 }}>Organization Settings</h1>
          <p style={{ fontSize: 14, color: "#64748B" }}>Manage your organization's profile and admin details.</p>
        </div>
      </div>

      {/* Logo upload card */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-foreground">Organization Logo</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="h-20 w-20 ring-2 ring-border">
              <AvatarImage src={displayAvatar} alt={user!.name} className="object-cover" />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-3 leading-snug">
              Upload your organization's logo. This will appear across the platform.
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} data-testid="input-avatar-file" />
            <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="h-8 px-3 text-sm gap-1.5" data-testid="btn-avatar-upload">
              {isUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</> : <><Camera className="h-3.5 w-3.5" /> Upload Logo</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Org + Admin fields */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Organization Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-foreground">Organization Info</span>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="orgName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Organization Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Calvary Church" className="h-10 text-sm" {...field} data-testid="input-org-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orgAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Organization Address
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123 Main St, City, Country" className="h-10 text-sm" {...field} data-testid="input-org-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t border-border/60" />

            {/* Admin Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-foreground">Admin Info</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" /> First Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John" className="h-10 text-sm" {...field} data-testid="input-admin-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" /> Last Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" className="h-10 text-sm" {...field} data-testid="input-admin-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <Button type="submit" disabled={updateUser.isPending} className="h-10 px-6 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" data-testid="btn-profile-submit">
                {updateUser.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

/* ── Field user view (unchanged) ── */
function FieldUserProfile() {
  const { user } = useAuth();
  const { fileInputRef, previewUrl, isUploading, updateUser, handleFileChange } = useProfileUpload(user!.id);

  const form = useForm<FieldUserFormValues>({
    resolver: zodResolver(fieldUserSchema),
    values: {
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      organization: user?.organization || "",
    },
  });

  function onSubmit(data: FieldUserFormValues) {
    updateUser.mutate({
      id: user!.id,
      data: {
        name: data.name,
        bio: data.bio || null,
        location: data.location || null,
        organization: data.organization || null,
      },
    });
  }

  const displayAvatar = previewUrl ?? user!.avatarUrl ?? undefined;
  const initials = user!.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="max-w-lg mx-auto py-6">
      <div className="flex items-start gap-4 mb-7">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
          <User className="h-5 w-5" style={{ color: "#0268CE" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 4 }}>Profile Settings</h1>
          <p style={{ fontSize: 14, color: "#64748B" }}>Your profile is visible to church admins and on your reports.</p>
        </div>
      </div>

      {/* Photo upload card */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-foreground">Profile Photo</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="h-20 w-20 ring-2 ring-border">
              <AvatarImage src={displayAvatar} alt={user!.name} className="object-cover" />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-3 leading-snug">
              Upload a photo of yourself or your family. Shown on your posts and profile.
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} data-testid="input-avatar-file" />
            <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="h-8 px-3 text-sm gap-1.5" data-testid="btn-avatar-upload">
              {isUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</> : <><Camera className="h-3.5 w-3.5" /> Upload Photo</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile fields */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="h-10 text-sm" {...field} data-testid="input-profile-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Field Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" className="h-10 text-sm" {...field} data-testid="input-profile-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-muted-foreground" /> Sent From
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Home Church" className="h-10 text-sm" {...field} data-testid="input-profile-org" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short summary about yourself and your mission (max 250 characters)"
                      className="resize-none text-sm h-20"
                      maxLength={250}
                      {...field}
                      data-testid="input-profile-bio"
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <span className={`text-[11px] ml-auto ${(field.value?.length ?? 0) > 230 ? "text-amber-500" : "text-muted-foreground"}`}>
                      {field.value?.length ?? 0}/250
                    </span>
                  </div>
                </FormItem>
              )}
            />
            <div className="pt-1 flex justify-end">
              <Button type="submit" disabled={updateUser.isPending} className="h-10 px-6 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" data-testid="btn-profile-submit">
                {updateUser.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

/* ── Router ── */
export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;

  if (user.role === "admin" || user.role === "super_admin") {
    return <AdminProfile />;
  }
  return <FieldUserProfile />;
}
