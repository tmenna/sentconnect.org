import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  updateUser,
  type ReportWithDetails,
  type UpdateUserBody,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [posts, setPosts] = useState<ReportWithDetails[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editBio, setEditBio] = useState(user?.bio ?? "");
  const [editLocation, setEditLocation] = useState(user?.location ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/users/${user.id}/reports`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data: unknown = await res.json();
          setPosts(Array.isArray(data) ? (data as ReportWithDetails[]) : []);
        }
      } finally {
        setIsLoadingPosts(false);
      }
    })();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setIsSaving(true);
    try {
      const patch: UpdateUserBody = {
        name: editName.trim() || undefined,
        bio: editBio.trim() || null,
        location: editLocation.trim() || null,
      };
      await updateUser(user.id, patch);
      await refreshUser();
      setIsEditing(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Could not save profile changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  if (!user) return null;

  const ProfileHeader = () => (
    <View>
      {/* Top header bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: topInset + 8,
          },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>
          Profile
        </Text>
        <View style={styles.topBarActions}>
          {isEditing ? (
            <>
              <Pressable
                onPress={() => setIsEditing(false)}
                style={styles.iconButton}
              >
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={colors.mutedForeground}
                />
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={[
                  styles.saveButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  setEditName(user.name);
                  setEditBio(user.bio ?? "");
                  setEditLocation(user.location ?? "");
                  setIsEditing(true);
                }}
                style={styles.iconButton}
              >
                <Ionicons
                  name="create-outline"
                  size={22}
                  color={colors.mutedForeground}
                />
              </Pressable>
              <Pressable onPress={handleLogout} style={styles.iconButton}>
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* User info card */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Avatar uri={user.avatarUrl} name={user.name} size={72} />

        {isEditing ? (
          <View style={styles.editFields}>
            <TextInput
              style={[
                styles.editInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Full name"
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              style={[
                styles.editInput,
                styles.editBio,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Bio (optional)"
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />
            <TextInput
              style={[
                styles.editInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Location (optional)"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {user.name}
            </Text>
            {user.bio ? (
              <Text
                style={[styles.profileBio, { color: colors.mutedForeground }]}
              >
                {user.bio}
              </Text>
            ) : null}
            {user.location ? (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.locationText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {user.location}
                </Text>
              </View>
            ) : null}
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text
                style={[styles.roleText, { color: colors.accentForeground }]}
              >
                {(user.role as string) === "field_user"
                  ? "Missionary"
                  : (user.role as string) === "admin"
                  ? "Admin"
                  : (user.role as string) === "super_admin"
                  ? "Platform Admin"
                  : user.role}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Posts header */}
      <View
        style={[
          styles.postsHeader,
          { borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.postsTitle, { color: colors.foreground }]}>
          Reports ({posts.length})
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoadingPosts ? (
        <View style={styles.container}>
          <ProfileHeader />
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 40 }}
          />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PostCard post={item} />}
          ListHeaderComponent={
            <View>
              <ProfileHeader />
              <View style={{ height: 12 }} />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="newspaper-outline"
                size={44}
                color={colors.mutedForeground}
              />
              <Text
                style={[styles.emptyTitle, { color: colors.foreground }]}
              >
                No reports yet
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.mutedForeground },
                ]}
              >
                Share your first field report from the Compose tab.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            Platform.OS === "web"
              ? { paddingBottom: 84 + 34 }
              : { paddingBottom: 20 }
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    minWidth: 60,
    alignItems: "center",
  },
  saveButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#fff",
  },
  profileCard: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 14,
  },
  profileInfo: {
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    letterSpacing: -0.3,
  },
  profileBio: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 4,
  },
  roleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  editFields: {
    width: "100%",
    gap: 10,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  editBio: {
    height: 80,
    textAlignVertical: "top",
  },
  postsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  postsTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    marginTop: 4,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
