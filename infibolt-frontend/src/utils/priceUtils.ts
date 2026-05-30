export type PriceLikeProduct = {
  price?: number | string | null;
  originalPrice?: number | string | null;
  comparePrice?: number | string | null;
  stock?: number | string | null;
  limitedOffer?: boolean | null;
  offerEnds?: string | Date | null;
};

export function formatINR(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function getOriginalPrice(product: PriceLikeProduct) {
  const originalPrice = Number(product.originalPrice ?? product.comparePrice ?? 0);
  const price = Number(product.price || 0);
  return Number.isFinite(originalPrice) && originalPrice > price ? originalPrice : 0;
}

export function getDiscountPercent(price: number | string | null | undefined, originalPrice: number | string | null | undefined) {
  const finalPrice = Number(price || 0);
  const mrp = Number(originalPrice || 0);
  if (!Number.isFinite(finalPrice) || !Number.isFinite(mrp) || mrp <= finalPrice || mrp <= 0) return 0;
  return Math.round(((mrp - finalPrice) / mrp) * 100);
}

export function getSavings(price: number | string | null | undefined, originalPrice: number | string | null | undefined) {
  const finalPrice = Number(price || 0);
  const mrp = Number(originalPrice || 0);
  if (!Number.isFinite(finalPrice) || !Number.isFinite(mrp) || mrp <= finalPrice) return 0;
  return mrp - finalPrice;
}

export function getStockState(stock: number | string | null | undefined) {
  const value = Number(stock);
  if (!Number.isFinite(value)) return { count: null, isOutOfStock: false, isLowStock: false, message: "" };
  if (value <= 0) return { count: 0, isOutOfStock: true, isLowStock: false, message: "Out of Stock" };
  if (value < 10) return { count: value, isOutOfStock: false, isLowStock: true, message: `Only ${value} left in stock` };
  return { count: value, isOutOfStock: false, isLowStock: false, message: "In stock" };
}

export function getOfferEndDate(offerEnds: PriceLikeProduct["offerEnds"]) {
  if (!offerEnds) return null;
  const date = offerEnds instanceof Date ? offerEnds : new Date(offerEnds);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getTimeRemaining(endDate: Date | null) {
  if (!endDate) return null;
  const total = Math.max(0, endDate.getTime() - Date.now());
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { total, days, hours, minutes, seconds };
}
