import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

async function savePushTokenToServer(token: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/users/me/push-token`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Non-fatal — notifications degrade gracefully
  }
}

async function clearPushTokenOnServer(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/users/me/push-token`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: null }),
    });
  } catch {
    // Non-fatal
  }
}

interface UseNotificationsOptions {
  isLoggedIn: boolean;
}

export function useNotifications({ isLoggedIn }: UseNotificationsOptions) {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      clearPushTokenOnServer();
      return;
    }

    registerForPushNotifications().then(token => {
      if (token) savePushTokenToServer(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Received while app is foregrounded — the handler above shows it
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      const postId = data?.postId;
      if (postId != null) {
        router.push(`/post/${postId}` as never);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isLoggedIn, router]);
}
