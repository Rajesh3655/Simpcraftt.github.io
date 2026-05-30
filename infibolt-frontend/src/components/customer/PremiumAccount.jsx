import { AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";

export function AccountAtmosphere({ children, className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,198,175,0.34),transparent_64%)] blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(66,102,213,0.12),transparent_62%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.72),transparent_38%),linear-gradient(180deg,rgba(247,245,240,0.18),rgba(247,245,240,0.86))]" />
      </div>
      {children}
    </div>
  );
}

export function AccountCard({ children, className = "" }) {
  return (
    <section className={`account-card ${className}`}>
      {children}
    </section>
  );
}

export function AccountIntro({ eyebrow, title, description, icon: Icon = Sparkles }) {
  return (
    <div>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white/64 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      {eyebrow && <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>}
      <h2 className="mt-3 text-[1.72rem] font-semibold leading-[1.02] tracking-normal text-slate-950 sm:text-[2.15rem]">
        {title}
      </h2>
      {description && <p className="mt-3 max-w-md text-sm font-light leading-7 text-slate-600">{description}</p>}
    </div>
  );
}

export function PremiumField({
  icon: Icon,
  label,
  value,
  onChange,
  error,
  helper,
  type = "text",
  placeholder,
  disabled = false,
  textarea = false,
  required = false,
  inputMode,
  autoComplete,
  min,
  max,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const inputClass =
    "w-full bg-transparent text-[15px] font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none disabled:opacity-55";

  return (
    <label className="grid gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className={`premium-control account-input flex items-center gap-3 px-4 ${textarea ? "py-3" : "min-h-[52px] py-2"} ${error ? "account-input-error" : ""}`}>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.8} />}
        {textarea ? (
          <textarea
            required={required}
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={5}
            className={`${inputClass} resize-none leading-7`}
          />
        ) : (
          <input
            required={required}
            disabled={disabled}
            inputMode={inputMode}
            autoComplete={autoComplete}
            min={min}
            max={max}
            type={inputType}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
        )}
        {isPassword && !textarea && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-900/5 hover:text-slate-950 disabled:pointer-events-none disabled:opacity-45"
          >
            {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
          </button>
        )}
      </span>
      {helper && !error && <span className="text-xs font-medium leading-5 text-slate-500">{helper}</span>}
      {error && <span className="text-xs font-medium leading-5 text-rose-700">{error}</span>}
    </label>
  );
}

export function PremiumSelect({ label, value, onChange, options, error, helper }) {
  return (
    <label className="grid gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`premium-control account-input min-h-[52px] px-4 text-[15px] font-medium text-slate-950 ${error ? "account-input-error" : ""}`}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {helper && !error && <span className="text-xs font-medium leading-5 text-slate-500">{helper}</span>}
      {error && <span className="text-xs font-medium leading-5 text-rose-700">{error}</span>}
    </label>
  );
}

export function PremiumNotice({ tone = "neutral", title, children, icon: Icon }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-700/12 bg-emerald-50/72 text-emerald-950"
      : tone === "error"
        ? "border-rose-700/12 bg-rose-50/72 text-rose-950"
        : "border-slate-900/8 bg-white/54 text-slate-800";
  const NoticeIcon = Icon || (tone === "success" ? CheckCircle2 : AlertCircle);

  return (
    <div className={`rounded-2xl border p-4 shadow-[0_14px_38px_rgba(17,24,39,0.045)] backdrop-blur-xl ${toneClass}`}>
      <div className="flex gap-3">
        <NoticeIcon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
        <div>
          {title && <p className="text-sm font-semibold tracking-normal">{title}</p>}
          {children && <div className="mt-1 text-sm font-light leading-6 opacity-80">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export function PremiumButton({ children, loading = false, disabled = false, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`premium-button account-button inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:pointer-events-none disabled:opacity-60 ${className}`}
    >
      {loading && (
        <span className="relative grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-white/25" />
          <span className="absolute inset-0 rounded-full border-2 border-white/25 border-t-white animate-spin" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
        </span>
      )}
      {children}
    </button>
  );
}

export function SoftStatus({ children, tone = "warm" }) {
  const toneClass = tone === "dark" ? "bg-slate-950 text-white" : "border border-slate-900/8 bg-white/58 text-slate-700";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${toneClass}`}>{children}</span>;
}
