import { useAuth } from "@/components/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateUser, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        toast({ title: "Profile updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
      onError: (error) => {
        toast({ 
          title: "Error updating profile", 
          description: error.message || "Please try again later",
          variant: "destructive"
        });
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

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
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
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and public presence.</p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>This information is visible to {user.role === 'missionary' ? 'church admins and on your public reports' : 'other church admins'}.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} data-testid="input-profile-name" />
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
                    <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" /> Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} data-testid="input-profile-avatar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} data-testid="input-profile-location" />
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
                      <FormLabel className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /> Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="Mission Agency" {...field} data-testid="input-profile-org" />
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
                      <FormLabel>Biography</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your calling and mission..." 
                          className="h-32 resize-none" 
                          {...field} 
                          data-testid="input-profile-bio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateUser.isPending}
                  data-testid="btn-profile-submit"
                  className="min-w-32"
                >
                  {updateUser.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
