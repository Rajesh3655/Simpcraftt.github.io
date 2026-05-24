import { CheckCircle2, Clock3, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
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
import { useAppStore } from "../../../store/appStore";

const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{8,}$/;

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
    if (!STRONG_PASSWORD_PATTERN.test(form.password)) next.password = "Use uppercase, lowercase, number, symbol, and 8+ characters.";
    if (step === "otp" && !/^\d{6}$/.test(form.otp)) next.otp = "Enter the 6 digit code.";
    return next;
  }, [form, step]);

  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const requestPayload = {
    ...form,
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.replace(/\D/g, ""),
  };

  const submit = async (event) => {
    event.preventDefault();
    setTouched(true);
    const detailErrors = ["name", "email", "phone", "password"].some((key) => errors[key]);
    if (step === "details") {
      if (detailErrors) return;
      setStatus("loading");
      try {
        const result = await signup(requestPayload);
        setCooldown(result.resendAfterSeconds || 60);
        setStatus("idle");
        setStep("otp");
        toast.success("Code sent", { description: "Enter the 6 digit code to finish your account." });
      } catch (error) {
        setStatus("idle");
        toast.error("We could not send the code", { description: error.message });
      }
      return;
    }
    if (errors.otp) return;
    setStatus("loading");
    try {
      await verifyOtp(requestPayload);
      setStatus("success");
      toast.success("Account created", { description: "Your ownership space is ready." });
      navigate("/profile");
    } catch (error) {
      setStatus("idle");
      toast.error("Code not accepted", { description: error.message });
    }
  };

  const resend = async () => {
    if (cooldown > 0 || status === "loading") return;
    setStatus("loading");
    try {
      const result = await signup(requestPayload);
      setCooldown(result.resendAfterSeconds || 60);
      toast.success("Code resent", { description: "Use the newest code to continue." });
    } catch (error) {
      toast.error("Unable to resend code", { description: error.message });
    } finally {
      setStatus("idle");
    }
  };

  return (
    <CommerceShell
      eyebrow="Customer Access"
      title="Create your INFIBOLT ID."
      description="Start your product ownership space with a calm, one-time verification."
    >
      <AccountAtmosphere>
        <MotionSection className="px-5 pb-16 sm:px-6 md:px-8 md:pb-20">
          <div className="mx-auto grid w-full max-w-[1000px] gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <AccountCard className="p-5 sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <SoftStatus>{step === "otp" ? "Verify" : "Create"}</SoftStatus>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${step === "details" ? "bg-slate-950" : "bg-emerald-500"}`} />
                  <span className={`h-2 w-2 rounded-full ${step === "otp" ? "bg-slate-950" : "bg-slate-300"}`} />
                </div>
              </div>
              <form onSubmit={submit} noValidate className="grid gap-4">
                <PremiumField icon={UserRound} label="Full name" value={form.name} onChange={update("name")} error={touched ? errors.name : ""} placeholder="Rajesh Kumar" />
                <PremiumField icon={Mail} label="Email address" type="email" value={form.email} onChange={update("email")} error={touched ? errors.email : ""} placeholder="you@example.com" />
                <PremiumField icon={Phone} label="Mobile number" inputMode="numeric" value={form.phone} onChange={update("phone")} error={touched ? errors.phone : ""} placeholder="9876543210" />
                <PremiumField
                  icon={Lock}
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  error={touched ? errors.password : ""}
                  placeholder="Infibolt@123"
                  helper="Use uppercase, lowercase, number, and symbol."
                />
                {step === "otp" && (
                  <div className="grid gap-3 rounded-2xl border border-slate-900/8 bg-white/48 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Verification code</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {cooldown > 0 ? `${cooldown}s` : "Ready"}</span>
                    </div>
                    <OtpInput value={form.otp} onChange={update("otp")} disabled={status === "loading"} error={touched ? errors.otp : ""} />
                    <button type="button" onClick={resend} disabled={cooldown > 0 || status === "loading"} className="premium-button inline-flex min-h-[42px] items-center justify-center rounded-full border border-slate-900/10 bg-white/58 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 disabled:opacity-50">
                      Resend code
                    </button>
                  </div>
                )}
                <PremiumButton loading={status === "loading"} type="submit">
                  {status === "loading" ? "Preparing..." : step === "otp" ? "Complete account" : "Continue"}
                </PremiumButton>
                <Link to="/auth/login" className="text-sm font-medium text-slate-500 transition hover:text-slate-950">Already have an account</Link>
              </form>
            </AccountCard>

            <AccountCard className="p-6 sm:p-8">
              <AccountIntro
                icon={CheckCircle2}
                eyebrow="Ownership begins here"
                title="Built for care after purchase."
                description="Your account becomes a quiet home for devices, warranty records, support conversations, and future direct orders."
              />
              <div className="mt-7 grid gap-3">
                <PremiumNotice title="One-time verification">A short code confirms the account before your profile is created.</PremiumNotice>
                <PremiumNotice title="Designed for long-term ownership">Warranty, support, and product records stay connected to your INFIBOLT ID.</PremiumNotice>
              </div>
            </AccountCard>
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}
