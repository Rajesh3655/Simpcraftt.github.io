import { CheckCircle2, Clock3, Lock, Mail, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import { OtpInput } from "../../../components/OtpInput";
import {
  AccountAtmosphere,
  AccountCard,
  AccountIntro,
  PremiumButton,
  PremiumField,
  PremiumNotice,
  SoftStatus,
} from "../../../components/customer/PremiumAccount";
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
      setError(step === "request" ? "Enter a valid email address." : "Enter the code and a stronger password.");
      return;
    }
    setError("");
    setStatus("loading");
    try {
      if (step === "request") {
        const result = await authService.forgotPassword({ email: form.email.trim().toLowerCase() });
        setCooldown(result.resendAfterSeconds || 60);
        setStep("verify");
        toast.success("Code sent", { description: "Check your inbox and enter the 6 digit code." });
      } else {
        await authService.resetPassword({ ...form, email: form.email.trim().toLowerCase() });
        toast.success("Password updated", { description: "You can sign in with your new password." });
        setStep("done");
      }
    } catch (requestError) {
      setError(requestError.message || "We could not complete the request.");
    } finally {
      setStatus("idle");
    }
  };

  const resend = async () => {
    if (cooldown > 0 || !/^\S+@\S+\.\S+$/.test(form.email)) return;
    setStatus("loading");
    setError("");
    try {
      const result = await authService.forgotPassword({ email: form.email.trim().toLowerCase() });
      setCooldown(result.resendAfterSeconds || 60);
      toast.success("Code resent", { description: "Use the newest code to continue." });
    } catch (requestError) {
      setError(requestError.message || "Unable to resend the code.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <CommerceShell
      eyebrow="Account Recovery"
      title="Reset with calm confidence."
      description="Recover access with a short verification code and a new password."
    >
      <AccountAtmosphere>
        <MotionSection className="px-5 pb-16 sm:px-6 md:px-8 md:pb-20">
          <div className="mx-auto grid w-full max-w-[900px] gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <AccountCard className="p-6 sm:p-8">
              <AccountIntro
                icon={Lock}
                eyebrow="Private reset"
                title="A careful path back in."
                description="Request a code, confirm it, and choose a new password without leaving the INFIBOLT experience."
              />
              <div className="mt-7 flex gap-2">
                {["request", "verify", "done"].map((item) => (
                  <span key={item} className={`h-1.5 flex-1 rounded-full ${step === item ? "bg-slate-950" : step === "done" ? "bg-emerald-500" : "bg-slate-200"}`} />
                ))}
              </div>
            </AccountCard>

            <AccountCard className="p-5 sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <SoftStatus>{step === "request" ? "Request" : step === "verify" ? "Verify" : "Complete"}</SoftStatus>
                {step === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              </div>
              <form onSubmit={submit} className="grid gap-4">
                <PremiumField icon={Mail} label="Email address" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} disabled={step !== "request"} placeholder="you@example.com" />
                {step === "verify" && (
                  <div className="grid gap-3 rounded-2xl border border-slate-900/8 bg-white/48 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Verification code</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {cooldown > 0 ? `${cooldown}s` : "Ready"}</span>
                    </div>
                    <OtpInput value={form.otp} onChange={(otp) => setForm((current) => ({ ...current, otp }))} disabled={status === "loading"} error={error && /^\d{6}$/.test(form.otp) ? error : ""} />
                    <button type="button" onClick={resend} disabled={cooldown > 0 || status === "loading"} className="premium-button inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/58 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 disabled:opacity-50">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Resend code
                    </button>
                  </div>
                )}
                {step !== "request" && <PremiumField icon={Lock} label="New password" type="password" value={form.password} onChange={(password) => setForm((current) => ({ ...current, password }))} placeholder="New password" />}
                {step === "done" && <PremiumNotice tone="success" title="Password updated">Your account is ready for sign in.</PremiumNotice>}
                {error && step !== "verify" && <PremiumNotice tone="error" title="A little more is needed">{error}</PremiumNotice>}
                <PremiumButton loading={status === "loading"} disabled={step === "done"} type="submit">
                  {status === "loading" ? "Checking..." : step === "request" ? "Send code" : step === "verify" ? "Update password" : "Reset complete"}
                </PremiumButton>
                <Link to="/auth/login" className="text-sm font-medium text-slate-500 transition hover:text-slate-950">Back to login</Link>
              </form>
            </AccountCard>
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}
