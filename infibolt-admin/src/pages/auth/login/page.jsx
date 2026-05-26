import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAdminStore } from "../../../store/appStore";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminStore((state) => state.login);
  const auth = useAdminStore((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const errors = validateLogin(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    try {
      await login(form);
      toast.success("Secure session active", { description: "Protected workspace access is ready." });
      navigate("/");
    } catch (error) {
      setFieldErrors(error.fields || { email: "Check this email.", password: "Check this password." });
    }
  };

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8F7F5] px-6 py-10 font-sans">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-900/10 bg-white/85 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <ShieldCheck className="h-8 w-8 text-slate-900" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Admin login</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Protected dashboard access with secure session handling and role-aware admin permissions.</p>
        <div className="mt-7 grid gap-4">
          <Field icon={Mail} label="Email" type="email" value={form.email} error={fieldErrors.email} onChange={(email) => setField("email", email)} />
          <Field icon={Lock} label="Password" type="password" value={form.password} error={fieldErrors.password} onChange={(password) => setField("password", password)} />
          <button disabled={auth.status === "loading"} className="premium-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] disabled:opacity-60">
            {auth.status === "loading" ? "Signing in..." : "Login"}
          </button>
          {auth.error && <p className="rounded-xl bg-red-500/10 p-3 text-sm font-medium text-red-700">{auth.error}</p>}
        </div>
      </form>
    </main>
  );
}

function Field({ icon: Icon, label, value, onChange, type, error }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className={`premium-control flex items-center gap-3 px-4 py-3 ${error ? "border-rose-500 bg-rose-50/60" : ""}`}>
        <Icon className="h-4 w-4 text-slate-400" />
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm font-medium outline-none" aria-invalid={Boolean(error)} />
      </span>
      {error && <span className="text-xs font-semibold text-rose-700">{error}</span>}
    </label>
  );
}

function validateLogin(form) {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter a valid admin email.";
  if (form.password.length < 8) errors.password = "Password must be at least 8 characters.";
  return errors;
}
