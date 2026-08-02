"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthModal from "./AuthModal";
import { authClient } from "@/lib/auth-client";

type AuthSession = (typeof authClient)["$Infer"]["Session"];
type AuthUser = AuthSession extends { user: infer U } ? U : null;

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isReady: boolean;
  openModal: () => void;
  closeModal: () => void;
  requestOtp: (method: "email" | "phone", identifier: string) => Promise<string | null>;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (profile: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<string | null>;
  verifyOtp: (
    method: "email" | "phone",
    identifier: string,
    token: string,
    profile?: { firstName?: string; lastName?: string }
  ) => Promise<string | null>;
  updateProfile: (profile: { firstName?: string; lastName?: string }) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const fallbackAuthContext: AuthContextValue = {
  user: null,
  isLoggedIn: false,
  isReady: false,
  openModal: () => {},
  closeModal: () => {},
  requestOtp: async () => "AuthProvider is not mounted",
  signInWithPassword: async () => "AuthProvider is not mounted",
  signUpWithPassword: async () => "AuthProvider is not mounted",
  verifyOtp: async () => "AuthProvider is not mounted",
  updateProfile: async () => "AuthProvider is not mounted",
  logout: async () => {},
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderInner>{children}</AuthProviderInner>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user ?? null;
  const isReady = !isPending;

  const requestOtp = useCallback(
    async (method: "email" | "phone", identifier: string) => {
      if (method === "email") {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email: identifier,
          type: "sign-in",
        });
        return error?.message ?? null;
      }
      const { error } = await authClient.phoneNumber.sendOtp({
        phoneNumber: identifier,
      });
      return error?.message ?? null;
    },
    []
  );

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({
      email,
      password,
    });
    if (!error) {
      await refetch();
    }
    return error?.message ?? null;
  }, [refetch]);

  const signUpWithPassword = useCallback(
    async (profile: { firstName: string; lastName: string; email: string; password: string }) => {
      const name = `${profile.firstName} ${profile.lastName}`.trim();
      const { error } = await authClient.signUp.email({
        name,
        email: profile.email,
        password: profile.password,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
      });
      if (!error) {
        await refetch();
      }
      return error?.message ?? null;
    },
    [refetch]
  );

  const verifyOtp = useCallback(
    async (
      method: "email" | "phone",
      identifier: string,
      token: string,
      profile?: { firstName?: string; lastName?: string }
    ) => {
      if (method === "email") {
        const { error } = await authClient.signIn.emailOtp({
          email: identifier,
          otp: token,
        });
        if (!error) {
          if (profile?.firstName || profile?.lastName) {
            const name = [profile.firstName, profile.lastName]
              .filter(Boolean)
              .join(" ");
            await authClient.updateUser({
              firstName: profile.firstName?.trim() || undefined,
              lastName: profile.lastName?.trim() || undefined,
              ...(name ? { name } : {}),
            });
          }
          await refetch();
        }
        return error?.message ?? null;
      }
      const { error } = await authClient.phoneNumber.verify({
        phoneNumber: identifier,
        code: token,
      });
      if (!error) {
        if (profile?.firstName || profile?.lastName) {
          const name = [profile.firstName, profile.lastName]
            .filter(Boolean)
            .join(" ");
          await authClient.updateUser({
            firstName: profile.firstName?.trim() || undefined,
            lastName: profile.lastName?.trim() || undefined,
            ...(name ? { name } : {}),
          });
        }
        await refetch();
      }
      return error?.message ?? null;
    },
    [refetch]
  );

  const updateProfile = useCallback(
    async (profile: { firstName?: string; lastName?: string }) => {
      const name = [profile.firstName, profile.lastName]
        .filter(Boolean)
        .join(" ");
      await authClient.updateUser({
        firstName: profile.firstName?.trim() || undefined,
        lastName: profile.lastName?.trim() || undefined,
        ...(name ? { name } : {}),
      });
      await refetch();
      return null;
    },
    [refetch]
  );

  const logout = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isReady,
      openModal: () => setIsOpen(true),
      closeModal: () => setIsOpen(false),
      requestOtp,
      signInWithPassword,
      signUpWithPassword,
      verifyOtp,
      updateProfile,
      logout,
    }),
    [user, isReady, requestOtp, signInWithPassword, signUpWithPassword, verifyOtp, updateProfile, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isOpen ? <AuthModal onClose={() => setIsOpen(false)} /> : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("useAuth called without AuthProvider; using fallback auth state.");
    }
    return fallbackAuthContext;
  }
  return value;
}
