import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock3, KeyRound, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

export function AccountAccess({ initialMode = "login", compact = false }) {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const signup = useAppStore((state) => state.signup);
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
    const mobile = loginForm.email.replace(/\D/g, "");
    if (!/^\S+@\S+\.\S+$/.test(loginForm.email) && !/^[1-9]\d{7,14}$/.test(mobile)) next.email = "Enter your email address or mobile number.";
    if (loginForm.password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  }, [loginForm]);

  const signupErrors = useMemo(() => {
    const next = {};
    if (!signupForm.name.trim()) next.name = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(signupForm.email)) next.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(signupForm.phone.replace(/\D/g, ""))) next.phone = "Enter a valid 10 digit mobile number.";
    if (!STRONG_PASSWORD_PATTERN.test(signupForm.password)) next.password = "Use uppercase, lowercase, number, symbol, and 8+ characters.";
    if (signupStep === "otp" && !/^\d{6}$/.test(signupForm.otp)) next.otp = "Enter the 6 digit code.";
    return next;
  }, [signupForm, signupStep]);

  const resetErrors = useMemo(() => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(resetForm.email)) next.email = "Enter a valid email address.";
    if (resetStep === "verify" && !/^\d{6}$/.test(resetForm.otp)) next.otp = "Enter the 6 digit code.";
    if (resetStep === "verify" && resetForm.password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  }, [resetForm, resetStep]);

  const hasServerErrors = Object.keys(serverErrors).length > 0;

  const finishAuth = (message) => {
    toast.success(message, { description: "Your INFIBOLT account is ready." });
    setSignupStep("details");
    setResetStep("request");
    setSignupForm(initialSignupForm);
    setResetForm(initialResetForm);
    setError("");
    setTouched(false);
    setServerErrors({});
    setCooldown(0);
    navigate("/profile");
  };

  const loginIdentifier = () => {
    const value = loginForm.email.trim();
    return /^\S+@\S+\.\S+$/.test(value) ? value.toLowerCase() : value.replace(/\D/g, "");
  };

  const markServerFields = (scope, message, details) => {
    const normalized = String(message || "").toLowerCase();
    if (scope === "login") {
      setServerErrors({ loginEmail: "Check this login ID.", loginPassword: "Check this password." });
      return;
    }
    if (scope === "signup") {
      const fields = details?.fields || {};
      if (fields.email || fields.phone) {
        setServerErrors({
          ...(fields.email ? { signupEmail: fields.email } : {}),
          ...(fields.phone ? { signupPhone: fields.phone } : {}),
        });
        return;
      }
      if (normalized.includes("email") && (normalized.includes("mobile") || normalized.includes("phone"))) {
        setServerErrors({
          signupEmail: "This email is already registered.",
          signupPhone: "This mobile number is already registered.",
        });
        return;
      }
      if (normalized.includes("mobile") || normalized.includes("phone")) {
        setServerErrors({ signupPhone: "This mobile number is already registered." });
      } else if (normalized.includes("email")) {
        setServerErrors({ signupEmail: "This email is already registered." });
      } else {
        setServerErrors({ signupEmail: "Check this email.", signupPhone: "Check this mobile number." });
      }
      return;
    }
    if (scope === "reset") {
      if (normalized.includes("otp") || normalized.includes("code")) {
        setServerErrors({ resetOtp: "Check this code." });
      } else if (normalized.includes("password")) {
        setServerErrors({ resetPassword: "Check this password." });
      } else {
        setServerErrors({ resetEmail: "Check this email address." });
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
      markServerFields("login", message, requestError.details);
    } finally {
      setStatus("idle");
    }
  };

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
        toast.success("Code sent", { description: "Verify once to create your INFIBOLT ID." });
      } catch (requestError) {
        const message = requestError.message || "We could not begin signup.";
        setError(message);
        markServerFields("signup", message, requestError.details);
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
      if (requestError.details?.fields?.email || requestError.details?.fields?.phone) {
        setSignupStep("details");
        markServerFields("signup", message, requestError.details);
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
        const result = await authService.forgotPassword({ email: resetForm.email.trim().toLowerCase() });
        setCooldown(result.resendAfterSeconds || 60);
        setResetStep("verify");
        toast.success("Code sent", { description: "Use it to set a new password." });
      } catch (requestError) {
        const message = requestError.message || "We could not send the reset code.";
        setError(message);
        markServerFields("reset", message, requestError.details);
      } finally {
        setStatus("idle");
      }
      return;
    }
    if (resetErrors.email || resetErrors.otp || resetErrors.password) return;
    setStatus("loading");
    try {
      await authService.resetPassword({ email: resetForm.email.trim().toLowerCase(), otp: resetForm.otp, password: resetForm.password });
      toast.success("Password updated", { description: "Sign in with your new password." });
      returnToLogin(resetForm.email);
    } catch (requestError) {
      const message = requestError.message || "We could not update your password.";
      setError(message);
      markServerFields("reset", message, requestError.details);
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
      markServerFields("signup", message, requestError.details);
    } finally {
      setStatus("idle");
    }
  };

  const resendResetCode = async () => {
    if (cooldown > 0 || status === "loading") return;
    setStatus("loading");
    try {
      const result = await authService.forgotPassword({ email: resetForm.email.trim().toLowerCase() });
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
                {mode === "signup" ? "Verify your mobile number and keep products, warranty, and support connected." : mode === "reset" ? "Use your email to receive a secure reset code." : "Use your email or mobile number to continue."}
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

        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.form key="login" {...panelMotion} onSubmit={submitLogin} noValidate className="grid gap-4">
              <PremiumField icon={Mail} label="Email or mobile" value={loginForm.email} onChange={(email) => { setLoginForm((current) => ({ ...current, email })); clearFieldFeedback("loginEmail", "loginPassword"); }} error={(touched ? loginErrors.email : "") || serverErrors.loginEmail} placeholder="you@example.com or 9876543210" />
              <PremiumField icon={Lock} label="Password" type="password" value={loginForm.password} onChange={(password) => { setLoginForm((current) => ({ ...current, password })); clearFieldFeedback("loginPassword"); }} error={(touched ? loginErrors.password : "") || serverErrors.loginPassword} placeholder="Your password" />
              <label className="flex items-center justify-between gap-4 text-sm font-medium text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={loginForm.remember} onChange={(event) => setLoginForm((current) => ({ ...current, remember: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-slate-950" />
                  Remember this device
                </span>
                <button type="button" onClick={() => openMode("reset")} className="text-slate-950 transition hover:text-slate-600">Forgot password</button>
              </label>
              {error && !hasServerErrors ? <PremiumNotice tone="error" title="Sign in could not continue">{error}</PremiumNotice> : null}
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
                  <PremiumField icon={Phone} label="Mobile number" inputMode="numeric" value={signupForm.phone} onChange={(phone) => { setSignupForm((current) => ({ ...current, phone })); clearFieldFeedback("signupPhone"); }} error={(touched ? signupErrors.phone : "") || serverErrors.signupPhone} placeholder="9876543210" />
                  <PremiumField icon={KeyRound} label="Password" type="password" value={signupForm.password} onChange={(password) => { setSignupForm((current) => ({ ...current, password })); setError(""); }} error={touched ? signupErrors.password : ""} placeholder="Infibolt@123" helper="Use uppercase, lowercase, number, and symbol." />
                </>
              ) : (
                <>
                  <PremiumNotice tone="success" title="Verification code sent">
                    Enter the 6 digit code sent to {signupForm.phone.replace(/\D/g, "")}.
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
              <PremiumField icon={Mail} label="Email address" type="email" value={resetForm.email} onChange={(email) => { setResetForm((current) => ({ ...current, email })); clearFieldFeedback("resetEmail"); }} error={(touched ? resetErrors.email : "") || serverErrors.resetEmail} placeholder="you@example.com" disabled={resetStep === "verify"} />
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
