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
  description: product.description || product.summary,
  gallery: product.gallery?.length ? product.gallery : [product.image].filter(Boolean),
  variants: product.variants?.length ? product.variants : ["Obsidian", "Ice Alloy"],
  features: product.features?.length ? product.features : ["Marketplace-ready purchase", "12-month warranty", "Premium industrial design"],
  specs:
    product.specs && Object.keys(product.specs).length
      ? product.specs
      : {
          Warranty: "12 months limited warranty",
          Support: "INFIBOLT care workflow",
          Availability: product.status || "Ready",
        },
});
