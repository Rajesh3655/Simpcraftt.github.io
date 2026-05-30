import mongoose from "mongoose";
import { PRODUCT_VISIBILITY } from "../constants/status.js";
import { schemaDefaults } from "./base.js";

const imageField = { type: String, trim: true, maxlength: 1000 };
const textList = [{ type: String, trim: true, maxlength: 180 }];
const marketplaceUrl = { type: String, trim: true, maxlength: 1000 };

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    categorySlug: { type: String, trim: true, lowercase: true, maxlength: 80, index: true },
    collection: { type: String, trim: true, maxlength: 80 },
    collectionSlug: { type: String, trim: true, lowercase: true, maxlength: 100, index: true },
    sku: { type: String, trim: true, uppercase: true, maxlength: 80, index: true },
    serialPrefix: { type: String, trim: true, uppercase: true, maxlength: 30 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    comparePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    limitedOffer: { type: Boolean, default: false, index: true },
    offerEnds: { type: Date },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    badge: { type: String, default: "New", trim: true, maxlength: 40 },
    subtitle: { type: String, trim: true, maxlength: 180 },
    status: { type: String, default: "Draft", enum: PRODUCT_VISIBILITY, index: true },
    featured: { type: Boolean, default: false, index: true },
    newLaunch: { type: Boolean, default: false, index: true },
    bestseller: { type: Boolean, default: false, index: true },
    trending: { type: Boolean, default: false, index: true },
    homepageVisible: { type: Boolean, default: false, index: true },
    heroVisible: { type: Boolean, default: false, index: true },
    desktopMenuFeatured: { type: Boolean, default: false, index: true },
    collectionVisible: { type: Boolean, default: true, index: true },
    productPageVisible: { type: Boolean, default: true, index: true },
    mobileFeatured: { type: Boolean, default: false, index: true },
    supportWarrantyEnabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0, index: true },
    visibility: { type: String, default: "public", enum: ["public", "private", "admin-only"], index: true },
    summary: { type: String, required: true, trim: true, maxlength: 500 },
    shortDescription: { type: String, trim: true, maxlength: 500 },
    description: { type: String, trim: true, maxlength: 2000 },
    fullDescription: { type: String, trim: true, maxlength: 6000 },
    image: imageField,
    coverImage: imageField,
    hoverImage: imageField,
    thumbnail: imageField,
    mobileHeroImage: imageField,
    gallery: [imageField],
    galleryImages: [imageField],
    variants: [{ type: String, trim: true, maxlength: 80 }],
    features: textList,
    highlights: textList,
    premiumHighlights: [
      {
        label: { type: String, trim: true, maxlength: 80 },
        icon: { type: String, trim: true, maxlength: 40 },
        order: { type: Number, default: 0 },
      },
    ],
    storySection: {
      title: { type: String, trim: true, maxlength: 140 },
      subtitle: { type: String, trim: true, maxlength: 360 },
      backgroundImage: imageField,
      alignment: { type: String, default: "left", enum: ["left", "center", "right"] },
    },
    specs: { type: Map, of: String, default: {} },
    specifications: [
      {
        label: { type: String, trim: true, maxlength: 100 },
        value: { type: String, trim: true, maxlength: 300 },
        group: { type: String, trim: true, maxlength: 80 },
        order: { type: Number, default: 0 },
      },
    ],
    featureBlocks: [
      {
        title: { type: String, trim: true, maxlength: 120 },
        body: { type: String, trim: true, maxlength: 600 },
        description: { type: String, trim: true, maxlength: 600 },
        image: imageField,
        order: { type: Number, default: 0 },
      },
    ],
    faqs: [
      {
        question: { type: String, trim: true, maxlength: 180 },
        answer: { type: String, trim: true, maxlength: 800 },
        order: { type: Number, default: 0 },
      },
    ],
    recommendations: [{ type: String, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ }],
    relatedProducts: [{ type: String, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ }],
    warrantyMonths: { type: Number, default: 12, min: 0, max: 120 },
    replacementDays: { type: Number, default: 7, min: 0, max: 365 },
    supportPriority: { type: String, default: "Normal", enum: ["Low", "Normal", "High", "Flagship"] },
    seo: {
      title: { type: String, trim: true, maxlength: 160 },
      description: { type: String, trim: true, maxlength: 300 },
      keywords: [{ type: String, trim: true, maxlength: 80 }],
    },
    metaTitle: { type: String, trim: true, maxlength: 160 },
    metaDescription: { type: String, trim: true, maxlength: 300 },
    keywords: [{ type: String, trim: true, maxlength: 80 }],
    amazonLink: { type: String, trim: true, maxlength: 1000 },
    flipkartLink: { type: String, trim: true, maxlength: 1000 },
    externalBuyEnabled: { type: Boolean, default: true },
    marketplace: {
      amazon: marketplaceUrl,
      flipkart: marketplaceUrl,
      croma: marketplaceUrl,
      relianceDigital: marketplaceUrl,
      retail: marketplaceUrl,
      custom: marketplaceUrl,
      customLabel: { type: String, trim: true, maxlength: 80 },
      externalBuyEnabled: { type: Boolean, default: true },
      visible: { type: Boolean, default: true },
      priority: { type: String, default: "Amazon", enum: ["Amazon", "Flipkart", "Croma", "Reliance Digital", "Retail", "Custom"] },
      regionalAvailability: [{ type: String, trim: true, maxlength: 80 }],
      launchStatus: { type: String, default: "Available through launch partners", trim: true, maxlength: 120 },
    },
  },
  schemaDefaults
);

