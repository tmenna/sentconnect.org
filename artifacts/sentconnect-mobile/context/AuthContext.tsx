import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setOrgSubdomain,
  type LoginResponse,
  type User,
} from "@workspace/api-client-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ApiErrorBody {
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  orgSlug: string | null;
  isLoading: boolean;
  login: (email: string, password: string, org?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
const ORG_SLUG_KEY = "sentconnect_org_slug";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orgSlug, setOrgSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        credentials: "include",
      });
      if (res.ok) {
        return (await res.json()) as User;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await fetchCurrentUser();
    setUser(u);
  }, [fetchCurrentUser]);

  useEffect(() => {
    (async () => {
      const storedOrg = await AsyncStorage.getItem(ORG_SLUG_KEY);
      if (storedOrg) {
        setOrgSlug(storedOrg);
        setOrgSubdomain(storedOrg);
      }
      const u = await fetchCurrentUser();
      setUser(u);
      setIsLoading(false);
    })();
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (email: string, password: string, org?: string) => {
      // Prefer the explicitly entered org; fall back to previously stored slug
      const storedSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
      const slug = org?.trim() || storedSlug || null;
      if (slug) {
        setOrgSubdomain(slug);
        await AsyncStorage.setItem(ORG_SLUG_KEY, slug);
        setOrgSlug(slug);
      }
      const res = await fetch(`${BASE_URL}/api/users/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(slug ? { "X-Org-Subdomain": slug } : {}),
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errBody: ApiErrorBody = await res
          .json()
          .catch(() => ({} as ApiErrorBody));
        throw new Error(errBody.error ?? "Login failed");
      }
      const data: LoginResponse = await res.json();
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/api/users/me`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    await AsyncStorage.removeItem(ORG_SLUG_KEY);
    setOrgSubdomain(null);
    setOrgSlug(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, orgSlug, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
