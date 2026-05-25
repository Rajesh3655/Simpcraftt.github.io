import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock3, HelpCircle, ImageUp, PackageCheck, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { AccountAccess } from "../../components/customer/AccountAccess";
import {
  AccountAtmosphere,
  AccountCard,
  PremiumButton,
  PremiumField,
  PremiumNotice,
  PremiumSelect,
  SoftStatus,
} from "../../components/customer/PremiumAccount";
import { OtpInput } from "../../components/OtpInput";
import { uploadUrl } from "../../config/api";
import { uploadService } from "../../services/uploadService";
import { warrantyService } from "../../services/warrantyService";
import { products } from "../../store/commerce";
import { useAppStore } from "../../store/appStore";

const purchaseSources = ["Amazon", "Flipkart", "Marketplace", "Retail", "Offline"];
const claimableWarrantyStatuses = ["Active", "Claim Under Review", "Replacement Approved", "Repaired", "Replaced"];
const claimIssueTypes = ["Dead on arrival", "Not powering on", "Physical damage", "Battery or charging issue", "Audio or display issue", "Accessory issue", "Other product issue"];
const initialClaimDraft = { issueType: "Dead on arrival", issueDescription: "", attachment: null, policyAccepted: false, policyViewed: false };

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

const initialWarrantyForm = {
  product: products[0]?.name || "Aura Audio Pro",
  productSlug: products[0]?.slug || "aura-audio-pro",
  serial: "",
  source: "Amazon",
  sourceDetail: "",
  purchaseDate: "",
  invoiceNumber: "",
  invoiceUrl: "",
};

const otpDestination = (ownership, profile) => (
  ownership?.otpTarget || profile?.phone || profile?.email || "your verified account"
);

