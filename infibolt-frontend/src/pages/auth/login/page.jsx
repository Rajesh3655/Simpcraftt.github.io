import { AlertCircle, Lock, Mail, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import { useAppStore } from "../../../store/appStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const auth = useAppStore((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    return next;
  }, [form]);

  const submitLogin = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length) return;
    await login(form);
    toast.success("Welcome back", { description: "Your secure backend session is active." });
    navigate("/profile");
  };

  return (
    <CommerceShell eyebrow="Customer Access" title="Login to your INFIBOLT account." description="Secure authentication with token handling, session state, and protected backend requests.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid w-full max-w-[1080px] gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <aside className="premium-surface p-6 dark:bg-white/[0.03] sm:p-8">
            <ShieldCheck className="h-7 w-7 text-slate-900 dark:text-white" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Session-ready access</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">Login uses the centralized auth service, axios interceptors, token storage, loading state, toast feedback, and protected profile routing.</p>
            <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-800 dark:text-emerald-100">Secure cookie session with CSRF-protected backend requests.</div>
          </aside>

          <form onSubmit={submitLogin} noValidate className="premium-surface p-5 backdrop-blur dark:bg-white/[0.04] sm:p-8">
            <div className="grid gap-5">
              <AuthField icon={Mail} label="Email address" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} error={touched ? errors.email : ""} placeholder="customer@infibolt.com" />
              <AuthField icon={Lock} label="Password" type="password" value={form.password} onChange={(password) => setForm((current) => ({ ...current, password }))} error={touched ? errors.password : ""} placeholder="Minimum 8 characters" />
              <button disabled={auth.status === "loading"} type="submit" className="premium-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900">
                {auth.status === "loading" ? "Signing In..." : "Login"}
              </button>
              {auth.error && (
                <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-800 dark:text-red-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{auth.error}</span>
                </div>
              )}
              <div className="flex flex-col gap-3 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <Link to="/auth/register" className="text-slate-900 hover:underline dark:text-white">Create account</Link>
                <Link to="/auth/otp" className="text-slate-900 hover:underline dark:text-white">Forgot password / OTP</Link>
              </div>
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
      <span className={`premium-control flex items-center gap-3 px-4 py-3 dark:bg-white/[0.03] ${error ? "border-red-400" : "dark:border-white/10"}`}>
        <Icon className="h-4 w-4 text-slate-400" />
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white" />
      </span>
      {error && <span className="text-xs font-medium text-red-600 dark:text-red-300">{error}</span>}
    </label>
  );
}
