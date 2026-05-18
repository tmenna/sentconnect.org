import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { useLike } from "@/hooks/usePostActions";

interface Photo {
  id: number;
  url: string;
  caption?: string | null;
}

interface Author {
  id: number;
  name: string;
  avatarUrl?: string | null;
  organization?: string | null;
}

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  reportDate: string;
  /**
   * The OpenAPI spec names this field `missionary`; the API currently serialises it
   * as `author`. Both are accepted here so the card works against both the generated
   * type (ReportWithDetails.missionary) and the live API response (author).
   */
  author?: Author;
  missionary?: Author;
  photos: Photo[];
  peopleReached?: number | null;
  location?: string | null;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
}

interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  church_planting: "Church Planting",
  leadership_training: "Leadership",
  humanitarian_work: "Humanitarian",
  education: "Education",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  church_planting: "#F59E0B",
  leadership_training: "#3B82F6",
  humanitarian_work: "#EF4444",
  education: "#10B981",
  other: "#6B7280",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PostCard({ post, onPress }: PostCardProps) {
  const colors = useColors();
  const categoryColor = CATEGORY_COLORS[post.category] ?? "#6B7280";
  const firstPhoto = post.photos?.[0];
  // API sends `author`; OpenAPI spec names the field `missionary`. Accept both.
  const authorInfo = post.author ?? post.missionary ?? { id: 0, name: "Unknown", avatarUrl: null };

  const { liked, likeCount, toggle: toggleLike } = useLike(
    post.id,
    post.likedByMe ?? false,
    post.likeCount ?? 0,
  );

  const handleLike = async (e: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          uri={authorInfo.avatarUrl}
          name={authorInfo.name}
          size={38}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.authorName, { color: colors.foreground }]}>
            {authorInfo.name}
          </Text>
          <View style={styles.metaRow}>
            {post.location ? (
              <Text
                style={[styles.metaText, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {post.location} · 
              </Text>
            ) : null}
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {formatDate(post.reportDate)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryColor + "18" },
          ]}
        >
          <Text
            style={[styles.categoryText, { color: categoryColor }]}
          >
            {CATEGORY_LABELS[post.category] ?? post.category}
          </Text>
        </View>
      </View>

      {/* Photo */}
      {firstPhoto ? (
        <Image
          source={{ uri: firstPhoto.url }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : null}

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {post.title}
        </Text>
        <Text
          style={[styles.description, { color: colors.mutedForeground }]}
          numberOfLines={3}
        >
          {post.description}
        </Text>
      </View>

      {/* Footer: impact badge + action bar */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {post.peopleReached ? (
          <View
            style={[
              styles.impactBadge,
              { backgroundColor: "#DCFCE7" },
            ]}
          >
            <Text style={[styles.impactText, { color: "#15803D" }]}>
              {post.peopleReached.toLocaleString()} reached
            </Text>
          </View>
        ) : (
          <View />
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleLike}
            style={styles.actionBtn}
            hitSlop={6}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? "#EF4444" : colors.mutedForeground}
            />
            {likeCount > 0 ? (
              <Text
                style={[
                  styles.actionCount,
                  { color: liked ? "#EF4444" : colors.mutedForeground },
                ]}
              >
                {likeCount}
              </Text>
            ) : null}
          </Pressable>

          <View style={styles.actionBtn}>
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={colors.mutedForeground}
            />
            {(post.commentCount ?? 0) > 0 ? (
              <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>
                {post.commentCount}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  categoryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.3,
  },
  photo: {
    width: "100%",
    height: 220,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 5,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
  },
  impactBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  impactText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
