import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAdminStore } from "../../../store/appStore";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminStore((state) => state.login);
  const auth = useAdminStore((state) => state.auth);
  const [form, setForm] = useState({ email: "admin@infibolt.com", password: "Admin@12345" });

  const submit = async (event) => {
    event.preventDefault();
    await login(form);
    toast.success("Admin session active", { description: "Secure backend session is active." });
    navigate("/");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8F7F5] px-6 py-10 font-sans">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-900/10 bg-white/85 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <ShieldCheck className="h-8 w-8 text-slate-900" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Admin login</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Protected dashboard access with secure session handling and role-aware admin permissions.</p>
        <div className="mt-7 grid gap-4">
          <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} />
          <Field icon={Lock} label="Password" type="password" value={form.password} onChange={(password) => setForm((current) => ({ ...current, password }))} />
          <button disabled={auth.status === "loading"} className="premium-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] disabled:opacity-60">
            {auth.status === "loading" ? "Signing in..." : "Login"}
          </button>
          {auth.error && <p className="rounded-xl bg-red-500/10 p-3 text-sm font-medium text-red-700">{auth.error}</p>}
        </div>
      </form>
    </main>
  );
}

function Field({ icon: Icon, label, value, onChange, type }) {
  return <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span><span className="premium-control flex items-center gap-3 px-4 py-3"><Icon className="h-4 w-4 text-slate-400" /><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm font-medium outline-none" /></span></label>;
}
