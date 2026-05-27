import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock3, KeyRound, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { OtpInput } from "../OtpInput";
import {
  AccountCard,
  PremiumButton,
  PremiumField,
  PremiumNotice,
} from "./PremiumAccount";
import { authService } from "../../services/authService";
import { useAppStore } from "../../store/appStore";

const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{8,}$/;

const panelMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
};

const initialLoginForm = { email: "", password: "", otp: "", remember: true };
const initialSignupForm = { name: "", email: "", phone: "", password: "", otp: "" };
const initialResetForm = { email: "", otp: "", password: "" };
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let googleScriptPromise;

function isEmailOrPhone(value) {
  const normalized = String(value || "").trim();
  const phone = normalized.replace(/\D/g, "");
  return /^\S+@\S+\.\S+$/.test(normalized) || /^[1-9]\d{7,14}$/.test(phone);
}

function loginIdentifierFrom(value) {
  const normalized = String(value || "").trim();
  return /^\S+@\S+\.\S+$/.test(normalized) ? normalized.toLowerCase() : normalized.replace(/\D/g, "");
}

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Google sign in is only available in the browser."));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.google), { once: true });
        existing.addEventListener("error", () => reject(new Error("Google sign in could not load.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error("Google sign in could not load."));
      document.head.appendChild(script);
    });
  }
  return googleScriptPromise;
}

