import { AlertTriangle, ArrowLeft, Loader2, MailCheck, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAdminStore } from "../../../store/appStore";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let googleScriptPromise;

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Google login is only available in the browser."));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.google), { once: true });
        existing.addEventListener("error", () => reject(new Error("Google login could not load.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error("Google login could not load."));
      document.head.appendChild(script);
    });
  }
  return googleScriptPromise;
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const googleLogin = useAdminStore((state) => state.googleLogin);
  const verifyAdminOtp = useAdminStore((state) => state.verifyAdminOtp);
  const resendAdminOtp = useAdminStore((state) => state.resendAdminOtp);
  const hydrateSession = useAdminStore((state) => state.hydrateSession);
  const clearLocalSession = useAdminStore((state) => state.clearLocalSession);
  const auth = useAdminStore((state) => state.auth);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendLeft, setResendLeft] = useState(0);
  const [expiresLeft, setExpiresLeft] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (auth.status === "session-expired") {
      setError("");
      clearLocalSession();
    }
  }, [auth.status, clearLocalSession]);

  useEffect(() => {
    if (auth.status === "idle") hydrateSession();
  }, [auth.status, hydrateSession]);

  useEffect(() => {
    if (auth.user) navigate("/", { replace: true });
  }, [auth.user, navigate]);

  useEffect(() => {
    if (!auth.mfa) return undefined;
    setOtp(["", "", "", "", "", ""]);
    setResendLeft(auth.mfa.resendAfterSeconds || 300);
    setExpiresLeft(auth.mfa.expiresInSeconds || 300);
    window.setTimeout(() => otpRefs.current[0]?.focus(), 120);
    const timer = window.setInterval(() => {
      setResendLeft((current) => Math.max(0, current - 1));
      setExpiresLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [auth.mfa?.verificationId]);

  const submitGoogleCredential = useCallback(
    async (credential) => {
      if (!credential) return;
      setError("");
      try {
        const result = await googleLogin({ credential });
        if (result.mfaRequired) {
          toast.success("Google verified", { description: "Enter the OTP sent to your admin email." });
          return;
        }
        toast.success("Secure admin session active", { description: "Google identity verified on the server." });
        navigate("/", { replace: true });
      } catch (requestError) {
        const message = requestError.status === 403 ? requestError.message || "Unauthorized access. This Google account is not approved for admin login." : requestError.message || "Google admin login failed.";
        setError(message);
        if (requestError.status === 423) {
          toast.error("Admin account locked", { id: "admin-account-locked", description: message });
        } else if (requestError.status !== 403) {
          toast.error("Google login failed", { description: message });
        }
      }
    },
    [googleLogin, navigate]
  );

  const submitOtp = useCallback(
    async (event) => {
      event?.preventDefault();
      if (!auth.mfa) return;
      const code = otp.join("");
      if (!/^\d{6}$/.test(code)) {
        setError("Enter the 6-digit code sent to your email.");
        return;
      }
      setError("");
      try {
        await verifyAdminOtp({ email: auth.mfa.email, verificationId: auth.mfa.verificationId, otp: code });
        toast.success("MFA verified", { description: "Secure admin session is now active." });
        navigate("/", { replace: true });
      } catch (requestError) {
        setError(requestError.message || "Invalid verification code.");
        otpRefs.current[0]?.focus();
      }
    },
    [auth.mfa, navigate, otp, verifyAdminOtp]
  );

  const resendOtp = useCallback(async () => {
    if (!auth.mfa || resendLeft > 0) return;
    setError("");
    try {
      await resendAdminOtp({ email: auth.mfa.email, verificationId: auth.mfa.verificationId });
      toast.success("New code sent", { description: `Check ${auth.mfa.email}.` });
    } catch (requestError) {
      setError(requestError.message || "Could not resend the code.");
    }
  }, [auth.mfa, resendAdminOtp, resendLeft]);

  const setOtpDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const onOtpPaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length !== 6) return;
    event.preventDefault();
    setOtp(pasted.split(""));
    otpRefs.current[5]?.focus();
  };

  const resetMfa = () => {
    setError("");
    clearLocalSession();
  };

  const isMfaStep = Boolean(auth.mfa);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f4ef] text-slate-950 dark:bg-[#08090c] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:block">
          <img src="/images/Darkmood-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-62" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88),rgba(2,6,23,0.35)),linear-gradient(0deg,rgba(2,6,23,0.68),rgba(2,6,23,0.16))]" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <img src="/images/logo/infibolt-dark.png" alt="INFIBOLT" className="h-9 w-auto" />
              <span className="rounded-full border border-white/35 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur">Admin Control</span>
            </div>
            <div className="max-w-2xl pb-6 text-white">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/12 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Google verified access
              </p>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-normal xl:text-6xl">INFIBOLT Control Center</h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-white/90">
                A locked operations workspace for products, warranty, support, content, and customer care.
              </p>
            </div>
          </div>
        </section>

        <section className="grid min-h-screen place-items-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img src="/images/favicon.svg" alt="INFIBOLT" className="h-8 w-8 dark:invert" />
              <span className="text-sm font-extrabold uppercase tracking-[0.24em]">INFIBOLT</span>
            </div>

            <div className="rounded-[1.35rem] border border-slate-900/10 bg-white/82 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] sm:p-8">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-normal">{isMfaStep ? "Verify email OTP" : "Admin sign in"}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                {isMfaStep
                  ? `Enter the secure code sent to ${auth.mfa.email}.`
                  : "Continue with an approved Google account. Access is verified server-side against the admin whitelist."}
              </p>

              {isMfaStep ? (
                <form onSubmit={submitOtp} className="mt-7">
                  <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-100">
                    <MailCheck className="h-4 w-4" />
                    Google verified. Email OTP required.
                  </div>
                  <div className="grid grid-cols-6 gap-2" onPaste={onOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(node) => {
                          otpRefs.current[index] = node;
                        }}
                        value={digit}
                        onChange={(event) => setOtpDigit(index, event.target.value)}
                        onKeyDown={(event) => onOtpKeyDown(index, event)}
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        aria-label={`OTP digit ${index + 1}`}
                        className="h-12 rounded-2xl border border-slate-900/10 bg-white text-center text-lg font-bold outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/8 dark:border-white/10 dark:bg-white/8 dark:focus:border-white"
                      />
                    ))}
                  </div>
                  <button disabled={auth.status === "loading" || expiresLeft <= 0} className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-55 dark:bg-white dark:text-slate-950">
                    {auth.status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify OTP
                  </button>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Expires in {formatSeconds(expiresLeft)}</span>
                    <button type="button" onClick={resendOtp} disabled={resendLeft > 0 || auth.status === "loading"} className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-3 py-2 text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-slate-300">
                      <RefreshCw className="h-3.5 w-3.5" />
                      {resendLeft > 0 ? `Resend in ${resendLeft}s` : "Resend code"}
                    </button>
                  </div>
                  <button type="button" onClick={resetMfa} className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Use another Google account
                  </button>
                </form>
              ) : (
                <div className="mt-7">
                  {googleClientId ? (
                    <GoogleAdminButton
                      disabled={auth.status === "loading"}
                      onCredential={submitGoogleCredential}
                      onError={(message) => {
                        setError(message);
                        toast.error("Google login unavailable", { description: message });
                      }}
                    />
                  ) : (
                    <SecurityNotice message="Google login is not configured. Set VITE_GOOGLE_CLIENT_ID for the admin app." />
                  )}
                </div>
              )}

              {auth.status === "loading" && (
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isMfaStep ? "Verifying OTP" : "Verifying secure session"}
                </p>
              )}

              {(error || auth.error) && <SecurityNotice message={error || auth.error} />}

              <div className="mt-7 rounded-2xl border border-slate-900/8 bg-slate-950/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.035]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Security policy</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Sessions use HttpOnly cookies, CSRF validation, short access expiry, refresh rotation, and logout revocation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatSeconds(value) {
  const seconds = Math.max(0, Number(value || 0));
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function GoogleAdminButton({ disabled, onCredential, onError }) {
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
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        const width = Math.floor(buttonRef.current.getBoundingClientRect().width || 360);
        google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: Math.min(Math.max(width, 260), 400),
        });
      })
      .catch((scriptError) => onError(scriptError.message || "Google login could not load."));
    return () => {
      cancelled = true;
    };
  }, [onCredential, onError]);

  return (
    <div className={`rounded-full border border-slate-900/10 bg-white p-1 shadow-[0_16px_42px_rgba(15,23,42,0.09)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(15,23,42,0.14)] dark:border-white/10 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <div ref={buttonRef} className="flex min-h-[44px] justify-center" />
    </div>
  );
}

function SecurityNotice({ message }) {
  return (
    <div className="mt-5 flex gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4 text-rose-800 dark:text-rose-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-sm font-semibold leading-6">{message}</p>
    </div>
  );
}
