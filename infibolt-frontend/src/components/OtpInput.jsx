import { useEffect, useRef } from "react";

export function OtpInput({ value, onChange, disabled = false, error }) {
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
    <div className="grid gap-2">
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
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
            className={`aspect-square min-h-[48px] rounded-2xl border bg-white text-center text-lg font-bold tracking-normal text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 disabled:opacity-60 dark:bg-white/[0.04] dark:text-white dark:focus:border-white ${
              error ? "border-red-400" : "border-slate-900/10 dark:border-white/10"
            }`}
          />
        ))}
      </div>
      {error && <span className="text-xs font-medium text-red-600 dark:text-red-300">{error}</span>}
    </div>
  );
}
