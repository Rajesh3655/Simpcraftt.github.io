import { Bug, ImageUp, MessageCircle, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
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

export default function SupportPage() {
  const createSupportTicket = useAppStore((state) => state.createSupportTicket);
  const [form, setForm] = useState({ name: "", email: "", topic: "Warranty", message: "" });
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
      message: topic === "Report a bug" && !current.message
        ? "What failed:\n\nSteps to reproduce:\n\nExpected result:\n\nActual result:"
        : current.message,
    }));
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
      eyebrow="Support"
      title="Care is part of the product."
      description="A calmer way to ask for help, keep context, and follow every update."
    >
      <AccountAtmosphere>
        <MotionSection className="px-5 pb-16 sm:px-6 md:px-8 md:pb-20">
          <div className="mx-auto grid w-full max-w-[1100px] items-start gap-5 lg:grid-cols-2">
            <AccountCard className="p-5 sm:p-7">
              <div className="mb-6">
                <SoftStatus>Care request</SoftStatus>
                <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Tell us what happened.</h2>
                <p className="mt-2 text-sm font-light leading-7 text-slate-600">Share the product, purchase context, and what you need. We will keep the thread attached to your account.</p>
              </div>
              <form onSubmit={submit} className="grid gap-4">
                <PremiumField label="Full name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} required />
                <PremiumField label="Email" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} required />
                <PremiumSelect label="Topic" value={form.topic} onChange={selectTopic} options={["Warranty", "Report a bug", "Marketplace purchase", "Product information", "Partnership"]} />
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
            </div>
          </div>
          <div className="mx-auto mt-10 w-full max-w-[1180px]">
            <FAQList />
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
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
