import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await login(email.trim(), password.trim(), org.trim() || undefined);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid credentials. Please try again."
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 20, paddingBottom: bottomInset + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View
            style={[styles.logoIcon, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="globe-outline" size={32} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>
            SentConnect
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Field reports from the front lines
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Org field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Organization
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="e.g. calvary (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={org}
              onChangeText={setOrg}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              testID="input-login-org"
            />
          </View>

          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="you@mission.org"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              testID="input-login-email"
            />
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Password
            </Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.foreground }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                testID="input-login-password"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>
          </View>

          {/* Error message */}
          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: colors.destructive + "15",
                  borderColor: colors.destructive + "40",
                },
              ]}
            >
              <Text
                style={[styles.errorText, { color: colors.destructive }]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Submit button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.loginButton,
              {
                backgroundColor: isLoading
                  ? colors.primary + "80"
                  : colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            testID="btn-login-submit"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        {/* Footer verse */}
        <Text style={[styles.verse, { color: colors.mutedForeground }]}>
          "Declare his glory among the nations." — Psalm 96:3
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    flexGrow: 1,
    alignItems: "stretch",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 44,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  passwordContainer: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  loginButton: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  verse: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 40,
  },
});
