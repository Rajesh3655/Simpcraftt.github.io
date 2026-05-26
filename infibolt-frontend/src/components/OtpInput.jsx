import { useEffect, useRef } from "react";

export function OtpInput({ value, onChange, disabled = false, error, className = "" }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || "");

  useEffect(() => {
    if (value.length === 0 && refs.current[0]) refs.current[0].focus();
  }, [value.length]);

  const setDigit = (index, nextValue) => {
    const clean = nextValue.replace(/\D/g, "");
    if (!clean) {
      const next = digits.slice();
      next[index] = "";
      onChange(next.join(""));
      return;
    }
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split("");
      onChange(pasted.join(""));
      refs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    const next = digits.slice();
    next[index] = clean;
    onChange(next.join(""));
    refs.current[index + 1]?.focus();
  };

  const onKeyDown = (index) => (event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={`grid gap-2 ${className}`}>
      <div className="flex w-full flex-wrap gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            value={digit}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            onChange={(event) => setDigit(index, event.target.value)}
            onPaste={(event) => {
              event.preventDefault();
              setDigit(index, event.clipboardData.getData("text"));
            }}
            onKeyDown={onKeyDown(index)}
            className={`h-12 w-12 shrink-0 rounded-2xl border bg-white/72 text-center text-lg font-semibold tracking-normal text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition duration-200 focus:border-slate-900/22 focus:bg-white focus:ring-4 focus:ring-slate-900/[0.055] disabled:opacity-60 dark:bg-white/[0.04] dark:text-white dark:focus:border-white sm:h-14 sm:w-14 ${
              error ? "border-rose-500/35 bg-rose-50/70" : "border-slate-900/10 dark:border-white/10"
            }`}
          />
        ))}
      </div>
      {error && <span className="text-xs font-medium text-rose-700 dark:text-rose-300">{error}</span>}
    </div>
  );
}
