import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HelpCircle,
  Heart,
  Home,
  LifeBuoy,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  Settings,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { AccountAccess, SessionExpiredNotice } from "../../components/customer/AccountAccess";
import { AccountAtmosphere, AccountCard, PremiumButton, PremiumField, PremiumSelect, SoftStatus } from "../../components/customer/PremiumAccount";
import { OtpInput } from "../../components/OtpInput";
import { formatPrice, products } from "../../store/commerce";
import { useAppStore } from "../../store/appStore";

const accountTabs = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "products", label: "My Products", icon: PackageCheck },
  { id: "warranty", label: "Warranty", icon: ShieldCheck },
  { id: "support", label: "Support", icon: TicketCheck },
  { id: "saved", label: "Saved Items", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

const panelMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

const ownershipPreviewDevices = products.slice(0, 3).map((product, index) => ({
  ...product,
  serial: ["IB-AAP-24-0187", "IB-NWX-24-0421", "IB-ECM-24-0093"][index],
  ownerSince: ["12 May 2026", "03 Apr 2026", "18 Mar 2026"][index],
  warrantyUntil: ["12 May 2027", "03 Apr 2027", "18 Mar 2027"][index],
  protection: [82, 73, 66][index],
}));

const defaultTickets = [
  { id: "CARE-1024", topic: "Warranty", status: "In review", message: "Invoice verification for Aura Audio Pro", updatedAt: "Today" },
  { id: "CARE-1018", topic: "Product guidance", status: "Resolved", message: "Best charging profile for Nova Watch X", updatedAt: "Yesterday" },
];

const defaultClaims = [
  { id: "WR-2208", product: "Aura Audio Pro", serial: "IB-AAP-24-0187", status: "Protected", updatedAt: "Verified today" },
  { id: "WR-2182", product: "Echo Charge Max", serial: "IB-ECM-24-0093", status: "Invoice check", updatedAt: "2 days ago" },
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const mobileQuickActions = [
  { label: "Saved", icon: Heart, tab: "saved" },
];

const mobileServices = [
  { label: "Help", icon: LifeBuoy, href: "/support" },
  { label: "FAQ", icon: HelpCircle, href: "/faq" },
  { label: "Warranty terms", icon: WalletCards, href: "/warranty-policy" },
];

export default function ProfilePage() {
  const auth = useAppStore((state) => state.auth);
  const profile = useAppStore((state) => state.profile);
  const wishlist = useAppStore((state) => state.wishlist.items);
  const warranty = useAppStore((state) => state.warranty);
  const support = useAppStore((state) => state.support);
  const loadSupportTickets = useAppStore((state) => state.loadSupportTickets);
  const loadWarrantyClaims = useAppStore((state) => state.loadWarrantyClaims);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const requestProfileContactUpdate = useAppStore((state) => state.requestProfileContactUpdate);
  const verifyProfileContactUpdate = useAppStore((state) => state.verifyProfileContactUpdate);
  const logout = useAppStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState("settings");
  const [settingsForm, setSettingsForm] = useState(profile);
  const [settingsPasswordError, setSettingsPasswordError] = useState("");
  const [emailVerification, setEmailVerification] = useState({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" });

  useEffect(() => {
    if (!auth.user) return;
    loadSupportTickets();
    loadWarrantyClaims();
  }, [auth.user, loadSupportTickets, loadWarrantyClaims]);

  useEffect(() => {
    setSettingsForm(profile);
  }, [profile]);

  useEffect(() => {
    if (emailVerification.cooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setEmailVerification((current) => ({ ...current, cooldown: Math.max(current.cooldown - 1, 0) }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [emailVerification.cooldown]);

  const signedIn = Boolean(auth.user);
  const supportItems = support.tickets.length ? support.tickets : defaultTickets;
  const warrantyItems = warranty.claims.length ? warranty.claims : defaultClaims;
  const savedItems = wishlist.length ? wishlist : products.slice(0, 2);
  if (!signedIn) {
    return (
      <CommerceShell seoTitle="Account" seoDescription="Secure INFIBOLT account access for products, warranty records, and support.">
        <AccountAtmosphere>
          <MotionSection className="grid min-h-[calc(100svh-73px)] place-items-center px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
            <div className="mx-auto grid max-w-[1080px] gap-5">
              {auth.status === "expired" && <SessionExpiredNotice />}
              <AccountAccess initialMode="login" />
            </div>
          </MotionSection>
        </AccountAtmosphere>
      </CommerceShell>
    );
  }

  const saveProfile = async (event) => {
    event.preventDefault();
    const wantsPasswordChange = settingsForm.currentPassword || settingsForm.newPassword;
    if (wantsPasswordChange && (!settingsForm.currentPassword || !settingsForm.newPassword)) {
      setSettingsPasswordError("Enter both current and new password.");
      toast.error("Password not saved", { id: "account-profile-action", description: "Enter both current and new password." });
      return;
    }
    if (settingsForm.newPassword && settingsForm.newPassword.length < 8) {
      setSettingsPasswordError("New password must be at least 8 characters.");
      toast.error("Password not saved", { id: "account-profile-action", description: "New password must be at least 8 characters." });
      return;
    }
    const { currentPassword, newPassword, ...profileFields } = settingsForm;
    try {
      const { email, phone, ...safeProfileFields } = profileFields;
      await updateProfile(safeProfileFields);
      setSettingsPasswordError("");
      setSettingsForm({ ...profileFields, currentPassword: "", newPassword: "" });
      toast.success("Profile saved", {
        id: "account-profile-action",
        description: wantsPasswordChange ? "Profile updated. Password change is ready for backend connection." : "Your account details were updated.",
      });
    } catch (error) {
      toast.error("Profile not saved", { id: "account-profile-action", description: error.message || "Please try again." });
    }
  };

  const verifyEmailChange = async () => {
    if (!emailVerification.email || emailVerification.otp.length !== 6) {
      setEmailVerification((current) => ({ ...current, error: "Enter the 6 digit email code." }));
      return;
    }
    setEmailVerification((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const result = await verifyProfileContactUpdate({
        email: emailVerification.email,
        verificationId: emailVerification.verificationId,
        otp: emailVerification.otp,
      });
      setSettingsForm((current) => ({ ...current, ...result, currentPassword: "", newPassword: "" }));
      setEmailVerification({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" });
      toast.success("Email updated", { id: "account-profile-action", description: "Your account, warranty, support, and newsletter records now use the new email." });
    } catch (error) {
      setEmailVerification((current) => ({ ...current, status: "pending", error: error.message || "Email code was not accepted." }));
    }
  };

  const resendEmailChange = async () => {
    if (!emailVerification.email || emailVerification.cooldown > 0 || emailVerification.status === "loading") return;
    setEmailVerification((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const result = await requestProfileContactUpdate({ email: emailVerification.email });
      setEmailVerification((current) => ({ ...current, verificationId: result.verificationId || current.verificationId, cooldown: result.resendAfterSeconds || 60, status: "pending", otp: "" }));
      toast.success("Code resent", { id: "account-profile-action", description: "Use the newest email code to continue." });
    } catch (error) {
      setEmailVerification((current) => ({ ...current, status: "pending", error: error.message || "Could not resend the code." }));
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out", { id: "account-profile-action", description: "Your secure session has ended." });
  };

  return (
    <CommerceShell seoTitle="Customer Profile" seoDescription="Premium INFIBOLT customer ownership hub.">
      <AccountAtmosphere>
        <MotionSection className="px-3 pb-32 pt-6 sm:px-6 md:px-8 md:pb-24 lg:pt-10">
          <div className="mx-auto grid w-full max-w-[1320px] min-w-0 gap-4 sm:gap-5 lg:hidden">
            <MobileProfileApp
              profile={profile}
              updateProfile={updateProfile}
              requestProfileContactUpdate={requestProfileContactUpdate}
              emailVerification={emailVerification}
              onEmailOtpChange={(otp) => setEmailVerification((current) => ({ ...current, otp, error: "" }))}
              onEmailVerificationStart={setEmailVerification}
              onVerifyEmail={verifyEmailChange}
              onResendEmail={resendEmailChange}
              onCancelEmail={() => setEmailVerification({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" })}
              onOpenTab={setActiveTab}
              onLogout={handleLogout}
            />
          </div>

          <div className="mx-auto hidden w-full max-w-[1320px] min-w-0 gap-4 sm:gap-5 lg:grid">
            <AccountHero profile={profile} />

            <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[282px_1fr]">
              <AccountNav activeTab={activeTab} onChange={setActiveTab} onLogout={handleLogout} />

              <div className="min-w-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <TabPanel key="overview">
                      <OverviewPanel />
                    </TabPanel>
                  )}
                  {activeTab === "products" && (
                    <TabPanel key="products">
                      <ProductsPanel devices={ownershipPreviewDevices} />
                    </TabPanel>
                  )}
                  {activeTab === "warranty" && (
                    <TabPanel key="warranty">
                      <WarrantyPanel items={warrantyItems} status={warranty.status} error={warranty.error} />
                    </TabPanel>
                  )}
                  {activeTab === "support" && (
                    <TabPanel key="support">
                      <SupportPanel items={supportItems} status={support.status} error={support.error} />
                    </TabPanel>
                  )}
                  {activeTab === "saved" && (
                    <TabPanel key="saved">
                      <SavedPanel items={savedItems} usingSamples={!wishlist.length} />
                    </TabPanel>
                  )}
                  {activeTab === "addresses" && (
                    <TabPanel key="addresses">
                      <AddressesPanel profile={profile} />
                    </TabPanel>
                  )}
                  {activeTab === "alerts" && (
                    <TabPanel key="alerts">
                      <AlertsPanel />
                    </TabPanel>
                  )}
                  {activeTab === "settings" && (
                    <TabPanel key="settings">
                      <SettingsPanel
                        form={settingsForm}
                        phone={profile.phone}
                        passwordError={settingsPasswordError}
                        onChange={setSettingsForm}
                        onCancel={() => {
                          setSettingsForm({ ...profile, currentPassword: "", newPassword: "" });
                          setSettingsPasswordError("");
                        }}
                        onSubmit={saveProfile}
                        emailVerification={emailVerification}
                        onEmailOtpChange={(otp) => setEmailVerification((current) => ({ ...current, otp, error: "" }))}
                        onVerifyEmail={verifyEmailChange}
                        onResendEmail={resendEmailChange}
                        onCancelEmail={() => setEmailVerification({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" })}
                      />
                    </TabPanel>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}

function MobileProfileApp({ profile, updateProfile, requestProfileContactUpdate, emailVerification, onEmailOtpChange, onEmailVerificationStart, onVerifyEmail, onResendEmail, onCancelEmail, onOpenTab, onLogout }) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [mobileForm, setMobileForm] = useState(profile);
  const [passwordError, setPasswordError] = useState("");
  const [settingsSpin, setSettingsSpin] = useState("");

  useEffect(() => {
    setMobileForm({ ...profile, currentPassword: "", newPassword: "" });
  }, [profile]);

  const saveMobileProfile = async (event) => {
    event.preventDefault();
    const wantsPasswordChange = mobileForm.currentPassword || mobileForm.newPassword;
    if (wantsPasswordChange && (!mobileForm.currentPassword || !mobileForm.newPassword)) {
      setPasswordError("Enter both current and new password.");
      toast.error("Password not saved", { id: "account-profile-action", description: "Enter both current and new password." });
      return;
    }
    if (mobileForm.newPassword && mobileForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      toast.error("Password not saved", { id: "account-profile-action", description: "New password must be at least 8 characters." });
      return;
    }
    const { currentPassword, newPassword, ...profileFields } = mobileForm;
    try {
      const { email, phone, ...safeProfileFields } = profileFields;
      await updateProfile(safeProfileFields);
      setPasswordError("");
      setMobileForm({ ...profileFields, currentPassword: "", newPassword: "" });
      setEditingProfile(false);
      toast.success("Account saved", {
        id: "account-profile-action",
        description: wantsPasswordChange ? "Profile updated. Password change is ready for backend connection." : "Your profile details were updated.",
      });
    } catch (error) {
      toast.error("Profile not saved", { id: "account-profile-action", description: error.message || "Please try again." });
    }
  };

  const toggleMobileSettings = () => {
    setEditingProfile((isOpen) => {
      setSettingsSpin(isOpen ? "close" : "open");
      window.setTimeout(() => setSettingsSpin(""), 460);
      return !isOpen;
    });
  };

  return (
    <div className="grid min-w-0 gap-4">
      <MobileProfileHeader profile={profile} onEdit={toggleMobileSettings} spinning={settingsSpin} />
      {editingProfile && (
        <MobileProfileEditor
          form={mobileForm}
          phone={profile.phone}
          onChange={setMobileForm}
          passwordError={passwordError}
          onCancel={() => {
            setMobileForm({ ...profile, currentPassword: "", newPassword: "" });
            setPasswordError("");
            setEditingProfile(false);
          }}
          onSubmit={saveMobileProfile}
          emailVerification={emailVerification}
          onEmailOtpChange={onEmailOtpChange}
          onVerifyEmail={onVerifyEmail}
          onResendEmail={onResendEmail}
          onCancelEmail={onCancelEmail}
        />
      )}
      <MobileServiceSection title="Account options" items={[...mobileQuickActions, ...mobileServices]} onOpenTab={onOpenTab} />
      <button
        type="button"
        onClick={onLogout}
        className="min-h-[48px] rounded-[1.15rem] border border-rose-900/10 bg-white/72 px-5 text-sm font-semibold text-rose-800 shadow-[0_12px_34px_rgba(15,23,42,0.045)]"
      >
        Logout
      </button>
    </div>
  );
}

function MobileProfileHeader({ profile, onEdit, spinning }) {
  const initials = String(profile.name || "IB").trim().slice(0, 1).toUpperCase() || "I";
  return (
    <section className="relative overflow-hidden rounded-[1.45rem] border border-slate-900/8 bg-white/78 p-4 shadow-[0_18px_56px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,rgba(14,165,233,0.16),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.76))]" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-lg font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)]">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-semibold leading-tight text-slate-950">{profile.name}</p>
            <p className="mt-1 truncate text-xs font-medium text-slate-500">{profile.email}</p>
            <span className="mt-2 inline-flex rounded-full border border-emerald-700/10 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
              Verified member
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/78 text-slate-700 ring-1 ring-slate-900/8 transition active:scale-95"
        >
          <Settings className={`h-4.5 w-4.5 ${spinning === "open" ? "settings-gear-spin-open" : ""} ${spinning === "close" ? "settings-gear-spin-close" : ""}`} strokeWidth={1.85} />
        </button>
      </div>
    </section>
  );
}

function MobileProfileEditor({ form, phone, onChange, passwordError, onCancel, onSubmit, emailVerification, onEmailOtpChange, onVerifyEmail, onResendEmail, onCancelEmail }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-[1.35rem] border border-slate-900/8 bg-white/82 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.055)] backdrop-blur-2xl">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Profile details</p>
        <h2 className="mt-2 text-xl font-semibold tracking-normal text-slate-950">Edit account</h2>
      </div>
      <PremiumField label="Full name" value={form.name || ""} onChange={(name) => onChange((current) => ({ ...current, name }))} />
      <PremiumField label="Email" type="email" value={form.email || ""} onChange={() => {}} disabled helper="Account email is fixed after signup." />
      <PremiumField label="Phone number" value={form.phone || phone || ""} onChange={() => {}} disabled helper="Phone is fixed after signup and can be used for login." />
      <EmailVerificationPanel verification={emailVerification} onOtpChange={onEmailOtpChange} onVerify={onVerifyEmail} onResend={onResendEmail} onCancel={onCancelEmail} />
      <div className="grid grid-cols-2 gap-3">
        <PremiumField label="City" value={form.city || ""} onChange={(city) => onChange((current) => ({ ...current, city }))} />
        <PremiumSelect label="State" value={form.state || "Karnataka"} onChange={(state) => onChange((current) => ({ ...current, state }))} options={indianStates} />
      </div>
      <div className="grid gap-4 border-t border-slate-900/8 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Password</p>
        <PremiumField label="Current password" type="password" value={form.currentPassword || ""} onChange={(currentPassword) => onChange((current) => ({ ...current, currentPassword }))} />
        <PremiumField label="New password" type="password" value={form.newPassword || ""} onChange={(newPassword) => onChange((current) => ({ ...current, newPassword }))} error={passwordError} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] rounded-full border border-slate-900/10 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700"
        >
          Cancel
        </button>
        <PremiumButton type="submit" className="min-h-[48px]">
          Save
        </PremiumButton>
      </div>
    </form>
  );
}

function MobileActionGrid({ items, onOpenTab }) {
  return (
    <section className="rounded-[1.35rem] border border-slate-900/8 bg-white/78 p-3 shadow-[0_14px_42px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => <MobileIconAction key={item.label} item={item} onOpenTab={onOpenTab} />)}
      </div>
    </section>
  );
}

function MobileIconAction({ item, onOpenTab }) {
  const Icon = item.icon;
  const content = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-slate-950/[0.035] text-slate-800 transition group-active:scale-95">
        <Icon className="h-5 w-5" strokeWidth={1.85} />
      </span>
      <span className="mt-2 max-w-full text-center text-[11px] font-semibold leading-tight text-slate-600">{item.label}</span>
    </>
  );
  const className = "group flex min-w-0 flex-col items-center rounded-[1rem] px-1 py-2 transition active:bg-slate-950/[0.035]";
  if (item.href) return <Link to={item.href} className={className}>{content}</Link>;
  return <button type="button" onClick={() => item.tab && onOpenTab(item.tab)} className={className}>{content}</button>;
}

function MobileServiceSection({ title = "Official Service", items, onOpenTab }) {
  return (
    <MobileSection title={title}>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => <MobileIconAction key={item.label} item={item} onOpenTab={onOpenTab} />)}
      </div>
    </MobileSection>
  );
}

function MobileSection({ title, action, onAction, children }) {
  return (
    <section className="rounded-[1.35rem] border border-slate-900/8 bg-white/78 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.055)] backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-[1.2rem] font-semibold tracking-normal text-slate-950">{title}</h2>
        {action && (
          <button type="button" onClick={onAction} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
            {action}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function AccountHero({ profile }) {
  return (
    <section className="relative overflow-hidden rounded-[1.1rem] border border-slate-900/8 bg-white/72 px-4 py-5 shadow-[0_20px_70px_rgba(15,23,42,0.075)] backdrop-blur-2xl sm:rounded-[1.35rem] sm:px-6 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(248,250,252,0.72)_44%,rgba(236,242,248,0.86))]" />
        <div className="absolute right-[-9rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.13),transparent_64%)] blur-2xl" />
        <div className="absolute bottom-[-11rem] left-[22%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1),transparent_66%)] blur-2xl" />
      </div>
      <div className="relative max-w-3xl min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:tracking-[0.22em]">Infibolt account</p>
        <h1 className="mt-3 max-w-full text-[1.72rem] font-semibold leading-[1.08] tracking-normal text-slate-950 sm:text-[2.55rem]">
          Good to see you, {firstName(profile.name)}.
        </h1>
        <p className="mt-4 max-w-full text-sm font-light leading-7 text-slate-600 sm:max-w-xl sm:text-[15px]">
          Manage your profile, saved products, warranty records, and support conversations from one clean account space.
        </p>
        <div className="mt-6 grid max-w-full gap-2 text-sm font-medium text-slate-600 sm:flex sm:flex-wrap sm:gap-3">
          <span className="min-w-0 break-words">{profile.email}</span>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="min-w-0 break-words">{profile.phone}</span>
        </div>
      </div>
    </section>
  );
}

function AccountNav({ activeTab, onChange, onLogout }) {
  return (
    <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      <AccountCard className="overflow-hidden p-3">
        <div className="grid gap-4">
          <DesktopNavGroup title="Account">
            {mobileQuickActions.map((item) => (
              <DesktopNavAction key={item.label} item={item} activeTab={activeTab} onChange={onChange} />
            ))}
          </DesktopNavGroup>
          <DesktopNavGroup title="Official service">
            {mobileServices.map((item) => (
              <DesktopNavAction key={item.label} item={item} activeTab={activeTab} onChange={onChange} />
            ))}
          </DesktopNavGroup>
          <DesktopNavGroup title="Preferences">
            <DesktopNavAction item={{ label: "Settings", icon: Settings, tab: "settings" }} activeTab={activeTab} onChange={onChange} />
          </DesktopNavGroup>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex min-h-[46px] w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold text-rose-800 transition hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
          Logout
        </button>
      </AccountCard>
    </aside>
  );
}

function DesktopNavGroup({ title, children }) {
  return (
    <div className="grid gap-2">
      <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

function DesktopNavAction({ item, activeTab, onChange }) {
  const Icon = item.icon;
  const isActive = item.tab && activeTab === item.tab;
  const className = `group flex min-h-[46px] w-full min-w-0 items-center gap-3 rounded-2xl px-4 text-left text-sm font-semibold transition duration-200 ${
    isActive
      ? "bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.15)]"
      : "bg-white/54 text-slate-600 ring-1 ring-slate-900/6 hover:bg-white hover:text-slate-950"
  }`;
  const content = (
    <>
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-950"}`} strokeWidth={1.8} />
      <span className="min-w-0 truncate">{item.label}</span>
      {item.href && <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-slate-500" strokeWidth={1.8} />}
    </>
  );

  if (item.href) return <Link to={item.href} className={className}>{content}</Link>;
  return <button type="button" onClick={() => item.tab && onChange(item.tab)} className={className}>{content}</button>;
}

function OverviewPanel() {
  return (
    <div className="grid min-w-0 gap-4 sm:gap-5">
      <AccountCard className="p-4 sm:p-6">
        <SectionHeading label="Overview" title="Account shortcuts" description="Use the sections below to manage only what matters." />
      </AccountCard>
      <section className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-3">
        <JourneyCard icon={ShieldCheck} title="Register a product" text="Attach invoice, serial, and purchase channel into your ownership record." href="/warranty" />
        <JourneyCard icon={LifeBuoy} title="Open premium care" text="Start support with device context already nearby." href="/support" />
        <JourneyCard icon={WalletCards} title="Launch partners" text="Choose a marketplace partner, then return here for ownership care." href="/products" />
      </section>
    </div>
  );
}

function ProductsPanel({ devices }) {
  return (
    <div className="grid gap-5">
      <AccountCard className="p-4 sm:p-6">
        <SectionHeading label="My products" title="Devices connected to you" description="Every registered device gets its own ownership card, warranty status, and support shortcut." />
      </AccountCard>
      <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-2">
        {devices.map((device) => <DeviceCard key={device.slug} device={device} />)}
      </div>
    </div>
  );
}

function WarrantyPanel({ items, status, error }) {
  return (
    <AccountCard className="p-4 sm:p-6">
      <SectionHeading label="Warranty" title="Protection timeline" description="Claim status, verification movement, and product protection in one continuous view." />
      <div className="mt-6 grid gap-4">
        {status === "loading" && <PageLoader label="Opening warranty timeline" />}
        {status === "error" && <EmptyState title="Warranty timeline unavailable" description={error} />}
        {items.map((item, index) => <WarrantyRow key={item.id || index} item={item} index={index} />)}
      </div>
      <div className="mt-6">
        <Link to="/warranty" className="premium-button account-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Open warranty center
        </Link>
      </div>
    </AccountCard>
  );
}

function SupportPanel({ items, status, error }) {
  return (
    <AccountCard className="p-4 sm:p-6">
      <SectionHeading label="Support" title="Care conversations" description="Support history is organized like a modern conversation timeline, not a ticket table." />
      <div className="mt-6 grid gap-4">
        {status === "loading" && <PageLoader label="Opening support timeline" />}
        {status === "error" && <EmptyState title="Support timeline unavailable" description={error} />}
        {items.map((item) => <SupportThread key={item.id} item={item} />)}
      </div>
      <div className="mt-6">
        <Link to="/support" className="premium-button account-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Start support
        </Link>
      </div>
    </AccountCard>
  );
}

function SavedPanel({ items, usingSamples }) {
  return (
    <div className="grid min-w-0 gap-4 sm:gap-5">
      <AccountCard className="p-4 sm:p-6">
        <SectionHeading label="Saved" title="Products kept close" description={usingSamples ? "Previewing saved-product behavior until you save your first device." : "Your saved products are ready for comparison and purchase."} />
      </AccountCard>
      <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <SavedItem key={item.slug} item={item} />)}
      </div>
    </div>
  );
}

function AddressesPanel({ profile }) {
  return (
    <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[1fr_0.8fr]">
      <AccountCard className="p-4 sm:p-6">
        <SectionHeading label="Ownership" title="Marketplace purchase profile" description="Keep useful purchase context ready for warranty registration and support." />
        <div className="mt-6 rounded-[1.35rem] border border-slate-900/8 bg-white/58 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
              <Home className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-semibold text-slate-950">Primary address</p>
              <p className="mt-2 text-sm font-light leading-7 text-slate-600">{profile.city || "Bengaluru"}, {profile.state || "Karnataka"}</p>
              <p className="text-sm font-light leading-7 text-slate-600">Use marketplace invoice and serial details to activate device care.</p>
            </div>
          </div>
        </div>
      </AccountCard>
      <AccountCard className="p-4 sm:p-6">
        <SectionHeading label="Care ready" title="Ownership services" description="Invoice records, support context, and preferred launch channels stay organized here." />
        <div className="mt-6 grid gap-3">
          {["Marketplace order references", "Warranty-ready invoice context", "Preferred launch channels"].map((item) => (
            <CheckedLine key={item}>{item}</CheckedLine>
          ))}
        </div>
      </AccountCard>
    </div>
  );
}

function AlertsPanel() {
  const alerts = [
    "Warranty approval and claim updates",
    "Support reply notifications",
    "Product service and repair status changes",
  ];

  return (
    <AccountCard className="p-4 sm:p-6">
      <SectionHeading label="Alerts" title="Account notifications" description="Important ownership, warranty, and support updates will appear here." />
      <div className="mt-6 grid gap-3">
        {alerts.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-900/8 bg-white/58 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
              <Bell className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">{item}</p>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">Enabled for your account.</p>
            </div>
          </div>
        ))}
      </div>
    </AccountCard>
  );
}

function SettingsPanel({ form, phone, passwordError, onChange, onCancel, onSubmit, emailVerification, onEmailOtpChange, onVerifyEmail, onResendEmail, onCancelEmail }) {
  return (
    <AccountCard className="p-4 sm:p-6">
      <SectionHeading label="Settings" title="Edit account" description="Keep your profile details current and manage password changes from the same account space." />
      <form onSubmit={onSubmit} className="mt-6 grid gap-5">
        <div className="grid gap-4 border-b border-slate-900/8 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Profile details</p>
          <div className="grid gap-4 md:grid-cols-2">
            <PremiumField label="Full name" value={form.name || ""} onChange={(name) => onChange((current) => ({ ...current, name }))} />
            <PremiumField label="Email" type="email" value={form.email || ""} onChange={() => {}} disabled helper="Account email is fixed after signup." />
            <PremiumField label="Phone number" value={form.phone || phone || ""} onChange={() => {}} disabled helper="Phone is fixed after signup and can be used for login." />
            <PremiumField label="City" value={form.city || ""} onChange={(city) => onChange((current) => ({ ...current, city }))} />
            <PremiumSelect label="State" value={form.state || "Karnataka"} onChange={(state) => onChange((current) => ({ ...current, state }))} options={indianStates} />
          </div>
          <EmailVerificationPanel verification={emailVerification} onOtpChange={onEmailOtpChange} onVerify={onVerifyEmail} onResend={onResendEmail} onCancel={onCancelEmail} />
        </div>
        <div className="grid gap-4 border-b border-slate-900/8 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Password</p>
          <div className="grid gap-4 md:grid-cols-2">
            <PremiumField label="Current password" type="password" value={form.currentPassword || ""} onChange={(currentPassword) => onChange((current) => ({ ...current, currentPassword }))} />
            <PremiumField label="New password" type="password" value={form.newPassword || ""} onChange={(newPassword) => onChange((current) => ({ ...current, newPassword }))} error={passwordError} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[0.35fr_1fr]">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[52px] rounded-full border border-slate-900/10 bg-white px-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <PremiumButton type="submit">Save profile</PremiumButton>
        </div>
      </form>
    </AccountCard>
  );
}

function EmailVerificationPanel({ verification, onOtpChange, onVerify, onResend, onCancel }) {
  if (!verification?.email) return null;
  const loading = verification.status === "loading";
  return (
    <div className="grid gap-4 rounded-[1.2rem] border border-sky-900/10 bg-sky-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <span className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
            <Mail className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-950">Verify new email</span>
            <span className="mt-1 block break-words text-xs font-medium leading-5 text-slate-600">{verification.email}</span>
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
          <Clock3 className="h-3.5 w-3.5" /> {verification.cooldown > 0 ? `${verification.cooldown}s` : "Ready"}
        </span>
      </div>
      <OtpInput value={verification.otp || ""} onChange={onOtpChange} disabled={loading} error={verification.error} />
      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={onCancel} className="min-h-[42px] rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          Cancel
        </button>
        <button type="button" onClick={onResend} disabled={verification.cooldown > 0 || loading} className="min-h-[42px] rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 disabled:opacity-50">
          Resend
        </button>
        <button type="button" onClick={onVerify} disabled={loading} className="min-h-[42px] rounded-full bg-slate-950 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60">
          {loading ? "Checking..." : "Verify"}
        </button>
      </div>
    </div>
  );
}

function DeviceCard({ device }) {
  return (
    <AccountCard className="overflow-hidden p-0">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        <img src={device.image} alt={device.name} className="h-full w-full object-cover transition duration-500 hover:scale-[1.025]" loading="lazy" />
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SoftStatus>{device.badge}</SoftStatus>
            <h3 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">{device.name}</h3>
            <p className="mt-2 text-sm font-light leading-6 text-slate-500">{device.serial}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">Protected</span>
        </div>
        <ProtectionMeter value={device.protection} />
        <div className="mt-5 grid gap-3 text-sm text-slate-600">
          <InfoLine label="Owner since" value={device.ownerSince} />
          <InfoLine label="Warranty until" value={device.warrantyUntil} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/products/${device.slug}`} className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-slate-950 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white">View product</Link>
          <Link to="/support" className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-800">Support</Link>
        </div>
      </div>
    </AccountCard>
  );
}

function WarrantyRow({ item, index }) {
  return (
    <div className="relative rounded-[1.35rem] border border-slate-900/8 bg-white/58 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">{index + 1}</span>
          <div>
            <p className="font-semibold text-slate-950">{item.product}</p>
            <p className="mt-1 text-sm font-light leading-6 text-slate-500">{item.id} · {item.serial}</p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-emerald-700/10 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">{item.status}</span>
      </div>
      <p className="mt-4 text-sm font-light text-slate-500">{item.updatedAt || "Recently updated"}</p>
    </div>
  );
}

function SupportThread({ item }) {
  return (
    <div className="rounded-[1.35rem] border border-slate-900/8 bg-white/58 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{item.id}</p>
          <p className="mt-2 text-sm font-light leading-6 text-slate-600">{item.message || item.topic}</p>
        </div>
        <span className="rounded-full border border-amber-700/10 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">{item.status}</span>
      </div>
      <div className="mt-5 rounded-2xl bg-slate-950/[0.035] p-4 text-sm font-light leading-6 text-slate-600">
        Care team context is attached to your product and warranty profile.
      </div>
    </div>
  );
}

function SavedItem({ item }) {
  return (
    <AccountCard className="overflow-hidden p-0">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="p-5">
        <SoftStatus>{item.badge}</SoftStatus>
        <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.name}</h3>
        <p className="mt-2 text-sm font-light leading-6 text-slate-500">{item.summary}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-semibold text-slate-950">{formatPrice(item.price)}</span>
          <Link to={`/products/${item.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950">
            View <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AccountCard>
  );
}

function TabPanel({ children }) {
  return (
    <motion.div {...panelMotion} className="min-w-0">
      {children}
    </motion.div>
  );
}

function SectionHeading({ label, title, description }) {
  return (
    <div>
      <SoftStatus>{label}</SoftStatus>
      <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 max-w-2xl text-sm font-light leading-7 text-slate-600">{description}</p>}
    </div>
  );
}

function JourneyCard({ icon: Icon, title, text, href }) {
  return (
    <AccountCard className="group p-5 sm:p-6">
      <Icon className="h-5 w-5 text-slate-900" strokeWidth={1.8} />
      <h3 className="mt-5 text-xl font-semibold tracking-normal text-slate-950">{title}</h3>
      <p className="mt-3 text-sm font-light leading-7 text-slate-600">{text}</p>
      <Link to={href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
        Continue <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </AccountCard>
  );
}

function ProtectionMeter({ value }) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        <span>Protection health</span>
        <span>{value}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/[0.035] px-4 py-3">
      <span className="font-light text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function CheckedLine({ children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-950/[0.035] px-4 py-3 text-sm font-medium text-slate-700">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.8} />
      {children}
    </div>
  );
}

function firstName(name) {
  const value = String(name || "there").trim().split(/\s+/)[0] || "there";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