schema.pre("validate", function normalizeProduct() {
  this.shortDescription = this.shortDescription || this.summary;
  this.fullDescription = this.fullDescription || this.description;
  this.subtitle = this.subtitle || this.shortDescription || this.summary;
  this.categorySlug = this.categorySlug || String(this.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  this.originalPrice = this.originalPrice || this.comparePrice;
  this.comparePrice = this.comparePrice || this.originalPrice;
  this.collectionSlug = this.collectionSlug || String(this.collection || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  this.coverImage = this.coverImage || this.image;
  this.thumbnail = this.thumbnail || this.coverImage;
  this.galleryImages = this.galleryImages?.length ? this.galleryImages : this.gallery;
  this.marketplace = {
    ...(this.marketplace || {}),
    amazon: this.marketplace?.amazon || this.amazonLink,
    flipkart: this.marketplace?.flipkart || this.flipkartLink,
    externalBuyEnabled: this.marketplace?.externalBuyEnabled ?? this.externalBuyEnabled,
  };
  this.premiumHighlights = this.premiumHighlights?.length
    ? this.premiumHighlights
    : (this.highlights?.length ? this.highlights : this.features || []).slice(0, 5).map((label, index) => ({ label, icon: "sparkles", order: index }));
  this.featureBlocks = (this.featureBlocks || []).map((block, index) => ({
    ...block,
    body: block.body || block.description,
    description: block.description || block.body,
    order: Number.isFinite(block.order) ? block.order : index,
  }));
  this.relatedProducts = this.relatedProducts?.length ? this.relatedProducts : this.recommendations;
  this.seo = {
    ...(this.seo || {}),
    title: this.seo?.title || this.metaTitle,
    description: this.seo?.description || this.metaDescription,
    keywords: this.seo?.keywords?.length ? this.seo.keywords : this.keywords,
  };
});

schema.index({ name: "text", summary: "text", shortDescription: "text", description: "text", fullDescription: "text", category: "text", collection: "text" });
schema.index({ categorySlug: 1, collectionSlug: 1, status: 1, visibility: 1 });
schema.index({ homepageVisible: -1, heroVisible: -1, featured: -1, sortOrder: 1 });
schema.index({ price: 1, rating: -1, stock: -1 });

export const Product = mongoose.model("Product", schema);