export default function WarrantyPage() {
  const auth = useAppStore((state) => state.auth);
  const profile = useAppStore((state) => state.profile);
  const { claims, rmas, status, error } = useAppStore((state) => state.warranty);
  const loadWarrantyClaims = useAppStore((state) => state.loadWarrantyClaims);
  const createWarrantyClaim = useAppStore((state) => state.createWarrantyClaim);
  const verifyWarrantyOtp = useAppStore((state) => state.verifyWarrantyOtp);
  const createWarrantyRma = useAppStore((state) => state.createWarrantyRma);
  const [activeMode, setActiveMode] = useState("register");
  const [registrationStep, setRegistrationStep] = useState("details");
  const [activeOwnership, setActiveOwnership] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState("");
  const [activeClaimId, setActiveClaimId] = useState("");
  const [claimDraft, setClaimDraft] = useState(initialClaimDraft);
  const [claimUpload, setClaimUpload] = useState({ status: "idle", error: "", fileName: "" });
  const [claimPolicyError, setClaimPolicyError] = useState("");
  const [invoiceUpload, setInvoiceUpload] = useState({ status: "idle", error: "", fileName: "" });
  const [warrantyPolicy, setWarrantyPolicy] = useState(null);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyViewed, setPolicyViewed] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(initialWarrantyForm);

  useEffect(() => {
    if (auth.user) loadWarrantyClaims();
  }, [auth.user, loadWarrantyClaims]);

  useEffect(() => {
    warrantyService.getPolicy({ skipGlobalErrorToast: true })
      .then(setWarrantyPolicy)
      .catch(() => setWarrantyPolicy(null));
  }, []);

  const registeredProducts = useMemo(() => claims, [claims]);
  const rmaByOwnership = useMemo(() => rmas.reduce((map, rma) => ({ ...map, [rma.ownershipId]: rma }), {}), [rmas]);
  const formErrors = {
    serial: form.serial && form.serial.trim().length < 3 ? "Enter the serial number printed on the product, box, or invoice." : "",
    purchaseDate: form.purchaseDate && new Date(form.purchaseDate) > new Date() ? "Purchase date cannot be in the future." : "",
  };
  const warrantyOtpDestination = otpDestination(activeOwnership, profile);

  if (!auth.user) {
    return (
      <CommerceShell seoTitle="Warranty" seoDescription="Sign in to manage INFIBOLT product ownership and warranty.">
        <AccountAtmosphere>
          <MotionSection className="grid min-h-[calc(100svh-73px)] place-items-center px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
            <AccountAccess initialMode="login" />
          </MotionSection>
        </AccountAtmosphere>
      </CommerceShell>
    );
  }

  const setProduct = (productName) => {
    const selected = products.find((item) => item.name === productName);
    setForm((current) => ({ ...current, product: productName, productSlug: selected?.slug || current.productSlug }));
  };

  const resetRegistrationDraft = () => {
    setRegistrationStep("details");
    setActiveOwnership(null);
    setOtp("");
    setOtpError("");
    setInvoiceUpload({ status: "idle", error: "", fileName: "" });
    setPolicyAccepted(false);
    setPolicyViewed(false);
    setPolicyError("");
    setFieldErrors({});
    setForm(initialWarrantyForm);
  };

  const changeMode = (nextMode) => {
    if (nextMode === "register" && registrationStep === "submitted") resetRegistrationDraft();
    setActiveMode(nextMode);
  };

  const submitRegistration = async (event) => {
    event.preventDefault();
    setOtpError("");
    setFieldErrors({});
    setPolicyError("");
    if (!form.invoiceUrl) {
      setInvoiceUpload({ status: "error", error: "Upload invoice PDF before continuing.", fileName: "" });
      return;
    }
    if (form.serial.trim().length < 3) {
      setOtpError("Enter the product serial number before OTP verification.");
      return;
    }
    if (!warrantyPolicy?.url || !policyViewed || !policyAccepted) {
      setPolicyError(!warrantyPolicy?.url ? "Warranty policy is not available yet." : !policyViewed ? "Please view and read the warranty policy before registration." : "Acknowledge the warranty policy before OTP verification.");
      return;
    }
    setSubmitting(true);
    try {
      const ownership = await createWarrantyClaim({
        ...form,
        serial: form.serial.trim().toUpperCase(),
        customer: profile.name,
        email: profile.email,
        policyAccepted,
      });
      setActiveOwnership(ownership);
      setRegistrationStep("otp");
      setOtp("");
      toast.success("OTP sent", { description: `Verify ${otpDestination(ownership, profile)} to continue registration.` });
    } catch (requestError) {
      const fields = requestError.details?.fields || {};
      setFieldErrors(fields);
      setOtpError(fields.serial || requestError.message || "Registration could not start.");
      if (fields.policyAccepted) setPolicyError(fields.policyAccepted);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadInvoicePdf = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setInvoiceUpload({ status: "error", error: "Only PDF invoice files are allowed.", fileName: file.name });
      setForm((current) => ({ ...current, invoiceUrl: "" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setInvoiceUpload({ status: "error", error: "Invoice PDF must be 5 MB or smaller.", fileName: file.name });
      setForm((current) => ({ ...current, invoiceUrl: "" }));
      return;
    }
    setInvoiceUpload({ status: "loading", error: "", fileName: file.name });
    try {
      const result = await uploadService.uploadInvoice(file);
      setForm((current) => ({ ...current, invoiceUrl: result.url || result.path }));
      setInvoiceUpload({ status: "success", error: "", fileName: file.name });
      toast.success("Invoice uploaded", { description: "PDF attached to warranty registration." });
    } catch (requestError) {
      setForm((current) => ({ ...current, invoiceUrl: "" }));
      setInvoiceUpload({ status: "error", error: requestError.message || "Invoice upload failed.", fileName: file.name });
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    if (!activeOwnership?.id || otp.length !== 6) {
      setOtpError("Enter the 6 digit warranty OTP.");
      return;
    }
    setSubmitting(true);
    try {
      const verified = await verifyWarrantyOtp(activeOwnership.id, otp);
      setActiveOwnership(verified);
      setRegistrationStep("submitted");
      toast.success("Ownership submitted", { description: "Admin invoice review will activate warranty." });
    } catch (requestError) {
      setOtpError(requestError.message || "OTP was not accepted.");
    } finally {
      setSubmitting(false);
    }
  };

  const startClaim = (ownership) => {
    setActiveClaimId(ownership.id);
    setClaimDraft(initialClaimDraft);
    setClaimUpload({ status: "idle", error: "", fileName: "" });
    setClaimPolicyError("");
  };

  const uploadClaimPhoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setClaimDraft((current) => ({ ...current, attachment: null }));
      setClaimUpload({ status: "error", error: "Upload a product photo image.", fileName: file.name });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setClaimDraft((current) => ({ ...current, attachment: null }));
      setClaimUpload({ status: "error", error: "Product photo must be 2 MB or smaller.", fileName: file.name });
      return;
    }
    setClaimUpload({ status: "loading", error: "", fileName: file.name });
    try {
      const result = await uploadService.uploadClaimPhoto(file);
      setClaimDraft((current) => ({
        ...current,
        attachment: {
          url: result.url || result.path,
          filename: result.originalName || result.filename || file.name,
          type: result.type || file.type,
        },
      }));
      setClaimUpload({ status: "success", error: "", fileName: file.name });
      toast.success("Product photo uploaded", { description: "Photo attached to the claim form." });
    } catch (requestError) {
      setClaimDraft((current) => ({ ...current, attachment: null }));
      setClaimUpload({ status: "error", error: requestError.message || "Product photo upload failed.", fileName: file.name });
    }
  };

  const submitRma = async (ownership) => {
    if (!ownership || !claimableWarrantyStatuses.includes(ownership.warrantyStatus) || rmaByOwnership[ownership.id]) return;
    setClaimPolicyError("");
    if (!claimDraft.issueType) {
      setClaimUpload((current) => ({ ...current, error: "Select the issue type before submitting." }));
      return;
    }
    if (claimDraft.issueDescription.trim().length < 5) {
      setClaimUpload((current) => ({ ...current, error: "Describe what happened before submitting." }));
      return;
    }
    if (!claimDraft.attachment?.url) {
      setClaimUpload({ status: "error", error: "Upload a product photo before submitting.", fileName: claimUpload.fileName });
      return;
    }
    if (!warrantyPolicy?.url || !claimDraft.policyViewed || !claimDraft.policyAccepted) {
      setClaimPolicyError(!warrantyPolicy?.url ? "Warranty policy is not available yet." : !claimDraft.policyViewed ? "Please view and read the warranty policy before submitting a claim." : "Acknowledge the warranty policy before submitting a claim.");
      return;
    }
    setClaiming(ownership.id);
    try {
      const rma = await createWarrantyRma({
        ownershipId: ownership.id,
        issueType: claimDraft.issueType,
        issueDescription: claimDraft.issueDescription.trim(),
        attachments: [claimDraft.attachment],
        policyAccepted: claimDraft.policyAccepted,
      });
      toast.success("Claim created", { description: `${rma.id} is now under review.` });
      setActiveClaimId("");
      setClaimDraft(initialClaimDraft);
      setClaimUpload({ status: "idle", error: "", fileName: "" });
      setActiveMode("claim");
    } finally {
      setClaiming("");
    }
  };

  return (
    <CommerceShell seoTitle="Warranty" seoDescription="Premium INFIBOLT ownership, warranty, and RMA ecosystem.">
      <AccountAtmosphere>
        <MotionSection className="px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-20 lg:pt-10">
          <div className="mx-auto grid max-w-7xl gap-5">
            <WarrantyHero
              profile={profile}
              activeMode={activeMode}
              onModeChange={changeMode}
            />

            <div id="warranty-workspace" className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
              {activeMode === "register" && (
              <AccountCard className="overflow-hidden p-5 sm:p-7 xl:col-span-2">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <SoftStatus>Register product</SoftStatus>
                    <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Activate ownership care</h2>
                    <p className="mt-2 max-w-2xl text-sm font-light leading-7 text-slate-600">
                      Register Amazon, Flipkart, marketplace, or retail purchases with serial validation, invoice context, and mobile OTP.
                    </p>
                  </div>
                  <StepPills active={registrationStep} />
                </div>

                <AnimatePresence mode="wait">
                  {registrationStep === "details" && (
                    <motion.form key="details" {...stepMotion} onSubmit={submitRegistration} className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <PremiumSelect label="Product" value={form.product} onChange={setProduct} options={products.slice(0, 8).map((item) => item.name)} />
                        <div className="grid gap-2">
                          <PremiumField label="Serial number" value={form.serial} onChange={(serial) => { setForm((current) => ({ ...current, serial: serial.toUpperCase() })); setOtpError(""); setFieldErrors((current) => ({ ...current, serial: "" })); }} error={formErrors.serial || fieldErrors.serial || ""} placeholder="INF-HX01-24A8K92" required />
                          <p className="px-1 text-xs font-medium leading-5 text-slate-500">
                            Where to find? Product box label, warranty card, invoice item details, or device sticker.
                          </p>
                        </div>
                        <PremiumSelect label="Purchase source" value={form.source} onChange={(source) => setForm((current) => ({ ...current, source }))} options={purchaseSources} />
                        <PremiumField label={["Retail", "Offline"].includes(form.source) ? "Store name" : "Seller / order source"} value={form.sourceDetail} onChange={(sourceDetail) => setForm((current) => ({ ...current, sourceDetail }))} placeholder={form.source === "Amazon" ? "Amazon order / seller" : "Store or marketplace"} />
                        <PremiumField label="Purchase date" type="date" value={form.purchaseDate} onChange={(purchaseDate) => setForm((current) => ({ ...current, purchaseDate }))} error={formErrors.purchaseDate} required />
                        <PremiumField label="Invoice number" value={form.invoiceNumber} onChange={(invoiceNumber) => setForm((current) => ({ ...current, invoiceNumber }))} placeholder="Invoice / order ID" required />
                      </div>
                      <InvoicePdfUpload upload={invoiceUpload} uploaded={Boolean(form.invoiceUrl)} onUpload={uploadInvoicePdf} />
                      <WarrantyPolicyAgreement
                        policy={warrantyPolicy}
                        accepted={policyAccepted}
                        viewed={policyViewed}
                        error={policyError}
                        onView={() => {
                          setPolicyViewed(true);
                          setPolicyError("");
                        }}
                        onChange={(accepted) => {
                          setPolicyAccepted(accepted);
                          setPolicyError("");
                        }}
                      />
                      <PremiumButton loading={submitting} type="submit" disabled={Boolean(formErrors.serial || formErrors.purchaseDate)}>
                        {submitting ? "Sending OTP..." : "Verify and register"}
                      </PremiumButton>
                    </motion.form>
                  )}

                  {registrationStep === "otp" && (
                    <motion.form key="otp" {...stepMotion} onSubmit={submitOtp} className="grid gap-4">
                      <PremiumNotice tone="success" title="Mobile verification">
                        Enter the OTP sent to {warrantyOtpDestination} before invoice review begins.
                      </PremiumNotice>
                      <div className="rounded-[1.25rem] border border-slate-900/8 bg-white/58 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Warranty OTP</span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Ready</span>
                        </div>
                        <OtpInput value={otp} onChange={(value) => { setOtp(value); setOtpError(""); }} disabled={submitting} error={otpError} />
                      </div>
                      <PremiumButton loading={submitting} type="submit">{submitting ? "Checking..." : "Submit for review"}</PremiumButton>
                      <button type="button" onClick={() => setRegistrationStep("details")} className="text-left text-sm font-semibold text-slate-500 transition hover:text-slate-950">Edit registration details</button>
                    </motion.form>
                  )}

                  {registrationStep === "submitted" && (
                    <motion.div key="submitted" {...stepMotion} className="grid gap-4">
                      <PremiumNotice tone="success" title="Registration in review">
                        {activeOwnership?.product || "Your product"} is waiting for admin invoice review. Claim warranty will unlock after approval.
                      </PremiumNotice>
                      <PremiumNotice title="Claim not available yet">
                        You can register another product now. This product will appear in claim warranty after admin approval.
                      </PremiumNotice>
                      <PremiumButton type="button" onClick={resetRegistrationDraft}>
                        Register another product
                      </PremiumButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AccountCard>
              )}

              {activeMode === "claim" && (
              <AccountCard className="p-5 sm:p-7 xl:col-span-2">
                <div className="mb-6">
                  <SoftStatus>Warranty claim</SoftStatus>
                  <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Claim warranty for a registered product</h2>
                  <p className="mt-2 text-sm font-light leading-7 text-slate-600">Choose from your registered products. Claim requests open only after admin approval.</p>
                </div>
                {registeredProducts.length ? (
                  <RegisteredProductList
                    items={registeredProducts}
                    rmaByOwnership={rmaByOwnership}
                    claimingId={claiming}
                    activeClaimId={activeClaimId}
                    claimDraft={claimDraft}
                    claimUpload={claimUpload}
                    claimPolicy={warrantyPolicy}
                    claimPolicyError={claimPolicyError}
                    onStartClaim={startClaim}
                    onCancelClaim={() => {
                      setActiveClaimId("");
                      setClaimDraft(initialClaimDraft);
                      setClaimUpload({ status: "idle", error: "", fileName: "" });
                      setClaimPolicyError("");
                    }}
                    onClaimDraftChange={(updater) => {
                      setClaimDraft(updater);
                      setClaimPolicyError("");
                    }}
                    onPhotoUpload={uploadClaimPhoto}
                    onSubmitClaim={submitRma}
                  />
                ) : (
                  <EmptyState title="No registered products yet" description="Register a product first. After admin approval, warranty claim options will appear here." />
                )}
              </AccountCard>
              )}
            </div>

            {status === "loading" && <PageLoader label="Opening warranty records" />}
            {status === "error" && <EmptyState title="Warranty ecosystem unavailable" description={error} />}
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}

function WarrantyHero({ profile, activeMode, onModeChange }) {
  return (
    <section className="relative overflow-hidden rounded-[1.45rem] border border-slate-900/8 bg-white/76 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-7 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_0%,rgba(14,165,233,0.16),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.74))]" />
      <div className="relative">
        <SoftStatus>Warranty center</SoftStatus>
        <h1 className="mt-4 max-w-3xl text-[2rem] font-semibold leading-[1.05] tracking-normal text-slate-950 sm:text-[2.75rem]">Register or claim warranty.</h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-7 text-slate-600 sm:text-base">Register marketplace and retail products, then claim service only from approved ownership records.</p>
        <p className="mt-5 text-sm font-semibold text-slate-500">{profile.email} · {profile.phone}</p>
        <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onModeChange("register")}
            className={`min-h-[52px] rounded-full px-5 text-xs font-semibold uppercase tracking-[0.14em] transition ${activeMode === "register" ? "bg-slate-950 text-white shadow-[0_16px_34px_rgba(15,23,42,0.14)]" : "border border-slate-900/10 bg-white/68 text-slate-800 hover:bg-white"}`}
          >
            Register warranty
          </button>
          <button
            type="button"
            onClick={() => onModeChange("claim")}
            className={`min-h-[52px] rounded-full px-5 text-xs font-semibold uppercase tracking-[0.14em] transition ${activeMode === "claim" ? "bg-emerald-600 text-white shadow-[0_16px_34px_rgba(16,185,129,0.22)]" : "border border-emerald-700/15 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
          >
            Claim warranty
          </button>
        </div>
      </div>
    </section>
  );
}

function StepPills({ active }) {
  const steps = ["details", "otp", "submitted"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <span key={step} className={`h-2.5 w-2.5 rounded-full transition ${steps.indexOf(active) >= index ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" : "bg-slate-200"}`} />
      ))}
    </div>
  );
}

function WarrantyPolicyAgreement({ policy, accepted, viewed, error, onView, onChange }) {
  const handleBlockedCheck = () => {
    if (!viewed) onChange(false);
  };

  return (
    <div className={`rounded-2xl border p-4 ${error ? "border-rose-400/40 bg-rose-50/62" : "border-slate-900/8 bg-white/54"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">INFIBOLT warranty policy</p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            Read and acknowledge the latest policy before continuing.
          </p>
        </div>
        {policy?.url ? (
          <a
            href={uploadUrl(policy.url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onView}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-950 hover:text-white"
          >
            View policy
          </a>
        ) : (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">Not uploaded</span>
        )}
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm font-medium leading-6 text-slate-700">
        <input
          type="checkbox"
          checked={accepted}
          disabled={!policy?.url || !viewed}
          onClick={handleBlockedCheck}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 disabled:opacity-50"
        />
        <span>I have read and agree to the INFIBOLT warranty policy.</span>
      </label>
      {error && <p className="mt-2 text-xs font-medium leading-5 text-rose-700">{error}</p>}
    </div>
  );
}

function RegisteredProductList({
  items,
  rmaByOwnership,
  claimingId,
  activeClaimId,
  claimDraft,
  claimUpload,
  claimPolicy,
  claimPolicyError,
  onStartClaim,
  onCancelClaim,
  onClaimDraftChange,
  onPhotoUpload,
  onSubmitClaim,
}) {
  return (
    <div className="grid gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Registered products</span>
      <div className="grid gap-3">
        {items.map((item) => {
          const claimAvailable = claimableWarrantyStatuses.includes(item.warrantyStatus);
          const activeRma = rmaByOwnership[item.id];
          const formOpen = activeClaimId === item.id;
          return (
            <div
              key={item.id}
              className="relative grid gap-4 rounded-2xl border border-slate-900/8 bg-white/56 p-4 pb-14 text-left shadow-[0_14px_38px_rgba(15,23,42,0.045)] sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <span className="flex min-w-0 gap-3">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${claimAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {claimAvailable ? <CheckCircle2 className="h-5 w-5" strokeWidth={1.8} /> : <PackageCheck className="h-5 w-5" strokeWidth={1.8} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-950">{item.product}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{item.serial} · {item.id}</span>
                  {activeRma && <ClaimStatus rma={activeRma} />}
                  {!claimAvailable && (
                    <span className="mt-2 block text-xs font-medium leading-5 text-amber-800">
                      Caution: this product is {item.warrantyStatus || "pending approval"}. Claim unlocks after admin approval.
                    </span>
                  )}
                </span>
              </span>
              <span className="grid gap-2 justify-self-start sm:min-w-[180px] sm:justify-self-end">
                <span className={`inline-flex justify-self-start rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] sm:justify-self-end ${
                  claimAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                }`}>
                  {claimAvailable ? "Approved" : item.warrantyStatus || "Pending"}
                </span>
                {claimAvailable && (
                  <button
                    type="button"
                    onClick={() => (activeRma ? undefined : onStartClaim(item))}
                    disabled={Boolean(activeRma) || claimingId === item.id}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-slate-950 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-55"
                  >
                    {claimingId === item.id ? "Submitting..." : activeRma ? activeRma.status : formOpen ? "Form open" : "Claim warranty"}
                  </button>
                )}
              </span>
              {formOpen && !activeRma && (
                <ClaimRequestForm
                  ownership={item}
                  draft={claimDraft}
                  upload={claimUpload}
                  policy={claimPolicy}
                  policyError={claimPolicyError}
                  submitting={claimingId === item.id}
                  onChange={onClaimDraftChange}
                  onPhotoUpload={onPhotoUpload}
                  onCancel={onCancelClaim}
                  onSubmit={() => onSubmitClaim(item)}
                />
              )}
              <a
                href="/support"
                aria-label={`Get help for ${item.product}`}
                className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-900/10 bg-white/78 text-slate-500 transition hover:bg-white hover:text-slate-950"
              >
                <HelpCircle className="h-4 w-4" strokeWidth={1.8} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClaimStatus({ rma }) {
  const rejected = rma.status === "Rejected";
  const approved = ["Approved", "Pickup Scheduled", "In Transit", "Inspection", "Repair Approved", "Replacement Approved", "Repaired", "Replaced", "Closed"].includes(rma.status);
  return (
    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
      rejected ? "bg-rose-50 text-rose-700" : approved ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
    }`}>
      {rejected ? "Claim rejected" : approved ? "Approved for claim" : "Claim under review"} · {rma.id}
    </span>
  );
}

function ClaimRequestForm({ ownership, draft, upload, policy, policyError, submitting, onChange, onPhotoUpload, onCancel, onSubmit }) {
  const submitDisabled = submitting || !draft.issueType || draft.issueDescription.trim().length < 5 || !draft.attachment?.url || !policy?.url || !draft.policyViewed || !draft.policyAccepted;

  return (
    <div className="grid gap-4 border-t border-slate-900/8 pt-4 sm:col-span-2">
      <PremiumSelect
        label="Issue type"
        value={draft.issueType}
        onChange={(issueType) => onChange((current) => ({ ...current, issueType }))}
        options={claimIssueTypes}
        required
      />
      <PremiumField
        textarea
        label="Issue description"
        value={draft.issueDescription}
        onChange={(issueDescription) => onChange((current) => ({ ...current, issueDescription }))}
        placeholder={`Describe the issue with ${ownership.product}.`}
        required
      />
      <ClaimPhotoUpload upload={upload} uploaded={Boolean(draft.attachment?.url)} onUpload={onPhotoUpload} />
      <WarrantyPolicyAgreement
        policy={policy}
        accepted={draft.policyAccepted}
        viewed={draft.policyViewed}
        error={policyError}
        onView={() => onChange((current) => ({ ...current, policyViewed: true }))}
        onChange={(policyAccepted) => onChange((current) => ({ ...current, policyAccepted }))}
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-xs font-medium leading-5 text-slate-500">Select an issue, describe it, upload clear proof, and acknowledge the INFIBOLT warranty policy before submitting.</p>
        <span className="flex gap-2 sm:justify-end">
          <button type="button" onClick={onCancel} className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onSubmit} disabled={submitDisabled} className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-slate-950 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-55">
            {submitting ? "Submitting..." : "Submit for claim"}
          </button>
        </span>
      </div>
    </div>
  );
}

