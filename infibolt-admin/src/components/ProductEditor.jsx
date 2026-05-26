import { ArrowLeft, CheckCircle2, ExternalLink, Image, Package, RotateCcw, Save, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import DeleteProductDialog from "./DeleteProductDialog";
import { uploadUrl } from "../config/api";
import { AdminShell } from "../layouts/AdminLayout";
import { productService } from "../services/productService";
import { uploadService } from "../services/uploadService";
import { useAdminStore } from "../store/appStore";

const specGroups = ["Audio", "Battery", "Connectivity", "Build", "Compatibility"];
const highlightIcons = ["sparkles", "audio", "anc", "battery", "charge", "spatial", "bluetooth", "warranty"];
const adminPillClass = "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200";
const defaultProductFaqs = [
  {
    question: "Where can I buy this product?",
    answer: "Infibolt products are purchased through trusted marketplace and retail launch partners listed on this page.",
    order: 0,
  },
  {
    question: "How do I activate warranty?",
    answer: "Create or open your Infibolt account, register the product serial number, upload the invoice, and submit it for warranty activation.",
    order: 1,
  },
  {
    question: "Can I raise support claims after marketplace purchase?",
    answer: "Yes. Once ownership is registered, warranty claims and product support are handled through Infibolt support workflows.",
    order: 2,
  },
];
const productQualityGuidance = [
  "Use official product names, not campaign slogans.",
  "Keep subtitles short and benefit-led.",
  "Upload clean product imagery with no text overlays.",
  "Add marketplace links only after they are live and verified.",
  "Keep highlights, features, specifications, and FAQ factual.",
];
const addProductGuidance = [
  "Start as Draft until images, price, links, and warranty FAQ are complete.",
  "Use the product's final brand name and permanent URL slug.",
  "Add at least one product image and one customer-facing highlight.",
  "Leave marketplace links blank until the partner page is live.",
];
const sectionGuidance = {
  "Basic Info": "This controls product identity everywhere. Keep naming, price, stock, and status accurate before publishing.",
  Media: "Use real product images with consistent lighting. The primary image becomes the hero, card image, and SEO image.",
  "Marketplace Links": "Use only trusted live partner URLs. Leave a field blank if that marketplace is not available yet.",
  Highlights: "Add 3 to 5 short claims customers can scan instantly. Avoid long sentences and marketing filler.",
  "Story Section": "Use one cinematic image and minimal copy. This is brand storytelling, not a specification area.",
  "Feature Blocks": "Use up to 4 focused feature stories. Each block should explain one meaningful product advantage.",
  Specifications: "Add structured facts customers compare before buying. Group labels must be clean and consistent.",
  FAQ: "Answer purchase, warranty, compatibility, and support doubts clearly. Do not repeat marketing copy.",
  SEO: "Write search metadata in plain language. Related products must be valid product slugs.",
  Visibility: "Draft first, then publish only when media, links, warranty details, and SEO are ready.",
};

const emptyProduct = {
  name: "",
  slug: "",
  subtitle: "",
  category: "audio",
  price: "",
  stock: "",
  badge: "",
  image: "",
  gallery: ["", "", ""],
  marketplace: { amazon: "", flipkart: "", croma: "", relianceDigital: "", customLabel: "", custom: "" },
  premiumHighlights: [{ label: "", icon: "sparkles", order: 0 }],
  storySection: { title: "", subtitle: "", backgroundImage: "", alignment: "left" },
  featureBlocks: [],
  specifications: specGroups.map((group, index) => ({ group, label: "", value: "", order: index })),
  faqs: defaultProductFaqs,
  seo: { title: "", description: "", keywordsText: "" },
  status: "Draft",
  productPageVisible: true,
  featured: false,
  newLaunch: false,
  homepageVisible: false,
  heroVisible: false,
  relatedProductsText: "",
};

export function ProductEditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const deleteProduct = useAdminStore((state) => state.deleteProduct);
  const loadProducts = useAdminStore((state) => state.loadProducts);
  const categories = useAdminStore((state) => state.categories.items);
  const loadCategories = useAdminStore((state) => state.loadCategories);

  useEffect(() => {
    let active = true;
    loadCategories();
    if (!slug) return undefined;
    productService.list().then((result) => {
      if (!active) return;
      const product = (result.items || []).find((item) => item.slug === slug);
      if (product) {
        setExisting(product);
        setForm(productToForm(product));
      }
    });
    return () => {
      active = false;
    };
  }, [loadCategories, slug]);

  const selectedCategoryValue = resolveCategorySlug(form.category, categories);
  const categoryOptions = categories;
  const galleryCount = useMemo(() => [form.image, ...form.gallery].filter(Boolean).length, [form.image, form.gallery]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    clearFieldError(key);
  };
  const setNested = (section, key, value) => {
    setForm((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
    clearFieldError(`${section}.${key}`);
  };
  const clearFieldError = (key) => {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const uploadImage = async (event, target, index = 0) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const key = `${target}-${index}`;
    setUploadingKey(key);
    try {
      const result = await uploadService.uploadAsset(file);
      const path = result.url || result.path || result.file?.url;
      if (!path) throw new Error("Upload response did not include a file path.");
      setImageTarget(target, index, path);
      toast.success("Image uploaded", { description: "The product media is ready." });
    } catch (error) {
      toast.error("Image upload failed", { description: error.message || "Please try another image." });
    } finally {
      setUploadingKey("");
      event.target.value = "";
    }
  };

  const setImageTarget = (target, index, path) => {
    setForm((current) => {
      if (target === "main") return { ...current, image: path };
      if (target === "gallery") {
        const gallery = [...current.gallery];
        gallery[index] = path;
        return { ...current, gallery };
      }
      if (target === "story") return { ...current, storySection: { ...current.storySection, backgroundImage: path } };
      if (target === "feature") {
        const featureBlocks = current.featureBlocks.map((block, blockIndex) => blockIndex === index ? { ...block, image: path } : block);
        return { ...current, featureBlocks };
      }
      return current;
    });
  };

  const save = async (event) => {
    event.preventDefault();
    const errors = validateProductForm(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error("Validation failed", { description: Object.values(errors)[0] });
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(form, categories);
      if (existing) await productService.update(existing.slug, payload);
      else await productService.create(payload);
      await loadProducts();
      toast.success(existing ? "Product updated" : "Product created", { description: "The official product experience was saved." });
      navigate("/products");
    } catch (error) {
      const apiErrors = { ...validationDetailsToErrors(error.details), ...(error.fields || {}) };
      if (Object.keys(apiErrors).length) setFieldErrors(apiErrors);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    setDeleting(true);
    try {
      await deleteProduct(existing.slug);
      toast.success("Product deleted", { description: `${existing.name} was removed from the catalogue.` });
      setDeleteOpen(false);
      navigate("/products");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell title={existing ? "Edit Product" : "Add Product"} description="Manage the fixed official product page structure without page-builder complexity.">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border border-slate-900/8 bg-white/70 p-4 shadow-[0_14px_44px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.035]">
        <div className="flex flex-wrap gap-2">
          <Link to="/products" className={adminPillClass}>
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
          {existing && (
            <a href={`http://localhost:3000/products/${existing.slug}`} target="_blank" rel="noreferrer" className={adminPillClass}>
              <ExternalLink className="h-4 w-4" />
              View
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setForm(existing ? productToForm(existing) : emptyProduct)} disabled={saving || deleting} className={adminPillClass}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          {existing && (
            <button type="button" onClick={() => setDeleteOpen(true)} disabled={deleting || saving} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 text-xs font-bold uppercase tracking-[0.14em] text-rose-700 transition hover:bg-rose-500/10 disabled:opacity-50 dark:text-rose-300">
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting" : "Delete"}
            </button>
          )}
          <button type="submit" form="product-editor-form" disabled={saving || deleting} className="premium-button inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60 dark:bg-white dark:text-slate-900">
            <Save className="h-4 w-4" />
            {saving ? "Saving" : existing ? "Update" : "Create"}
          </button>
        </div>
      </div>

      <QualityGuide items={existing ? productQualityGuidance : addProductGuidance} mode={existing ? "edit" : "add"} />

      <form id="product-editor-form" onSubmit={save} noValidate className="grid gap-5">
        <EditorSection number="1" title="Basic Info" guidance={sectionGuidance["Basic Info"]}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field required label="Product title" value={form.name} error={fieldErrors.name} onChange={(value) => setField("name", value)} helper="Official customer-facing name. Example: Aura Audio Pro." />
            <Field required label="Slug" value={form.slug} error={fieldErrors.slug} onChange={(value) => setField("slug", slugify(value))} placeholder="aura-audio-pro" helper="Lowercase URL handle. Use letters, numbers, and hyphens only." />
            <Field required label="Premium subtitle" value={form.subtitle} error={fieldErrors.subtitle} onChange={(value) => setField("subtitle", value)} helper="One calm sentence explaining the product promise." />
            <SelectField required label="Category" value={selectedCategoryValue} error={fieldErrors.category || fieldErrors.categorySlug} onChange={(value) => setForm((current) => ({ ...current, category: value }))}>
              {(categoryOptions.length ? categoryOptions : [{ id: "audio", name: "Audio" }, { id: "charging", name: "Charging" }, { id: "wearables", name: "Wearables" }]).map((category) => (
                <option key={category.id || category.slug || category.name} value={category.slug || category.id || slugify(category.name)}>{category.name}</option>
              ))}
            </SelectField>
            <Field required type="number" min={0} label="Price" value={form.price} error={fieldErrors.price} onChange={(value) => setField("price", value)} helper="Final customer-visible price. Do not add currency symbols." />
            <Field type="number" min={0} label="Stock" value={form.stock} error={fieldErrors.stock} onChange={(value) => setField("stock", value)} placeholder="0" helper="Use 0 for unavailable products. Status controls public messaging." />
            <Field label="Launch badge" value={form.badge} error={fieldErrors.badge} onChange={(value) => setField("badge", value)} placeholder="New, Flagship, Launch" helper="Optional short badge. Keep it under one or two words." />
          </div>
        </EditorSection>

        <EditorSection number="2" title="Media" guidance={sectionGuidance.Media}>
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <ImageUploadSlot required label="Primary image" image={form.image} uploading={uploadingKey === "main-0"} onUpload={(event) => uploadImage(event, "main")} error={fieldErrors.image} helper="Recommended: clean product image, square or 4:3, no banners or text." large />
            <div className="grid gap-3 md:grid-cols-3">
              {form.gallery.map((image, index) => (
                <ImageUploadSlot key={index} label={`Gallery ${index + 1}`} image={image} uploading={uploadingKey === `gallery-${index}`} onUpload={(event) => uploadImage(event, "gallery", index)} onClear={() => setGalleryImage(setForm, index, "")} error={fieldErrors.gallery} helper="Add detail, lifestyle, or alternate angle images." />
              ))}
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500">{galleryCount}/4 images selected.</p>
        </EditorSection>

        <EditorSection number="3" title="Marketplace Links" guidance={sectionGuidance["Marketplace Links"]}>
          <div className="grid gap-4 md:grid-cols-2">
            {["amazon", "flipkart", "croma", "relianceDigital"].map((key) => (
              <Field key={key} label={marketplaceLabel(key)} value={form.marketplace[key] || ""} error={fieldErrors[`marketplace.${key}`]} onChange={(value) => setNested("marketplace", key, value)} placeholder="https://" helper="Paste the exact product page URL. Leave blank if unavailable." />
            ))}
            <Field label="Custom website name" value={form.marketplace.customLabel || ""} error={fieldErrors["marketplace.customLabel"]} onChange={(value) => setNested("marketplace", "customLabel", value)} placeholder="Example: Vijay Sales" />
            <Field label="Custom website link" value={form.marketplace.custom || ""} error={fieldErrors["marketplace.custom"]} onChange={(value) => setNested("marketplace", "custom", value)} placeholder="https://" />
          </div>
        </EditorSection>

        <EditorSection number="4" title="Highlights" guidance={sectionGuidance.Highlights}>
          <div className="grid gap-3">
            {form.premiumHighlights.map((item, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_180px_44px]">
                <Field label={`Highlight ${index + 1}`} value={item.label} error={fieldErrors.premiumHighlights} onChange={(value) => updateArrayItem(setForm, "premiumHighlights", index, { label: value, order: index })} />
                <SelectField label="Icon" value={item.icon || "sparkles"} onChange={(value) => updateArrayItem(setForm, "premiumHighlights", index, { icon: value, order: index })}>
                  {highlightIcons.map((icon) => <option key={icon}>{icon}</option>)}
                </SelectField>
                <RemoveButton label="Remove highlight" onClick={() => removeArrayItem(setForm, "premiumHighlights", index)} />
              </div>
            ))}
            <AddButton disabled={form.premiumHighlights.length >= 5} onClick={() => addArrayItem(setForm, "premiumHighlights", { label: "", icon: "sparkles", order: form.premiumHighlights.length })}>Add highlight</AddButton>
          </div>
        </EditorSection>

        <EditorSection number="5" title="Story Section" guidance={sectionGuidance["Story Section"]}>
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4">
              <Field label="Story title" value={form.storySection.title} error={fieldErrors["storySection.title"]} onChange={(value) => setNested("storySection", "title", value)} helper="Short cinematic headline. Avoid technical lists here." />
              <Field label="Story subtitle" textarea rows={4} value={form.storySection.subtitle} error={fieldErrors["storySection.subtitle"]} onChange={(value) => setNested("storySection", "subtitle", value)} helper="1 to 2 calm lines. Keep it premium and minimal." />
              <SelectField label="Text alignment" value={form.storySection.alignment} onChange={(value) => setNested("storySection", "alignment", value)}>
                {["left", "center", "right"].map((alignment) => <option key={alignment}>{alignment}</option>)}
              </SelectField>
            </div>
            <ImageUploadSlot label="Story image" image={form.storySection.backgroundImage} uploading={uploadingKey === "story-0"} onUpload={(event) => uploadImage(event, "story")} onClear={() => setNested("storySection", "backgroundImage", "")} />
          </div>
        </EditorSection>

        <EditorSection number="6" title="Feature Blocks" guidance={sectionGuidance["Feature Blocks"]}>
          <div className="grid gap-4">
            {form.featureBlocks.map((block, index) => (
              <div key={index} className="rounded-2xl border border-slate-900/10 p-4 dark:border-white/10">
                <div className="grid gap-4 lg:grid-cols-[1fr_260px_44px]">
                  <div className="grid gap-4">
                    <Field label="Feature title" value={block.title} onChange={(value) => updateArrayItem(setForm, "featureBlocks", index, { title: value, order: index })} />
                    <Field label="Short description" textarea rows={3} value={block.description || block.body || ""} onChange={(value) => updateArrayItem(setForm, "featureBlocks", index, { description: value, body: value, order: index })} />
                  </div>
                  <ImageUploadSlot label="Feature image" image={block.image} uploading={uploadingKey === `feature-${index}`} onUpload={(event) => uploadImage(event, "feature", index)} onClear={() => updateArrayItem(setForm, "featureBlocks", index, { image: "" })} />
                  <RemoveButton label="Remove feature" onClick={() => removeArrayItem(setForm, "featureBlocks", index)} />
                </div>
              </div>
            ))}
            <AddButton disabled={form.featureBlocks.length >= 4} onClick={() => addArrayItem(setForm, "featureBlocks", { title: "", description: "", body: "", image: "", order: form.featureBlocks.length })}>Add feature block</AddButton>
          </div>
        </EditorSection>

        <EditorSection number="7" title="Specifications" guidance={sectionGuidance.Specifications}>
          <div className="grid gap-3">
            {form.specifications.map((item, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[180px_0.75fr_1fr_44px]">
                <SelectField label="Group" value={item.group || "Audio"} onChange={(value) => updateArrayItem(setForm, "specifications", index, { group: value, order: index })}>
                  {specGroups.map((group) => <option key={group}>{group}</option>)}
                </SelectField>
                <Field label="Label" value={item.label} error={fieldErrors.specifications} onChange={(value) => updateArrayItem(setForm, "specifications", index, { label: value, order: index })} />
                <Field label="Value" value={item.value} error={fieldErrors.specifications} onChange={(value) => updateArrayItem(setForm, "specifications", index, { value, order: index })} />
                <RemoveButton label="Remove specification" onClick={() => removeArrayItem(setForm, "specifications", index)} />
              </div>
            ))}
            <AddButton onClick={() => addArrayItem(setForm, "specifications", { group: "Audio", label: "", value: "", order: form.specifications.length })}>Add specification</AddButton>
          </div>
        </EditorSection>

        <EditorSection number="8" title="FAQ" guidance={sectionGuidance.FAQ}>
          <div className="grid gap-3">
            {form.faqs.map((faq, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_44px]">
                <Field label="Question" value={faq.question} onChange={(value) => updateArrayItem(setForm, "faqs", index, { question: value, order: index })} />
                <Field label="Answer" value={faq.answer} onChange={(value) => updateArrayItem(setForm, "faqs", index, { answer: value, order: index })} />
                <RemoveButton label="Remove FAQ" onClick={() => removeArrayItem(setForm, "faqs", index)} />
              </div>
            ))}
            <AddButton onClick={() => addArrayItem(setForm, "faqs", { question: "", answer: "", order: form.faqs.length })}>Add FAQ</AddButton>
          </div>
        </EditorSection>

        <EditorSection number="9" title="SEO" guidance={sectionGuidance.SEO}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="SEO title" value={form.seo.title} onChange={(value) => setNested("seo", "title", value)} />
            <Field label="SEO description" value={form.seo.description} onChange={(value) => setNested("seo", "description", value)} />
            <Field label="Keywords" value={form.seo.keywordsText} onChange={(value) => setNested("seo", "keywordsText", value)} placeholder="audio, wireless, infibolt" />
            <Field label="Related products" value={form.relatedProductsText} onChange={(value) => setField("relatedProductsText", value)} placeholder="one-slug, another-slug" />
          </div>
        </EditorSection>

        <EditorSection number="10" title="Visibility" guidance={sectionGuidance.Visibility}>
          <div className="grid items-start gap-4 md:grid-cols-2">
            <SelectField label="Status" value={form.status} onChange={(value) => setField("status", value)}>
              {["Draft", "Published", "Hidden", "Out of Stock", "Upcoming", "Discontinued"].map((status) => <option key={status}>{status}</option>)}
            </SelectField>
            <div className="grid gap-3 sm:grid-cols-2">
              {["productPageVisible", "featured", "newLaunch", "homepageVisible", "heroVisible"].map((key) => (
                <label key={key} className="flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-900/10 px-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
                  <input type="checkbox" checked={Boolean(form[key])} onChange={() => setForm((current) => ({ ...current, [key]: !current[key] }))} />
                  {labelize(key)}
                </label>
              ))}
            </div>
          </div>
        </EditorSection>

        <div className="flex justify-end">
          <button disabled={saving} className="premium-button inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] disabled:opacity-60 dark:bg-white dark:text-slate-900">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save product"}
          </button>
        </div>
      </form>
      <DeleteProductDialog product={existing} open={deleteOpen} deleting={deleting} onCancel={() => setDeleteOpen(false)} onConfirm={remove} />
    </AdminShell>
  );
}

function QualityGuide({ items, mode = "edit" }) {
  return (
    <section className="mb-5 rounded-[1.15rem] border border-slate-900/8 bg-slate-950 p-5 text-white shadow-[0_18px_58px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">Admin guidance</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{mode === "add" ? "Create the product like an official launch record." : "Publish only when the product feels official."}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/68">
            {mode === "add"
              ? "Build the foundation first: identity, media, marketplace readiness, warranty FAQ, and visibility."
              : "Use this page like a brand control room: accurate data, clean media, verified links, and calm customer-facing copy."}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[520px]">
          {items.map((item) => (
            <p key={item} className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.055] p-3 text-xs font-medium leading-5 text-white/78">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorSection({ number, title, guidance, children }) {
  return (
    <section className="premium-surface grid gap-5 p-5 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">{number}</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Product page</p>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      </div>
      {guidance && <p className="rounded-2xl border border-slate-900/8 bg-slate-950/[0.025] p-4 text-sm font-medium leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">{guidance}</p>}
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false, placeholder, required = false, rows = 4, min, error, helper }) {
  const inputProps = { required, placeholder, value, min, onChange: (event) => onChange(event.target.value) };
  const controlClass = `premium-control text-sm font-medium outline-none dark:bg-black/20 ${error ? "border-rose-500 bg-rose-50/50 text-rose-950 dark:border-rose-400 dark:bg-rose-950/20 dark:text-white" : ""}`;
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label} {required && <span className="text-red-600">*</span>}</span>
      {textarea ? <textarea {...inputProps} rows={rows} className={`${controlClass} px-4 py-3`} /> : <input {...inputProps} type={type} className={`${controlClass} min-h-[48px] px-4`} />}
      {helper && !error && <span className="text-xs font-medium leading-5 text-slate-500">{helper}</span>}
      {error && <span className="text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</span>}
    </label>
  );
}

function SelectField({ label, value, onChange, required = false, children, error, helper }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label} {required && <span className="text-red-600">*</span>}</span>
      <select required={required} value={value} onChange={(event) => onChange(event.target.value)} className={`premium-control min-h-[48px] px-4 text-sm font-medium dark:bg-black/20 ${error ? "border-rose-500 bg-rose-50/50 text-rose-950 dark:border-rose-400 dark:bg-rose-950/20 dark:text-white" : ""}`}>
        {children}
      </select>
      {helper && !error && <span className="text-xs font-medium leading-5 text-slate-500">{helper}</span>}
      {error && <span className="text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</span>}
    </label>
  );
}

function ImageUploadSlot({ label, image, uploading, onUpload, onClear, required = false, large = false, error, helper }) {
  return (
    <div className={`grid gap-2 rounded-2xl border p-3 ${error ? "border-rose-500 bg-rose-50/40 dark:border-rose-400 dark:bg-rose-950/20" : "border-slate-900/10 dark:border-white/10"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label} {required && <span className="text-red-600">*</span>}</p>
        {image && onClear && <RemoveButton small label={`Clear ${label}`} onClick={onClear} />}
      </div>
      <div className={`overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10 ${large ? "aspect-[4/3]" : "aspect-[5/3]"}`}>
        {image ? <img src={mediaSrc(image)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-sm text-slate-500"><Image className="h-5 w-5" /></div>}
      </div>
      <label className="inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : image ? "Replace image" : "Upload image"}
        <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} className="sr-only" />
      </label>
      {helper && !error && <span className="text-xs font-medium leading-5 text-slate-500">{helper}</span>}
      {error && <span className="text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</span>}
    </div>
  );
}

function AddButton({ children, onClick, disabled = false }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="inline-flex min-h-[40px] w-fit items-center justify-center rounded-full border border-slate-900/10 px-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 disabled:opacity-45 dark:border-white/10 dark:text-slate-200">
      {children}
    </button>
  );
}

function RemoveButton({ label, onClick, small = false }) {
  return (
    <button type="button" onClick={onClick} className={`grid place-items-center rounded-xl border border-slate-900/10 text-slate-500 dark:border-white/10 ${small ? "h-8 w-8" : "h-11 w-11 self-end"}`} aria-label={label}>
      <X className="h-4 w-4" />
    </button>
  );
}

function productToForm(product) {
  const mainImage = product.image || product.coverImage || product.thumbnail || "";
  return {
    ...emptyProduct,
    ...product,
    subtitle: product.subtitle || product.shortDescription || product.summary || "",
    image: mainImage,
    gallery: normalizeGallery(product.gallery?.length ? product.gallery : product.galleryImages, mainImage),
    marketplace: { ...emptyProduct.marketplace, ...(product.marketplace || {}) },
    premiumHighlights: normalizeHighlights(product.premiumHighlights, product.highlights || product.features),
    storySection: { ...emptyProduct.storySection, ...(product.storySection || {}) },
    featureBlocks: (product.featureBlocks || []).slice(0, 4).map((block, index) => ({ ...block, description: block.description || block.body || "", body: block.body || block.description || "", order: block.order ?? index })),
    specifications: normalizeSpecifications(product.specifications, product.specs),
    faqs: normalizeFaqs(product.faqs || product.faq || product.productFaqs, product.name),
    seo: { title: product.seo?.title || product.metaTitle || "", description: product.seo?.description || product.metaDescription || "", keywordsText: (product.seo?.keywords || product.keywords || []).join(", ") },
    price: String(product.price ?? ""),
    stock: String(product.stock ?? 0),
    relatedProductsText: (product.relatedProducts || product.recommendations || []).join(", "),
  };
}

function formToPayload(form, categories) {
  const categoryName = resolveCategoryName(form.category, categories);
  const categorySlug = resolveCategorySlug(form.category, categories);
  const gallery = [form.image, ...form.gallery.filter(Boolean)].filter(Boolean);
  const premiumHighlights = form.premiumHighlights.filter((item) => item.label.trim()).slice(0, 5).map((item, index) => ({ label: item.label.trim(), icon: item.icon || "sparkles", order: index }));
  const specifications = form.specifications.filter((item) => item.label.trim() && item.value.trim()).map((item, index) => ({ group: item.group || "Audio", label: item.label.trim(), value: item.value.trim(), order: index }));
  const featureBlocks = form.featureBlocks.filter((item) => item.title.trim() || item.description?.trim() || item.image).slice(0, 4).map((item, index) => ({ title: item.title.trim(), description: (item.description || item.body || "").trim(), body: (item.description || item.body || "").trim(), image: item.image || "", order: index }));
  const faqs = form.faqs.filter((item) => item.question.trim() && item.answer.trim()).map((item, index) => ({ question: item.question.trim(), answer: item.answer.trim(), order: index }));
  const relatedProducts = commaList(form.relatedProductsText).map(slugify).filter(Boolean).slice(0, 4);
  const seoKeywords = commaList(form.seo.keywordsText);

  return {
    slug: slugify(form.slug),
    name: form.name.trim(),
    subtitle: form.subtitle.trim(),
    category: categoryName,
    categorySlug,
    price: Number(form.price || 0),
    stock: Number(form.stock || 0),
    status: form.status,
    badge: form.badge.trim(),
    summary: form.subtitle.trim(),
    shortDescription: form.subtitle.trim(),
    description: form.storySection.subtitle?.trim() || form.subtitle.trim(),
    fullDescription: form.storySection.subtitle?.trim() || form.subtitle.trim(),
    image: form.image,
    coverImage: form.image,
    thumbnail: form.image,
    hoverImage: form.gallery.filter(Boolean)[0] || form.image,
    gallery,
    galleryImages: gallery,
    features: premiumHighlights.map((item) => item.label),
    highlights: premiumHighlights.map((item) => item.label),
    premiumHighlights,
    storySection: {
      title: form.storySection.title?.trim() || form.name.trim(),
      subtitle: form.storySection.subtitle?.trim() || form.subtitle.trim(),
      backgroundImage: form.storySection.backgroundImage || form.image,
      alignment: form.storySection.alignment || "left",
    },
    featureBlocks,
    specifications,
    specs: Object.fromEntries(specifications.map((item) => [item.label, item.value])),
    faqs,
    marketplace: {
      amazon: form.marketplace.amazon?.trim() || "",
      flipkart: form.marketplace.flipkart?.trim() || "",
      croma: form.marketplace.croma?.trim() || "",
      relianceDigital: form.marketplace.relianceDigital?.trim() || "",
      customLabel: form.marketplace.customLabel?.trim() || "",
      custom: form.marketplace.custom?.trim() || "",
      visible: true,
      externalBuyEnabled: true,
      priority: marketplacePriority(form.marketplace),
      launchStatus: "Available through trusted launch partners",
    },
    relatedProducts,
    recommendations: relatedProducts,
    seo: { title: form.seo.title?.trim() || "", description: form.seo.description?.trim() || "", keywords: seoKeywords },
    metaTitle: form.seo.title?.trim() || "",
    metaDescription: form.seo.description?.trim() || "",
    keywords: seoKeywords,
    productPageVisible: Boolean(form.productPageVisible),
    featured: Boolean(form.featured),
    newLaunch: Boolean(form.newLaunch),
    homepageVisible: Boolean(form.homepageVisible),
    heroVisible: Boolean(form.heroVisible),
  };
}

function validateProductForm(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = "Enter at least 2 characters.";
  if (!slugify(form.slug)) errors.slug = "Enter a slug.";
  if (!form.subtitle.trim() || form.subtitle.trim().length < 5) errors.subtitle = "Enter a short premium subtitle.";
  if (!form.category) errors.category = "Select a category.";
  if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0) errors.price = "Enter a valid price.";
  if (form.stock !== "" && (Number.isNaN(Number(form.stock)) || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock)))) errors.stock = "Enter a valid whole stock quantity.";
  if (!form.image) errors.image = "Upload a primary image.";
  if (!form.premiumHighlights.filter((item) => item.label.trim()).length) errors.premiumHighlights = "Add at least one highlight.";
  ["amazon", "flipkart", "croma", "relianceDigital", "custom"].forEach((key) => {
    const value = form.marketplace?.[key]?.trim();
    if (value && !isValidUrl(value)) errors[`marketplace.${key}`] = "Enter a valid URL or leave it blank.";
  });
  if (form.marketplace?.custom?.trim() && !form.marketplace?.customLabel?.trim()) {
    errors["marketplace.customLabel"] = "Add a name for the custom website.";
  }
  return errors;
}

function validationDetailsToErrors(details = []) {
  return details.reduce((errors, detail) => {
    const key = mapValidationPath(detail.path || detail.param);
    if (!key || errors[key]) return errors;
    errors[key] = detail.msg && detail.msg !== "Invalid value" ? detail.msg : "This field needs attention.";
    return errors;
  }, {});
}

function mapValidationPath(path = "") {
  if (path.startsWith("premiumHighlights") || path.startsWith("features") || path.startsWith("highlights")) return "premiumHighlights";
  if (path.startsWith("specifications") || path.startsWith("specs")) return "specifications";
  if (path.startsWith("gallery") || path.startsWith("galleryImages")) return "gallery";
  return path;
}

function updateArrayItem(setForm, key, index, patch) {
  setForm((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
}

function addArrayItem(setForm, key, item) {
  setForm((current) => ({ ...current, [key]: [...current[key], item] }));
}

function removeArrayItem(setForm, key, index) {
  setForm((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index).map((item, order) => ({ ...item, order })) }));
}

function setGalleryImage(setForm, index, value) {
  setForm((current) => {
    const gallery = [...current.gallery];
    gallery[index] = value;
    return { ...current, gallery };
  });
}

function normalizeGallery(gallery = [], mainImage = "") {
  const images = (gallery || []).filter(Boolean).filter((image) => image !== mainImage).slice(0, 3);
  return [...images, "", "", ""].slice(0, 3);
}

function normalizeHighlights(items = [], fallback = []) {
  const source = items.length ? items : (fallback || []).map((label, index) => ({ label, icon: "sparkles", order: index }));
  const normalized = source.filter((item) => item?.label).slice(0, 5).map((item, index) => ({ label: item.label || item, icon: item.icon || "sparkles", order: item.order ?? index }));
  return normalized.length ? normalized : emptyProduct.premiumHighlights;
}

function normalizeSpecifications(specifications = [], specs = {}) {
  const source = specifications?.length ? specifications : Object.entries(specs || {}).map(([label, value], index) => ({ label, value, group: specGroups[index % specGroups.length], order: index }));
  const rows = source.map((item, index) => ({ group: item.group || "Audio", label: item.label || "", value: item.value || "", order: item.order ?? index }));
  return rows.length ? rows : emptyProduct.specifications;
}

function normalizeFaqs(items = [], productName = "this product") {
  const source = Array.isArray(items) ? items : [];
  const rows = source
    .filter(Boolean)
    .map((item, index) => ({
      question: item.question || item.title || "",
      answer: item.answer || item.description || item.body || "",
      order: item.order ?? index,
    }))
    .filter((item) => item.question.trim() || item.answer.trim());
  if (rows.length) return rows;
  return defaultProductFaqs.map((item, index) => ({
    ...item,
    question: index === 0 ? `Where can I buy ${productName || "this product"}?` : item.question,
  }));
}

function resolveCategory(categoryValue, categories = []) {
  const normalized = slugify(categoryValue);
  return categories.find((category) => [category.slug, category.id, category.name].map(slugify).includes(normalized));
}

function resolveCategoryName(categoryValue, categories = []) {
  return resolveCategory(categoryValue, categories)?.name || categoryValue;
}

function resolveCategorySlug(categoryValue, categories = []) {
  const category = resolveCategory(categoryValue, categories);
  return slugify(category?.slug || category?.id || categoryValue);
}

function marketplacePriority(marketplace) {
  if (marketplace.amazon) return "Amazon";
  if (marketplace.flipkart) return "Flipkart";
  if (marketplace.croma) return "Croma";
  if (marketplace.relianceDigital) return "Reliance Digital";
  if (marketplace.custom) return "Custom";
  return "Amazon";
}

function marketplaceLabel(key) {
  if (key === "custom") return "Custom website link";
  return key === "relianceDigital" ? "Reliance Digital link" : `${key.charAt(0).toUpperCase()}${key.slice(1)} link`;
}

function mediaSrc(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("/images/")) return path;
  return uploadUrl(path);
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function commaList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function labelize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
