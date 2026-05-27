import { Bell, Clock3, Mail, Moon, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { ProtectedRoute } from "../../components/AppStates";
import { AccountAtmosphere, AccountCard, PremiumButton, PremiumField, SoftStatus } from "../../components/customer/PremiumAccount";
import { OtpInput } from "../../components/OtpInput";
import { useAppStore } from "../../store/appStore";

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidPhone(value) {
  return /^[1-9]\d{7,14}$/.test(normalizePhone(value));
}

export default function SettingsPage() {
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const requestProfileContactUpdate = useAppStore((state) => state.requestProfileContactUpdate);
  const verifyProfileContactUpdate = useAppStore((state) => state.verifyProfileContactUpdate);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const [form, setForm] = useState(profile);
  const [emailVerification, setEmailVerification] = useState({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" });

  useEffect(() => setForm(profile), [profile]);

  useEffect(() => {
    if (emailVerification.cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setEmailVerification((current) => ({ ...current, cooldown: Math.max(current.cooldown - 1, 0) })), 1000);
    return () => window.clearInterval(timer);
  }, [emailVerification.cooldown]);

  const save = async (event) => {
    event.preventDefault();
    const { email, phone, ...safeProfileFields } = form;
    if (!profile.phone) {
      if (!isValidPhone(phone)) {
        toast.error("Phone number required", { description: "Add a valid phone number to complete your profile." });
        return;
      }
      safeProfileFields.phone = normalizePhone(phone);
    }
    if (!String(form.address || "").trim() || !String(form.city || "").trim() || !String(form.state || "").trim()) {
      toast.error("Address details required", { description: "Add full address, city, and state to complete your profile." });
      return;
    }
    await updateProfile(safeProfileFields);
    toast.success("Preferences saved", { description: "Your account details are ready for the next visit." });
  };

  const verifyEmail = async () => {
    if (emailVerification.otp.length !== 6) {
      setEmailVerification((current) => ({ ...current, error: "Enter the 6 digit email code." }));
      return;
    }
    setEmailVerification((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const result = await verifyProfileContactUpdate({ email: emailVerification.email, verificationId: emailVerification.verificationId, otp: emailVerification.otp });
      setForm((current) => ({ ...current, ...result }));
      setEmailVerification({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" });
      toast.success("Email updated", { description: "Your account records now use the new email." });
    } catch (error) {
      setEmailVerification((current) => ({ ...current, status: "pending", error: error.message || "Email code was not accepted." }));
    }
  };

  const resendEmail = async () => {
    if (!emailVerification.email || emailVerification.cooldown > 0 || emailVerification.status === "loading") return;
    setEmailVerification((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const result = await requestProfileContactUpdate({ email: emailVerification.email });
      setEmailVerification((current) => ({ ...current, verificationId: result.verificationId || current.verificationId, otp: "", cooldown: result.resendAfterSeconds || 60, status: "pending" }));
      toast.success("Code resent", { description: "Use the newest email code to continue." });
    } catch (error) {
      setEmailVerification((current) => ({ ...current, status: "pending", error: error.message || "Could not resend the code." }));
    }
  };

  return (
    <CommerceShell eyebrow="Account" title="Preferences" description="Keep your INFIBOLT profile, updates, and display settings quietly tuned.">
      <AccountAtmosphere>
        <MotionSection className="px-5 pb-16 sm:px-6 md:px-8 md:pb-20">
          <ProtectedRoute>
            <form onSubmit={save} className="mx-auto grid max-w-4xl gap-5">
              <Panel icon={UserRound} eyebrow="Identity" title="Profile details">
                <div className="grid gap-4 md:grid-cols-2">
                  {["name", "email", "phone", "address", "city", "state"].map((key) => (
                    <PremiumField
                      key={key}
                      label={key}
                      value={form[key] || ""}
                      onChange={(value) => {
                        if (key === "email" || (key === "phone" && profile.phone)) return;
                        setForm((current) => ({ ...current, [key]: value }));
                      }}
                      type={key === "email" ? "email" : "text"}
                      disabled={key === "email" || (key === "phone" && Boolean(profile.phone))}
                      helper={key === "email" ? "Account email is fixed after signup." : key === "phone" ? (profile.phone ? "Phone is fixed after signup and can be used for login." : "Required to complete your Google account profile.") : key === "address" ? "Required for warranty pickup, delivery, and support." : undefined}
                    />
                  ))}
                </div>
                <EmailVerificationPanel verification={emailVerification} onOtpChange={(otp) => setEmailVerification((current) => ({ ...current, otp, error: "" }))} onVerify={verifyEmail} onResend={resendEmail} onCancel={() => setEmailVerification({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" })} />
              </Panel>
              <Panel icon={Bell} eyebrow="Signals" title="Notification rhythm">
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Warranty updates", "Support replies", "Product launches", "Marketplace reminders"].map((item) => <Toggle key={item} label={item} />)}
                </div>
              </Panel>
              <Panel icon={Moon} eyebrow="Display" title="Visual mode">
                <div className="flex flex-col gap-3 sm:flex-row">
                  {["light", "dark"].map((item) => (
                    <button type="button" onClick={() => setTheme(item)} key={item} className={`premium-button min-h-[46px] rounded-full px-5 text-xs font-semibold uppercase tracking-[0.16em] transition ${theme === item ? "bg-slate-950 text-white shadow-[0_16px_38px_rgba(17,24,39,0.14)]" : "border border-slate-900/10 bg-white/52 text-slate-600 hover:bg-white"}`}>{item}</button>
                  ))}
                </div>
              </Panel>
              <PremiumButton type="submit" className="sm:w-fit">
                <Save className="h-4 w-4" />
                Save preferences
              </PremiumButton>
            </form>
          </ProtectedRoute>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}

function EmailVerificationPanel({ verification, onOtpChange, onVerify, onResend, onCancel }) {
  if (!verification.email) return null;
  return (
    <div className="mt-4 grid gap-4 rounded-2xl border border-sky-900/10 bg-sky-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-950">
          <Mail className="h-4 w-4" /> Verify {verification.email}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {verification.cooldown > 0 ? `${verification.cooldown}s` : "Ready"}</span>
      </div>
      <OtpInput value={verification.otp} onChange={onOtpChange} disabled={verification.status === "loading"} error={verification.error} />
      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={onCancel} className="min-h-[42px] rounded-full border border-slate-900/10 bg-white px-4 text-xs font-semibold text-slate-700">Cancel</button>
        <button type="button" onClick={onResend} disabled={verification.cooldown > 0 || verification.status === "loading"} className="min-h-[42px] rounded-full border border-slate-900/10 bg-white px-4 text-xs font-semibold text-slate-700 disabled:opacity-50">Resend</button>
        <button type="button" onClick={onVerify} className="min-h-[42px] rounded-full bg-slate-950 px-4 text-xs font-semibold text-white">{verification.status === "loading" ? "Checking..." : "Verify email"}</button>
      </div>
    </div>
  );
}

function Panel({ icon: Icon, eyebrow, title, children }) {
  return (
    <AccountCard className="p-6 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <SoftStatus>{eyebrow}</SoftStatus>
          <h2 className="mt-3 text-xl font-semibold tracking-normal text-slate-950">{title}</h2>
        </div>
        <Icon className="h-5 w-5 text-slate-400" strokeWidth={1.8} />
      </div>
      {children}
    </AccountCard>
  );
}

function Toggle({ label }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <button type="button" onClick={() => setEnabled((value) => !value)} className="flex min-h-[52px] items-center justify-between gap-4 rounded-2xl border border-slate-900/8 bg-white/52 px-4 text-sm font-medium text-slate-700 transition hover:bg-white/86">
      <span>{label}</span>
      <span className={`h-6 w-11 shrink-0 rounded-full p-1 transition ${enabled ? "bg-slate-950" : "bg-slate-200"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}
