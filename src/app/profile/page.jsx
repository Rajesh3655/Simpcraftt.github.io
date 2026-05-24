"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { AccountShell, CommerceShell } from "../components/commerce/CommerceLayout";

const isLoggedIn = false;

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
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const emptySignup = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  address: "",
  district: "",
  state: "",
};

const panelMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function phoneDigits(value) {
  return value.replace(/\D/g, "");
}

function isValidPhone(value) {
  const digits = phoneDigits(value);
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

function isValidIdentifier(value) {
  return isValidEmail(value) || isValidPhone(value);
}

function passwordChecks(value) {
  return [
    { label: "8+ characters", valid: value.length >= 8 },
    { label: "Uppercase", valid: /[A-Z]/.test(value) },
    { label: "Number", valid: /\d/.test(value) },
    { label: "Special", valid: /[^A-Za-z0-9]/.test(value) },
  ];
}

function passwordStrength(value) {
  return passwordChecks(value).filter((item) => item.valid).length;
}

function passwordIsValid(value) {
  return passwordStrength(value) === passwordChecks(value).length && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function SoftError({ message }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-[11.5px] font-medium leading-5 text-[#9f3f38] sm:text-[12px]"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  icon: Icon,
  autoComplete,
  textarea = false,
  placeholder,
}) {
  const baseClass =
    "w-full rounded-[18px] border border-[#1c2a3a]/10 bg-[#fffdf9]/82 px-4 text-[15px] font-medium text-[#0c1424] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all duration-300 placeholder:text-[#8b8f96] focus:border-[#0c1424]/22 focus:bg-white focus:shadow-[0_0_0_4px_rgba(12,20,36,0.055),inset_0_1px_0_rgba(255,255,255,1)]";

  return (
    <label className="group grid gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f7480] sm:text-[11px] sm:tracking-[0.16em]">{label}</span>
      <span className="relative block">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-4 h-4 w-4 text-[#8c929c] transition-colors duration-300 group-focus-within:text-[#0c1424] ${
              textarea ? "top-4" : "top-1/2 -translate-y-1/2"
            }`}
          />
        )}
        {textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={4}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${baseClass} min-h-[118px] resize-none px-4 py-4 ${Icon ? "pl-11" : ""}`}
          />
        ) : (
          <input
            name={name}
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${baseClass} min-h-[58px] ${Icon ? "pl-11" : ""}`}
          />
        )}
      </span>
      <SoftError message={error} />
    </label>
  );
}

function VerifyField({ label, name, value, onChange, type = "text", error, icon: Icon, autoComplete, verified, onVerify, placeholder }) {
  return (
    <div className="grid gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f7480] sm:text-[11px] sm:tracking-[0.16em]">{label}</span>
      <div className="grid min-w-0 gap-2.5 sm:grid-cols-[minmax(0,1fr)_96px]">
        <span className="group relative block min-w-0">
          {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c929c] transition-colors duration-300 group-focus-within:text-[#0c1424]" />}
          <input
            name={name}
            value={value}
            onChange={onChange}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className={`min-h-[58px] w-full min-w-0 rounded-[18px] border border-[#1c2a3a]/10 bg-[#fffdf9]/82 px-4 text-[15px] font-medium text-[#0c1424] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all duration-300 placeholder:text-[#8b8f96] focus:border-[#0c1424]/22 focus:bg-white focus:shadow-[0_0_0_4px_rgba(12,20,36,0.055),inset_0_1px_0_rgba(255,255,255,1)] ${Icon ? "pl-11" : ""}`}
          />
        </span>
        <VerifyPill verified={verified} onClick={onVerify} />
      </div>
      <SoftError message={error} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const pickState = (nextState) => {
    onChange({ target: { name, value: nextState } });
    setIsOpen(false);
  };

  return (
    <label className="grid gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f7480] sm:text-[11px] sm:tracking-[0.16em]">{label}</span>
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-h-[58px] w-full items-center justify-between rounded-[18px] border border-[#1c2a3a]/10 bg-[#fffdf9]/82 px-4 text-left text-[15px] font-medium text-[#0c1424] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all duration-300 hover:bg-white focus:border-[#0c1424]/22 focus:bg-white focus:shadow-[0_0_0_4px_rgba(12,20,36,0.055)]"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={value ? "text-[#0c1424]" : "text-[#8b8f96]"}>{value || "Select state"}</span>
          <ChevronDown className={`h-4 w-4 text-[#0c1424] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-[16px] border border-[#1c2a3a]/12 bg-[#fffdf9] p-1.5 shadow-[0_24px_44px_rgba(12,20,36,0.16)]"
              role="listbox"
            >
              {indianStates.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => pickState(state)}
                  className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors ${
                    value === state ? "bg-[#101827] text-white" : "text-[#293244] hover:bg-[#f3efe8]"
                  }`}
                  role="option"
                  aria-selected={value === state}
                >
                  {state}
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <SoftError message={error} />
    </label>
  );
}

function VerifyPill({ verified, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[54px] w-full items-center justify-center gap-1.5 rounded-[18px] px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 sm:min-h-[58px] ${
        verified
          ? "bg-[#edf7ef] text-[#2e6c41]"
          : "bg-[#101827] text-white shadow-[0_12px_24px_rgba(12,20,36,0.18)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(12,20,36,0.24)]"
      }`}
    >
      {verified ? <Check className="h-3.5 w-3.5" /> : null}
      {verified ? "Done" : "Verify"}
    </button>
  );
}

function StrengthMeter({ value }) {
  const strength = passwordStrength(value);
  const checks = passwordChecks(value);
  const label = strength <= 1 ? "Weak" : strength <= 3 ? "Good" : "Strong";

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        {checks.map((item, index) => (
          <motion.span
            key={item.label}
            animate={{ opacity: index < strength ? 1 : 0.22 }}
            className={`h-1.5 flex-1 rounded-full ${index < strength ? "bg-[#122033]" : "bg-[#122033]/20"}`}
          />
        ))}
        <span className="ml-1 min-w-10 text-right text-[11px] font-semibold text-[#68707d] sm:ml-2 sm:min-w-12 sm:text-xs">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((item) => (
          <span
            key={item.label}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-colors duration-300 sm:text-[11px] ${
              item.valid ? "bg-[#edf7ef] text-[#2e6c41]" : "bg-[#f3efe8] text-[#77736d]"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Notice({ children, tone = "neutral" }) {
  return (
    <AnimatePresence initial={false}>
      {children ? (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.99 }}
          className={`rounded-[18px] px-4 py-3 text-sm font-medium leading-6 ${
            tone === "success" ? "bg-[#edf7ef] text-[#2e6c41]" : "bg-[#f3efe8] text-[#5f5b54]"
          }`}
          aria-live="polite"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PrimaryButton({ children }) {
  return (
    <button
      type="submit"
      className="group inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[18px] bg-[#0c1424] px-6 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_20px_44px_rgba(12,20,36,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#121d31] hover:shadow-[0_24px_58px_rgba(12,20,36,0.28)] active:translate-y-0 sm:min-h-[58px] sm:w-auto sm:text-[12px] sm:tracking-[0.16em]"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </button>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[50px] rounded-[16px] bg-white/52 px-5 text-sm font-semibold text-[#4d5663] shadow-[inset_0_0_0_1px_rgba(12,20,36,0.08)] transition-all duration-300 hover:bg-white hover:text-[#0c1424] hover:shadow-[0_10px_30px_rgba(12,20,36,0.08),inset_0_0_0_1px_rgba(12,20,36,0.1)] sm:w-auto"
    >
      {children}
    </button>
  );
}

function OtpOverlay({ target, onClose, onVerify }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const title = target?.type === "email" ? "Verify email" : "Verify phone";
  const subtitle = target?.type === "email" ? target?.value : target?.value ? `+91 ${target.value}` : "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!target || typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [target]);

  const submitOtp = (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6 digit OTP.");
      return;
    }
    onVerify();
  };

  if (!mounted || !target) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex min-h-[100dvh] items-center justify-center overflow-y-auto overscroll-contain bg-[#0c1424]/28 px-4 py-6 backdrop-blur-[10px]"
      >
        <motion.form
          onSubmit={submitOtp}
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[calc(100vw-32px)] overflow-hidden rounded-[28px] bg-[#fffaf2] p-5 shadow-[0_30px_100px_rgba(12,20,36,0.32)] sm:max-w-[430px] sm:rounded-[30px] sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0c1424] text-white shadow-[0_16px_34px_rgba(12,20,36,0.22)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-[#0c1424]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#69717d]">A secure OTP is ready for {subtitle || "this contact detail"}.</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#68707d] transition-colors hover:text-[#0c1424]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-7 grid gap-4">
            <input
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              className="h-16 w-full rounded-[20px] border border-[#0c1424]/10 bg-white/80 px-4 text-center text-2xl font-semibold tracking-[0.36em] text-[#0c1424] outline-none transition-all duration-300 placeholder:text-[#c1bab0] focus:border-[#0c1424]/24 focus:shadow-[0_0_0_5px_rgba(12,20,36,0.06)] sm:tracking-[0.5em]"
            />
            <SoftError message={error} />
            <PrimaryButton>Verify OTP</PrimaryButton>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function CardHeader({ mode, setMode }) {
  const modes = [
    { id: "signup", label: "Signup" },
    { id: "login", label: "Login" },
  ];

  return (
    <div className="mb-8">
      <div className="mb-7 grid w-full grid-cols-2 rounded-[18px] bg-[#f1ece3] p-1 sm:w-[228px]">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`relative min-h-11 w-full rounded-[14px] px-2 text-center text-[13px] font-semibold transition-colors duration-300 sm:px-4 sm:text-sm ${
              mode === item.id ? "text-[#0c1424]" : "text-[#77736d] hover:text-[#0c1424]"
            }`}
          >
            {mode === item.id && (
              <motion.span
                layoutId="profile-auth-mode"
                className="absolute inset-0 rounded-[14px] bg-white shadow-[0_8px_24px_rgba(12,20,36,0.08)]"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7d766c] sm:text-[11px] sm:tracking-[0.18em]">Customer Profile</p>
          <h2 className="mt-3 text-[1.85rem] font-semibold leading-[1.04] text-[#0c1424] sm:text-[2.35rem] md:text-[2.65rem]">
            {mode === "signup" ? "Create your account." : mode === "login" ? "Welcome back." : "Secure reset."}
          </h2>
          <p className="mt-4 max-w-xl text-[13px] leading-6 text-[#68707d] sm:text-sm sm:leading-7">
            {mode === "signup"
              ? "Register contact details, verify ownership, and prepare your product care profile."
              : mode === "login"
                ? "Access saved profile details, warranty records, and future order history."
                : "Validate your registered contact detail, verify OTP, and save a stronger password."}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AuthCard({ mode, setMode, children }) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={panelMotion}
      custom={0.1}
      className="relative w-full rounded-[26px] bg-[#fffaf2]/92 p-4 shadow-[0_22px_70px_rgba(12,20,36,0.13)] backdrop-blur-2xl sm:rounded-[34px] sm:p-8 lg:p-10"
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <CardHeader mode={mode} setMode={setMode} />
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

function SignupForm({ setMode }) {
  const [form, setForm] = useState(emptySignup);
  const [touched, setTouched] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpTarget, setOtpTarget] = useState(null);
  const [notice, setNotice] = useState("");

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "email") setEmailVerified(false);
    if (name === "phone") setPhoneVerified(false);
    setNotice("");
  };

  const errors = useMemo(() => {
    if (!touched) return {};
    return {
      name: form.name.trim().length < 2 ? "Use your full name." : "",
      email: !isValidEmail(form.email) ? "Use a valid email." : !emailVerified ? "Verify email." : "",
      phone: !isValidPhone(form.phone) ? "Use a valid 10 digit mobile number." : !phoneVerified ? "Verify phone." : "",
      password: !passwordIsValid(form.password) ? "Strength must be complete." : "",
      confirmPassword: form.confirmPassword !== form.password ? "Passwords must match." : "",
      address: form.address.trim().length < 8 ? "Add complete address." : "",
      district: form.district.trim().length < 2 ? "Add district." : "",
      state: !form.state ? "Select state." : "",
    };
  }, [emailVerified, form, phoneVerified, touched]);

  const openVerification = (type) => {
    setTouched(true);
    if (type === "email" && !isValidEmail(form.email)) {
      setNotice("Enter a valid email before verification.");
      toast.error("Invalid email", {
        description: "Please enter a valid email address before verification.",
      });
      return;
    }
    if (type === "phone" && !isValidPhone(form.phone)) {
      setNotice("Enter a valid phone number before verification.");
      toast.error("Invalid phone number", {
        description: "Use a valid 10 digit Indian mobile number.",
      });
      return;
    }
    setOtpTarget({ type, value: type === "email" ? form.email : phoneDigits(form.phone) });
    toast.success("OTP ready", {
      description: `Verification code prepared for your ${type}.`,
    });
  };

  const submitSignup = (event) => {
    event.preventDefault();
    setTouched(true);
    const invalid =
      form.name.trim().length < 2 ||
      !isValidEmail(form.email) ||
      !emailVerified ||
      !isValidPhone(form.phone) ||
      !phoneVerified ||
      !passwordIsValid(form.password) ||
      form.confirmPassword !== form.password ||
      form.address.trim().length < 8 ||
      form.district.trim().length < 2 ||
      !form.state;

    if (invalid) {
      setNotice("Complete the required details to continue.");
      toast.error("Signup incomplete", {
        description: "Please check the highlighted fields before continuing.",
      });
      return;
    }

    setNotice("Signup profile validated. Ready for backend account creation.");
    toast.success("Signup validated", {
      description: "Your profile details are ready for account creation.",
    });
  };

  return (
    <>
      <form onSubmit={submitSignup} className="grid gap-5">
        <Field label="Full name" name="name" value={form.name} onChange={updateForm} error={errors.name} icon={UserRound} autoComplete="name" placeholder="Enter your full name" />
        <div className="grid gap-5 md:grid-cols-2">
          <VerifyField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateForm}
            error={errors.email}
            icon={Mail}
            autoComplete="email"
            verified={emailVerified}
            onVerify={() => openVerification("email")}
            placeholder="you@example.com"
          />
          <VerifyField
            label="Phone number"
            name="phone"
            value={form.phone}
            onChange={updateForm}
            error={errors.phone}
            icon={Phone}
            autoComplete="tel"
            verified={phoneVerified}
            onVerify={() => openVerification("phone")}
            placeholder="10 digit mobile number"
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Password" name="password" type="password" value={form.password} onChange={updateForm} error={errors.password} icon={Lock} autoComplete="new-password" placeholder="Create a strong password" />
          <Field label="Re-enter password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateForm} error={errors.confirmPassword} icon={Lock} autoComplete="new-password" placeholder="Re-enter your password" />
        </div>
        <StrengthMeter value={form.password} />
        <Field label="Address" name="address" value={form.address} onChange={updateForm} error={errors.address} icon={MapPin} textarea autoComplete="street-address" placeholder="House/Flat, Street, Area" />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="District" name="district" value={form.district} onChange={updateForm} error={errors.district} autoComplete="address-level2" placeholder="Enter district" />
          <SelectField label="State" name="state" value={form.state} onChange={updateForm} error={errors.state} />
        </div>
        <Notice tone={notice.includes("validated") ? "success" : "neutral"}>{notice}</Notice>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <PrimaryButton>Signup</PrimaryButton>
          <GhostButton onClick={() => setMode("login")}>Already have an account</GhostButton>
        </div>
      </form>
      <OtpOverlay
        target={otpTarget}
        onClose={() => setOtpTarget(null)}
        onVerify={() => {
          if (otpTarget?.type === "email") setEmailVerified(true);
          if (otpTarget?.type === "phone") setPhoneVerified(true);
          setNotice(`${otpTarget?.type === "email" ? "Email" : "Phone"} verified successfully.`);
          toast.success(`${otpTarget?.type === "email" ? "Email" : "Phone"} verified`, {
            description: "Verification completed successfully.",
          });
          setOtpTarget(null);
        }}
      />
    </>
  );
}

function LoginForm({ setMode, resetNotice }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [touched, setTouched] = useState(false);
  const [notice, setNotice] = useState(resetNotice || "");

  const submitLogin = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!isValidIdentifier(form.identifier) || form.password.length < 8) {
      setNotice("Enter valid login details.");
      toast.error("Login failed", {
        description: "Please enter a valid email or phone and password.",
      });
      return;
    }

    setNotice("Login details validated. Authentication API can connect here.");
    toast.success("Login validated", {
      description: "Authentication can connect to this flow.",
    });
  };

  return (
    <form onSubmit={submitLogin} className="grid gap-5">
      <Field
        label="Email or phone"
        name="identifier"
        value={form.identifier}
        onChange={(event) => {
          setForm((current) => ({ ...current, identifier: event.target.value }));
          setNotice("");
        }}
        error={touched && !isValidIdentifier(form.identifier) ? "Use registered email or phone." : ""}
        icon={Mail}
        autoComplete="username"
        placeholder="Email or phone number"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={(event) => {
          setForm((current) => ({ ...current, password: event.target.value }));
          setNotice("");
        }}
        error={touched && form.password.length < 8 ? "Password is required." : ""}
        icon={Lock}
        autoComplete="current-password"
        placeholder="Enter your password"
      />
      <Notice tone={notice.includes("validated") || notice.includes("saved") ? "success" : "neutral"}>{notice}</Notice>
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <PrimaryButton>Login</PrimaryButton>
        <GhostButton onClick={() => setMode("forgot")}>Forgot password</GhostButton>
      </div>
    </form>
  );
}

function ForgotPasswordForm({ setMode, onSaved }) {
  const [step, setStep] = useState("identify");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [notice, setNotice] = useState("");

  const submitForgot = (event) => {
    event.preventDefault();
    setTouched(true);

    if (step === "identify") {
      if (!isValidIdentifier(identifier)) {
        setNotice("Use a registered email or phone number.");
        toast.error("Invalid account detail", {
          description: "Use a registered email or phone number.",
        });
        return;
      }
      setStep("otp");
      setTouched(false);
      setNotice("OTP sent. Enter the code to continue.");
      toast.success("OTP sent", {
        description: "Enter the verification code to continue.",
      });
      return;
    }

    if (step === "otp") {
      if (!/^\d{6}$/.test(otp)) {
        setNotice("Enter the 6 digit OTP.");
        toast.error("Invalid OTP", {
          description: "Enter the 6 digit verification code.",
        });
        return;
      }
      setStep("reset");
      setTouched(false);
      setNotice("OTP verified. Create a new password.");
      toast.success("OTP verified", {
        description: "Create your new password.",
      });
      return;
    }

    if (!passwordIsValid(password) || confirmPassword !== password) {
      setNotice("Complete the new password requirements.");
      toast.error("Password incomplete", {
        description: "Complete the strength rules and match both passwords.",
      });
      return;
    }

    toast.success("Password saved", {
      description: "Please login with your new password.",
    });
    onSaved();
  };

  return (
    <form onSubmit={submitForgot} className="grid gap-5">
      <div className="grid grid-cols-3 gap-2 rounded-[20px] bg-[#f1ece3] p-1 text-[11px] font-bold text-[#77736d]">
        {[
          ["identify", "Validate"],
          ["otp", "OTP"],
          ["reset", "Password"],
        ].map(([id, label]) => (
          <span key={id} className={`rounded-[15px] px-2 py-3 text-center transition-all duration-300 ${step === id ? "bg-white text-[#0c1424] shadow-[0_8px_22px_rgba(12,20,36,0.08)]" : ""}`}>
            {label}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "identify" && (
          <motion.div key="identify" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Field
              label="Registered email or phone"
              name="forgotIdentifier"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                setNotice("");
              }}
              error={touched && !isValidIdentifier(identifier) ? "Use registered email or phone." : ""}
              icon={Mail}
              autoComplete="username"
              placeholder="Registered email or phone"
            />
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div key="otp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Field
              label="OTP"
              name="otp"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setNotice("");
              }}
              error={touched && !/^\d{6}$/.test(otp) ? "Enter 6 digit OTP." : ""}
              icon={ShieldCheck}
              autoComplete="one-time-code"
              placeholder="6 digit OTP"
            />
          </motion.div>
        )}

        {step === "reset" && (
          <motion.div key="reset" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-5">
            <Field label="New password" name="newPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} error={touched && !passwordIsValid(password) ? "Strength must be complete." : ""} icon={Lock} autoComplete="new-password" placeholder="Create new password" />
            <Field label="Re-enter password" name="confirmNewPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={touched && confirmPassword !== password ? "Passwords must match." : ""} icon={Lock} autoComplete="new-password" placeholder="Re-enter new password" />
            <StrengthMeter value={password} />
          </motion.div>
        )}
      </AnimatePresence>

      <Notice tone={notice.includes("verified") || notice.includes("sent") ? "success" : "neutral"}>{notice}</Notice>
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <PrimaryButton>{step === "identify" ? "Validate" : step === "otp" ? "Verify OTP" : "Save Password"}</PrimaryButton>
        <GhostButton onClick={() => setMode("login")}>Back to login</GhostButton>
      </div>
    </form>
  );
}

function CustomerAccess() {
  const [mode, setMode] = useState("signup");
  const [loginNotice, setLoginNotice] = useState("");

  const handleMode = (nextMode) => {
    setMode(nextMode);
    if (nextMode !== "login") setLoginNotice("");
  };

  return (
    <CommerceShell seoTitle="Customer Profile" seoDescription="Create, login, and recover your INFIBOLT customer profile.">
      <main
        className="relative isolate overflow-hidden px-3 py-5 sm:px-6 sm:py-10 lg:px-10 lg:py-14"
        style={{ fontFamily: '"Satoshi", "General Sans", Inter, ui-sans-serif, system-ui, sans-serif' }}
      >
        <div className="absolute inset-0 -z-10 bg-[#f8f3eb]" />
        <div className="absolute left-[-12%] top-[-12%] -z-10 h-[38rem] w-[38rem] rounded-full bg-[#f1d9aa]/38 blur-3xl" />
        <div className="absolute bottom-[-16%] right-[-10%] -z-10 h-[34rem] w-[34rem] rounded-full bg-[#b7cbd6]/34 blur-3xl" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.18]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(12,20,36,0.16) 1px, transparent 0)", backgroundSize: "28px 28px" }}
        />

        <div className="mx-auto flex min-h-[calc(100vh-145px)] w-full max-w-[860px] items-start justify-center sm:min-h-[calc(100vh-170px)] sm:items-center">
          <AuthCard mode={mode} setMode={handleMode}>
            {mode === "signup" && <SignupForm setMode={handleMode} />}
            {mode === "login" && <LoginForm setMode={handleMode} resetNotice={loginNotice} />}
            {mode === "forgot" && (
              <ForgotPasswordForm
                setMode={handleMode}
                onSaved={() => {
                  setLoginNotice("Password reset saved. Please login.");
                  setMode("login");
                }}
              />
            )}
          </AuthCard>
        </div>
      </main>
    </CommerceShell>
  );
}

function LoggedInProfile() {
  return (
    <AccountShell title="Your account dashboard." description="Profile, addresses, order history, registered products, and warranty claims live here.">
      <div className="grid gap-5">
        {["Saved addresses", "Order history", "Registered products", "Warranty claims"].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-900/8 bg-white/75 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">{item}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">Customer data will appear here after authentication and backend account records are connected.</p>
          </div>
        ))}
      </div>
    </AccountShell>
  );
}

export default function ProfilePage() {
  return isLoggedIn ? <LoggedInProfile /> : <CustomerAccess />;
}
