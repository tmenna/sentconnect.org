import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  addReportPhoto,
  createReport,
  type CreateReportBodyCategory,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES: { value: CreateReportBodyCategory; label: string }[] = [
  { value: "church_planting", label: "Church Planting" },
  { value: "leadership_training", label: "Leadership" },
  { value: "humanitarian_work", label: "Humanitarian" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

/**
 * Wraps a local URI into the shape React Native's FormData.append expects at runtime.
 * RN replaces the browser FormData with its own implementation that accepts
 * `{ uri, name, type }` instead of a Blob. The TypeScript declaration still uses
 * the browser Blob type, so this helper centralises the unavoidable platform cast.
 */
function rnBlob(uri: string, name: string, type: string): Blob {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { uri, name, type } as object as Blob;
}

async function uploadPhoto(localUri: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", rnBlob(localUri, "photo.jpg", "image/jpeg"));

  const res = await fetch(`${BASE_URL}/api/storage/uploads`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
  const json: { objectPath?: string } = await res.json();
  if (!json.objectPath) {
    throw new Error("Upload response missing objectPath");
  }
  return `${BASE_URL}${json.objectPath}`;
}

export default function ComposeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CreateReportBodyCategory>("other");
  const [location, setLocation] = useState("");
  const [peopleReached, setPeopleReached] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  async function pickPhoto() {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to attach images."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title for your report.");
      return;
    }
    if (!body.trim()) {
      Alert.alert("Required", "Please write something in your report.");
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      const report = await createReport({
        title: title.trim(),
        description: body.trim(),
        category,
        reportDate: new Date().toISOString(),
        missionaryId: user.id,
        location: location.trim() || null,
        peopleReached: peopleReached ? parseInt(peopleReached, 10) : null,
      });

      if (photoUri) {
        try {
          const photoUrl = await uploadPhoto(photoUri);
          await addReportPhoto(report.id, { url: photoUrl, caption: null });
        } catch (photoErr: unknown) {
          const msg =
            photoErr instanceof Error ? photoErr.message : "Unknown error";
          Alert.alert(
            "Photo not saved",
            `Your report was posted, but the photo couldn't be attached (${msg}). You can try editing the report to add it later.`
          );
        }
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTitle("");
      setBody("");
      setLocation("");
      setPeopleReached("");
      setPhotoUri(null);
      setCategory("other");
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit report.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          New Report
        </Text>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !title.trim() || !body.trim()}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor:
                title.trim() && body.trim() && !isSubmitting
                  ? colors.primary
                  : colors.muted,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          testID="btn-compose-submit"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text
              style={[
                styles.submitText,
                {
                  color:
                    title.trim() && body.trim()
                      ? "#fff"
                      : colors.mutedForeground,
                },
              ]}
            >
              Post
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: bottomInset + (Platform.OS === "web" ? 84 : 20),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <TextInput
          style={[styles.titleInput, { color: colors.foreground }]}
          placeholder="Report title"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          maxLength={120}
          testID="input-compose-title"
        />

        <View
          style={[styles.divider, { backgroundColor: colors.border }]}
        />

        {/* Body */}
        <TextInput
          style={[styles.bodyInput, { color: colors.foreground }]}
          placeholder="Share what's happening in the field…"
          placeholderTextColor={colors.mutedForeground}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          testID="input-compose-body"
        />

        {/* Photo preview */}
        {photoUri ? (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: photoUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[
                styles.removePhoto,
                { backgroundColor: colors.foreground + "CC" },
              ]}
              onPress={() => setPhotoUri(null)}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}

        <View
          style={[styles.divider, { backgroundColor: colors.border }]}
        />

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      category === cat.value
                        ? colors.primary
                        : colors.secondary,
                    borderColor:
                      category === cat.value
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color:
                        category === cat.value
                          ? "#fff"
                          : colors.foreground,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.inputRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.mutedForeground}
            />
            <TextInput
              style={[styles.inlineInput, { color: colors.foreground }]}
              placeholder="Location (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={location}
              onChangeText={setLocation}
              returnKeyType="next"
              testID="input-compose-location"
            />
          </View>
        </View>

        {/* People reached */}
        <View style={styles.section}>
          <View style={styles.inputRow}>
            <Ionicons
              name="people-outline"
              size={18}
              color={colors.mutedForeground}
            />
            <TextInput
              style={[styles.inlineInput, { color: colors.foreground }]}
              placeholder="People reached (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={peopleReached}
              onChangeText={(v) =>
                setPeopleReached(v.replace(/[^0-9]/g, ""))
              }
              keyboardType="number-pad"
              returnKeyType="done"
              testID="input-compose-people-reached"
            />
          </View>
        </View>

        {/* Add photo button */}
        <View
          style={[styles.toolbarSection, { borderTopColor: colors.border }]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.toolbarButton,
              {
                backgroundColor: pressed
                  ? colors.accent
                  : "transparent",
                borderColor: colors.border,
              },
            ]}
            onPress={pickPhoto}
          >
            <Ionicons
              name="image-outline"
              size={20}
              color={colors.primary}
            />
            <Text
              style={[styles.toolbarButtonText, { color: colors.primary }]}
            >
              {photoUri ? "Change Photo" : "Add Photo"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  submitButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titleInput: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    paddingVertical: 12,
    lineHeight: 28,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  bodyInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 12,
    minHeight: 120,
  },
  photoPreview: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removePhoto: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  categoryRow: {
    gap: 8,
    paddingRight: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  categoryChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inlineInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    paddingVertical: 8,
  },
  toolbarSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  toolbarButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
