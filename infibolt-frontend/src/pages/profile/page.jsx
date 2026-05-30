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

const panelMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{8,}$/;
const STRONG_PASSWORD_MESSAGE = "Use uppercase, lowercase, number, symbol, and 8+ characters.";
const emptyPasswordErrors = { currentPassword: "", newPassword: "", confirmPassword: "" };
const passwordRuleChecks = [
  { label: "8+ characters", test: (value) => String(value || "").length >= 8 },
  { label: "Uppercase", test: (value) => /[A-Z]/.test(value || "") },
  { label: "Lowercase", test: (value) => /[a-z]/.test(value || "") },
  { label: "Number", test: (value) => /\d/.test(value || "") },
  { label: "Symbol", test: (value) => /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/.test(value || "") },
];

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

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidPhone(value) {
  return /^[1-9]\d{7,14}$/.test(normalizePhone(value));
}

function isValidPostalCode(value) {
  return /^[1-9]\d{5}$/.test(String(value || "").trim());
}

function missingProfileFields(profile = {}) {
  const fields = [];
  if (!isValidPhone(profile.phone)) fields.push("mobile number");
  if (!String(profile.address || "").trim()) fields.push("full address");
  if (!String(profile.city || "").trim()) fields.push("city");
  if (!String(profile.state || "").trim()) fields.push("state");
  if (!isValidPostalCode(profile.postalCode)) fields.push("PIN code");
  return fields;
}

function profileCompletionDraft(profile = {}) {
  return {
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    postalCode: profile.postalCode || "",
    status: "idle",
    errors: {},
  };
}

function validateProfileCompletion(form = {}, phoneLocked = false) {
  const errors = {};
  if (!phoneLocked && !isValidPhone(form.phone)) errors.phone = "Enter a valid mobile number.";
  if (!String(form.address || "").trim()) errors.address = "Enter your full address.";
  if (!String(form.city || "").trim()) errors.city = "Enter your city.";
  if (!String(form.state || "").trim()) errors.state = "Select your state.";
  if (!isValidPostalCode(form.postalCode)) errors.postalCode = "Enter a valid 6 digit PIN code.";
  return errors;
}

function getPasswordErrors(message) {
  const normalized = String(message || "").toLowerCase();
  if (normalized.includes("current password")) return { ...emptyPasswordErrors, currentPassword: message };
  return { ...emptyPasswordErrors, newPassword: message || "Password was not accepted." };
}

function passwordChangeValidation(form = {}, { requireCurrentPassword = true } = {}) {
  const wantsPasswordChange = Boolean(form.currentPassword || form.newPassword || form.confirmPassword);
  const errors = { ...emptyPasswordErrors };
  if (!wantsPasswordChange) return { wantsPasswordChange, errors, valid: true };
  if (requireCurrentPassword && !form.currentPassword) errors.currentPassword = "Enter your current password.";
  if (!form.newPassword) errors.newPassword = "Enter a new password.";
  else if (!STRONG_PASSWORD_PATTERN.test(form.newPassword)) errors.newPassword = STRONG_PASSWORD_MESSAGE;
  if (!form.confirmPassword) errors.confirmPassword = "Confirm your new password.";
  else if (form.newPassword && form.confirmPassword !== form.newPassword) errors.confirmPassword = "New passwords do not match.";
  return { wantsPasswordChange, errors, valid: !Object.values(errors).some(Boolean) };
}

