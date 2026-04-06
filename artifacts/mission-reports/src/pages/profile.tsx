import { useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateUser, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { User, MapPin, Building, Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpload } from "@workspace/object-storage-web";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  organization: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const updateUser = useUpdateUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Profile saved" });
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
      onError: () => {
        toast({ title: "Could not save profile", variant: "destructive" });
      }
    }
  });

  const { uploadFile, isUploading } = useUpload({
    onSuccess: async (response) => {
      const avatarUrl = `/api/storage${response.objectPath}`;
      setPreviewUrl(avatarUrl);
      updateUser.mutate({
        id: user!.id,
        data: { avatarUrl },
      });
    },
    onError: () => {
      toast({ title: "Photo upload failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      organization: user?.organization || "",
    }
  });

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;

  const displayAvatar = previewUrl ?? user.avatarUrl ?? undefined;
  const initials = user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be smaller than 10 MB", variant: "destructive" });
      return;
    }
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    await uploadFile(file);
  }

  function onSubmit(data: ProfileFormValues) {
    updateUser.mutate({
      id: user!.id,
      data: {
        name: data.name,
        bio: data.bio || null,
        location: data.location || null,
        organization: data.organization || null,
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {(user.role === "missionary" || user.role === "field_user")
            ? "Your profile is visible to church admins and on your reports."
            : "Your admin account details."}
        </p>
      </div>

      {/* Photo upload card */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-4">
        <p className="text-sm font-semibold text-foreground mb-4">Profile Photo</p>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="h-20 w-20 ring-2 ring-border">
              <AvatarImage src={displayAvatar} alt={user.name} className="object-cover" />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-avatar-file"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 text-sm gap-1.5"
              data-testid="btn-avatar-upload"
            >
              {isUploading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
              ) : (
                <><Camera className="h-3.5 w-3.5" /> Upload Photo</>
              )}
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
              <Button
                type="submit"
                disabled={updateUser.isPending}
                className="h-9 px-5 text-sm font-medium"
                data-testid="btn-profile-submit"
              >
                {updateUser.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
