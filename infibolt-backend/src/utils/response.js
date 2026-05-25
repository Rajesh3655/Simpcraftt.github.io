export const ok = (res, data = {}, statusCode = 200) => res.status(statusCode).json(data);

export const sanitizeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  permissions: user.permissions || [],
});

export const productDetails = (product) => ({
  ...product,
  summary: product.summary || product.shortDescription,
  shortDescription: product.shortDescription || product.summary,
  description: product.description || product.fullDescription || product.summary,
  fullDescription: product.fullDescription || product.description || product.summary,
  image: product.image || product.coverImage || product.thumbnail,
  coverImage: product.coverImage || product.image || product.thumbnail,
  thumbnail: product.thumbnail || product.coverImage || product.image,
  gallery: product.gallery?.length ? product.gallery : product.galleryImages?.length ? product.galleryImages : [product.coverImage || product.image].filter(Boolean),
  galleryImages: product.galleryImages?.length ? product.galleryImages : product.gallery?.length ? product.gallery : [product.coverImage || product.image].filter(Boolean),
  variants: product.variants?.length ? product.variants : ["Obsidian", "Ice Alloy"],
  features: product.features?.length ? product.features : product.highlights?.length ? product.highlights : ["Marketplace-ready purchase", "12-month warranty", "Premium industrial design"],
  highlights: product.highlights?.length ? product.highlights : product.features?.length ? product.features : ["Marketplace-ready purchase", "12-month warranty", "Premium industrial design"],
  specs:
    product.specs && Object.keys(product.specs).length
      ? product.specs
      : product.specifications?.length
        ? Object.fromEntries(product.specifications.map((item) => [item.label, item.value]).filter(([label, value]) => label && value))
      : {
          Warranty: `${product.warrantyMonths || 12} months limited warranty`,
          Support: "INFIBOLT care workflow",
          Availability: product.status || "Ready",
        },
  marketplace: {
    ...(product.marketplace || {}),
    amazon: product.marketplace?.amazon || product.amazonLink,
    flipkart: product.marketplace?.flipkart || product.flipkartLink,
    externalBuyEnabled: product.marketplace?.externalBuyEnabled ?? product.externalBuyEnabled ?? true,
  },
  seo: {
    ...(product.seo || {}),
    title: product.seo?.title || product.metaTitle || product.name,
    description: product.seo?.description || product.metaDescription || product.summary || product.shortDescription,
    keywords: product.seo?.keywords || product.keywords || [],
  },
});