export function AccountAccess({ initialMode = "login", compact = false, redirectTo = "/profile" }) {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const signup = useAppStore((state) => state.signup);
  const googleLogin = useAppStore((state) => state.googleLogin);
  const verifyOtp = useAppStore((state) => state.verifyOtp);
  const [mode, setMode] = useState(initialMode);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [resetForm, setResetForm] = useState(initialResetForm);
  const [signupStep, setSignupStep] = useState("details");
  const [signupVerificationId, setSignupVerificationId] = useState("");
  const [resetStep, setResetStep] = useState("request");
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(current - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    setError("");
    setTouched(false);
    setServerErrors({});
  }, [mode, signupStep, resetStep]);

  useEffect(() => {
    setMode(initialMode);
    setSignupStep("details");
    setSignupVerificationId("");
    setResetStep("request");
    setSignupForm(initialSignupForm);
    setResetForm(initialResetForm);
    setError("");
    setTouched(false);
    setServerErrors({});
    setCooldown(0);
  }, [initialMode]);

  const openMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setTouched(false);
    setServerErrors({});
    setCooldown(0);
    if (nextMode !== "signup") {
      setSignupStep("details");
      setSignupVerificationId("");
      setSignupForm(initialSignupForm);
    }
    if (nextMode !== "reset") {
      setResetStep("request");
      setResetForm(initialResetForm);
    }
  };

  const returnToLogin = (email = "") => {
    setMode("login");
    setLoginForm({ ...initialLoginForm, email });
    setSignupStep("details");
    setResetStep("request");
    setSignupForm(initialSignupForm);
    setResetForm(initialResetForm);
    setError("");
    setTouched(false);
    setServerErrors({});
    setCooldown(0);
  };

  const loginErrors = useMemo(() => {
    const next = {};
    if (!isEmailOrPhone(loginForm.email)) next.email = "Enter your email address or phone number.";
    if (loginForm.password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  }, [loginForm]);

  const signupErrors = useMemo(() => {
    const next = {};
    if (!signupForm.name.trim()) next.name = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(signupForm.email)) next.email = "Enter a valid email address.";
    if (!/^[1-9]\d{7,14}$/.test(signupForm.phone.replace(/\D/g, ""))) next.phone = "Enter a valid phone number.";
    if (!STRONG_PASSWORD_PATTERN.test(signupForm.password)) next.password = "Use uppercase, lowercase, number, symbol, and 8+ characters.";
    if (signupStep === "otp" && !/^\d{6}$/.test(signupForm.otp)) next.otp = "Enter the 6 digit code.";
    return next;
  }, [signupForm, signupStep]);

  const resetErrors = useMemo(() => {
    const next = {};
    if (!isEmailOrPhone(resetForm.email)) next.email = "Enter a valid email address or phone number.";
    if (resetStep === "verify" && !/^\d{6}$/.test(resetForm.otp)) next.otp = "Enter the 6 digit code.";
    if (resetStep === "verify" && resetForm.password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  }, [resetForm, resetStep]);

  const hasServerErrors = Object.keys(serverErrors).length > 0;
  const loginErrorTitle = error.toLowerCase().includes("locked") || error.toLowerCase().includes("blocked") || error.toLowerCase().includes("disabled") ? "Account blocked" : "Sign in could not continue";

  const finishAuth = useCallback((message) => {
    toast.success(message, { description: "Your INFIBOLT account is ready." });
    setSignupStep("details");
    setResetStep("request");
    setSignupForm(initialSignupForm);
    setResetForm(initialResetForm);
    setError("");
    setTouched(false);
    setServerErrors({});
    setCooldown(0);
    navigate(normalizeRedirectPath(redirectTo), { replace: true });
  }, [navigate, redirectTo]);

  const loginIdentifier = () => {
    return loginIdentifierFrom(loginForm.email);
  };

  const markServerFields = (scope, message, details) => {
    const normalized = String(message || "").toLowerCase();
    if (scope === "login") {
      setServerErrors({ loginEmail: "Check this login ID.", loginPassword: "Check this password." });
      return;
    }
    if (scope === "signup") {
      const fields = details?.fields || details || {};
      if (fields.email || fields.phone) {
        setServerErrors({
          ...(fields.email ? { signupEmail: fields.email } : {}),
          ...(fields.phone ? { signupPhone: fields.phone } : {}),
        });
        return;
      }
      if (normalized.includes("phone")) {
        setServerErrors({ signupPhone: "This phone number is already registered." });
      } else if (normalized.includes("email")) {
        setServerErrors({ signupEmail: "This email is already registered." });
      } else {
        setServerErrors({ signupEmail: "Check this email.", signupPhone: "Check this phone number." });
      }
      return;
    }
    if (scope === "reset") {
      if (normalized.includes("otp") || normalized.includes("code")) {
        setServerErrors({ resetOtp: "Check this code." });
      } else if (normalized.includes("password")) {
        setServerErrors({ resetPassword: "Check this password." });
      } else {
        setServerErrors({ resetEmail: "Check this email or phone number." });
      }
    }
  };

  const clearServerError = (...keys) => {
    setServerErrors((current) => {
      const next = { ...current };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  };

  const clearFieldFeedback = (...keys) => {
    setError("");
    clearServerError(...keys);
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setTouched(true);
    setError("");
    setServerErrors({});
    if (loginErrors.email || loginErrors.password) return;
    setStatus("loading");
    try {
      await login({ identifier: loginIdentifier(), password: loginForm.password });
      finishAuth("Welcome back");
    } catch (requestError) {
      const message = requestError.message || "We could not open your account.";
      setError(message);
      if (requestError.status === 423) {
        setServerErrors({});
        toast.error("Account blocked", { id: "account-blocked", description: message });
      } else {
        markServerFields("login", message, requestError.fields || requestError.details);
      }
    } finally {
      setStatus("idle");
    }
  };

  const submitGoogleCredential = useCallback(async (credential) => {
    if (!credential) return;
    setError("");
    setServerErrors({});
    setStatus("loading");
    try {
      await googleLogin({ credential });
      finishAuth(mode === "signup" ? "Account created" : "Welcome back");
    } catch (requestError) {
      const message = requestError.message || "Google sign in could not continue.";
      setError(message);
      if (requestError.status === 423) {
        toast.error("Account blocked", { id: "account-blocked", description: message });
      }
    } finally {
      setStatus("idle");
    }
  }, [finishAuth, googleLogin, mode]);

  const handleGoogleError = useCallback((message) => {
    setError(message);
  }, []);

  const submitSignup = async (event) => {
    event.preventDefault();
    setTouched(true);
    setError("");
    setServerErrors({});
    const payload = {
      name: signupForm.name.trim(),
      email: signupForm.email.trim().toLowerCase(),
      phone: signupForm.phone.replace(/\D/g, ""),
      password: signupForm.password,
      otp: signupForm.otp,
    };
    if (signupStep === "details") {
      if (["name", "email", "phone", "password"].some((key) => signupErrors[key])) return;
      setStatus("loading");
      try {
        const result = await signup(payload);
        setSignupVerificationId(result.verificationId || "");
        setCooldown(result.resendAfterSeconds || 60);
        setSignupStep("otp");
        setTouched(false);
        toast.success("Email code sent", { description: "Verify once to create your INFIBOLT ID." });
      } catch (requestError) {
        const message = requestError.message || "We could not begin signup.";
        setError(message);
        markServerFields("signup", message, requestError.fields || requestError.details);
      } finally {
        setStatus("idle");
      }
      return;
    }
    if (signupErrors.otp) return;
    setStatus("loading");
    try {
      await verifyOtp({ ...payload, verificationId: signupVerificationId });
      finishAuth("Account created");
    } catch (requestError) {
      const message = requestError.message || "Enter the latest 6 digit code sent to your account.";
      setError(message);
      if (requestError.fields?.email || requestError.details?.fields?.email) {
        setSignupStep("details");
        markServerFields("signup", message, requestError.fields || requestError.details);
        return;
      }
      setServerErrors({ signupOtp: "Check this code." });
    } finally {
      setStatus("idle");
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    setTouched(true);
    setError("");
    setServerErrors({});
    if (resetStep === "request") {
      if (resetErrors.email) return;
      setStatus("loading");
      try {
        const result = await authService.forgotPassword({ identifier: loginIdentifierFrom(resetForm.email) });
        setCooldown(result.resendAfterSeconds || 60);
        setResetStep("verify");
        toast.success("Code sent", { description: "Use it to set a new password." });
      } catch (requestError) {
        const message = requestError.message || "We could not send the reset code.";
        setError(message);
        markServerFields("reset", message, requestError.fields || requestError.details);
      } finally {
        setStatus("idle");
      }
      return;
    }
    if (resetErrors.email || resetErrors.otp || resetErrors.password) return;
    setStatus("loading");
    try {
      await authService.resetPassword({ identifier: loginIdentifierFrom(resetForm.email), otp: resetForm.otp, password: resetForm.password });
      toast.success("Password updated", { description: "Sign in with your new password." });
      returnToLogin(resetForm.email);
    } catch (requestError) {
      const message = requestError.message || "We could not update your password.";
      setError(message);
      markServerFields("reset", message, requestError.fields || requestError.details);
    } finally {
      setStatus("idle");
    }
  };

  const resendSignupCode = async () => {
    if (cooldown > 0 || status === "loading") return;
    setStatus("loading");
    try {
      const result = await signup({ ...signupForm, email: signupForm.email.trim().toLowerCase(), phone: signupForm.phone.replace(/\D/g, "") });
      setSignupVerificationId(result.verificationId || "");
      setCooldown(result.resendAfterSeconds || 60);
      toast.success("Code resent", { description: "Use the newest code to continue." });
    } catch (requestError) {
      const message = requestError.message || "We could not resend the code.";
      setError(message);
      markServerFields("signup", message, requestError.fields || requestError.details);
    } finally {
      setStatus("idle");
    }
  };

  const resendResetCode = async () => {
    if (cooldown > 0 || status === "loading") return;
    setStatus("loading");
    try {
      const result = await authService.forgotPassword({ identifier: loginIdentifierFrom(resetForm.email) });
      setCooldown(result.resendAfterSeconds || 60);
      toast.success("Code resent", { description: "Use the newest code to continue." });
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className={`mx-auto grid w-full ${compact ? "max-w-[500px]" : "max-w-[540px]"}`}>
      <AccountCard className="p-5 shadow-[0_28px_90px_rgba(15,23,42,0.09)] sm:p-7">
        <div className="mb-6 grid gap-5">
          <div className="grid gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {mode === "signup" ? "Create Account" : mode === "reset" ? "Account Recovery" : "Secure Login"}
              </p>
              <h2 className="mt-3 text-[1.7rem] font-semibold leading-tight tracking-normal text-slate-950 sm:text-[1.95rem]">
                {mode === "signup" ? "Create your account" : mode === "reset" ? "Reset password" : "Sign in to your account"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {mode === "signup" ? "Add your email and phone. Verification code goes to email only." : mode === "reset" ? "Use your email or phone. The reset code goes to your account email." : "Use your email or phone to continue."}
              </p>
            </div>
          </div>
          {mode !== "reset" && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 rounded-full border border-slate-900/8 bg-white/52 p-1 text-[11px] font-semibold text-slate-500">
                {[
                  ["signup", "Create account"],
                  ["login", "Login"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => openMode(value)}
                    className={`rounded-full px-3 py-2 transition ${mode === value ? "bg-slate-950 text-white shadow-sm" : "hover:text-slate-950"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {mode === "signup" && <StepDots active={signupStep === "otp" ? 1 : 0} />}
            </div>
          )}
          {mode === "reset" && <StepDots active={resetStep === "verify" ? 1 : 0} />}
        </div>

        {googleClientId && mode !== "reset" && signupStep === "details" && (
          <div className="mb-5 grid gap-4">
            <GoogleAuthButton mode={mode} disabled={status === "loading"} onCredential={submitGoogleCredential} onError={handleGoogleError} />
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span className="h-px bg-slate-900/8" />
              <span>or</span>
              <span className="h-px bg-slate-900/8" />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.form key="login" {...panelMotion} onSubmit={submitLogin} noValidate className="grid gap-4">
              <PremiumField icon={Mail} label="Email or phone" value={loginForm.email} onChange={(email) => { setLoginForm((current) => ({ ...current, email })); clearFieldFeedback("loginEmail", "loginPassword"); }} error={(touched ? loginErrors.email : "") || serverErrors.loginEmail} placeholder="you@example.com or 9876543210" />
              <PremiumField icon={Lock} label="Password" type="password" value={loginForm.password} onChange={(password) => { setLoginForm((current) => ({ ...current, password })); clearFieldFeedback("loginPassword"); }} error={(touched ? loginErrors.password : "") || serverErrors.loginPassword} placeholder="Your password" />
              <label className="flex items-center justify-between gap-4 text-sm font-medium text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={loginForm.remember} onChange={(event) => setLoginForm((current) => ({ ...current, remember: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-slate-950" />
                  Remember this device
                </span>
                <button type="button" onClick={() => openMode("reset")} className="text-slate-950 transition hover:text-slate-600">Forgot password</button>
              </label>
              {error && !hasServerErrors ? <PremiumNotice tone="error" title={loginErrorTitle}>{error}</PremiumNotice> : null}
              <PremiumButton loading={status === "loading"} type="submit">
                {status === "loading" ? "Checking..." : "Sign in"}
              </PremiumButton>
            </motion.form>
          )}

          {mode === "signup" && (
            <motion.form key="signup" {...panelMotion} onSubmit={submitSignup} noValidate className="grid gap-4">
              {signupStep === "details" ? (
                <>
                  <PremiumField icon={UserRound} label="Full name" value={signupForm.name} onChange={(name) => { setSignupForm((current) => ({ ...current, name })); setError(""); }} error={touched ? signupErrors.name : ""} placeholder="Rajesh Kumar" />
                  <PremiumField icon={Mail} label="Email address" type="email" value={signupForm.email} onChange={(email) => { setSignupForm((current) => ({ ...current, email })); clearFieldFeedback("signupEmail"); }} error={(touched ? signupErrors.email : "") || serverErrors.signupEmail} placeholder="you@example.com" />
                  <PremiumField icon={Phone} label="Phone number" inputMode="numeric" value={signupForm.phone} onChange={(phone) => { setSignupForm((current) => ({ ...current, phone })); clearFieldFeedback("signupPhone"); }} error={(touched ? signupErrors.phone : "") || serverErrors.signupPhone} placeholder="9876543210" />
                  <PremiumField icon={KeyRound} label="Password" type="password" value={signupForm.password} onChange={(password) => { setSignupForm((current) => ({ ...current, password })); setError(""); }} error={touched ? signupErrors.password : ""} placeholder="Infibolt@123" helper="Use uppercase, lowercase, number, and symbol." />
                </>
              ) : (
                <>
                  <PremiumNotice tone="success" title="Verification code sent">
                    Enter the 6 digit code sent to {signupForm.email.trim().toLowerCase()}.
                  </PremiumNotice>
                  <OtpPanel
                    value={signupForm.otp}
                    onChange={(otp) => {
                      setSignupForm((current) => ({ ...current, otp }));
                      clearFieldFeedback("signupOtp");
                      setTouched(false);
                    }}
                    error={(touched ? signupErrors.otp : "") || serverErrors.signupOtp}
                    cooldown={cooldown}
                    onResend={resendSignupCode}
                    loading={status === "loading"}
                  />
                </>
              )}
              {error && !hasServerErrors && <PremiumNotice tone="error" title={signupStep === "otp" ? "Verification code not accepted" : "Signup paused"}>{error}</PremiumNotice>}
              <PremiumButton loading={status === "loading"} type="submit">
                {status === "loading" ? "Preparing..." : signupStep === "otp" ? "Complete account" : "Continue"}
              </PremiumButton>
              {signupStep === "otp" && (
                <button type="button" onClick={() => { setSignupStep("details"); setError(""); setTouched(false); }} className="text-left text-sm font-medium text-slate-500 transition hover:text-slate-950">
                  Edit account details
                </button>
              )}
            </motion.form>
          )}

          {mode === "reset" && (
            <motion.form key="reset" {...panelMotion} onSubmit={submitReset} noValidate className="grid gap-4">
              <PremiumField icon={Mail} label="Email or phone" value={resetForm.email} onChange={(email) => { setResetForm((current) => ({ ...current, email })); clearFieldFeedback("resetEmail"); }} error={(touched ? resetErrors.email : "") || serverErrors.resetEmail} placeholder="you@example.com or 9876543210" disabled={resetStep === "verify"} />
              {resetStep === "verify" && (
                <>
                  <OtpPanel value={resetForm.otp} onChange={(otp) => { setResetForm((current) => ({ ...current, otp })); clearFieldFeedback("resetOtp"); }} error={(touched ? resetErrors.otp : "") || serverErrors.resetOtp} cooldown={cooldown} onResend={resendResetCode} loading={status === "loading"} />
                  <PremiumField icon={Lock} label="New password" type="password" value={resetForm.password} onChange={(password) => { setResetForm((current) => ({ ...current, password })); clearFieldFeedback("resetPassword"); }} error={(touched ? resetErrors.password : "") || serverErrors.resetPassword} placeholder="New password" />
                </>
              )}
              {error && !hasServerErrors && <PremiumNotice tone="error" title="Reset paused">{error}</PremiumNotice>}
              <PremiumButton loading={status === "loading"} type="submit">
                {status === "loading" ? "Checking..." : resetStep === "request" ? "Send reset code" : "Update password"}
              </PremiumButton>
              <button type="button" onClick={() => returnToLogin()} className="text-left text-sm font-medium text-slate-500 transition hover:text-slate-950">Back to login</button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 border-t border-slate-900/8 pt-5 text-xs leading-6 text-slate-500">
          Your session is protected with secure cookies and account verification.
        </div>
      </AccountCard>
    </div>
  );
}

function OtpPanel({ value, onChange, error, cooldown, onResend, loading }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-900/8 bg-white/48 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Verification code</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {cooldown > 0 ? `${cooldown}s` : "Ready"}</span>
      </div>
      <OtpInput value={value} onChange={onChange} disabled={loading} error={error} />
      <button type="button" onClick={onResend} disabled={cooldown > 0 || loading} className="premium-button inline-flex min-h-[42px] items-center justify-center rounded-full border border-slate-900/10 bg-white/58 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 disabled:opacity-50">
        Resend code
      </button>
    </div>
  );
}

function GoogleAuthButton({ mode, disabled, onCredential, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!googleClientId || !buttonRef.current) return undefined;
    let cancelled = false;
    loadGoogleIdentityScript()
      .then((google) => {
        if (cancelled || !buttonRef.current) return;
        buttonRef.current.innerHTML = "";
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => onCredential(response.credential),
        });
        const width = Math.floor(buttonRef.current.getBoundingClientRect().width || 320);
        google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: mode === "signup" ? "signup_with" : "signin_with",
          width: Math.min(Math.max(width, 240), 400),
        });
      })
      .catch((error) => onError(error.message || "Google sign in could not load."));
    return () => {
      cancelled = true;
    };
  }, [mode, onCredential, onError]);

  if (!googleClientId) return null;

  return (
    <div className={`min-h-[44px] overflow-hidden rounded-full ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <div ref={buttonRef} className="flex min-h-[44px] justify-center" />
    </div>
  );
}

function StepDots({ active }) {
  return (
    <div className="flex items-center justify-end gap-2 pr-4">
      {[0, 1].map((index) => (
        <span
          key={index}
          className={`h-2.5 w-2.5 rounded-full transition ${
              index <= active
                ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                : "border border-slate-300 bg-white"
            }`}
        />
      ))}
    </div>
  );
}

export function SessionExpiredNotice() {
  return (
    <PremiumNotice tone="error" title="Session expired" icon={CheckCircle2}>
      For your security, please sign in again to continue managing your account.
    </PremiumNotice>
  );
}

function normalizeRedirectPath(value) {
  const target = String(value || "/profile");
  if (!target.startsWith("/") || target.startsWith("//")) return "/profile";
  return target;
}
