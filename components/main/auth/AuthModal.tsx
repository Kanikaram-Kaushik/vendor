"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

type AuthModalProps = {
  onClose: () => void;
};

export default function AuthModal({ onClose }: AuthModalProps) {
  const { requestOtp, verifyOtp, signInWithPassword, signUpWithPassword } = useAuth();
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const demoCustomer = {
    firstName: "Demo",
    lastName: "Customer",
    email: "demo.customer@designbhk.com",
    password: "demo1234",
  };

  function resetErrors() {
    setError(null);
    setIsLoading(false);
  }

  async function loginDemoCustomer() {
    setIsLoading(true);
    setError(null);

    const signInMessage = await signInWithPassword(demoCustomer.email, demoCustomer.password);
    if (!signInMessage) {
      setIsLoading(false);
      onClose();
      return;
    }

    const signUpMessage = await signUpWithPassword(demoCustomer);
    if (signUpMessage) {
      setIsLoading(false);
      setError(signUpMessage);
      return;
    }

    const secondSignInMessage = await signInWithPassword(demoCustomer.email, demoCustomer.password);
    setIsLoading(false);
    if (secondSignInMessage) {
      setError(secondSignInMessage);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg rounded-4xl border border-foreground/10 bg-card/85 p-6 shadow-[0_30px_60px_rgba(15,10,5,0.25)] sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted sm:text-xs">
              Secure Access
            </p>
            <h3 className="mt-2 text-xl font-semibold sm:text-2xl">Customer access</h3>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition hover:border-white/25 hover:bg-white/10 hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex gap-2 rounded-full border border-foreground/15 bg-white/75 p-1 text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-xs">
          <button
            className={`flex-1 rounded-full px-4 py-2 transition ${authMode === "sign-in" ? "bg-foreground text-background" : "text-[#5c524a]"}`}
            onClick={() => {
              setAuthMode("sign-in");
              setStep("input");
              resetErrors();
            }}
          >
            Sign in
          </button>
          <button
            className={`flex-1 rounded-full px-4 py-2 transition ${authMode === "sign-up" ? "bg-foreground text-background" : "text-[#5c524a]"}`}
            onClick={() => {
              setAuthMode("sign-up");
              setStep("input");
              resetErrors();
            }}
          >
            Create account
          </button>
        </div>

        {authMode === "sign-up" ? (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
                First name
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white/90 px-4 py-2.5 text-sm text-[#1f1a16] placeholder:text-[#9b8f86] focus:border-accent focus:outline-none sm:text-base"
                  placeholder="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
                Last name
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white/90 px-4 py-2.5 text-sm text-[#1f1a16] placeholder:text-[#9b8f86] focus:border-accent focus:outline-none sm:text-base"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
            </div>

            <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
              Email address
              <input
                type="email"
                className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white/90 px-4 py-2.5 text-sm text-[#1f1a16] placeholder:text-[#9b8f86] focus:border-accent focus:outline-none sm:text-base"
                placeholder="you@studio.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </label>

            <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
              Password
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white/90 px-4 py-2.5 text-sm text-[#1f1a16] placeholder:text-[#9b8f86] focus:border-accent focus:outline-none sm:text-base"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <button
              className="mt-2 w-full rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60 sm:text-sm"
              disabled={isLoading}
              onClick={async () => {
                if (!firstName || !lastName || !identifier || !password) return;
                setIsLoading(true);
                setError(null);
                const message = await signUpWithPassword({
                  firstName,
                  lastName,
                  email: identifier,
                  password,
                });
                setIsLoading(false);
                if (message) {
                  setError(message);
                  return;
                }
                onClose();
              }}
            >
              Create account
            </button>

            <button
              className="w-full rounded-full border border-foreground/15 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs"
              onClick={() => setAuthMode("sign-in")}
            >
              Already have an account? Sign in
            </button>

            {error ? <p className="text-xs text-[#d8895b]">{error}</p> : null}
          </div>
        ) : step === "input" ? (
          <div className="mt-6 space-y-5">
            <div className="flex gap-2 rounded-full border border-foreground/15 bg-white/75 p-1 text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-xs">
              <button
                className={`flex-1 rounded-full px-4 py-2 transition ${loginMethod === "password" ? "bg-foreground text-background" : "text-[#5c524a]"}`}
                onClick={() => {
                  setLoginMethod("password");
                  resetErrors();
                }}
              >
                Password
              </button>
              <button
                className={`flex-1 rounded-full px-4 py-2 transition ${loginMethod === "otp" ? "bg-foreground text-background" : "text-[#5c524a]"}`}
                onClick={() => {
                  setLoginMethod("otp");
                  resetErrors();
                }}
              >
                OTP
              </button>
            </div>
            {loginMethod === "password" ? (
              <>
                <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
                  Email address
                  <input
                    type="email"
                    className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white/90 px-4 py-2.5 text-sm text-[#1f1a16] placeholder:text-[#9b8f86] focus:border-accent focus:outline-none sm:text-base"
                    placeholder="you@studio.com"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
                  Password
                  <input
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white/90 px-4 py-2.5 text-sm text-[#1f1a16] placeholder:text-[#9b8f86] focus:border-accent focus:outline-none sm:text-base"
                    placeholder="Your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <button
                  className="mt-2 w-full rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60 sm:text-sm"
                  disabled={isLoading}
                  onClick={async () => {
                    if (!identifier || !password) return;
                    setIsLoading(true);
                    setError(null);
                    const message = await signInWithPassword(identifier, password);
                    setIsLoading(false);
                    if (message) {
                      setError(message);
                      return;
                    }
                    onClose();
                  }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
                  {method === "email" ? "Email address" : "Phone number"}
                  <input
                    type={method === "email" ? "email" : "tel"}
                    className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white/90 px-4 py-2.5 text-sm text-[#1f1a16] placeholder:text-[#9b8f86] focus:border-accent focus:outline-none sm:text-base"
                    placeholder={method === "email" ? "you@studio.com" : "+1 555 000 0000"}
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                  />
                </label>
                <button
                  className="mt-2 w-full rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60 sm:text-sm"
                  disabled={isLoading}
                  onClick={async () => {
                    if (!identifier) return;
                    setIsLoading(true);
                    setError(null);
                    const message = await requestOtp(method, identifier);
                    setIsLoading(false);
                    if (message) {
                      setError(message);
                      return;
                    }
                    setStep("otp");
                  }}
                >
                  Send OTP
                </button>
              </>
            )}
            <button
              className="w-full rounded-full border border-foreground/15 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs"
              onClick={() => setAuthMode("sign-up")}
            >
              Need a customer account? Create one
            </button>
            <button
              className="w-full rounded-full border border-dashed border-foreground/20 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs"
              disabled={isLoading}
              onClick={loginDemoCustomer}
            >
              Try demo customer login
            </button>
            {error ? <p className="text-xs text-[#d8895b]">{error}</p> : null}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-muted sm:text-sm">
              We sent a 6-digit OTP to <strong>{identifier}</strong>.
            </p>
            <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
              Enter OTP
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white/90 px-4 py-2.5 text-sm text-[#1f1a16] placeholder:text-[#9b8f86] focus:border-accent focus:outline-none sm:text-base"
                placeholder="123456"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />
            </label>
            <button
              className="mt-2 w-full rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60 sm:text-sm"
              disabled={isLoading}
              onClick={async () => {
                if (!otp) return;
                setIsLoading(true);
                setError(null);
                const message = await verifyOtp(method, identifier, otp);
                setIsLoading(false);
                if (message) {
                  setError(message);
                  return;
                }
                onClose();
              }}
            >
              Verify &amp; Continue
            </button>
            <button
              className="w-full rounded-full border border-foreground/15 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs"
              onClick={() => {
                setStep("input");
                if (loginMethod === "otp") {
                  setIdentifier("");
                }
              }}
            >
              Change {method}
            </button>
            <button
              className="w-full rounded-full border border-foreground/15 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs"
              onClick={() => setAuthMode("sign-up")}
            >
              Create a customer account
            </button>
            <button
              className="w-full rounded-full border border-dashed border-foreground/20 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs"
              disabled={isLoading}
              onClick={loginDemoCustomer}
            >
              Try demo customer login
            </button>
            {error ? <p className="text-xs text-[#d8895b]">{error}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}
