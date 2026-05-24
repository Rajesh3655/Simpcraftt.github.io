import { CheckCircle2, Clock3, Lock, Mail, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { OtpInput } from "../../../components/OtpInput";
import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import { authService } from "../../../services/authService";

export default function OtpPage() {
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [step, setStep] = useState("request");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(current - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const canSubmit = useMemo(() => {
    if (step === "request") return /^\S+@\S+\.\S+$/.test(form.email);
    return /^\S+@\S+\.\S+$/.test(form.email) && /^\d{6}$/.test(form.otp) && form.password.length >= 8;
  }, [form, step]);

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setError(step === "request" ? "Enter a valid email address." : "Enter the OTP and a stronger password.");
      return;
    }
    setError("");
    setStatus("loading");
    try {
      if (step === "request") {
        const result = await authService.forgotPassword({ email: form.email });
        setCooldown(result.resendAfterSeconds || 60);
        setStep("verify");
        toast.success("OTP sent", { description: "Check the backend terminal in local development." });
      } else {
        await authService.resetPassword(form);
        toast.success("Password reset complete", { description: "You can login with your new password." });
        setStep("done");
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to process OTP request.");
    } finally {
      setStatus("idle");
    }
  };

  const resend = async () => {
    if (cooldown > 0 || !/^\S+@\S+\.\S+$/.test(form.email)) return;
    setStatus("loading");
    setError("");
    try {
      const result = await authService.forgotPassword({ email: form.email });
      setCooldown(result.resendAfterSeconds || 60);
      toast.success("OTP resent", { description: "A new code was issued." });
    } catch (requestError) {
      setError(requestError.message || "Unable to resend OTP.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <CommerceShell eyebrow="Secure Recovery" title="OTP verification." description="A polished recovery flow with secure one-time code verification and session-safe password reset.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <form onSubmit={submit} className="premium-surface mx-auto grid max-w-xl gap-5 p-6 dark:bg-white/[0.04] sm:p-8">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 text-center text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {["request", "verify", "done"].map((item) => <span key={item} className={`rounded-xl py-3 ${step === item ? "bg-white text-slate-900 shadow-sm" : ""}`}>{item}</span>)}
          </div>
          <Field icon={Mail} label="Email address" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} disabled={step !== "request"} />
          {step === "verify" && (
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">OTP code</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {cooldown > 0 ? `${cooldown}s` : "Ready"}</span>
              </div>
              <OtpInput value={form.otp} onChange={(otp) => setForm((current) => ({ ...current, otp }))} disabled={status === "loading"} error={error && /^\d{6}$/.test(form.otp) ? error : ""} />
              <button type="button" onClick={resend} disabled={cooldown > 0 || status === "loading"} className="premium-button inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-slate-900/10 px-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-slate-300">
                <RefreshCw className="h-3.5 w-3.5" />
                Resend OTP
              </button>
            </div>
          )}
          {step !== "request" && <Field icon={Lock} label="New password" type="password" value={form.password} onChange={(password) => setForm((current) => ({ ...current, password }))} />}
          {step === "done" && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="h-6 w-6" />
              <p className="mt-3 font-semibold">Password reset complete.</p>
            </div>
          )}
          {error && step !== "verify" && <p className="text-sm font-medium text-red-600 dark:text-red-300">{error}</p>}
          <button disabled={status === "loading" || step === "done"} className="premium-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] disabled:opacity-60">
            {status === "loading" ? "Processing..." : step === "request" ? "Request OTP" : step === "verify" ? "Verify & Reset" : "Reset Ready"}
          </button>
          <Link to="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Back to login</Link>
        </form>
      </MotionSection>
    </CommerceShell>
  );
}

function Field({ icon: Icon, label, value, onChange, type = "text", placeholder, disabled }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <span className="premium-control flex items-center gap-3 px-4 py-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <input disabled={disabled} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-medium outline-none disabled:opacity-60" />
      </span>
    </label>
  );
}