function ClaimPhotoUpload({ upload, uploaded, onUpload }) {
  return (
    <label className={`flex min-h-[116px] cursor-pointer items-center justify-center rounded-[1.25rem] border border-dashed px-5 text-center text-sm font-light leading-6 transition ${
      upload.status === "error"
        ? "border-rose-400/60 bg-rose-50/70 text-rose-800"
        : uploaded
          ? "border-emerald-500/40 bg-emerald-50/70 text-emerald-800"
          : "border-slate-900/14 bg-white/48 text-slate-500 hover:border-slate-900/24 hover:bg-white/70"
    }`}>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          onUpload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <span className="grid justify-items-center gap-2">
        <ImageUp className="h-5 w-5 text-current opacity-70" />
        <span className="font-semibold text-slate-800">{upload.status === "loading" ? "Uploading product photo..." : uploaded ? "Product photo uploaded" : "Upload product photo"}</span>
        <span>{upload.fileName || "Image only. Maximum file size 2 MB."}</span>
        {upload.error && <span className="font-medium text-rose-700">{upload.error}</span>}
      </span>
    </label>
  );
}

function InvoicePdfUpload({ upload, uploaded, onUpload }) {
  return (
    <label className={`flex min-h-[116px] cursor-pointer items-center justify-center rounded-[1.25rem] border border-dashed px-5 text-center text-sm font-light leading-6 transition ${
      upload.status === "error"
        ? "border-rose-400/60 bg-rose-50/70 text-rose-800"
        : uploaded
          ? "border-emerald-500/40 bg-emerald-50/70 text-emerald-800"
          : "border-slate-900/14 bg-white/48 text-slate-500 hover:border-slate-900/24 hover:bg-white/70"
    }`}>
      <input
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => {
          onUpload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <span className="grid justify-items-center gap-2">
        <UploadCloud className="h-5 w-5 text-current opacity-70" />
        <span className="font-semibold text-slate-800">{upload.status === "loading" ? "Uploading invoice..." : uploaded ? "Invoice PDF uploaded" : "Upload invoice PDF"}</span>
        <span>{upload.fileName || "PDF only. Maximum file size 5 MB."}</span>
        {upload.error && <span className="font-medium text-rose-700">{upload.error}</span>}
      </span>
    </label>
  );
}
