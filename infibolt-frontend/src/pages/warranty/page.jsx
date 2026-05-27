import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, HelpCircle, ImageUp, PackageCheck, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { EmptyState } from "../../components/AppStates";
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
import { uploadUrl } from "../../config/api";
import { productService } from "../../services/productService";
import { uploadService } from "../../services/uploadService";
import { warrantyService } from "../../services/warrantyService";
import { products } from "../../store/commerce";
import { useAppStore } from "../../store/appStore";

const purchaseSources = ["Amazon", "Flipkart", "Marketplace", "Retail", "Offline"];
const claimableWarrantyStatuses = ["Active", "Claim Under Review", "Replacement Approved", "Repaired", "Replaced"];
const claimIssueTypes = ["Dead on arrival", "Not powering on", "Physical damage", "Battery or charging issue", "Audio or display issue", "Accessory issue", "Other product issue"];
const initialClaimDraft = {
  issueType: "Dead on arrival",
  issueDescription: "",
  attachment: null,
  customerAddress: { name: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "" },
  policyAccepted: false,
  policyViewed: false,
};
const WARRANTY_REGISTRATION_WINDOW_DAYS = 7;
const INDIA_TIME_ZONE = "Asia/Kolkata";

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

const warrantyFormForProduct = (productSlug = "") => {
  const selected = products.find((item) => item.slug === productSlug) || products[0];
  return {
    ...initialWarrantyForm,
    product: selected?.name || initialWarrantyForm.product,
    productSlug: selected?.slug || initialWarrantyForm.productSlug,
  };
};

const dateInputFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: INDIA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateInputValue(value = new Date()) {
  return dateInputFormatter.format(value);
}

