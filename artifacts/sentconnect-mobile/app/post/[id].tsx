import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetReport, type ReportWithDetails } from "@workspace/api-client-react";
import { Avatar } from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useLike, useComments, type Comment } from "@/hooks/usePostActions";

type PostDetail = ReportWithDetails & {
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  author?: {
    id: number;
    name: string;
    avatarUrl?: string | null;
    organization?: string | null;
  };
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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface CommentRowProps {
  comment: Comment;
  currentUserId?: number;
  onDelete: (id: number) => void;
}

function CommentRow({ comment, currentUserId, onDelete }: CommentRowProps) {
  const colors = useColors();
  const isOwn = currentUserId === comment.author?.id;

  return (
    <View style={styles.commentRow}>
      <Avatar uri={comment.author?.avatarUrl} name={comment.author?.name ?? "?"} size={32} />
      <View style={[styles.commentBubble, { backgroundColor: colors.muted }]}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, { color: colors.foreground }]}>
            {comment.author?.name ?? "Unknown"}
          </Text>
          <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
            {formatDate(comment.createdAt)} · {formatTime(comment.createdAt)}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: colors.foreground }]}>
          {comment.text}
        </Text>
      </View>
      {isOwn && (
        <Pressable
          onPress={() => onDelete(comment.id)}
          hitSlop={8}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={14} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [draftText, setDraftText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const { data: rawData, isLoading, error } = useGetReport(postId);
  const post = rawData as PostDetail | undefined;

  const { liked, likeCount, toggle: toggleLike } = useLike(
    postId,
    post?.likedByMe ?? false,
    post?.likeCount ?? 0,
  );

  const { comments, isLoading: commentsLoading, isPosting, fetchError: commentError, postComment, deleteComment } =
    useComments(postId);

  const handleLike = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike();
  };

  const handleSendComment = async () => {
    const text = draftText.trim();
    if (!text || isPosting) return;
    const ok = await postComment(text);
    if (ok) {
      setDraftText("");
      inputRef.current?.blur();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.flex, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={[styles.flex, styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Post not found
        </Text>
      </View>
    );
  }

  // API sends `author`; OpenAPI spec names the field `missionary`. Accept both.
  const authorInfo =
    (post as { author?: PostDetail["author"] }).author ??
    (post as { missionary?: PostDetail["author"] }).missionary ?? {
      id: 0,
      name: "Unknown",
      avatarUrl: null,
    };
  const photos = post.photos ?? [];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      {/* Sticky header */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: colors.foreground }]}>Post</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={(c) => String(c.id)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Post card body */}
            <View style={[styles.postCard, { borderBottomColor: colors.border }]}>
              {/* Author row */}
              <View style={styles.authorRow}>
                <Avatar uri={authorInfo.avatarUrl} name={authorInfo.name} size={44} />
                <View style={styles.authorInfo}>
                  <Text style={[styles.authorName, { color: colors.foreground }]}>
                    {authorInfo.name}
                  </Text>
                  <View style={styles.metaRow}>
                    {post.location ? (
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                        {post.location} ·{" "}
                      </Text>
                    ) : null}
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {formatDate(post.reportDate ?? post.createdAt ?? "")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Full text */}
              {post.description ? (
                <Text style={[styles.postBody, { color: colors.foreground }]}>
                  {post.description}
                </Text>
              ) : null}

              {/* Photos */}
              {photos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoScroll}
                  contentContainerStyle={styles.photoScrollContent}
                >
                  {photos.map((photo) => (
                    <Image
                      key={photo.id}
                      source={{ uri: photo.url }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              )}

              {/* People reached */}
              {post.peopleReached ? (
                <View style={styles.impactRow}>
                  <View style={[styles.impactBadge, { backgroundColor: "#DCFCE7" }]}>
                    <Ionicons name="people-outline" size={13} color="#15803D" />
                    <Text style={[styles.impactText, { color: "#15803D" }]}>
                      {post.peopleReached.toLocaleString()} reached
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Like / comment action row */}
              <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                <Pressable onPress={handleLike} style={styles.actionBtn} hitSlop={6}>
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={22}
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

                <Pressable
                  onPress={() => inputRef.current?.focus()}
                  style={styles.actionBtn}
                  hitSlop={6}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={colors.mutedForeground}
                  />
                  {comments.length > 0 ? (
                    <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>
                      {comments.length}
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            </View>

            {/* Comments section header */}
            <View style={styles.commentsHeader}>
              <Text style={[styles.commentsTitle, { color: colors.foreground }]}>
                Comments
              </Text>
              {commentsLoading && (
                <ActivityIndicator size="small" color={colors.mutedForeground} />
              )}
            </View>

            {!commentsLoading && commentError && (
              <Text style={[styles.emptyComments, { color: colors.destructive }]}>
                {commentError}
              </Text>
            )}
            {!commentsLoading && !commentError && comments.length === 0 && (
              <Text style={[styles.emptyComments, { color: colors.mutedForeground }]}>
                No comments yet. Be the first to say something!
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <CommentRow
            comment={item}
            currentUserId={user?.id}
            onDelete={deleteComment}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Comment input bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <Avatar uri={user?.avatarUrl} name={user?.name ?? "?"} size={32} />
        <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput
            ref={inputRef}
            value={draftText}
            onChangeText={setDraftText}
            placeholder="Add a comment…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground }]}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
        </View>
        <Pressable
          onPress={handleSendComment}
          disabled={!draftText.trim() || isPosting}
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                draftText.trim() && !isPosting ? colors.primary : colors.muted,
            },
          ]}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={16} color="#fff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  backBtn: {
    width: 36,
    alignItems: "flex-start",
  },
  postCard: {
    borderBottomWidth: 1,
    paddingBottom: 0,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  postBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  photoScroll: { marginBottom: 12 },
  photoScrollContent: { paddingHorizontal: 16, gap: 8 },
  photo: {
    width: 260,
    height: 180,
    borderRadius: 12,
  },
  impactRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
  },
  impactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  impactText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  commentsTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  emptyComments: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  commentBubble: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 3,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  commentAuthor: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  commentTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  commentText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 19,
  },
  deleteBtn: {
    paddingTop: 10,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    maxHeight: 120,
  },
  textInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 20,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});
