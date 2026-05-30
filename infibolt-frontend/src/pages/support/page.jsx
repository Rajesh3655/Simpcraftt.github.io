import { BookOpen, Bug, CheckCircle2, Clock3, ImageUp, Mail, MessageCircle, MessageSquare, PackageCheck, Phone, Send, ShieldCheck, Sparkles, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { CommerceShell, FAQList, MotionSection } from "../../components/commerce/CommerceLayout";
import {
  AccountAtmosphere,
  AccountCard,
  PremiumButton,
  PremiumField,
  PremiumSelect,
  SoftStatus,
} from "../../components/customer/PremiumAccount";
import { uploadService } from "../../services/uploadService";
import { defaultContactSettings, siteService } from "../../services/siteService";
import { useAppStore } from "../../store/appStore";

const supportTopics = ["Warranty", "Report a bug", "Marketplace purchase", "Product information", "Partnership"];
const supportPaths = [
  { topic: "Warranty", title: "Warranty care", text: "Share serial, invoice, and registration details.", icon: ShieldCheck },
  { topic: "Marketplace purchase", title: "Order help", text: "Add Amazon, Flipkart, retail, or seller context.", icon: PackageCheck },
  { topic: "Report a bug", title: "Bug report", text: "Attach a screenshot and steps to reproduce.", icon: Bug },
];
const prepItems = [
  ["Serial number", "Printed on the product, box, invoice, or warranty card."],
  ["Invoice / order ID", "Helps us connect marketplace and retail purchases quickly."],
  ["Clear photos", "Useful for damage, missing accessory, or product condition checks."],
];
const bugReportTemplate = "What failed:\n\nSteps to reproduce:\n\nExpected result:\n\nActual result:";

export default function SupportPage() {
  const createSupportTicket = useAppStore((state) => state.createSupportTicket);
  const profile = useAppStore((state) => state.profile);
  const [form, setForm] = useState({ name: profile.name || "", email: profile.email || "", topic: "Warranty", message: "" });
  const [bugUpload, setBugUpload] = useState({ status: "idle", error: "", fileName: "" });
  const [submitting, setSubmitting] = useState(false);
  const [contact, setContact] = useState(defaultContactSettings);

  useEffect(() => {
    let mounted = true;
    siteService.settings().then((result) => {
      if (mounted) setContact(result.contactSettings);
    }).catch(() => {
      if (mounted) setContact(defaultContactSettings);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || profile.name || "",
      email: current.email || profile.email || "",
    }));
  }, [profile]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const ticket = await createSupportTicket(form);
      setForm({ name: "", email: "", topic: "Warranty", message: "", attachments: [] });
      setBugUpload({ status: "idle", error: "", fileName: "" });
      toast.success("Care request created", { description: `${ticket.id} is now in your support timeline.` });
    } finally {
      setSubmitting(false);
    }
  };

  const selectTopic = (topic) => {
    setForm((current) => ({
      ...current,
      topic,
      message: topic === "Report a bug"
        ? (!current.message ? bugReportTemplate : current.message)
        : (current.message === bugReportTemplate ? "" : current.message),
      attachments: topic === "Report a bug" ? current.attachments : [],
    }));
    if (topic !== "Report a bug") setBugUpload({ status: "idle", error: "", fileName: "" });
  };

  const uploadBugScreenshot = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setBugUpload({ status: "error", error: "Upload a screenshot image.", fileName: file.name });
      setForm((current) => ({ ...current, attachments: [] }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setBugUpload({ status: "error", error: "Screenshot must be 10 MB or smaller.", fileName: file.name });
      setForm((current) => ({ ...current, attachments: [] }));
      return;
    }
    setBugUpload({ status: "loading", error: "", fileName: file.name });
    try {
      const result = await uploadService.uploadSupportAttachment(file);
      setForm((current) => ({
        ...current,
        attachments: [{
          url: result.url || result.path,
          filename: result.originalName || result.filename || file.name,
          type: result.type || file.type,
        }],
      }));
      setBugUpload({ status: "success", error: "", fileName: file.name });
      toast.success("Screenshot uploaded", { description: "Attached to the bug report." });
    } catch (requestError) {
      setForm((current) => ({ ...current, attachments: [] }));
      setBugUpload({ status: "error", error: requestError.message || "Screenshot upload failed.", fileName: file.name });
    }
  };

  return (
    <CommerceShell
      seoTitle="Support"
      seoDescription="Create INFIBOLT care requests, warranty support tickets, bug reports, and urgent WhatsApp support conversations."
    >
      <AccountAtmosphere>
        <MotionSection className="px-4 pb-16 pt-6 sm:px-6 md:px-8 md:pb-20 lg:pt-10">
          <div className="mx-auto grid w-full max-w-[1220px] gap-5">
            <section className="relative overflow-hidden rounded-[1.45rem] border border-slate-900/8 bg-white/78 p-5 shadow-[0_24px_76px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-7 lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_0%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.72))]" />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
                <div className="min-w-0">
                  <SoftStatus>Support hub</SoftStatus>
                  <h1 className="mt-4 max-w-3xl text-[2.1rem] font-semibold leading-[1.04] tracking-normal text-slate-950 sm:text-[3rem]">
                    Product care with the context kept intact.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm font-light leading-7 text-slate-600 sm:text-base">
                    Open a care request, attach proof, and keep every reply connected to your INFIBOLT account.
                  </p>
                </div>
                <div className="relative min-h-[190px] overflow-hidden rounded-[1.25rem] border border-white/70 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                  <img src="/images/optimized/products/hero-sec.webp" alt="" loading="lazy" decoding="async" width="176" height="176" className="absolute bottom-[-2.5rem] right-[-2.5rem] h-44 w-44 object-contain opacity-40" />
                  <div className="relative">
                    <Sparkles className="h-5 w-5 text-emerald-300" strokeWidth={1.8} />
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Care timeline</p>
                    <p className="mt-2 max-w-[14rem] text-xl font-semibold leading-tight">Warranty, support, and bug reports in one place.</p>
                  </div>
                </div>
              </div>
              <div className="relative mt-6 grid gap-3 md:grid-cols-3">
                {supportPaths.map((item) => (
                  <button
                    key={item.topic}
                    type="button"
                    onClick={() => selectTopic(item.topic)}
                    className={`group flex min-h-[118px] items-start gap-4 rounded-[1.15rem] border p-4 text-left transition hover:-translate-y-0.5 ${
                      form.topic === item.topic ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]" : "border-slate-900/8 bg-white/62 text-slate-950 hover:bg-white"
                    }`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${form.topic === item.topic ? "bg-white/12 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                      <item.icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.title}</span>
                      <span className={`mt-2 block text-xs font-medium leading-5 ${form.topic === item.topic ? "text-white/70" : "text-slate-500"}`}>{item.text}</span>
                    </span>
                  </button>
                ))}
                <Link
                  to="/support/manuals"
                  className="group flex min-h-[118px] items-start gap-4 rounded-[1.15rem] border border-slate-900/8 bg-white/62 p-4 text-left text-slate-950 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
                    <BookOpen className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">User manuals</span>
                    <span className="mt-2 block text-xs font-medium leading-5 text-slate-500">View and download official product PDFs.</span>
                  </span>
                </Link>
              </div>
            </section>

            <div className="grid items-start gap-5 lg:grid-cols-[1fr_0.92fr]">
            <AccountCard className="p-5 sm:p-7">
              <div className="mb-6">
                <SoftStatus>Care request</SoftStatus>
                <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Tell us what happened.</h2>
                <p className="mt-2 text-sm font-light leading-7 text-slate-600">Share product, purchase, and issue details. A clear request reaches the right queue faster.</p>
              </div>
              <form onSubmit={submit} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <PremiumField label="Full name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} required />
                  <PremiumField label="Email" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} required />
                </div>
                <PremiumSelect label="Topic" value={form.topic} onChange={selectTopic} options={supportTopics} />
                <PremiumField label={form.topic === "Report a bug" ? "Bug details" : "Message"} value={form.message} onChange={(message) => setForm((current) => ({ ...current, message }))} textarea required placeholder={form.topic === "Report a bug" ? "What failed, steps to reproduce, expected result, and actual result." : "Add order details, serial number, or what you noticed."} />
                {form.topic === "Report a bug" && (
                  <BugScreenshotUpload upload={bugUpload} uploaded={Boolean(form.attachments?.[0]?.url)} onUpload={uploadBugScreenshot} />
                )}
                <PremiumButton loading={submitting} type="submit">
                  {form.topic === "Report a bug" ? <Bug className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Sending..." : form.topic === "Report a bug" ? "Submit bug report" : "Send request"}
                </PremiumButton>
              </form>
            </AccountCard>

            <div className="grid gap-5">
              <AccountCard className="p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <MessageSquare className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <SoftStatus>Quick help</SoftStatus>
                    <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">Need urgent support?</h2>
                    <p className="mt-2 max-w-xl text-sm font-light leading-7 text-slate-600">Start a WhatsApp chat with your product serial and marketplace order details ready.</p>
                  </div>
                </div>
                <a
                  href={contact.whatsapp || defaultContactSettings.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(37,211,102,0.28)] transition hover:bg-[#1fb85a] sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  Start WhatsApp Chat
                </a>
              </AccountCard>

              <AccountCard className="p-5 sm:p-7">
                <SoftStatus>Before you send</SoftStatus>
                <div className="mt-5 grid gap-3">
                  {prepItems.map(([title, text]) => (
                    <div key={title} className="flex gap-3 rounded-[1rem] border border-slate-900/7 bg-white/58 p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2} />
                      <span>
                        <span className="block text-sm font-semibold text-slate-950">{title}</span>
                        <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{text}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </AccountCard>

              <div className="grid gap-3 sm:grid-cols-2">
                <ContactTile icon={Clock3} label="Response" value="Usually within 24 hours" />
                <ContactTile icon={TicketCheck} label="Tracking" value="Saved to your account" />
                {contact.helpEmail && <ContactTile icon={Mail} label="Email" value={contact.helpEmail} href={`mailto:${contact.helpEmail}`} />}
                {(contact.mobileNumber || contact.phone) && <ContactTile icon={Phone} label="Phone" value={contact.mobileNumber || contact.phone} href={`tel:${String(contact.mobileNumber || contact.phone).replace(/\s+/g, "")}`} />}
              </div>
            </div>
            </div>
          </div>
          <div className="mx-auto mt-10 w-full max-w-[1220px]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SoftStatus>Answers</SoftStatus>
                <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">Common care questions</h2>
              </div>
              <p className="max-w-sm text-sm font-light leading-7 text-slate-600">Warranty, purchase, and support basics before you open a ticket.</p>
            </div>
            <FAQList />
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}

function ContactTile({ icon: Icon, label, value, href }) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.8} />
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</span>
        <span className="mt-1 block truncate text-sm font-semibold text-slate-800">{value}</span>
      </span>
    </>
  );

  const className = "flex min-h-[74px] items-center gap-3 rounded-[1.1rem] border border-slate-900/8 bg-white/64 px-4 shadow-[0_14px_38px_rgba(15,23,42,0.045)] transition hover:bg-white";
  if (href) return <a href={href} className={className}>{content}</a>;
  return <div className={className}>{content}</div>;
}

function BugScreenshotUpload({ upload, uploaded, onUpload }) {
  return (
    <label className={`flex min-h-[112px] cursor-pointer items-center justify-center rounded-[1.25rem] border border-dashed px-5 text-center text-sm font-light leading-6 transition ${
      upload.status === "error"
        ? "border-rose-400/60 bg-rose-50/70 text-rose-800"
        : uploaded
          ? "border-emerald-500/40 bg-emerald-50/70 text-emerald-800"
          : "border-slate-900/14 bg-white/48 text-slate-500 hover:border-slate-900/24 hover:bg-white/70"
    }`}>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          onUpload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <span className="grid justify-items-center gap-2">
        <ImageUp className="h-5 w-5 text-current opacity-70" />
        <span className="font-semibold text-slate-800">{upload.status === "loading" ? "Uploading screenshot..." : uploaded ? "Screenshot attached" : "Upload screenshot"}</span>
        <span>{upload.fileName || "PNG, JPG, WEBP, GIF, or AVIF up to 10 MB."}</span>
        {upload.error && <span className="font-medium text-rose-700">{upload.error}</span>}
      </span>
    </label>
  );
}
