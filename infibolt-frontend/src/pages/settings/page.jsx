import { Bell, Moon, Save, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { ProtectedRoute } from "../../components/AppStates";
import { AccountAtmosphere, AccountCard, PremiumButton, PremiumField, SoftStatus } from "../../components/customer/PremiumAccount";
import { useAppStore } from "../../store/appStore";

export default function SettingsPage() {
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const [form, setForm] = useState(profile);

  const save = (event) => {
    event.preventDefault();
    updateProfile(form);
    toast.success("Preferences saved", { description: "Your account details are ready for the next visit." });
  };

  return (
    <CommerceShell eyebrow="Account" title="Preferences" description="Keep your INFIBOLT profile, updates, and display settings quietly tuned.">
      <AccountAtmosphere>
        <MotionSection className="px-5 pb-16 sm:px-6 md:px-8 md:pb-20">
          <ProtectedRoute>
            <form onSubmit={save} className="mx-auto grid max-w-4xl gap-5">
              <Panel icon={UserRound} eyebrow="Identity" title="Profile details">
                <div className="grid gap-4 md:grid-cols-2">
                  {["name", "email", "phone", "city", "state"].map((key) => (
                    <PremiumField
                      key={key}
                      label={key}
                      value={form[key] || ""}
                      onChange={(value) => setForm((current) => ({ ...current, [key]: value }))}
                      type={key === "email" ? "email" : "text"}
                    />
                  ))}
                </div>
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
