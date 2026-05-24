import { CheckCircle2, Clock3, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CommerceShell, MotionSection, SecondaryButton } from "../components/commerce/CommerceLayout";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", otp: "" });
  const [step, setStep] = useState("details");
  const [countdown, setCountdown] = useState(30);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (step !== "otp" || countdown <= 0) return undefined;
    const timer = window.setInterval(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [step, countdown]);

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

  const requestOtp = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!errors.name && !errors.email && !errors.phone && !errors.password) {
      setStep("otp");
      setCountdown(30);
    }
  };

  return (
    <CommerceShell eyebrow="Customer Access" title="Create your account." description="Registration is prepared for mobile OTP verification and customer identity flows.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid w-full max-w-[1120px] gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={requestOtp} noValidate className="rounded-2xl border border-slate-900/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
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
                <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <AuthField label="OTP code" inputMode="numeric" value={form.otp} onChange={update("otp")} error={touched ? errors.otp : ""} placeholder="000000" />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><Clock3 className="h-4 w-4" /> Resend available in {countdown}s</p>
                    <button type="button" disabled={countdown > 0} onClick={() => setCountdown(30)} className="text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-900 disabled:opacity-40 dark:text-white">Resend OTP</button>
                  </div>
                </div>
              )}

              <button type="submit" className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                {step === "otp" ? "Verify OTP Soon" : "Continue to OTP"}
              </button>
              <SecondaryButton href="/login">Already have an account</SecondaryButton>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.02] sm:p-8">
            <CheckCircle2 className="h-7 w-7 text-slate-900 dark:text-white" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">OTP verification coming soon</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">The signup UI is ready for mobile OTP handoff, resend timing, and verification feedback. Until backend OTP is connected, no account is created and no OTP is sent.</p>
            <div className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="rounded-xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">Phone number input with local validation</div>
              <div className="rounded-xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">OTP entry, countdown, and resend placeholder</div>
              <div className="rounded-xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">Success/failure states ready for API integration</div>
            </div>
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

function AuthField({ icon: Icon, label, type = "text", value, onChange, error, placeholder, inputMode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{label}</span>
      <span className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition dark:bg-white/[0.03] ${error ? "border-red-400" : "border-slate-900/10 dark:border-white/10"}`}>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <input type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white" />
      </span>
      {error && <span className="text-xs font-medium text-red-600 dark:text-red-300">{error}</span>}
    </label>
  );
}

