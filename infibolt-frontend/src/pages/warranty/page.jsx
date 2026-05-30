import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, HelpCircle, ImageUp, PackageCheck, UploadCloud, XCircle } from "lucide-react";
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

const purchaseSources = ["Amazon", "Flipkart", "Marketplace", "Retail", "Offline", "Other"];
const customProductOption = "Other INFIBOLT product";
const claimableWarrantyStatuses = ["Active", "Claim Under Review", "Replacement Approved", "Repaired", "Replaced"];
const claimIssueTypes = ["Dead on arrival", "Not powering on", "Physical damage", "Battery or charging issue", "Audio or display issue", "Accessory issue", "Other product issue"];
const warrantyWorkflowSteps = ["Claim Submitted", "Under Review", "Approved / Rejected", "Waiting for Customer Shipment", "Tracking Submitted", "Product Received", "Inspection in Progress", "Final Approval", "Replacement Dispatched", "Delivered"];
const rmaWorkflowStepByStatus = {
  Requested: "Claim Submitted",
  "In Progress": "Under Review",
  "More Details Requested": "Under Review",
  Approved: "Approved / Rejected",
  Rejected: "Approved / Rejected",
  "Waiting for Customer Shipment": "Waiting for Customer Shipment",
  "Tracking Submitted": "Tracking Submitted",
  "Product Received": "Product Received",
  Inspection: "Inspection in Progress",
  "Inspection in Progress": "Inspection in Progress",
  "Repair Approved": "Final Approval",
  "Final Approved": "Final Approval",
  "Rejected After Inspection": "Final Approval",
  "Replacement Approved": "Final Approval",
  Repaired: "Final Approval",
  Replaced: "Final Approval",
  "Replacement Dispatched": "Replacement Dispatched",
  "Return Dispatched": "Replacement Dispatched",
  "Out for Delivery": "Replacement Dispatched",
  Delivered: "Delivered",
  Closed: "Delivered",
};
const reclaimableRmaStatuses = ["Rejected", "Closed"];
const defaultReturnAddress = {
  name: "INFIBOLT Service Center",
  line1: "#45 Tech Park Road",
  line2: "",
  city: "Bangalore",
  state: "Karnataka",
  postalCode: "560001",
  phone: "+91 XXXXX XXXXX",
};
const indianMobilePattern = /^[6-9]\d{9}$/;
const indiaPinCodePattern = /^[1-9]\d{5}$/;

