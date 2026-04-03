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
import { User, MapPin, Building, Image as ImageIcon } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  organization: z.string().optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      organization: user?.organization || "",
      avatarUrl: user?.avatarUrl || "",
    }
  });

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Redirect href="/login" />;

  function onSubmit(data: ProfileFormValues) {
    updateUser.mutate({
      id: user!.id,
      data: {
        name: data.name,
        bio: data.bio || null,
        location: data.location || null,
        organization: data.organization || null,
        avatarUrl: data.avatarUrl || null,
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user.role === "missionary"
            ? "Your profile is visible to church admins and on your reports."
            : "Your admin account details."}
        </p>
      </div>

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

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" /> Avatar URL
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.jpg" className="h-10 text-sm" {...field} data-testid="input-profile-avatar" />
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

            {user.role === 'missionary' && (
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Biography</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your calling and mission..."
                        className="resize-none text-sm h-28"
                        {...field}
                        data-testid="input-profile-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
