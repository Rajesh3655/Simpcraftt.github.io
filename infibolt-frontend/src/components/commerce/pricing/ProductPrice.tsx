import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { PriceLikeProduct } from "../../../utils/priceUtils";
import {
  formatINR,
  getDiscountPercent,
  getOfferEndDate,
  getOriginalPrice,
  getSavings,
  getStockState,
  getTimeRemaining,
} from "../../../utils/priceUtils";

type ProductPriceProps = {
  product: PriceLikeProduct;
  label?: string;
  variant?: "card" | "detail" | "dark";
  className?: string;
  showStock?: boolean;
  showOffer?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function DiscountBadge({ percent, compact = false }: { percent: number; compact?: boolean }) {
  if (!percent) return null;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.45, ease }}
      className={`inline-flex shrink-0 items-center rounded-full bg-[linear-gradient(135deg,#E11D48,#7F1D1D)] font-bold uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_rgba(190,18,60,0.22)] ${
        compact ? "px-2 py-1 text-[8px]" : "px-3 py-1.5 text-[10px]"
      }`}
    >
      Save {percent}%
    </motion.span>
  );
}

export function CountdownTimer({ offerEnds, dark = false }: { offerEnds: PriceLikeProduct["offerEnds"]; dark?: boolean }) {
  const endDate = useMemo(() => getOfferEndDate(offerEnds), [offerEnds]);
  const [remaining, setRemaining] = useState(() => getTimeRemaining(endDate));

  useEffect(() => {
    setRemaining(getTimeRemaining(endDate));
    if (!endDate) return undefined;
    const id = window.setInterval(() => setRemaining(getTimeRemaining(endDate)), 1000);
    return () => window.clearInterval(id);
  }, [endDate]);

  if (!remaining || remaining.total <= 0) return null;

  const units = [
    ["D", remaining.days],
    ["H", remaining.hours],
    ["M", remaining.minutes],
    ["S", remaining.seconds],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className="mt-3 flex flex-wrap items-center gap-2"
    >
      <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${dark ? "text-white/58" : "text-[#8B806F]"}`}>
        Ends in
      </span>
      <span className="flex items-center gap-1.5">
        {units.map(([label, value]) => (
          <span
            key={label}
            className={`inline-flex min-w-10 flex-col items-center rounded-xl border px-2 py-1.5 ${
              dark ? "border-white/12 bg-white/[0.06] text-white" : "border-[#0B1020]/8 bg-white/72 text-[#0B1020]"
            }`}
          >
            <motion.span key={String(value)} initial={{ opacity: 0.25, y: -3 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-semibold leading-none">
              {String(value).padStart(2, "0")}
            </motion.span>
            <span className="mt-1 text-[8px] font-bold uppercase opacity-50">{label}</span>
          </span>
        ))}
      </span>
    </motion.div>
  );
}

export function ProductPrice({
  product,
  label = "Launch price",
  variant = "card",
  className = "",
  showStock = true,
  showOffer = true,
}: ProductPriceProps) {
  const price = Number(product.price || 0);
  const originalPrice = getOriginalPrice(product);
  const discount = getDiscountPercent(price, originalPrice);
  const savings = getSavings(price, originalPrice);
  const stock = getStockState(product.stock);
  const dark = variant === "dark";
  const compact = variant === "card";
  const limitedOffer = Boolean(product.limitedOffer);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: compact ? 1.01 : 1 }}
      transition={{ duration: 0.45, ease }}
      className={className}
    >
      {label && (
        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#8B806F]"}`}>
          {label}
        </p>
      )}

      <div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 ${compact ? "" : "sm:gap-x-4"}`}>
        <motion.span
          key={price}
          initial={{ opacity: 0.35, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease }}
          className={`font-semibold tracking-normal ${dark ? "text-white" : "text-[#0B1020]"} ${
            compact ? "text-[1.05rem] sm:text-xl" : "text-4xl sm:text-5xl"
          }`}
        >
          {formatINR(price)}
        </motion.span>

        <DiscountBadge percent={discount} compact={compact} />

        {originalPrice > 0 && (
          <span className={`${compact ? "text-xs sm:text-sm" : "pb-1 text-base"} font-medium text-slate-400 line-through`}>
            {formatINR(originalPrice)}
          </span>
        )}
      </div>

      {savings > 0 && (
        <p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.16em] ${dark ? "text-emerald-200" : "text-emerald-700"}`}>
          You save {formatINR(savings)}
        </p>
      )}

      {showOffer && limitedOffer && (
        <div className="mt-3">
          <motion.span
            animate={{ opacity: [0.72, 1, 0.72] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
              dark ? "bg-white/10 text-white" : "bg-[#0B1020]/[0.06] text-[#0B1020]"
            }`}
          >
            Limited Time Offer
          </motion.span>
          <CountdownTimer offerEnds={product.offerEnds} dark={dark} />
        </div>
      )}

      {showStock && stock.message && (stock.isLowStock || stock.isOutOfStock) && (
        <p className={`mt-3 text-xs font-bold uppercase tracking-[0.16em] ${stock.isOutOfStock ? "text-rose-600" : "text-amber-700"}`}>
          {stock.message}
        </p>
      )}
    </motion.div>
  );
}

export default ProductPrice;