function digitsOnly(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function claimAddressErrors(address = {}) {
  const phone = digitsOnly(address.phone);
  const postalCode = digitsOnly(address.postalCode);
  return {
    name: address.name?.trim() ? "" : "Enter the contact person name.",
    phone: indianMobilePattern.test(phone) ? "" : "Enter a valid 10 digit Indian mobile number.",
    line1: address.line1?.trim() && address.line1.trim().length >= 5 ? "" : "Enter a complete pickup address.",
    city: address.city?.trim() ? "" : "Enter the city.",
    state: address.state?.trim() ? "" : "Enter the state.",
    postalCode: indiaPinCodePattern.test(postalCode) ? "" : "Enter a valid 6 digit PIN code.",
  };
}

function firstAddressError(address = {}) {
  return Object.values(claimAddressErrors(address)).find(Boolean) || "";
}
const initialClaimDraft = {
  issueType: "Dead on arrival",
  issueDescription: "",
  attachment: null,
  customerAddress: { name: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "" },
  policyAccepted: false,
  policyViewed: false,
};
const WARRANTY_REGISTRATION_WINDOW_YEARS = 1;
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
  customProductName: "",
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

function addYearsToDateInput(value, years) {
  const [year, month, day] = String(value || "").split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(Date.UTC(year + years, month - 1, day));
  return date.toISOString().slice(0, 10);
}

function warrantyExpiryDateInput(ownership = {}) {
  if (ownership.warrantyUntil) return dateInputValue(new Date(ownership.warrantyUntil));
  const purchaseDate = ownership.purchaseDate || ownership.warrantyStart || ownership.createdAt;
  return purchaseDate ? addYearsToDateInput(dateInputValue(new Date(purchaseDate)), WARRANTY_REGISTRATION_WINDOW_YEARS) : "";
}

function isOwnershipExpired(ownership = {}) {
  const expiryDate = warrantyExpiryDateInput(ownership);
  const expiryDay = dayIndexFromDateInput(expiryDate);
  const todayDay = dayIndexFromDateInput(dateInputValue());
  return expiryDay !== null && todayDay !== null && todayDay > expiryDay;
}

function recordDateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function purchaseDateError(value) {
  if (!value) return "Purchase date is required.";
  const today = dateInputValue();
  const purchaseDay = dayIndexFromDateInput(value);
  const todayDay = dayIndexFromDateInput(today);
  if (purchaseDay === null || todayDay === null) return "Enter a valid purchase date.";
  const daysSincePurchase = todayDay - purchaseDay;
  if (daysSincePurchase < 0) return "Purchase date cannot be in the future.";
  const registrationDeadlineDay = dayIndexFromDateInput(addYearsToDateInput(value, WARRANTY_REGISTRATION_WINDOW_YEARS));
  if (registrationDeadlineDay !== null && todayDay > registrationDeadlineDay) {
    return "Warranty registration is available only within one year of purchase.";
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
    postalCode: profile.postalCode || "",
  };
}

function missingClaimProfileFields(profile = {}) {
  const missing = [];
  if (!String(profile.phone || "").replace(/\D/g, "")) missing.push("mobile number");
  if (!String(profile.address || "").trim()) missing.push("full address");
  if (!String(profile.city || "").trim()) missing.push("city");
  if (!String(profile.state || "").trim()) missing.push("state");
  if (!/^[1-9]\d{5}$/.test(String(profile.postalCode || "").trim())) missing.push("PIN code");
  return missing;
}

function productLabel(product = {}) {
  return product.name || product.title || product.slug || "";
}

function productKey(product = {}) {
  return String(product.slug || product.name || product.title || "").trim().toLowerCase();
}

function mergeRegistrationProducts(...groups) {
  const merged = new Map();
  groups.flat().filter(Boolean).forEach((item) => {
    const key = productKey(item);
    if (key && !merged.has(key)) merged.set(key, item);
  });
  return [...merged.values()].sort((a, b) => {
    const sortA = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 9999;
    const sortB = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 9999;
    if (sortA !== sortB) return sortA - sortB;
    return productLabel(a).localeCompare(productLabel(b));
  });
}

async function loadWarrantyRegistrationProducts() {
  try {
    const result = await productService.warrantyRegistrationList();
    return result.items || [];
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const result = await productService.warrantyRegistrationList();
    return result.items || [];
  }
}

export default function WarrantyPage() {
  const location = useLocation();
  const auth = useAppStore((state) => state.auth);
  const profile = useAppStore((state) => state.profile);
  const { claims, rmas } = useAppStore((state) => state.warranty);
  const loadWarrantyClaims = useAppStore((state) => state.loadWarrantyClaims);
  const createWarrantyClaim = useAppStore((state) => state.createWarrantyClaim);
  const createWarrantyRma = useAppStore((state) => state.createWarrantyRma);
  const submitWarrantyShipment = useAppStore((state) => state.submitWarrantyShipment);
  const [activeMode, setActiveMode] = useState("overview");
  const [registrationStep, setRegistrationStep] = useState("details");
  const [activeOwnership, setActiveOwnership] = useState(null);
  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState("");
  const [activeClaimId, setActiveClaimId] = useState("");
  const [claimDraft, setClaimDraft] = useState(initialClaimDraft);
  const [claimUpload, setClaimUpload] = useState({ status: "idle", error: "", fileName: "" });
  const [claimPolicyError, setClaimPolicyError] = useState("");
  const [claimError, setClaimError] = useState("");
  const [shipmentDrafts, setShipmentDrafts] = useState({});
  const [savingShipment, setSavingShipment] = useState("");
  const [openDetailId, setOpenDetailId] = useState("");
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
  const [productListStatus, setProductListStatus] = useState("loading");

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
    setProductListStatus("loading");
    loadWarrantyRegistrationProducts()
      .then((items) => {
        if (cancelled) return;
        setRegistrationProducts(mergeRegistrationProducts(items, products));
        setProductListStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setRegistrationProducts(mergeRegistrationProducts(products));
        setProductListStatus("error");
      });
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

  const registrationRecords = useMemo(
    () => claims.filter((item) => !claimableWarrantyStatuses.includes(item.warrantyStatus) && item.warrantyStatus !== "Expired" && !isOwnershipExpired(item)),
    [claims],
  );
  const careProducts = useMemo(
    () => claims.filter((item) => claimableWarrantyStatuses.includes(item.warrantyStatus) || item.warrantyStatus === "Expired" || isOwnershipExpired(item)),
    [claims],
  );
  const rmaByOwnership = useMemo(() => rmas.reduce((map, rma) => {
    if (!rma.ownershipId) return map;
    const current = map[rma.ownershipId];
    if (!current) return { ...map, [rma.ownershipId]: rma };
    const currentTerminal = reclaimableRmaStatuses.includes(current.status);
    const nextTerminal = reclaimableRmaStatuses.includes(rma.status);
    if (currentTerminal && !nextTerminal) return { ...map, [rma.ownershipId]: rma };
    const currentDate = recordDateValue(current.updatedAt || current.createdAt);
    const nextDate = recordDateValue(rma.updatedAt || rma.createdAt);
    return nextDate > currentDate ? { ...map, [rma.ownershipId]: rma } : map;
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
  const productOptions = useMemo(
    () => [...warrantyProductOptions.map(productLabel).filter(Boolean), customProductOption],
    [warrantyProductOptions],
  );
  const customProductError = form.product === customProductOption && form.customProductName.trim().length < 2
    ? "Enter the INFIBOLT product name shown on your invoice."
    : "";
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
    if (productName === customProductOption) {
      setForm((current) => ({ ...current, product: customProductOption, productSlug: "", customProductName: current.customProductName || "" }));
      return;
    }
    const selected = warrantyProductOptions.find((item) => productLabel(item) === productName);
    setForm((current) => ({ ...current, product: productName, productSlug: selected?.slug || "", customProductName: "" }));
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
      const message = "Upload invoice PDF before continuing.";
      setInvoiceUpload({ status: "error", error: message, fileName: "" });
      setOtpError(message);
      toast.error("Registration not submitted", { id: "warranty-registration-error", description: message });
      return;
    }
    if (form.serial.trim().length < 3) {
      const message = "Enter the product serial number before registration.";
      setOtpError(message);
      toast.error("Registration not submitted", { id: "warranty-registration-error", description: message });
      return;
    }
    if (formErrors.purchaseDate) {
      setOtpError(formErrors.purchaseDate);
      toast.error("Registration not submitted", { id: "warranty-registration-error", description: formErrors.purchaseDate });
      return;
    }
    if (customProductError) {
      setOtpError(customProductError);
      toast.error("Registration not submitted", { id: "warranty-registration-error", description: customProductError });
      return;
    }
    if (!warrantyPolicy?.url || !policyViewed || !policyAccepted) {
      const message = !warrantyPolicy?.url ? "Warranty policy is not available yet." : !policyViewed ? "Please view and read the warranty policy before registration." : "Acknowledge the warranty policy before registration.";
      setPolicyError(message);
      setOtpError(message);
      toast.error("Registration not submitted", { id: "warranty-registration-error", description: message });
      return;
    }
    setSubmitting(true);
    try {
      const isCustomProduct = form.product === customProductOption;
      const productName = isCustomProduct ? form.customProductName.trim() : form.product;
      const { customProductName, productSlug, ...registrationPayload } = form;
      const ownership = await createWarrantyClaim({
        ...registrationPayload,
        product: productName,
        ...(isCustomProduct ? {} : { productSlug }),
        serial: form.serial.trim().toUpperCase(),
        customer: profile.name,
        email: profile.email,
        policyAccepted,
      });
      setActiveOwnership(ownership);
      setRegistrationStep("submitted");
      toast.success("Warranty registration submitted", { description: "Admin invoice review will activate warranty." });
    } catch (requestError) {
      const fields = requestError.fields || requestError.details?.fields || {};
      const message = fields.purchaseDate || fields.serial || fields.invoiceUrl || fields.policyAccepted || requestError.message || "Registration could not start.";
      setFieldErrors(fields);
      setOtpError(message);
      if (fields.policyAccepted) setPolicyError(fields.policyAccepted);
      toast.error("Registration failed", { id: "warranty-registration-error", description: message });
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
    setClaimError("");
  };

  const startRegistrationRetry = (ownership) => {
    const matchedProduct = warrantyProductOptions.find((item) => item.slug === ownership.productSlug || productLabel(item) === ownership.product);
    setActiveMode("register");
    setRegistrationStep("details");
    setActiveOwnership(null);
    setOtpError("");
    setFieldErrors({});
    setInvoiceUpload({ status: "idle", error: "", fileName: "" });
    setPolicyAccepted(false);
    setPolicyViewed(false);
    setPolicyError("");
    setForm({
      product: matchedProduct ? productLabel(matchedProduct) : customProductOption,
      productSlug: matchedProduct?.slug || "",
      customProductName: matchedProduct ? "" : ownership.product || "",
      serial: String(ownership.serial || "").toUpperCase(),
      source: ownership.source || "Amazon",
      sourceDetail: ownership.sourceDetail || "",
      purchaseDate: ownership.purchaseDate ? dateInputValue(new Date(ownership.purchaseDate)) : "",
      invoiceNumber: ownership.invoiceNumber || "",
      invoiceUrl: "",
    });
    requestAnimationFrame(() => {
      document.getElementById("warranty-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
    const existingRma = ownership ? rmaByOwnership[ownership.id] : null;
    if (!ownership) return;
    if (isOwnershipExpired(ownership)) {
      const message = "Claims are available only within one year from the purchase date.";
      setClaimError(message);
      toast.error("Warranty expired", { id: "warranty-claim-error", description: message });
      return;
    }
    if (existingRma && !reclaimableRmaStatuses.includes(existingRma.status)) {
      const message = `A warranty claim is already ${existingRma.status} for this product.`;
      setClaimError(message);
      toast.error("Claim not submitted", { id: "warranty-claim-error", description: message });
      return;
    }
    if (!claimableWarrantyStatuses.includes(ownership.warrantyStatus)) {
      const message = "Warranty must be active before a claim can be opened.";
      setClaimError(message);
      toast.error("Claim not submitted", { id: "warranty-claim-error", description: message });
      return;
    }
    setClaimPolicyError("");
    setClaimError("");
    if (!claimDraft.issueType) {
      const message = "Select the issue type before submitting.";
      setClaimError(message);
      setClaimUpload((current) => ({ ...current, error: message }));
      toast.error("Claim not submitted", { id: "warranty-claim-error", description: message });
      return;
    }
    if (claimDraft.issueDescription.trim().length < 5) {
      const message = "Describe what happened before submitting.";
      setClaimError(message);
      setClaimUpload((current) => ({ ...current, error: message }));
      toast.error("Claim not submitted", { id: "warranty-claim-error", description: message });
      return;
    }
    if (!claimDraft.attachment?.url) {
      const message = "Upload a product photo before submitting.";
      setClaimError(message);
      setClaimUpload({ status: "error", error: message, fileName: claimUpload.fileName });
      toast.error("Claim not submitted", { id: "warranty-claim-error", description: message });
      return;
    }
    const address = claimDraft.customerAddress || {};
    const addressError = firstAddressError(address);
    if (addressError) {
      const message = addressError;
      setClaimError(message);
      setClaimUpload((current) => ({ ...current, error: message }));
      toast.error("Claim not submitted", { id: "warranty-claim-error", description: message });
      return;
    }
    if (!warrantyPolicy?.url || !claimDraft.policyViewed || !claimDraft.policyAccepted) {
      const message = !warrantyPolicy?.url ? "Warranty policy is not available yet." : !claimDraft.policyViewed ? "Please view and read the warranty policy before submitting a claim." : "Acknowledge the warranty policy before submitting a claim.";
      setClaimPolicyError(message);
      setClaimError(message);
      toast.error("Claim not submitted", { id: "warranty-claim-error", description: message });
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
          postalCode: String(claimDraft.customerAddress.postalCode || "").replace(/\D/g, ""),
        },
        attachments: [claimDraft.attachment],
        policyAccepted: claimDraft.policyAccepted,
      });
      toast.success("Claim created", { description: `${rma.id} is now under review.` });
      setActiveClaimId("");
      setClaimDraft(initialClaimDraft);
      setClaimUpload({ status: "idle", error: "", fileName: "" });
      setActiveMode("claim");
      setClaimError("");
    } catch (requestError) {
      const fields = requestError.fields || requestError.details?.fields || {};
      const message = fields["customerAddress.phone"] || fields["customerAddress.postalCode"] || fields["customerAddress.line1"] || fields.ownershipId || fields.policyAccepted || requestError.message || "Claim could not be submitted.";
      setClaimError(message);
      if (fields.policyAccepted) setClaimPolicyError(fields.policyAccepted);
      setClaimUpload((current) => ({ ...current, error: message }));
      toast.error("Claim failed", { id: "warranty-claim-error", description: message });
    } finally {
      setClaiming("");
    }
  };

  const submitShipmentDetails = async (rma) => {
    const draft = shipmentDrafts[rma.id] || {};
    if (!draft.courierName?.trim() || !draft.trackingId?.trim()) {
      toast.error("Tracking details required", { description: "Enter courier name and AWB/tracking number." });
      return;
    }
    setSavingShipment(rma.id);
    try {
      await submitWarrantyShipment(rma.id, {
        courierName: draft.courierName.trim(),
        trackingId: draft.trackingId.trim(),
        notes: draft.notes?.trim() || "",
      });
      toast.success("Tracking ID submitted", { description: "Shipment status moved to Shipment Sent." });
    } finally {
      setSavingShipment("");
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
              {activeMode === "overview" && (
                <AccountCard className="p-5 sm:p-7 xl:col-span-2">
                  <div className="mb-6">
                    <div>
                      <SoftStatus>Warranty dashboard</SoftStatus>
                      <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Pending registrations</h2>
                      <p className="mt-2 text-sm font-light leading-7 text-slate-600">Track products waiting for invoice and serial review before they move to warranty care.</p>
                    </div>
                  </div>
                  {registrationRecords.length ? (
                    <RegistrationRecordList
                      items={registrationRecords}
                      onReRegister={startRegistrationRetry}
                      onRegisterNew={() => changeMode("register")}
                      openDetailId={openDetailId}
                      onToggleDetails={(id) => setOpenDetailId((current) => (current === id ? "" : id))}
                    />
                  ) : (
                    <EmptyRegistrationState onRegisterNew={() => changeMode("register")} />
                  )}
                </AccountCard>
              )}

              {activeMode === "register" && (
              <AccountCard className="overflow-hidden p-5 sm:p-7 xl:col-span-2">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <SoftStatus>Register product</SoftStatus>
                    <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Activate ownership care</h2>
                    <p className="mt-2 max-w-2xl text-sm font-light leading-7 text-slate-600">
                      Link Amazon, Flipkart, marketplace, or retail purchases to your INFIBOLT account with invoice and serial review.
                      Registration must be completed within one year of purchase.
                    </p>
                  </div>
                  <StepPills active={registrationStep} />
                </div>

                <AnimatePresence mode="wait">
                  {registrationStep === "details" && (
                    <motion.form key="details" {...stepMotion} onSubmit={submitRegistration} className="grid gap-4">
                      {otpError && <PremiumNotice tone="error" title="Registration not submitted">{otpError}</PremiumNotice>}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-3">
                          <PremiumSelect label="Product" value={form.product} onChange={setProduct} options={productOptions} />
                          {productListStatus === "error" && (
                            <p className="px-1 text-xs font-medium leading-5 text-amber-700">
                              Live product list could not refresh. Choose from saved options or use custom product name.
                            </p>
                          )}
                          {form.product === customProductOption && (
                            <PremiumField
                              label="Custom product name"
                              value={form.customProductName}
                              onChange={(customProductName) => {
                                setForm((current) => ({ ...current, customProductName }));
                                setOtpError("");
                              }}
                              error={customProductError}
                              placeholder="Product name on invoice"
                              required
                            />
                          )}
                        </div>
                        <div className="grid gap-2">
                          <PremiumField label="Serial number" value={form.serial} onChange={(serial) => { setForm((current) => ({ ...current, serial: serial.toUpperCase() })); setOtpError(""); setFieldErrors((current) => ({ ...current, serial: "" })); }} error={formErrors.serial || fieldErrors.serial || ""} placeholder="INF-HX01-24A8K92" required />
                          <p className="px-1 text-xs font-medium leading-5 text-slate-500">
                            Where to find? Product box label, warranty card, invoice item details, or device sticker.
                          </p>
                        </div>
                        <PremiumSelect label="Purchase source" value={form.source} onChange={(source) => setForm((current) => ({ ...current, source }))} options={purchaseSources} />
                        <PremiumField label={["Retail", "Offline", "Other"].includes(form.source) ? "Store / source name" : "Seller / order source"} value={form.sourceDetail} onChange={(sourceDetail) => setForm((current) => ({ ...current, sourceDetail }))} placeholder={form.source === "Amazon" ? "Amazon order / seller" : form.source === "Other" ? "Where you purchased it" : "Store or marketplace"} />
                        <PremiumField label="Purchase date" type="date" value={form.purchaseDate} onChange={(purchaseDate) => { setForm((current) => ({ ...current, purchaseDate })); setOtpError(""); setFieldErrors((current) => ({ ...current, purchaseDate: "" })); }} error={fieldErrors.purchaseDate || formErrors.purchaseDate} helper="Register within one year of purchase to activate warranty." min={addYearsToDateInput(dateInputValue(), -WARRANTY_REGISTRATION_WINDOW_YEARS)} max={dateInputValue()} required />
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
                      <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                        <button
                          type="button"
                          onClick={() => {
                            resetRegistrationDraft();
                            setActiveMode("overview");
                          }}
                          className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <PremiumButton loading={submitting} type="submit">
                          {submitting ? "Submitting registration..." : "Verify and register"}
                        </PremiumButton>
                      </div>
                    </motion.form>
                  )}

                  {registrationStep === "submitted" && (
                    <motion.div key="submitted" {...stepMotion} className="grid gap-4">
                      <PremiumNotice tone="success" title="Ownership details received">
                        {activeOwnership?.product || "Your product"} is now connected to your account. Warranty care will be available once the invoice and serial details are confirmed.
                      </PremiumNotice>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AccountCard>
              )}

              {activeMode === "claim" && (
              <AccountCard className="p-5 sm:p-7 xl:col-span-2">
                <div className="mb-6">
                  <div>
                    <SoftStatus>Warranty care</SoftStatus>
                    <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Approved warranty products</h2>
                    <p className="mt-2 text-sm font-light leading-7 text-slate-600">Approved registrations appear here with claim actions or the current claim status.</p>
                  </div>
                </div>
                {careProducts.length ? (
                  <RegisteredProductList
                    items={careProducts}
                    rmaByOwnership={rmaByOwnership}
                    claimingId={claiming}
                    activeClaimId={activeClaimId}
                    claimDraft={claimDraft}
                    claimUpload={claimUpload}
                    claimPolicy={warrantyPolicy}
                    claimPolicyError={claimPolicyError}
                    shipmentDrafts={shipmentDrafts}
                    savingShipment={savingShipment}
                    openDetailId={openDetailId}
                    onStartClaim={startClaim}
                    onCancelClaim={() => {
                      setActiveClaimId("");
                      setClaimDraft(initialClaimDraft);
                      setClaimUpload({ status: "idle", error: "", fileName: "" });
                      setClaimPolicyError("");
                      setClaimError("");
                    }}
                    onClaimDraftChange={(updater) => {
                      setClaimDraft(updater);
                      setClaimPolicyError("");
                      setClaimError("");
                    }}
                    onPhotoUpload={uploadClaimPhoto}
                    onSubmitClaim={submitRma}
                    onShipmentDraftChange={(id, nextDraft) => setShipmentDrafts((current) => ({ ...current, [id]: { ...(current[id] || {}), ...nextDraft } }))}
                    onSubmitShipment={submitShipmentDetails}
                    onToggleDetails={(id) => setOpenDetailId((current) => (current === id ? "" : id))}
                    onReRegister={startRegistrationRetry}
                    claimError={claimError}
                  />
                ) : (
                  <EmptyState title="No care-ready products" description="Approved warranty registrations will appear here for claims and delivery updates." />
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
          Register within one year of purchase. Claims stay available only until the one-year warranty expires.
        </p>
        <p className="mt-5 text-sm font-semibold text-slate-500">{profile.email} · {profile.phone}</p>
        <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onModeChange("overview")}
            className={`min-h-[52px] rounded-full px-5 text-xs font-semibold uppercase tracking-[0.14em] transition ${activeMode === "register" || activeMode === "overview" ? "bg-slate-950 text-white shadow-[0_16px_34px_rgba(15,23,42,0.14)]" : "border border-slate-900/10 bg-white/68 text-slate-800 hover:bg-white"}`}
          >
            Warranty registrations
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

function EmptyRegistrationState({ onRegisterNew }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-[1.25rem] border border-dashed border-slate-900/12 bg-white/58 px-5 py-10 text-center">
      <div className="grid justify-items-center gap-4">
        <PackageCheck className="h-9 w-9 text-slate-400" strokeWidth={1.7} />
        <div>
          <h3 className="text-xl font-semibold tracking-normal text-slate-950">No registrations yet</h3>
          <p className="mt-2 max-w-md text-sm font-light leading-6 text-slate-600">Register a product to start invoice review and activate warranty care.</p>
        </div>
        <button type="button" onClick={onRegisterNew} className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-slate-950 px-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)] transition hover:bg-slate-800">
          Register a product
        </button>
      </div>
    </div>
  );
}

function RegistrationRecordList({ items, onReRegister, onRegisterNew, openDetailId, onToggleDetails }) {
  if (!items.length) return null;
  return (
    <div className="mt-8 grid gap-3 border-t border-slate-900/8 pt-6 first:mt-0 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Registration records</span>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            Pending and rejected warranty registrations stay here. Approved products move to Warranty Care.
          </p>
        </div>
        {onRegisterNew && (
          <button type="button" onClick={onRegisterNew} className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-slate-950 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(15,23,42,0.14)] transition hover:bg-slate-800">
            Register new product
          </button>
        )}
      </div>
      <div className="grid gap-3">
        {items.map((item) => {
          const status = item.warrantyStatus || item.status || "Pending Verification";
          const isRejected = status === "Rejected" || item.status === "Rejected";
          const latestNote = item.reviewNote || [...(item.timeline || [])].reverse().find((entry) => entry?.note)?.note;
          const detailOpen = openDetailId === item.id;
          return (
            <div
              key={item.id}
              className={`relative grid gap-4 rounded-2xl border p-4 text-left shadow-[0_14px_38px_rgba(15,23,42,0.04)] sm:grid-cols-[1fr_auto] sm:items-center ${
                isRejected ? "border-rose-300/80 bg-rose-50/50" : "border-amber-200/80 bg-amber-50/35"
              }`}
            >
              <span className="flex min-w-0 gap-3">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isRejected ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  {isRejected ? <XCircle className="h-5 w-5" strokeWidth={1.8} /> : <PackageCheck className="h-5 w-5" strokeWidth={1.8} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-950">{item.product}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{item.serial} · {item.id}</span>
                  <span className={`mt-3 block rounded-2xl border px-3 py-2 text-xs font-medium leading-5 ${
                    isRejected ? "border-rose-200 bg-white/78 text-rose-800" : "border-amber-200 bg-white/70 text-amber-800"
                  }`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-[0.16em] ${isRejected ? "text-rose-600" : "text-amber-700"}`}>
                      {isRejected ? "Rejected reason" : "Verification update"}
                    </span>
                    {latestNote || (isRejected ? "Warranty registration could not be verified." : "Waiting for admin invoice and serial verification.")}
                  </span>
                </span>
              </span>
              <span className="grid gap-2 justify-self-start sm:min-w-[180px] sm:justify-self-end">
                <span className={`inline-flex justify-self-start rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] sm:justify-self-end ${
                  isRejected ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
                }`}>
                  {isRejected ? "Rejected" : status}
                </span>
                {isRejected && (
                  <button
                    type="button"
                    onClick={() => onReRegister(item)}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-emerald-700 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-800"
                  >
                    Re-register
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onToggleDetails(item.id)}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-950 hover:text-white"
                >
                  {detailOpen ? "Hide details" : "View details"}
                </button>
              </span>
              {detailOpen && (
                <WarrantyDetailPanel
                  className="sm:col-span-2"
                  rows={[
                    ["Product", item.product || "-"],
                    ["Serial", item.serial || "-"],
                    ["Registration ID", item.id || "-"],
                    ["Invoice number", item.invoiceNumber || "-"],
                    ["Purchase date", formatCareDate(item.purchaseDate)],
                    ["Warranty until", formatCareDate(item.warrantyUntil)],
                    ["Status", status],
                    ["Admin note", latestNote || "-"],
                  ]}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WarrantyDetailPanel({ rows, className = "" }) {
  return (
    <div className={`grid gap-2 rounded-2xl border border-slate-900/8 bg-white/72 p-4 text-sm shadow-[0_14px_34px_rgba(15,23,42,0.045)] ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">View details</span>
      <dl className="grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-950/[0.025] px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</dt>
            <dd className="mt-1 break-words text-xs font-semibold leading-5 text-slate-700">{value || "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatCareDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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
  shipmentDrafts,
  savingShipment,
  openDetailId,
  onStartClaim,
  onCancelClaim,
  onClaimDraftChange,
  onPhotoUpload,
  onSubmitClaim,
  onShipmentDraftChange,
  onSubmitShipment,
  onToggleDetails,
  onReRegister,
  claimError,
}) {
  return (
    <div className="grid gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Registered products</span>
      <div className="grid gap-3">
        {items.map((item) => {
          const ownershipStatus = item.warrantyStatus || item.status || "";
          const isRejected = ownershipStatus === "Rejected" || item.status === "Rejected";
          const expired = ownershipStatus === "Expired" || isOwnershipExpired(item);
          const expiryDate = warrantyExpiryDateInput(item);
          const activeRma = rmaByOwnership[item.id];
          const hasRejectedRma = ["Rejected", "Rejected After Inspection"].includes(activeRma?.status);
          const cardRejected = isRejected || hasRejectedRma;
          const canClaim = !isRejected && !expired && claimableWarrantyStatuses.includes(item.warrantyStatus);
          const claimAvailable = !hasRejectedRma && canClaim;
          const rmaAllowsNewRequest = reclaimableRmaStatuses.includes(activeRma?.status);
          const rmaBlocksNewRequest = Boolean(activeRma) && !rmaAllowsNewRequest;
          const canOpenClaimForm = canClaim && (!activeRma || rmaAllowsNewRequest) && !rmaBlocksNewRequest;
          const formOpen = activeClaimId === item.id;
          const latestOwnershipNote = [...(item.timeline || [])].reverse().find((entry) => entry?.note)?.note;
          const rejectionReason = item.reviewNote || latestOwnershipNote || "Warranty registration could not be verified.";
          const detailOpen = openDetailId === item.id;
          return (
            <div
              key={item.id}
              className={`relative grid gap-4 rounded-2xl border p-4 pb-14 text-left shadow-[0_14px_38px_rgba(15,23,42,0.045)] transition sm:grid-cols-[1fr_auto] sm:items-center ${
                cardRejected
                  ? "border-rose-300/80 bg-rose-50/50 shadow-[0_18px_44px_rgba(225,29,72,0.08)]"
                  : expired
                    ? "border-slate-300/80 bg-slate-100/72"
                  : "border-slate-900/8 bg-white/56"
              }`}
            >
              <span className="flex min-w-0 gap-3">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  cardRejected ? "bg-rose-100 text-rose-700" : expired ? "bg-slate-200 text-slate-600" : claimAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {cardRejected || expired ? <XCircle className="h-5 w-5" strokeWidth={1.8} /> : claimAvailable ? <CheckCircle2 className="h-5 w-5" strokeWidth={1.8} /> : <PackageCheck className="h-5 w-5" strokeWidth={1.8} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-950">{item.product}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{item.serial} · {item.id}</span>
                  {isRejected ? (
                    <span className="mt-3 block rounded-2xl border border-rose-200 bg-white/78 px-3 py-2 text-xs font-medium leading-5 text-rose-800">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">Rejected reason</span>
                      {rejectionReason}
                    </span>
                  ) : expired ? (
                    <span className="mt-2 block text-xs font-medium leading-5 text-slate-600">
                      Warranty expired{expiryDate ? ` on ${expiryDate}` : ""}. Claims are available only within one year from the purchase date.
                    </span>
                  ) : !claimAvailable && !hasRejectedRma && (
                    <span className="mt-2 block text-xs font-medium leading-5 text-amber-800">Warranty care becomes available after ownership verification is complete.</span>
                  )}
                </span>
              </span>
              <span className="grid gap-2 justify-self-start sm:min-w-[180px] sm:justify-self-end">
                <span className={`inline-flex justify-self-start rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] sm:justify-self-end ${
                  cardRejected ? "bg-rose-100 text-rose-700" : expired ? "bg-slate-200 text-slate-700" : claimAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                }`}>
                  {cardRejected ? "Rejected" : expired ? "Expired" : claimAvailable ? "Care ready" : "Verification in progress"}
                </span>
                {isRejected && (
                  <button
                    type="button"
                    onClick={() => onReRegister(item)}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-emerald-700 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-800"
                  >
                    Re-register
                  </button>
                )}
                {activeRma ? (
                  <span className={`inline-flex min-h-[42px] items-center justify-center rounded-full px-5 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-[0_14px_34px_rgba(15,23,42,0.14)] ${
                    activeRma.status === "Rejected" || activeRma.status === "Rejected After Inspection"
                      ? "bg-rose-600 text-white"
                      : activeRma.status === "Delivered"
                        ? "bg-emerald-700 text-white"
                        : activeRma.status === "Inspection" || activeRma.status === "Inspection in Progress"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-950 text-white"
                  }`}>
                    {claimHeadline(activeRma)}
                  </span>
                ) : canOpenClaimForm && (
                  <button
                    type="button"
                    onClick={() => onStartClaim(item)}
                    disabled={claimingId === item.id}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-emerald-700 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:pointer-events-none disabled:opacity-55"
                  >
                    {claimingId === item.id ? "Submitting..." : formOpen ? "Form open" : "Claim Now"}
                  </button>
                )}
                {activeRma && rmaAllowsNewRequest && canOpenClaimForm && (
                  <button
                    type="button"
                    onClick={() => onStartClaim(item)}
                    disabled={claimingId === item.id}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-emerald-700 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:pointer-events-none disabled:opacity-55"
                  >
                    {claimingId === item.id ? "Submitting..." : formOpen ? "Reclaim form open" : "Reclaim"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onToggleDetails(item.id)}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-950 hover:text-white"
                >
                  {detailOpen ? "Hide details" : "View details"}
                </button>
              </span>
              {detailOpen && (
                <WarrantyDetailPanel
                  className="sm:col-span-2"
                  rows={[
                    ["Product", item.product || "-"],
                    ["Serial", item.serial || "-"],
                    ["Ownership ID", item.id || "-"],
                    ["Invoice number", item.invoiceNumber || "-"],
                    ["Purchase date", formatCareDate(item.purchaseDate)],
                    ["Warranty until", formatCareDate(item.warrantyUntil)],
                    ["Warranty status", item.warrantyStatus || item.status || "-"],
                    ["Claim status", activeRma?.status || "No claim submitted"],
                  ]}
                />
              )}
              {activeRma && detailOpen && (
                <div className="min-w-0 sm:col-span-2">
                  <ClaimStatus
                    rma={activeRma}
                    returnAddress={claimPolicy?.returnAddress}
                    shipmentDraft={shipmentDrafts[activeRma.id] || {}}
                    savingShipment={savingShipment === activeRma.id}
                    onShipmentDraftChange={(nextDraft) => onShipmentDraftChange(activeRma.id, nextDraft)}
                    onSubmitShipment={() => onSubmitShipment(activeRma)}
                  />
                </div>
              )}
              {formOpen && canOpenClaimForm && (
                <ClaimRequestForm
                  ownership={item}
                  draft={claimDraft}
                  upload={claimUpload}
                  policy={claimPolicy}
                  policyError={claimPolicyError}
                  claimError={claimError}
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

function ClaimStatus({ rma, returnAddress, shipmentDraft, savingShipment, onShipmentDraftChange, onSubmitShipment }) {
  const rejected = rma.status === "Rejected";
  const inspectionRejected = rma.status === "Rejected After Inspection";
  const closed = rma.status === "Closed";
  const approved = ["Approved", "Waiting for Customer Shipment", "Tracking Submitted", "Product Received", "Inspection", "Inspection in Progress", "Repair Approved", "Final Approved", "Replacement Approved", "Replacement Dispatched", "Return Dispatched", "Out for Delivery", "Delivered", "Repaired", "Replaced", "Closed"].includes(rma.status);
  const latestTimelineNote = [...(rma.timeline || [])].reverse().find((entry) => entry?.note)?.note;
  const note = rma.rejectionReason || rma.notes || latestTimelineNote || rma.policyDecision || "";
  const statusLabel = rejected ? "Claim Rejected" : inspectionRejected ? "Rejected After Inspection" : closed ? "Care request closed" : approved ? claimHeadline(rma) : "Care request received";
  return (
    <span className="mt-2 grid gap-3">
      <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
        rejected || inspectionRejected ? "bg-rose-50 text-rose-700" : rma.status === "Inspection in Progress" || rma.status === "Inspection" ? "bg-amber-50 text-amber-800" : approved ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
      }`}>
        {statusLabel} · {rma.status || "Requested"} · {rma.id}
      </span>
      {note && (
        <span className={`block max-w-2xl rounded-xl px-3 py-2 text-xs font-medium leading-5 ${
          rejected || inspectionRejected ? "bg-rose-50 text-rose-800" : "bg-slate-950/[0.035] text-slate-600"
        }`}>
          {rejected || inspectionRejected ? "Reason: " : "Update: "}{note}
        </span>
      )}
      <DeliveryProgressTracker rma={rma} returnAddress={returnAddress} />
      {!rejected && !inspectionRejected && ["Waiting for Customer Shipment", "Approved"].includes(rma.status) && !rma.returnShipment?.trackingId && (
        <ShipmentDetailsForm draft={shipmentDraft} saving={savingShipment} onChange={onShipmentDraftChange} onSubmit={onSubmitShipment} />
      )}
    </span>
  );
}

function DeliveryProgressTracker({ rma, returnAddress }) {
  const activeStep = workflowStepFromRma(rma);
  const activeIndex = Math.max(warrantyWorkflowSteps.indexOf(activeStep), 0);
  const progressWidth = activeIndex === 0 ? 0 : (activeIndex / (warrantyWorkflowSteps.length - 1)) * 100;
  const detail = rma.deliveryNotes || workflowStepGuidance(activeStep, rma);

  return (
    <section className="relative overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/74 px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.075)] ring-1 ring-slate-900/[0.035] backdrop-blur-2xl sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.68))]" />
      <div className="relative flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Warranty workflow</span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
            Step {activeIndex + 1} of {warrantyWorkflowSteps.length}
          </span>
          <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${activeStep === "Inspection in Progress" ? "bg-amber-50 text-amber-800" : activeStep === "Delivered" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-800"}`}>
            {activeStep}
          </span>
        </span>
      </div>

      <div className="relative mt-6 px-1 pb-1">
        <div className="absolute left-[calc(5%+0.25rem)] right-[calc(5%+0.25rem)] top-5 h-1 overflow-hidden rounded-full bg-slate-200/80 sm:left-[calc(5%+0.5rem)] sm:right-[calc(5%+0.5rem)]">
          <motion.span
            className="block h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
            initial={false}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="relative grid grid-cols-5 gap-y-4 sm:grid-cols-10 sm:gap-1">
          {warrantyWorkflowSteps.map((step, index) => {
            const completed = index < activeIndex || (index === 0 && activeStep === "Claim Submitted") || activeStep === "Delivered";
            const active = index === activeIndex && activeStep !== "Delivered";
            return (
              <div key={step} className="group grid min-w-0 justify-items-center gap-2">
                <motion.span
                  className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border text-xs font-semibold shadow-sm transition duration-300 group-hover:-translate-y-0.5 sm:h-11 sm:w-11 ${
                    completed
                      ? "border-emerald-500 bg-emerald-600 text-white shadow-[0_10px_26px_rgba(16,185,129,0.24)]"
                      : active
                        ? "border-emerald-400 bg-white text-emerald-700 shadow-[0_0_0_7px_rgba(16,185,129,0.09),0_16px_34px_rgba(16,185,129,0.22)]"
                        : "border-slate-200 bg-white/86 text-slate-400"
                  }`}
                  aria-current={active ? "step" : undefined}
                  title={step}
                  initial={false}
                  animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={active ? { duration: 1.55, repeat: Infinity, ease: "easeInOut" } : { duration: 0.25 }}
                >
                  {completed ? <CheckCircle2 className="h-5 w-5" strokeWidth={2} /> : index + 1}
                  {active && <span className="absolute inset-0 -z-10 rounded-full bg-emerald-400/18 blur-md" />}
                </motion.span>
                <span className={`max-w-full text-center text-[8px] font-semibold uppercase leading-tight tracking-[0.06em] sm:text-[9px] ${
                  completed || active ? "text-slate-900" : "text-slate-400"
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="relative mt-4 rounded-2xl bg-slate-950/[0.035] px-4 py-3 text-xs font-medium leading-5 text-slate-600">
        {detail}
      </p>
      {["Approved", "Waiting for Customer Shipment"].includes(rma.status) && <ReturnAddressCard address={returnAddress} />}
      {rma.returnShipment?.trackingId && <ShipmentSummary title="Submitted tracking details" shipment={rma.returnShipment} />}
      {["Inspection", "Inspection in Progress"].includes(rma.status) && (
        <div className="relative mt-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs font-medium leading-5 text-amber-900">
          <span className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800">Inspection in Progress</span>
          <span className="block">Our technical team is currently inspecting your product. Please wait for final approval confirmation. Further updates will be shared through email.</span>
        </div>
      )}
      {rma.status === "Final Approved" || rma.status === "Replacement Approved" ? (
        <p className="relative mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-medium leading-5 text-emerald-800">Your warranty claim has been approved after inspection. Replacement process has started.</p>
      ) : null}
      {rma.status === "Rejected After Inspection" ? (
        <p className="relative mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-medium leading-5 text-rose-800">After inspection, the product was found ineligible for warranty replacement. The original product will be returned to you with tracking once dispatched.</p>
      ) : null}
      {rma.replacementShipment?.trackingId && <ShipmentSummary title="Replacement shipment tracking" shipment={rma.replacementShipment} />}
      {rma.returnToCustomerShipment?.trackingId && <ShipmentSummary title="Return shipment tracking" shipment={rma.returnToCustomerShipment} />}
    </section>
  );
}

function workflowStepFromRma(rma = {}) {
  if (rmaWorkflowStepByStatus[rma.status]) return rmaWorkflowStepByStatus[rma.status];
  if (rma.deliveryStatus === "Delivered") return "Delivered";
  if (["Replacement Dispatched", "Return Dispatched", "Out for Delivery"].includes(rma.deliveryStatus)) return "Replacement Dispatched";
  if (rma.inspectionStatus === "Inspection in Progress") return "Inspection in Progress";
  if (rma.serviceCenterReceivedAt) return "Product Received";
  if (rma.returnShipment?.trackingId) return "Tracking Submitted";
  return "Claim Submitted";
}

function claimHeadline(rma = {}) {
  if (rma.status === "Rejected") return "Claim Rejected";
  if (rma.status === "Rejected After Inspection") return "Rejected After Inspection";
  if (rma.status === "Requested") return "Claim Submitted";
  if (rma.status === "In Progress" || rma.status === "More Details Requested") return "Under Review";
  if (rma.status === "Approved") return "Claim Approved";
  if (rma.status === "Waiting for Customer Shipment") return "Claim Approved";
  if (rma.status === "Tracking Submitted") return "Shipment Sent";
  if (rma.status === "Product Received") return "Product Received at Service Center";
  if (rma.status === "Inspection in Progress" || rma.status === "Inspection") return "Inspection in Progress";
  if (rma.status === "Final Approved" || rma.status === "Replacement Approved" || rma.status === "Repair Approved") return "Final Approved";
  if (rma.status === "Replacement Dispatched") return "Replacement Dispatched";
  if (rma.status === "Return Dispatched") return "Product Return Dispatched";
  if (rma.status === "Out for Delivery") return "Out for Delivery";
  if (rma.status === "Delivered") return "Delivered";
  return rma.claimStatus || rma.status || "Care request active";
}

function workflowStepGuidance(step, rma = {}) {
  return {
    "Claim Submitted": "Your warranty claim has been submitted and is waiting for admin review.",
    "Under Review": "Your claim is under review. INFIBOLT support is checking the issue details and documents.",
    "Approved / Rejected": rma.status === "Rejected" ? "Decision updated: your warranty claim was rejected. The reason is shown above." : "Decision updated: your claim has been approved and the return-shipment instructions are being prepared.",
    "Waiting for Customer Shipment": "Action needed: pack the product securely, include invoice copy, mention the RMA number, and submit your courier tracking ID.",
    "Tracking Submitted": "Tracking received: INFIBOLT is waiting for the product to arrive at the service center.",
    "Product Received": "Product received: the service center has your product and will start technical inspection next.",
    "Inspection in Progress": "Inspection started: our technical team is checking the product and will update final approval after review.",
    "Final Approval": rma.status === "Rejected After Inspection" ? "Inspection decision updated: the product was found ineligible for replacement. Return shipment updates will appear here." : "Final approval completed: replacement or repair processing has started.",
    "Replacement Dispatched": rma.returnToCustomerShipment?.trackingId ? "Return shipment dispatched: tracking details are available below." : "Replacement dispatched: tracking details are available below.",
    Delivered: "Delivered: this warranty workflow is complete.",
  }[step] || "Track every warranty movement here.";
}

function ReturnAddressCard({ address }) {
  const serviceAddress = { ...defaultReturnAddress, ...(address || {}) };
  const cityLine = [serviceAddress.city, serviceAddress.state].filter(Boolean).join(", ");
  return (
    <div className="relative mt-3 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium leading-5 text-emerald-900 sm:grid-cols-[1fr_1.2fr]">
      <div>
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Return Address</span>
        <span className="mt-2 block font-semibold">{serviceAddress.name}</span>
        <span className="block">{serviceAddress.line1}</span>
        {serviceAddress.line2 && <span className="block">{serviceAddress.line2}</span>}
        <span className="block">{cityLine}</span>
        <span className="block">{serviceAddress.postalCode}</span>
        <span className="block">Phone: {serviceAddress.phone}</span>
      </div>
      <ul className="grid list-disc gap-1 pl-4">
        <li>Pack product securely</li>
        <li>Include invoice copy</li>
        <li>Mention RMA number on package</li>
      </ul>
    </div>
  );
}

function ShipmentDetailsForm({ draft, saving, onChange, onSubmit }) {
  return (
    <div className="grid gap-3 rounded-[1.25rem] border border-slate-900/8 bg-white/72 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.055)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Submit Shipment Details</p>
      <div className="grid gap-3 md:grid-cols-3">
        <input value={draft.courierName || ""} onChange={(event) => onChange({ courierName: event.target.value })} placeholder="Courier Name" className="premium-control min-h-[42px] px-4 text-sm font-medium" />
        <input value={draft.trackingId || ""} onChange={(event) => onChange({ trackingId: event.target.value })} placeholder="Tracking Number / AWB" className="premium-control min-h-[42px] px-4 text-sm font-medium" />
        <input value={draft.notes || ""} onChange={(event) => onChange({ notes: event.target.value })} placeholder="Optional Notes" className="premium-control min-h-[42px] px-4 text-sm font-medium" />
      </div>
      <button type="button" onClick={onSubmit} disabled={saving} className="inline-flex min-h-[42px] w-fit items-center justify-center rounded-full bg-slate-950 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800 disabled:opacity-60">
        {saving ? "Submitting..." : "Submit Tracking ID"}
      </button>
    </div>
  );
}

function ShipmentSummary({ title, shipment }) {
  return (
    <div className="relative mt-3 grid gap-2 rounded-2xl border border-slate-900/8 bg-white/78 p-4 text-xs font-medium leading-5 text-slate-700">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{title}</span>
      <span>Courier: {shipment.courierName || "-"}</span>
      <span>Tracking ID: {shipment.trackingId || "-"}</span>
      {shipment.dispatchedAt && <span>Dispatch date: {dateInputValue(new Date(shipment.dispatchedAt))}</span>}
      {shipment.estimatedDelivery && <span>Estimated delivery: {dateInputValue(new Date(shipment.estimatedDelivery))}</span>}
      {shipment.shippedAt && <span>Shipped at: {dateInputValue(new Date(shipment.shippedAt))}</span>}
    </div>
  );
}

function ClaimRequestForm({ ownership, draft, upload, policy, policyError, claimError, submitting, onChange, onPhotoUpload, onCancel, onSubmit }) {
  const address = draft.customerAddress || {};
  const addressErrors = claimAddressErrors(address);
  const addressReady = !Object.values(addressErrors).some(Boolean);
  const updateAddress = (field, value) => onChange((current) => ({ ...current, customerAddress: { ...(current.customerAddress || {}), [field]: value } }));
  const submitDisabled = submitting || !draft.issueType || draft.issueDescription.trim().length < 5 || !draft.attachment?.url || !addressReady || !policy?.url || !draft.policyViewed || !draft.policyAccepted;
  const touchedAddress = Object.values(address).some((value) => String(value || "").trim());
  const showAddressErrors = touchedAddress || claimError;

  return (
    <div className="grid gap-4 border-t border-slate-900/8 pt-4 sm:col-span-2">
      {claimError && <PremiumNotice tone="error" title="Claim not submitted">{claimError}</PremiumNotice>}
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
          <PremiumField label="Contact name" value={address.name || ""} onChange={(value) => updateAddress("name", value)} error={showAddressErrors ? addressErrors.name : ""} required />
          <PremiumField label="Contact phone" value={address.phone || ""} onChange={(value) => updateAddress("phone", value.replace(/\D/g, "").slice(0, 10))} error={showAddressErrors ? addressErrors.phone : ""} helper="Use a 10 digit Indian mobile number, starting with 6, 7, 8, or 9." inputMode="numeric" autoComplete="tel" required />
          <PremiumField label="Address line 1" value={address.line1 || ""} onChange={(value) => updateAddress("line1", value)} error={showAddressErrors ? addressErrors.line1 : ""} required />
          <PremiumField label="Address line 2" value={address.line2 || ""} onChange={(value) => updateAddress("line2", value)} />
          <PremiumField label="City" value={address.city || ""} onChange={(value) => updateAddress("city", value)} error={showAddressErrors ? addressErrors.city : ""} required />
          <PremiumField label="State" value={address.state || ""} onChange={(value) => updateAddress("state", value)} error={showAddressErrors ? addressErrors.state : ""} required />
          <PremiumField label="PIN code" value={address.postalCode || ""} onChange={(value) => updateAddress("postalCode", value.replace(/\D/g, "").slice(0, 6))} error={showAddressErrors ? addressErrors.postalCode : ""} inputMode="numeric" autoComplete="postal-code" required />
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