function dayIndexFromDateInput(value) {
  const [year, month, day] = String(value || "").split("-").map(Number);
  if (!year || !month || !day) return null;
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function addDaysToDateInput(value, days) {
  const [year, month, day] = String(value || "").split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function purchaseDateError(value) {
  if (!value) return "Purchase date is required.";
  const today = dateInputValue();
  const purchaseDay = dayIndexFromDateInput(value);
  const todayDay = dayIndexFromDateInput(today);
  if (purchaseDay === null || todayDay === null) return "Enter a valid purchase date.";
  const daysSincePurchase = todayDay - purchaseDay;
  if (daysSincePurchase < 0) return "Purchase date cannot be in the future.";
  if (daysSincePurchase > WARRANTY_REGISTRATION_WINDOW_DAYS) {
    return "Warranty registration is available only within 7 days of purchase.";
  }
  return "";
}

function claimAddressFromProfile(profile = {}) {
  return {
    name: profile.name || "",
    phone: String(profile.phone || "").replace(/\D/g, ""),
    line1: profile.address || "",
    line2: "",
    city: profile.city || "",
    state: profile.state || "",
    postalCode: "",
  };
}

function missingClaimProfileFields(profile = {}) {
  const missing = [];
  if (!String(profile.phone || "").replace(/\D/g, "")) missing.push("mobile number");
  if (!String(profile.address || "").trim()) missing.push("full address");
  if (!String(profile.city || "").trim()) missing.push("city");
  if (!String(profile.state || "").trim()) missing.push("state");
  return missing;
}

export default function WarrantyPage() {
  const location = useLocation();
  const auth = useAppStore((state) => state.auth);
  const profile = useAppStore((state) => state.profile);
  const { claims, rmas } = useAppStore((state) => state.warranty);
  const loadWarrantyClaims = useAppStore((state) => state.loadWarrantyClaims);
  const createWarrantyClaim = useAppStore((state) => state.createWarrantyClaim);
  const createWarrantyRma = useAppStore((state) => state.createWarrantyRma);
  const [activeMode, setActiveMode] = useState("register");
  const [registrationStep, setRegistrationStep] = useState("details");
  const [activeOwnership, setActiveOwnership] = useState(null);
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
  const warrantyProductSlug = useMemo(() => new URLSearchParams(location.search).get("product") || "", [location.search]);
  const warrantyReturnTo = `${location.pathname}${location.search || ""}`;
  const [linkedProduct, setLinkedProduct] = useState(null);
  const [form, setForm] = useState(() => warrantyFormForProduct(warrantyProductSlug));
  const [registrationProducts, setRegistrationProducts] = useState(products);

  useEffect(() => {
    if (auth.user) loadWarrantyClaims();
  }, [auth.user, loadWarrantyClaims]);

  useEffect(() => {
    warrantyService.getPolicy({ skipGlobalErrorToast: true })
      .then(setWarrantyPolicy)
      .catch(() => setWarrantyPolicy(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    productService.warrantyRegistrationList()
      .then((result) => {
        if (cancelled) return;
        const merged = [...(result.items || []), ...products].reduce((map, item) => {
          const key = item.slug || item.name || item.title;
          if (key && !map.has(key)) map.set(key, item);
          return map;
        }, new Map());
        setRegistrationProducts([...merged.values()]);
      })
      .catch(() => setRegistrationProducts(products));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!warrantyProductSlug) return;
    const selected = registrationProducts.find((item) => item.slug === warrantyProductSlug);
    if (selected) {
      setLinkedProduct(null);
      setActiveMode("register");
      setForm((current) => (
        current.productSlug === selected.slug
          ? current
          : { ...current, product: selected.name, productSlug: selected.slug }
      ));
      return;
    }

    let cancelled = false;
    productService.detail(warrantyProductSlug)
      .then((product) => {
        if (cancelled || !product?.slug) return;
        setLinkedProduct(product);
        setActiveMode("register");
        setForm((current) => (
          current.productSlug === product.slug
            ? current
            : { ...current, product: product.name || product.title || product.slug, productSlug: product.slug }
        ));
      })
      .catch(() => {
        if (!cancelled) setLinkedProduct(null);
      });
    return () => {
      cancelled = true;
    };
  }, [registrationProducts, warrantyProductSlug]);

  const registeredProducts = useMemo(() => claims, [claims]);
  const rmaByOwnership = useMemo(() => rmas.reduce((map, rma) => {
    if (!rma.ownershipId || map[rma.ownershipId]) return map;
    return { ...map, [rma.ownershipId]: rma };
  }, {}), [rmas]);
  const selectedWarrantyProduct = useMemo(
    () => (
      linkedProduct?.slug === warrantyProductSlug
        ? linkedProduct
        : registrationProducts.find((item) => item.slug === warrantyProductSlug)
    ),
    [linkedProduct, registrationProducts, warrantyProductSlug],
  );
  const warrantyProductOptions = useMemo(() => {
    const baseProducts = registrationProducts;
    if (selectedWarrantyProduct?.slug && !baseProducts.some((item) => item.slug === selectedWarrantyProduct.slug)) {
      return [selectedWarrantyProduct, ...baseProducts];
    }
    return baseProducts;
  }, [selectedWarrantyProduct]);
  const formErrors = {
    serial: form.serial && form.serial.trim().length < 3 ? "Enter the serial number printed on the product, box, or invoice." : "",
    purchaseDate: purchaseDateError(form.purchaseDate),
  };
  if (!auth.user) {
    return (
      <CommerceShell seoTitle="Warranty" seoDescription="Sign in to manage INFIBOLT product ownership and warranty.">
        <AccountAtmosphere>
          <MotionSection className="grid min-h-[calc(100svh-73px)] place-items-center px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
            <AccountAccess initialMode="login" redirectTo={warrantyReturnTo} />
          </MotionSection>
        </AccountAtmosphere>
      </CommerceShell>
    );
  }

  const setProduct = (productName) => {
    const selected = warrantyProductOptions.find((item) => (item.name || item.title || item.slug) === productName);
    setForm((current) => ({ ...current, product: productName, productSlug: selected?.slug || current.productSlug }));
  };

  const resetRegistrationDraft = () => {
    setRegistrationStep("details");
    setActiveOwnership(null);
    setOtpError("");
    setInvoiceUpload({ status: "idle", error: "", fileName: "" });
    setPolicyAccepted(false);
    setPolicyViewed(false);
    setPolicyError("");
    setFieldErrors({});
    setForm(
      selectedWarrantyProduct?.slug
        ? { ...initialWarrantyForm, product: selectedWarrantyProduct.name || selectedWarrantyProduct.title || selectedWarrantyProduct.slug, productSlug: selectedWarrantyProduct.slug }
        : warrantyFormForProduct(warrantyProductSlug),
    );
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
      setOtpError("Enter the product serial number before registration.");
      return;
    }
    if (!warrantyPolicy?.url || !policyViewed || !policyAccepted) {
      setPolicyError(!warrantyPolicy?.url ? "Warranty policy is not available yet." : !policyViewed ? "Please view and read the warranty policy before registration." : "Acknowledge the warranty policy before registration.");
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
      setRegistrationStep("submitted");
      toast.success("Warranty registration submitted", { description: "Admin invoice review will activate warranty." });
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

  const startClaim = (ownership) => {
    const missingFields = missingClaimProfileFields(profile);
    if (missingFields.length > 0) {
      toast.warning("Complete service details", {
        description: `Add ${missingFields.join(", ")} before submitting the claim.`,
      });
    }
    setActiveClaimId(ownership.id);
    setClaimDraft({ ...initialClaimDraft, customerAddress: claimAddressFromProfile(profile) });
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
    const address = claimDraft.customerAddress || {};
    const phone = String(address.phone || "").replace(/\D/g, "");
    if (!address.name.trim() || phone.length < 8 || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.postalCode.trim()) {
      setClaimUpload((current) => ({ ...current, error: "Enter pickup and delivery address details before submitting." }));
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
        customerAddress: {
          ...claimDraft.customerAddress,
          phone: String(claimDraft.customerAddress.phone || "").replace(/\D/g, ""),
        },
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
    <CommerceShell seoTitle="Warranty" seoDescription="Premium INFIBOLT ownership, warranty, and product care.">
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
                      Link Amazon, Flipkart, marketplace, or retail purchases to your INFIBOLT account with secure email verification.
                      Registration must be completed within 7 days of purchase.
                    </p>
                  </div>
                  <StepPills active={registrationStep} />
                </div>

                <AnimatePresence mode="wait">
                  {registrationStep === "details" && (
                    <motion.form key="details" {...stepMotion} onSubmit={submitRegistration} className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <PremiumSelect label="Product" value={form.product} onChange={setProduct} options={warrantyProductOptions.map((item) => item.name || item.title || item.slug)} />
                        <div className="grid gap-2">
                          <PremiumField label="Serial number" value={form.serial} onChange={(serial) => { setForm((current) => ({ ...current, serial: serial.toUpperCase() })); setOtpError(""); setFieldErrors((current) => ({ ...current, serial: "" })); }} error={formErrors.serial || fieldErrors.serial || ""} placeholder="INF-HX01-24A8K92" required />
                          <p className="px-1 text-xs font-medium leading-5 text-slate-500">
                            Where to find? Product box label, warranty card, invoice item details, or device sticker.
                          </p>
                        </div>
                        <PremiumSelect label="Purchase source" value={form.source} onChange={(source) => setForm((current) => ({ ...current, source }))} options={purchaseSources} />
                        <PremiumField label={["Retail", "Offline"].includes(form.source) ? "Store name" : "Seller / order source"} value={form.sourceDetail} onChange={(sourceDetail) => setForm((current) => ({ ...current, sourceDetail }))} placeholder={form.source === "Amazon" ? "Amazon order / seller" : "Store or marketplace"} />
                        <PremiumField label="Purchase date" type="date" value={form.purchaseDate} onChange={(purchaseDate) => setForm((current) => ({ ...current, purchaseDate }))} error={formErrors.purchaseDate} helper="Register within 7 days of purchase to activate warranty." min={addDaysToDateInput(dateInputValue(), -WARRANTY_REGISTRATION_WINDOW_DAYS)} max={dateInputValue()} required />
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
                        {submitting ? "Sending email OTP..." : "Verify and register"}
                      </PremiumButton>
                    </motion.form>
                  )}

                  {registrationStep === "submitted" && (
                    <motion.div key="submitted" {...stepMotion} className="grid gap-4">
                      <PremiumNotice tone="success" title="Ownership details received">
                        {activeOwnership?.product || "Your product"} is now connected to your account. Warranty care will be available once the invoice and serial details are confirmed.
                      </PremiumNotice>
                      <PremiumNotice title="Care access is being prepared">
                        You can register another product now. This device will appear in warranty care after verification is complete.
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
                  <SoftStatus>Warranty care</SoftStatus>
                  <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Get care for a registered product</h2>
                  <p className="mt-2 text-sm font-light leading-7 text-slate-600">Choose a verified product to begin warranty support with your ownership details already connected.</p>
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
                  <EmptyState title="No registered products yet" description="Register a product first. Warranty care appears here after ownership verification." />
                )}
              </AccountCard>
              )}
            </div>

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
        <SoftStatus>Ownership care</SoftStatus>
        <h1 className="mt-4 max-w-3xl text-[2rem] font-semibold leading-[1.05] tracking-normal text-slate-950 sm:text-[2.75rem]">Register products. Keep care connected.</h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-7 text-slate-600 sm:text-base">
          Link marketplace and retail purchases to your INFIBOLT account for warranty coverage, support, and long-term product care.
          Register within 7 days of purchase; after the 8th day, warranty registration cannot be claimed.
        </p>
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
            Warranty care
          </button>
        </div>
      </div>
    </section>
  );
}

function StepPills({ active }) {
  const steps = ["details", "submitted"];
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
          const rmaAllowsNewRequest = ["Rejected", "Closed"].includes(activeRma?.status);
          const rmaBlocksNewRequest = Boolean(activeRma) && !rmaAllowsNewRequest;
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
                      Warranty care becomes available after ownership verification is complete.
                    </span>
                  )}
                </span>
              </span>
              <span className="grid gap-2 justify-self-start sm:min-w-[180px] sm:justify-self-end">
                <span className={`inline-flex justify-self-start rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] sm:justify-self-end ${
                  claimAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                }`}>
                  {claimAvailable ? "Care ready" : "Verification in progress"}
                </span>
                {claimAvailable && (
                  <button
                    type="button"
                    onClick={() => (rmaBlocksNewRequest ? undefined : onStartClaim(item))}
                    disabled={rmaBlocksNewRequest || claimingId === item.id}
                    className={`inline-flex min-h-[42px] items-center justify-center rounded-full px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition disabled:pointer-events-none disabled:opacity-55 ${
                      rmaAllowsNewRequest ? "bg-slate-950 hover:bg-slate-800" : "bg-slate-950 hover:bg-slate-800"
                    }`}
                  >
                    {claimingId === item.id ? "Submitting..." : rmaBlocksNewRequest ? activeRma.status : formOpen ? "Form open" : rmaAllowsNewRequest ? "Start new request" : "Start care request"}
                  </button>
                )}
              </span>
              {formOpen && !rmaBlocksNewRequest && (
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
  const closed = rma.status === "Closed";
  const approved = ["Approved", "Pickup Scheduled", "In Transit", "Inspection", "Repair Approved", "Replacement Approved", "Repaired", "Replaced", "Closed"].includes(rma.status);
  const latestTimelineNote = [...(rma.timeline || [])].reverse().find((entry) => entry?.note)?.note;
  const note = rma.notes || latestTimelineNote || rma.policyDecision || "";
  const statusLabel = rejected ? "Care request rejected" : closed ? "Care request closed" : approved ? "Care in progress" : "Care request received";
  const deliveryGuidance = {
    Picked: "Product pickup is recorded.",
    Received: "Product received at service desk.",
    Processed: "Service team is processing the request.",
    Shipped: "Product has been shipped back.",
    Delivered: "Product delivery is complete.",
  };
  return (
    <span className="mt-2 grid gap-2">
      <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
        rejected ? "bg-rose-50 text-rose-700" : approved ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
      }`}>
        {statusLabel} · {rma.status || "Requested"} · {rma.id}
      </span>
      {note && (
        <span className={`block max-w-2xl rounded-xl px-3 py-2 text-xs font-medium leading-5 ${
          rejected ? "bg-rose-50 text-rose-800" : "bg-slate-950/[0.035] text-slate-600"
        }`}>
          {rejected ? "Reason: " : "Update: "}{note}
        </span>
      )}
      {(rma.deliveryStatus || rma.status === "Approved") && (
        <span className="block max-w-2xl rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium leading-5 text-emerald-800">
          Delivery: {rma.deliveryStatus || "Awaiting pickup"}. {rma.deliveryNotes || deliveryGuidance[rma.deliveryStatus] || "Admin will update pickup, service processing, shipping, and delivery here."}
        </span>
      )}
    </span>
  );
}

function ClaimRequestForm({ ownership, draft, upload, policy, policyError, submitting, onChange, onPhotoUpload, onCancel, onSubmit }) {
  const address = draft.customerAddress || {};
  const addressReady = address.name?.trim() && String(address.phone || "").replace(/\D/g, "").length >= 8 && address.line1?.trim() && address.city?.trim() && address.state?.trim() && address.postalCode?.trim();
  const updateAddress = (field, value) => onChange((current) => ({ ...current, customerAddress: { ...(current.customerAddress || {}), [field]: value } }));
  const submitDisabled = submitting || !draft.issueType || draft.issueDescription.trim().length < 5 || !draft.attachment?.url || !addressReady || !policy?.url || !draft.policyViewed || !draft.policyAccepted;

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
        placeholder={`Tell us what happened with ${ownership.product}.`}
        required
      />
      <ClaimPhotoUpload upload={upload} uploaded={Boolean(draft.attachment?.url)} onUpload={onPhotoUpload} />
      <div className="grid gap-3 rounded-2xl border border-slate-900/8 bg-white/54 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pickup and delivery address</p>
        <div className="grid gap-3 md:grid-cols-2">
          <PremiumField label="Contact name" value={address.name || ""} onChange={(value) => updateAddress("name", value)} required />
          <PremiumField label="Contact phone" value={address.phone || ""} onChange={(value) => updateAddress("phone", value.replace(/\D/g, ""))} inputMode="tel" required />
          <PremiumField label="Address line 1" value={address.line1 || ""} onChange={(value) => updateAddress("line1", value)} required />
          <PremiumField label="Address line 2" value={address.line2 || ""} onChange={(value) => updateAddress("line2", value)} />
          <PremiumField label="City" value={address.city || ""} onChange={(value) => updateAddress("city", value)} required />
          <PremiumField label="State" value={address.state || ""} onChange={(value) => updateAddress("state", value)} required />
          <PremiumField label="PIN code" value={address.postalCode || ""} onChange={(value) => updateAddress("postalCode", value)} required />
        </div>
      </div>
      <WarrantyPolicyAgreement
        policy={policy}
        accepted={draft.policyAccepted}
        viewed={draft.policyViewed}
        error={policyError}
        onView={() => onChange((current) => ({ ...current, policyViewed: true }))}
        onChange={(policyAccepted) => onChange((current) => ({ ...current, policyAccepted }))}
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-xs font-medium leading-5 text-slate-500">Select an issue, describe what happened, upload a clear photo, and acknowledge the INFIBOLT warranty policy before submitting.</p>
        <span className="flex gap-2 sm:justify-end">
          <button type="button" onClick={onCancel} className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onSubmit} disabled={submitDisabled} className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-slate-950 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-55">
            {submitting ? "Submitting..." : "Submit care request"}
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