function canChangePassword(profile = {}) {
  return profile.authProvider === "password" && profile.hasPassword !== false;
}

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
  const [editingDetails, setEditingDetails] = useState(false);
  const [settingsForm, setSettingsForm] = useState(profile);
  const [settingsPasswordErrors, setSettingsPasswordErrors] = useState(emptyPasswordErrors);
  const [emailVerification, setEmailVerification] = useState({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" });
  const [profileCompletion, setProfileCompletion] = useState(() => profileCompletionDraft(profile));

  useEffect(() => {
    if (!auth.user) return;
    loadSupportTickets();
    loadWarrantyClaims();
  }, [auth.user, loadSupportTickets, loadWarrantyClaims]);

  useEffect(() => {
    setSettingsForm({ ...profile, currentPassword: "", newPassword: "", confirmPassword: "" });
    setProfileCompletion(profileCompletionDraft(profile));
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
  if (!signedIn && auth.status === "loading") {
    return (
      <CommerceShell seoTitle="Account" seoDescription="Secure INFIBOLT account access for products, warranty records, and support.">
        <AccountAtmosphere>
          <MotionSection className="grid min-h-[calc(100svh-73px)] place-items-center px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
            <PageLoader label="Opening your account" />
          </MotionSection>
        </AccountAtmosphere>
      </CommerceShell>
    );
  }

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
    const passwordAllowed = canChangePassword(profile);
    const passwordValidation = passwordAllowed ? passwordChangeValidation(settingsForm) : { wantsPasswordChange: false, errors: emptyPasswordErrors, valid: true };
    if (!passwordValidation.valid) {
      setSettingsPasswordErrors(passwordValidation.errors);
      toast.error("Password not saved", { id: "account-profile-action", description: Object.values(passwordValidation.errors).find(Boolean) || "Check the password fields." });
      return;
    }
    if (!profile.phone && !isValidPhone(settingsForm.phone)) {
      toast.error("Phone number required", { id: "account-profile-action", description: "Add a valid phone number to complete your profile." });
      return;
    }
    if (!String(settingsForm.address || "").trim() || !String(settingsForm.city || "").trim() || !String(settingsForm.state || "").trim() || !isValidPostalCode(settingsForm.postalCode)) {
      toast.error("Address details required", { id: "account-profile-action", description: "Add full address, city, state, and 6 digit PIN code to complete your profile." });
      return;
    }
    const { currentPassword, newPassword, confirmPassword, ...profileFields } = settingsForm;
    try {
      const { email, phone, ...safeProfileFields } = profileFields;
      if (!profile.phone) safeProfileFields.phone = normalizePhone(phone);
      if (passwordAllowed && passwordValidation.wantsPasswordChange) {
        safeProfileFields.currentPassword = currentPassword;
        safeProfileFields.newPassword = newPassword;
      }
      await updateProfile(safeProfileFields);
      setSettingsPasswordErrors(emptyPasswordErrors);
      setSettingsForm({ ...profileFields, currentPassword: "", newPassword: "", confirmPassword: "" });
      setEditingDetails(false);
      toast.success("Profile saved", {
        id: "account-profile-action",
        description: passwordValidation.wantsPasswordChange ? "Your password and account details were updated." : "Your account details were updated.",
      });
    } catch (error) {
      if (passwordValidation.wantsPasswordChange) setSettingsPasswordErrors(getPasswordErrors(error.message));
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
      setSettingsForm((current) => ({ ...current, ...result, currentPassword: "", newPassword: "", confirmPassword: "" }));
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
      setEmailVerification((current) => ({ ...current, verificationId: result.verificationId || current.verificationId, cooldown: result.resendAfterSeconds || 300, status: "pending", otp: "" }));
      toast.success("Code resent", { id: "account-profile-action", description: "Use the newest email code to continue." });
    } catch (error) {
      setEmailVerification((current) => ({ ...current, status: "pending", error: error.message || "Could not resend the code." }));
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out", { id: "account-profile-action", description: "Your secure session has ended." });
  };

  const completeRequiredProfileDetails = async (event) => {
    event.preventDefault();
    const phoneLocked = Boolean(profile.phone);
    const errors = validateProfileCompletion(profileCompletion, phoneLocked);
    if (Object.keys(errors).length) {
      setProfileCompletion((current) => ({ ...current, errors }));
      toast.error("Complete required details", {
        id: "account-profile-action",
        description: Object.values(errors).join(" "),
      });
      return;
    }
    const payload = {
      address: String(profileCompletion.address || "").trim(),
      city: String(profileCompletion.city || "").trim(),
      state: String(profileCompletion.state || "").trim(),
      postalCode: String(profileCompletion.postalCode || "").trim(),
    };
    if (!phoneLocked) payload.phone = normalizePhone(profileCompletion.phone);
    setProfileCompletion((current) => ({ ...current, status: "loading", errors: {} }));
    try {
      await updateProfile(payload);
      setSettingsForm((current) => ({ ...current, ...payload }));
      setProfileCompletion((current) => ({ ...current, ...payload, status: "idle", errors: {} }));
      toast.success("Profile details saved", { id: "account-profile-action", description: "Your account profile is complete." });
    } catch (error) {
      setProfileCompletion((current) => ({
        ...current,
        status: "idle",
        errors: { form: error.message || "Could not save profile details." },
      }));
    }
  };

  return (
    <CommerceShell seoTitle="Customer Profile" seoDescription="Premium INFIBOLT customer ownership hub.">
      <AccountAtmosphere>
        {missingProfileFields(profile).length > 0 && (
          <ProfileCompletionModal
            profile={profile}
            form={profileCompletion}
            loading={profileCompletion.status === "loading"}
            onChange={(patch) => setProfileCompletion((current) => ({ ...current, ...patch, errors: { ...current.errors, ...Object.fromEntries(Object.keys(patch).map((key) => [key, ""])) } }))}
            onSubmit={completeRequiredProfileDetails}
          />
        )}
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
              onLogout={handleLogout}
            />
          </div>

          <div className="mx-auto hidden w-full max-w-[1320px] min-w-0 gap-4 sm:gap-5 lg:grid">
            <AccountHero profile={profile} onLogout={handleLogout} />
            {missingProfileFields(profile).length > 0 && (
              <AccountCard className="p-5 sm:p-6">
                <SoftStatus>Complete profile</SoftStatus>
                <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Add required account details</h2>
                <p className="mt-2 text-sm font-light leading-7 text-slate-600">
                  Please add your {missingProfileFields(profile).join(", ")} so warranty, support, pickup, and delivery updates can continue smoothly.
                </p>
                <button type="button" onClick={() => setEditingDetails(true)} className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                  Edit details
                </button>
              </AccountCard>
            )}

            <div className="min-w-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {editingDetails ? (
                  <TabPanel key="configure-profile">
                    <SettingsPanel
                      form={settingsForm}
                      phone={profile.phone}
                      allowPasswordChange={canChangePassword(profile)}
                      passwordErrors={settingsPasswordErrors}
                      onChange={setSettingsForm}
                      onCancel={() => {
                        setSettingsForm({ ...profile, currentPassword: "", newPassword: "", confirmPassword: "" });
                        setSettingsPasswordErrors(emptyPasswordErrors);
                        setEditingDetails(false);
                      }}
                      onSubmit={saveProfile}
                      emailVerification={emailVerification}
                      onEmailOtpChange={(otp) => setEmailVerification((current) => ({ ...current, otp, error: "" }))}
                      onVerifyEmail={verifyEmailChange}
                      onResendEmail={resendEmailChange}
                      onCancelEmail={() => setEmailVerification({ email: "", verificationId: "", otp: "", cooldown: 0, status: "idle", error: "" })}
                    />
                  </TabPanel>
                ) : (
                  <TabPanel key="profile-details">
                    <ProfileDetailsPanel profile={profile} onEdit={() => setEditingDetails(true)} />
                  </TabPanel>
                )}
              </AnimatePresence>
            </div>
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}

function MobileProfileApp({ profile, updateProfile, requestProfileContactUpdate, emailVerification, onEmailOtpChange, onEmailVerificationStart, onVerifyEmail, onResendEmail, onCancelEmail, onLogout }) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [mobileForm, setMobileForm] = useState(profile);
  const [passwordErrors, setPasswordErrors] = useState(emptyPasswordErrors);
  const missingFields = missingProfileFields(profile);

  useEffect(() => {
    setMobileForm({ ...profile, currentPassword: "", newPassword: "", confirmPassword: "" });
  }, [profile]);

  const saveMobileProfile = async (event) => {
    event.preventDefault();
    const passwordAllowed = canChangePassword(profile);
    const passwordValidation = passwordAllowed ? passwordChangeValidation(mobileForm) : { wantsPasswordChange: false, errors: emptyPasswordErrors, valid: true };
    if (!passwordValidation.valid) {
      setPasswordErrors(passwordValidation.errors);
      toast.error("Password not saved", { id: "account-profile-action", description: Object.values(passwordValidation.errors).find(Boolean) || "Check the password fields." });
      return;
    }
    if (!profile.phone && !isValidPhone(mobileForm.phone)) {
      toast.error("Phone number required", { id: "account-profile-action", description: "Add a valid phone number to complete your profile." });
      return;
    }
    if (!String(mobileForm.address || "").trim() || !String(mobileForm.city || "").trim() || !String(mobileForm.state || "").trim() || !isValidPostalCode(mobileForm.postalCode)) {
      toast.error("Address details required", { id: "account-profile-action", description: "Add full address, city, state, and 6 digit PIN code to complete your profile." });
      return;
    }
    const { currentPassword, newPassword, confirmPassword, ...profileFields } = mobileForm;
    try {
      const { email, phone, ...safeProfileFields } = profileFields;
      if (!profile.phone) safeProfileFields.phone = normalizePhone(phone);
      if (passwordAllowed && passwordValidation.wantsPasswordChange) {
        safeProfileFields.currentPassword = currentPassword;
        safeProfileFields.newPassword = newPassword;
      }
      await updateProfile(safeProfileFields);
      setPasswordErrors(emptyPasswordErrors);
      setMobileForm({ ...profileFields, currentPassword: "", newPassword: "", confirmPassword: "" });
      setEditingProfile(false);
      toast.success("Account saved", {
        id: "account-profile-action",
        description: passwordValidation.wantsPasswordChange ? "Your password and profile details were updated." : "Your profile details were updated.",
      });
    } catch (error) {
      if (passwordValidation.wantsPasswordChange) setPasswordErrors(getPasswordErrors(error.message));
      toast.error("Profile not saved", { id: "account-profile-action", description: error.message || "Please try again." });
    }
  };

  return (
    <div className="grid min-w-0 gap-4">
      <MobileProfileHeader profile={profile} onLogout={onLogout} />
      {missingFields.length > 0 && !editingProfile && (
        <section className="rounded-[1.35rem] border border-amber-700/12 bg-amber-50/76 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.055)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">Complete profile</p>
          <h2 className="mt-2 text-lg font-semibold tracking-normal text-slate-950">Add required account details</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Please add your {missingFields.join(", ")} for warranty pickup, delivery, and support.</p>
          <button
            type="button"
            onClick={() => setEditingProfile(true)}
            className="mt-4 min-h-[44px] rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          >
            Edit details
          </button>
        </section>
      )}
      {editingProfile ? (
          <MobileProfileEditor
            form={mobileForm}
            phone={profile.phone}
            allowPasswordChange={canChangePassword(profile)}
          onChange={setMobileForm}
          passwordErrors={passwordErrors}
          onCancel={() => {
            setMobileForm({ ...profile, currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordErrors(emptyPasswordErrors);
            setEditingProfile(false);
          }}
          onSubmit={saveMobileProfile}
          emailVerification={emailVerification}
          onEmailOtpChange={onEmailOtpChange}
          onVerifyEmail={onVerifyEmail}
          onResendEmail={onResendEmail}
          onCancelEmail={onCancelEmail}
        />
      ) : (
        <MobileProfileDetails profile={profile} onEdit={() => setEditingProfile(true)} />
      )}
    </div>
  );
}

function ProfileCompletionModal({ profile, form, loading, onChange, onSubmit }) {
  const phoneLocked = Boolean(profile.phone);
  const missingFields = missingProfileFields({ ...profile, ...form });
  const errors = form.errors || {};
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/38 px-4 py-6 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="max-h-[calc(100svh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-[1.45rem] border border-white/70 bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-6">
        <SoftStatus>Complete profile</SoftStatus>
        <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Add required account details</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add the missing details once so warranty, delivery, pickup, and support requests stay connected to your account.
        </p>
        <div className="mt-4 rounded-2xl border border-amber-700/15 bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-900">
          Please check carefully. Once this mobile number is saved, it cannot be edited from your account.
        </div>
        {missingFields.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-900/8 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Still needed</p>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">{missingFields.join(", ")}</p>
          </div>
        )}
        {errors.form && (
          <div className="mt-4 rounded-2xl border border-rose-900/10 bg-rose-50 px-4 py-3 text-xs font-semibold leading-5 text-rose-800">
            {errors.form}
          </div>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <PremiumField
            label="Mobile number"
            inputMode="numeric"
            autoComplete="tel"
            value={form.phone || ""}
            onChange={(phone) => onChange({ phone: normalizePhone(phone).slice(0, 15) })}
            error={errors.phone}
            disabled={phoneLocked}
            helper={phoneLocked ? "Mobile number is already locked to this account." : "Required for warranty, support, and account recovery."}
            placeholder="Enter mobile number"
          />
          <PremiumField
            label="PIN code"
            inputMode="numeric"
            autoComplete="postal-code"
            value={form.postalCode || ""}
            onChange={(postalCode) => onChange({ postalCode: postalCode.replace(/\D/g, "").slice(0, 6) })}
            error={errors.postalCode}
            placeholder="560001"
          />
          <div className="sm:col-span-2">
            <PremiumField
              label="Full address"
              autoComplete="street-address"
              value={form.address || ""}
              onChange={(address) => onChange({ address })}
              error={errors.address}
              placeholder="House / flat, street, area"
            />
          </div>
          <PremiumField
            label="City"
            autoComplete="address-level2"
            value={form.city || ""}
            onChange={(city) => onChange({ city })}
            error={errors.city}
            placeholder="Bengaluru"
          />
          <PremiumSelect
            label="State"
            value={form.state || ""}
            onChange={(state) => onChange({ state })}
            options={["", ...indianStates]}
            error={errors.state}
          />
        </div>
        <PremiumButton loading={loading} type="submit" className="mt-5 w-full">
          {loading ? "Saving..." : "Save required details"}
        </PremiumButton>
      </form>
    </div>
  );
}

function MobileProfileHeader({ profile, onLogout }) {
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
          onClick={onLogout}
          aria-label="Logout"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-800 ring-1 ring-rose-900/10 transition active:scale-95"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.85} />
        </button>
      </div>
    </section>
  );
}

function MobileProfileDetails({ profile, onEdit }) {
  const details = profileDetailItems(profile);
  return (
    <section className="rounded-[1.35rem] border border-slate-900/8 bg-white/82 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.055)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Profile</p>
          <h2 className="mt-2 text-xl font-semibold tracking-normal text-slate-950">Account details</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
          Secure
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        {details.map((item) => (
          <div key={item.label} className="rounded-[1rem] border border-slate-900/6 bg-slate-50/72 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
            <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="mt-5 min-h-[48px] w-full rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
      >
        Edit details
      </button>
    </section>
  );
}

function PasswordChecklist({ password }) {
  if (!password) {
    return <p className="text-xs font-medium leading-5 text-slate-500">To change password, enter current password, a strong new password, and confirm it.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {passwordRuleChecks.map((rule) => {
        const passed = rule.test(password);
        return (
          <span key={rule.label} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${passed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {rule.label}
          </span>
        );
      })}
    </div>
  );
}

function MobileProfileEditor({ form, phone, allowPasswordChange = true, onChange, passwordErrors = emptyPasswordErrors, onCancel, onSubmit, emailVerification, onEmailOtpChange, onVerifyEmail, onResendEmail, onCancelEmail }) {
  const phoneLocked = Boolean(phone);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-[1.35rem] border border-slate-900/8 bg-white/82 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.055)] backdrop-blur-2xl">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Profile details</p>
        <h2 className="mt-2 text-xl font-semibold tracking-normal text-slate-950">Configure profile details</h2>
      </div>
      <PremiumField label="Full name" value={form.name || ""} onChange={(name) => onChange((current) => ({ ...current, name }))} />
      <PremiumField label="Email" type="email" value={form.email || ""} onChange={() => {}} disabled helper="Account email is fixed after signup." />
      <PremiumField
        label="Phone number"
        value={form.phone || phone || ""}
        onChange={(phoneNumber) => {
          if (!phoneLocked) onChange((current) => ({ ...current, phone: phoneNumber }));
        }}
        disabled={phoneLocked}
        helper={phoneLocked ? "Phone is fixed after signup and can be used for login." : "Required to complete your Google account profile."}
      />
      <PremiumField label="Full address" value={form.address || ""} onChange={(address) => onChange((current) => ({ ...current, address }))} helper="Required for warranty pickup, delivery, and support." />
      <EmailVerificationPanel verification={emailVerification} onOtpChange={onEmailOtpChange} onVerify={onVerifyEmail} onResend={onResendEmail} onCancel={onCancelEmail} />
      <div className="grid grid-cols-2 gap-3">
        <PremiumField label="City" value={form.city || ""} onChange={(city) => onChange((current) => ({ ...current, city }))} />
        <PremiumSelect label="State" value={form.state || ""} onChange={(state) => onChange((current) => ({ ...current, state }))} options={["", ...indianStates]} />
        <PremiumField label="PIN code" value={form.postalCode || ""} onChange={(postalCode) => onChange((current) => ({ ...current, postalCode: postalCode.replace(/\D/g, "").slice(0, 6) }))} inputMode="numeric" helper="Required for pickup and delivery." />
      </div>
      {allowPasswordChange && (
        <div className="grid gap-4 border-t border-slate-900/8 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Password</p>
          <PremiumField label="Current password" type="password" value={form.currentPassword || ""} onChange={(currentPassword) => onChange((current) => ({ ...current, currentPassword }))} error={passwordErrors.currentPassword} />
          <PremiumField label="New password" type="password" value={form.newPassword || ""} onChange={(newPassword) => onChange((current) => ({ ...current, newPassword }))} error={passwordErrors.newPassword} />
          <PremiumField label="Confirm new password" type="password" value={form.confirmPassword || ""} onChange={(confirmPassword) => onChange((current) => ({ ...current, confirmPassword }))} error={passwordErrors.confirmPassword} />
          <PasswordChecklist password={form.newPassword} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] rounded-full border border-slate-900/10 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700"
        >
          Cancel
        </button>
        <PremiumButton type="submit" className="min-h-[48px]">
          Update
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

function AccountHero({ profile, onLogout }) {
  return (
    <section className="relative overflow-hidden rounded-[1.1rem] border border-slate-900/8 bg-white/72 px-4 py-5 shadow-[0_20px_70px_rgba(15,23,42,0.075)] backdrop-blur-2xl sm:rounded-[1.35rem] sm:px-6 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(248,250,252,0.72)_44%,rgba(236,242,248,0.86))]" />
        <div className="absolute right-[-9rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.13),transparent_64%)] blur-2xl" />
        <div className="absolute bottom-[-11rem] left-[22%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1),transparent_66%)] blur-2xl" />
      </div>
      <div className="relative flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:tracking-[0.22em]">Infibolt account</p>
          <h1 className="mt-3 max-w-full text-[1.72rem] font-semibold leading-[1.08] tracking-normal text-slate-950 sm:text-[2.55rem]">
            Good to see you, {firstName(profile.name)}.
          </h1>
          <p className="mt-4 max-w-full text-sm font-light leading-7 text-slate-600 sm:max-w-xl sm:text-[15px]">
            Keep your profile details ready for warranty, pickup, delivery, and support.
          </p>
          <div className="mt-6 grid max-w-full gap-2 text-sm font-medium text-slate-600 sm:flex sm:flex-wrap sm:gap-3">
            <span className="min-w-0 break-words">{profile.email}</span>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="min-w-0 break-words">{profile.phone}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full border border-rose-900/10 bg-rose-50 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800 transition hover:bg-rose-100"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.85} />
          Logout
        </button>
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
              <p className="mt-2 text-sm font-light leading-7 text-slate-600">{profile.address || "Full address not added"}</p>
              <p className="text-sm font-light leading-7 text-slate-600">{[profile.city, profile.state, profile.postalCode].filter(Boolean).join(", ") || "City, state, and PIN code not added"}</p>
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

function ProfileDetailsPanel({ profile, onEdit }) {
  const details = profileDetailItems(profile);
  const missingFields = missingProfileFields(profile);
  return (
    <AccountCard className="overflow-hidden p-0">
      <div className="relative overflow-hidden px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_6%,rgba(16,185,129,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.74))]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <SectionHeading
              label="Profile"
              title="Account details"
              description="Your customer profile is used for warranty pickup, delivery, support, and ownership communication."
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                Verified account
              </span>
              <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${missingFields.length ? "bg-amber-50 text-amber-800" : "bg-slate-950 text-white"}`}>
                {missingFields.length ? "Details required" : "Profile complete"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full bg-slate-950 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_42px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Edit details
          </button>
        </div>
      </div>
      <div className="grid gap-3 border-t border-slate-900/8 bg-white/62 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {details.map((item) => (
          <ProfileDetailTile key={item.label} label={item.label} value={item.value} important={item.important} />
        ))}
      </div>
    </AccountCard>
  );
}

function ProfileDetailTile({ label, value, important }) {
  return (
    <div className={`min-w-0 rounded-[1.1rem] border px-4 py-4 ${important ? "border-amber-700/14 bg-amber-50/74" : "border-slate-900/6 bg-slate-50/72"}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${important ? "text-amber-800" : "text-slate-400"}`}>{label}</p>
      <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function profileDetailItems(profile = {}) {
  const empty = (label) => ({ label, value: "Not added", important: true });
  return [
    { label: "Full name", value: profile.name || "Not added", important: !profile.name },
    { label: "Email", value: profile.email || "Not added", important: !profile.email },
    isValidPhone(profile.phone) ? { label: "Phone number", value: profile.phone } : empty("Phone number"),
    String(profile.address || "").trim() ? { label: "Full address", value: profile.address } : empty("Full address"),
    String(profile.city || "").trim() ? { label: "City", value: profile.city } : empty("City"),
    String(profile.state || "").trim() ? { label: "State", value: profile.state } : empty("State"),
    isValidPostalCode(profile.postalCode) ? { label: "PIN code", value: profile.postalCode } : empty("PIN code"),
  ];
}

function SettingsPanel({ form, phone, allowPasswordChange = true, passwordErrors = emptyPasswordErrors, onChange, onCancel, onSubmit, emailVerification, onEmailOtpChange, onVerifyEmail, onResendEmail, onCancelEmail }) {
  const phoneLocked = Boolean(phone);
  return (
    <AccountCard className="p-4 sm:p-6">
      <SectionHeading label="Profile details" title="Configure profile details" description="Update the information used for warranty pickup, delivery, support, and secure account communication." />
      <form onSubmit={onSubmit} className="mt-6 grid gap-5">
        <div className="grid gap-4 border-b border-slate-900/8 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Profile details</p>
          <div className="grid gap-4 md:grid-cols-2">
            <PremiumField label="Full name" value={form.name || ""} onChange={(name) => onChange((current) => ({ ...current, name }))} />
            <PremiumField label="Email" type="email" value={form.email || ""} onChange={() => {}} disabled helper="Account email is fixed after signup." />
            <PremiumField
              label="Phone number"
              value={form.phone || phone || ""}
              onChange={(phoneNumber) => {
                if (!phoneLocked) onChange((current) => ({ ...current, phone: phoneNumber }));
              }}
              disabled={phoneLocked}
              helper={phoneLocked ? "Phone is fixed after signup and can be used for login." : "Required to complete your Google account profile."}
            />
            <PremiumField label="Full address" value={form.address || ""} onChange={(address) => onChange((current) => ({ ...current, address }))} helper="Required for warranty pickup, delivery, and support." />
            <PremiumField label="City" value={form.city || ""} onChange={(city) => onChange((current) => ({ ...current, city }))} />
            <PremiumSelect label="State" value={form.state || ""} onChange={(state) => onChange((current) => ({ ...current, state }))} options={["", ...indianStates]} />
            <PremiumField label="PIN code" value={form.postalCode || ""} onChange={(postalCode) => onChange((current) => ({ ...current, postalCode: postalCode.replace(/\D/g, "").slice(0, 6) }))} inputMode="numeric" helper="Required for pickup and delivery." />
          </div>
          <EmailVerificationPanel verification={emailVerification} onOtpChange={onEmailOtpChange} onVerify={onVerifyEmail} onResend={onResendEmail} onCancel={onCancelEmail} />
        </div>
        {allowPasswordChange && (
          <div className="grid gap-4 border-b border-slate-900/8 pb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Password</p>
            <div className="grid gap-4 md:grid-cols-2">
              <PremiumField label="Current password" type="password" value={form.currentPassword || ""} onChange={(currentPassword) => onChange((current) => ({ ...current, currentPassword }))} error={passwordErrors.currentPassword} />
              <PremiumField label="New password" type="password" value={form.newPassword || ""} onChange={(newPassword) => onChange((current) => ({ ...current, newPassword }))} error={passwordErrors.newPassword} />
              <PremiumField label="Confirm new password" type="password" value={form.confirmPassword || ""} onChange={(confirmPassword) => onChange((current) => ({ ...current, confirmPassword }))} error={passwordErrors.confirmPassword} />
            </div>
            <PasswordChecklist password={form.newPassword} />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-[0.35fr_1fr]">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[52px] rounded-full border border-slate-900/10 bg-white px-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <PremiumButton type="submit">Update details</PremiumButton>
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
