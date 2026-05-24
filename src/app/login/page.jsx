import { AlertCircle, Lock, Mail, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { CommerceShell, MotionSection, SecondaryButton } from "../components/commerce/CommerceLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const next = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  }, [email, password]);

  const submitLogin = (event) => {
    event.preventDefault();
    setTouched(true);
  };

  return (
    <CommerceShell eyebrow="Customer Access" title="Login to your INFIBOLT account." description="Account access is prepared for profiles, saved addresses, warranty records, and future orders.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid w-full max-w-[1100px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.02] sm:p-8">
            <ShieldCheck className="h-7 w-7 text-slate-900 dark:text-white" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Secure account access</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">Login is API-ready, but customer authentication is not connected yet. The form validates locally and keeps the flow gracefully disabled until backend integration begins.</p>
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-400/10 p-4 text-sm font-medium text-amber-900 dark:text-amber-100">
              Feature in Development: account login launching soon.
            </div>
          </div>

          <form onSubmit={submitLogin} noValidate className="rounded-2xl border border-slate-900/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
            <div className="grid gap-5">
              <AuthField icon={Mail} label="Email address" type="email" value={email} onChange={setEmail} error={touched ? errors.email : ""} placeholder="you@example.com" />
              <AuthField icon={Lock} label="Password" type="password" value={password} onChange={setPassword} error={touched ? errors.password : ""} placeholder="Minimum 8 characters" />
              <button type="submit" aria-disabled="true" className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white opacity-70 transition hover:opacity-80 dark:bg-white dark:text-slate-900">
                Login Coming Soon
              </button>
              {touched && (
                <div className="flex gap-3 rounded-xl border border-slate-900/10 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Authentication backend is not connected yet. Your details were not submitted.</span>
                </div>
              )}
              <SecondaryButton href="/register">Create Account</SecondaryButton>
            </div>
          </form>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

function AuthField({ icon: Icon, label, type, value, onChange, error, placeholder }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{label}</span>
      <span className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition dark:bg-white/[0.03] ${error ? "border-red-400" : "border-slate-900/10 dark:border-white/10"}`}>
        <Icon className="h-4 w-4 text-slate-400" />
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white" />
      </span>
      {error && <span className="text-xs font-medium text-red-600 dark:text-red-300">{error}</span>}
    </label>
  );
}

