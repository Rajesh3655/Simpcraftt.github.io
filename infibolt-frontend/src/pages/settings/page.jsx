import { Bell, Moon, Save, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { ProtectedRoute } from "../../components/AppStates";
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
    toast.success("Settings saved", { description: "Profile preferences are stored locally until backend sync." });
  };

  return (
    <CommerceShell eyebrow="Account" title="Settings" description="Profile, notification, and display preferences are ready for account API sync.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <ProtectedRoute>
          <form onSubmit={save} className="mx-auto grid max-w-4xl gap-6">
            <Panel icon={UserRound} title="Profile">
              <div className="grid gap-4 md:grid-cols-2">
                {["name", "email", "phone", "city", "state"].map((key) => (
                  <label key={key} className="grid gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{key}</span>
                    <input value={form[key] || ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="min-h-[48px] rounded-xl border border-slate-900/10 bg-white px-4 text-sm font-medium outline-none" />
                  </label>
                ))}
              </div>
            </Panel>
            <Panel icon={Bell} title="Notifications">
              <div className="grid gap-3 sm:grid-cols-2">
                {["Warranty updates", "Support replies", "Product launches", "Marketplace reminders"].map((item) => <Toggle key={item} label={item} />)}
              </div>
            </Panel>
            <Panel icon={Moon} title="Display">
              <div className="flex gap-3">
                {["light", "dark"].map((item) => <button type="button" onClick={() => setTheme(item)} key={item} className={`rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] ${theme === item ? "bg-slate-900 text-white" : "border border-slate-900/10 text-slate-600"}`}>{item}</button>)}
              </div>
            </Panel>
            <button className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white"><Save className="h-4 w-4" /> Save settings</button>
          </form>
        </ProtectedRoute>
      </MotionSection>
    </CommerceShell>
  );
}

function Panel({ icon: Icon, title, children }) {
  return <section className="rounded-2xl border border-slate-900/10 bg-white/75 p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><Icon className="h-5 w-5" /><h2 className="text-xl font-semibold">{title}</h2></div>{children}</section>;
}

function Toggle({ label }) {
  const [enabled, setEnabled] = useState(true);
  return <button type="button" onClick={() => setEnabled((value) => !value)} className="flex items-center justify-between rounded-xl border border-slate-900/10 bg-white px-4 py-3 text-sm font-medium"><span>{label}</span><span className={`h-6 w-11 rounded-full p-1 ${enabled ? "bg-slate-900" : "bg-slate-200"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} /></span></button>;
}
