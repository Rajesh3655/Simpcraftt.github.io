export const ok = (res, data = {}, statusCode = 200) => res.status(statusCode).json(data);

export const sanitizeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address || "",
  city: user.city || "",
  state: user.state || "",
  postalCode: user.postalCode || "",
  role: user.role,
  status: user.status,
  emailVerifiedAt: user.emailVerifiedAt,
  avatarUrl: user.avatarUrl,
  permissions: user.permissions || [],
});

export const sanitizeAdminUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  status: user.status,
  avatarUrl: user.avatarUrl,
  permissions: user.permissions || [],
});

export const productDetails = (product) => ({
  ...product,
  originalPrice: product.originalPrice || product.comparePrice,
  comparePrice: product.comparePrice || product.originalPrice,
  summary: product.summary || product.shortDescription,
  subtitle: product.subtitle || product.shortDescription || product.summary,
  shortDescription: product.shortDescription || product.summary,
  description: product.description || product.fullDescription || product.summary,
  fullDescription: product.fullDescription || product.description || product.summary,
  image: product.image || product.coverImage || product.thumbnail,
  coverImage: product.coverImage || product.image || product.thumbnail,
  thumbnail: product.thumbnail || product.coverImage || product.image,
  gallery: product.gallery?.length ? product.gallery : product.galleryImages?.length ? product.galleryImages : [product.coverImage || product.image].filter(Boolean),
  galleryImages: product.galleryImages?.length ? product.galleryImages : product.gallery?.length ? product.gallery : [product.coverImage || product.image].filter(Boolean),
  variants: product.variants?.length ? product.variants : ["Obsidian", "Ice Alloy"],
  features: product.features?.length ? product.features : product.highlights?.length ? product.highlights : ["Marketplace-ready purchase", "Warranty support", "Premium industrial design"],
  highlights: product.highlights?.length ? product.highlights : product.features?.length ? product.features : ["Marketplace-ready purchase", "Warranty support", "Premium industrial design"],
  premiumHighlights: product.premiumHighlights?.length
    ? [...product.premiumHighlights].sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 5)
    : (product.highlights?.length ? product.highlights : product.features || ["Marketplace-ready purchase", "Warranty support", "Premium industrial design"])
        .slice(0, 5)
        .map((label, index) => ({ label, icon: "sparkles", order: index })),
  storySection: {
    title: product.storySection?.title || product.name,
    subtitle: product.storySection?.subtitle || product.description || product.summary,
    backgroundImage: product.storySection?.backgroundImage || product.coverImage || product.image,
    alignment: product.storySection?.alignment || "left",
  },
  specs:
    product.specs && Object.keys(product.specs).length
      ? product.specs
      : product.specifications?.length
        ? Object.fromEntries(product.specifications.map((item) => [item.label, item.value]).filter(([label, value]) => label && value))
      : {
          Warranty: product.warrantyMonths ? `${product.warrantyMonths} months limited warranty` : "Warranty support after registration",
          Support: "INFIBOLT care workflow",
          Availability: product.status || "Ready",
        },
  specifications: product.specifications?.length
    ? [...product.specifications].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [],
  featureBlocks: (product.featureBlocks?.length ? product.featureBlocks : [])
    .map((block, index) => ({ ...block, description: block.description || block.body, body: block.body || block.description, order: block.order ?? index }))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 4),
  faqs: (product.faqs || []).sort((a, b) => (a.order || 0) - (b.order || 0)),
  relatedProducts: (product.relatedProducts?.length ? product.relatedProducts : product.recommendations || []).slice(0, 4),
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
