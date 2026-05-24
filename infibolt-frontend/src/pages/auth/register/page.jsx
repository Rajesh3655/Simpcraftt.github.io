import { CheckCircle2, Clock3, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import { OtpInput } from "../../../components/OtpInput";
import { useAppStore } from "../../../store/appStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const signup = useAppStore((state) => state.signup);
  const verifyOtp = useAppStore((state) => state.verifyOtp);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", otp: "" });
  const [step, setStep] = useState("details");
  const [status, setStatus] = useState("idle");
  const [touched, setTouched] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(current - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const errors = useMemo(() => {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ""))) next.phone = "Enter a valid 10 digit mobile number.";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (step === "otp" && !/^\d{6}$/.test(form.otp)) next.otp = "Enter the 6 digit OTP.";
    return next;
  }, [form, step]);

  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setTouched(true);
    const detailErrors = ["name", "email", "phone", "password"].some((key) => errors[key]);
    if (step === "details") {
      if (detailErrors) return;
      setStatus("loading");
      try {
        const result = await signup(form);
        setCooldown(result.resendAfterSeconds || 60);
        setStatus("success");
        setStep("otp");
        toast.success("OTP sent", { description: "Check the backend terminal in local development." });
      } catch (error) {
        setStatus("idle");
        toast.error("OTP request failed", { description: error.message });
      }
      return;
    }
    if (errors.otp) return;
    setStatus("loading");
    try {
      await verifyOtp(form);
      setStatus("success");
      toast.success("Account created", { description: "Your secure session is active." });
      navigate("/profile");
    } catch (error) {
      setStatus("idle");
      toast.error("OTP verification failed", { description: error.message });
    }
  };

  const resend = async () => {
    if (cooldown > 0 || status === "loading") return;
    setStatus("loading");
    try {
      const result = await signup(form);
      setCooldown(result.resendAfterSeconds || 60);
      toast.success("OTP resent", { description: "A new code was issued." });
    } catch (error) {
      toast.error("Unable to resend OTP", { description: error.message });
    } finally {
      setStatus("idle");
    }
  };

  return (
    <CommerceShell eyebrow="Customer Access" title="Create your account." description="Secure signup with single-use OTP verification and a clean account handoff.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid w-full max-w-[1120px] gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={submit} noValidate className="premium-surface p-5 backdrop-blur dark:bg-white/[0.04] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${step === "details" ? "bg-slate-900 dark:bg-white" : "bg-emerald-500"}`} />
              <span className={`h-2.5 w-2.5 rounded-full ${step === "otp" ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-white/20"}`} />
            </div>
            <div className="grid gap-5">
              <AuthField icon={UserRound} label="Full name" value={form.name} onChange={update("name")} error={touched ? errors.name : ""} placeholder="Rajesh Kumar" />
              <AuthField icon={Mail} label="Email address" type="email" value={form.email} onChange={update("email")} error={touched ? errors.email : ""} placeholder="you@example.com" />
              <AuthField icon={Phone} label="Mobile number" inputMode="numeric" value={form.phone} onChange={update("phone")} error={touched ? errors.phone : ""} placeholder="9876543210" />
              <AuthField icon={Lock} label="Password" type="password" value={form.password} onChange={update("password")} error={touched ? errors.password : ""} placeholder="Minimum 8 characters" />
              {step === "otp" && (
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">OTP code</span>
                    <span className="text-xs font-medium text-slate-500">{cooldown > 0 ? `${cooldown}s` : "Ready to resend"}</span>
                  </div>
                  <OtpInput value={form.otp} onChange={update("otp")} disabled={status === "loading"} error={touched ? errors.otp : ""} />
                  <button type="button" onClick={resend} disabled={cooldown > 0 || status === "loading"} className="premium-button inline-flex min-h-[40px] items-center justify-center rounded-full border border-slate-900/10 px-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-slate-300">
                    Resend OTP
                  </button>
                </div>
              )}
              <button disabled={status === "loading"} type="submit" className="premium-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900">
                {status === "loading" ? "Processing..." : step === "otp" ? "Verify OTP" : "Continue to OTP"}
              </button>
              <Link to="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Already have an account</Link>
            </div>
          </form>

          <aside className="premium-surface p-6 dark:bg-white/[0.03] sm:p-8">
            <CheckCircle2 className="h-7 w-7 text-slate-900 dark:text-white" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Production auth UX</h2>
            <div className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="rounded-xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">Clean validation before secure requests</div>
              <div className="rounded-xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">Single-use OTP, secure session cookies</div>
              <div className="rounded-xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">Success/error toasts and protected route handoff</div>
              <p className="flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><Clock3 className="h-4 w-4" /> Local provider logs OTP server-side</p>
            </div>
          </aside>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

function AuthField({ icon: Icon, label, type = "text", value, onChange, error, placeholder, inputMode, helper }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{label}</span>
      <span className={`premium-control flex items-center gap-3 px-4 py-3 dark:bg-white/[0.03] ${error ? "border-red-400" : "dark:border-white/10"}`}>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <input type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white" />
      </span>
      {helper && <span className="text-xs font-medium text-slate-500">{helper}</span>}
      {error && <span className="text-xs font-medium text-red-600 dark:text-red-300">{error}</span>}
    </label>
  );
}
