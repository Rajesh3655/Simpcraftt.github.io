import { Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import {
  AccountAtmosphere,
  AccountCard,
  AccountIntro,
  PremiumButton,
  PremiumField,
  PremiumNotice,
  SoftStatus,
} from "../../../components/customer/PremiumAccount";
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
    await login({ email: form.email.trim().toLowerCase(), password: form.password });
    toast.success("Welcome back", { description: "Your INFIBOLT space is ready." });
    navigate("/profile");
  };

  return (
    <CommerceShell
      eyebrow="Customer Access"
      title="Welcome back."
      description="A quiet entrance to your products, care history, and ownership profile."
    >
      <AccountAtmosphere>
        <MotionSection className="px-5 pb-16 sm:px-6 md:px-8 md:pb-20">
          <div className="mx-auto grid w-full max-w-[980px] gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <AccountCard className="p-6 sm:p-8">
              <AccountIntro
                icon={ShieldCheck}
                eyebrow="Private ownership"
                title="Everything you own, kept close."
                description="Sign in to manage registered devices, support conversations, care coverage, and future orders in one refined space."
              />
              <div className="mt-7 grid gap-3">
                {["Warranty memories stay attached to every product.", "Support updates remain easy to follow.", "Your account stays calm across every visit."].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-900/8 bg-white/52 px-4 py-3 text-sm font-light leading-6 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </AccountCard>

            <AccountCard className="p-5 sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <SoftStatus>INFIBOLT ID</SoftStatus>
                  <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Login</h2>
                </div>
                <Sparkles className="h-5 w-5 text-slate-400" strokeWidth={1.7} />
              </div>
              <form onSubmit={submitLogin} noValidate className="grid gap-4">
                <PremiumField icon={Mail} label="Email address" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} error={touched ? errors.email : ""} placeholder="you@example.com" />
                <PremiumField icon={Lock} label="Password" type="password" value={form.password} onChange={(password) => setForm((current) => ({ ...current, password }))} error={touched ? errors.password : ""} placeholder="Your password" />
                <PremiumButton loading={auth.status === "loading"} type="submit">
                  {auth.status === "loading" ? "Opening..." : "Enter account"}
                </PremiumButton>
                {auth.error && <PremiumNotice tone="error" title="We could not open your account">{auth.error}</PremiumNotice>}
                <div className="flex flex-col gap-3 pt-1 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <Link to="/auth/register" className="text-slate-950 transition hover:text-slate-600">Create account</Link>
                  <Link to="/auth/otp" className="text-slate-500 transition hover:text-slate-950">Reset password</Link>
                </div>
              </form>
            </AccountCard>
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}
