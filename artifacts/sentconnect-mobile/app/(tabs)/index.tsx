import { Ionicons } from "@expo/vector-icons";
import {
  getTimeline,
  useGetTimeline,
  type ReportWithDetails,
  type TimelineResponse,
} from "@workspace/api-client-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PostCard } from "@/components/PostCard";
import { useColors } from "@/hooks/useColors";

const PAGE_SIZE = 15;

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [allPosts, setAllPosts] = useState<ReportWithDetails[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pageOffset, setPageOffset] = useState(0);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, error, refetch } = useGetTimeline({
    limit: PAGE_SIZE,
    offset: 0,
  });

  useEffect(() => {
    if (data) {
      const timeline = data as TimelineResponse;
      setAllPosts(timeline.reports ?? []);
      setHasMore(timeline.hasMore ?? false);
      setPageOffset(PAGE_SIZE);
    }
  }, [data]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await refetch();
      if (res.data) {
        const timeline = res.data as TimelineResponse;
        setAllPosts(timeline.reports ?? []);
        setHasMore(timeline.hasMore ?? false);
        setPageOffset(PAGE_SIZE);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || isLoading) return;
    setIsFetchingMore(true);
    try {
      const result = await getTimeline({ limit: PAGE_SIZE, offset: pageOffset });
      setAllPosts((prev) => [...prev, ...result.reports]);
      setHasMore(result.hasMore);
      setPageOffset((prev) => prev + PAGE_SIZE);
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore, isLoading, pageOffset]);

  const Header = () => (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: topInset + 8,
        },
      ]}
    >
      <Ionicons name="globe-outline" size={22} color={colors.primary} />
      <Text style={[styles.headerTitle, { color: colors.foreground }]}>
        Field Reports
      </Text>
    </View>
  );

  if (isLoading && allPosts.length === 0) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <Header />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading reports...
          </Text>
        </View>
      </View>
    );
  }

  if (error && allPosts.length === 0) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <Header />
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color={colors.mutedForeground}
          />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Unable to load
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Check your connection and pull down to retry.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <FlatList
        data={allPosts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => router.push(`/post/${item.id}` as never)}
          />
        )}
        ListHeaderComponent={
          <View>
            <Header />
            <View style={{ height: 12 }} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="newspaper-outline"
              size={48}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No reports yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Be the first to share a field report.
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          Platform.OS === "web"
            ? { paddingBottom: 84 + 34 }
            : { paddingBottom: 20 }
        }
        scrollEnabled={!!(allPosts && allPosts.length > 0)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    marginTop: 4,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
