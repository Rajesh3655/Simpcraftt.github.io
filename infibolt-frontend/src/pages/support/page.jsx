import { MessageSquare, Send, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommerceShell, FAQList, MotionSection, SecondaryButton } from "../../components/commerce/CommerceLayout";
import { EmptyState, PageLoader } from "../../components/AppStates";
import {
  AccountAtmosphere,
  AccountCard,
  PremiumButton,
  PremiumField,
  PremiumNotice,
  PremiumSelect,
  SoftStatus,
} from "../../components/customer/PremiumAccount";
import { useAppStore } from "../../store/appStore";

export default function SupportPage() {
  const { tickets, status, error } = useAppStore((state) => state.support);
  const loadSupportTickets = useAppStore((state) => state.loadSupportTickets);
  const createSupportTicket = useAppStore((state) => state.createSupportTicket);
  const [form, setForm] = useState({ name: "", email: "", topic: "Warranty", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSupportTickets();
  }, [loadSupportTickets]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const ticket = await createSupportTicket(form);
      setForm({ name: "", email: "", topic: "Warranty", message: "" });
      toast.success("Care request created", { description: `${ticket.id} is now in your support timeline.` });
    } finally {
      setSubmitting(false);
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
          <div className="mx-auto grid w-full max-w-[1180px] gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <AccountCard className="p-5 sm:p-7">
              <div className="mb-6">
                <SoftStatus>Care request</SoftStatus>
                <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Tell us what happened.</h2>
                <p className="mt-2 text-sm font-light leading-7 text-slate-600">Share the product, purchase context, and what you need. We will keep the thread attached to your account.</p>
              </div>
              <form onSubmit={submit} className="grid gap-4">
                <PremiumField label="Full name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} required />
                <PremiumField label="Email" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} required />
                <PremiumSelect label="Topic" value={form.topic} onChange={(topic) => setForm((current) => ({ ...current, topic }))} options={["Warranty", "Marketplace purchase", "Product information", "Partnership"]} />
                <PremiumField label="Message" value={form.message} onChange={(message) => setForm((current) => ({ ...current, message }))} textarea required placeholder="Add order details, serial number, or what you noticed." />
                <PremiumButton loading={submitting} type="submit">
                  <Send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Send request"}
                </PremiumButton>
              </form>
            </AccountCard>

            <div className="space-y-5">
              <AccountCard className="p-6 sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <SoftStatus>Timeline</SoftStatus>
                    <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">Support conversations</h2>
                  </div>
                  <TicketCheck className="h-5 w-5 text-slate-400" strokeWidth={1.8} />
                </div>
                <div className="grid gap-3">
                  {status === "loading" && <PageLoader label="Opening care timeline" />}
                  {status === "error" && <EmptyState title="Care timeline unavailable" description={error} />}
                  {status === "success" && tickets.length === 0 && <EmptyState title="No conversations yet" description="Your requests will appear here as a calm care history." />}
                  {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
                </div>
              </AccountCard>
              <AccountCard className="p-6 sm:p-7">
                <MessageSquare className="h-5 w-5 text-slate-900" strokeWidth={1.8} />
                <p className="mt-4 max-w-xl text-sm font-light leading-7 text-slate-600">For urgent purchase help, start a WhatsApp chat with your product serial and marketplace order details ready.</p>
                <div className="mt-5"><SecondaryButton href="https://wa.me/1234567890" external>Start WhatsApp Chat</SecondaryButton></div>
              </AccountCard>
              <PremiumNotice title="Before you send">A serial number, invoice ID, or marketplace order reference helps us resolve the request faster.</PremiumNotice>
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

function TicketCard({ ticket }) {
  return (
    <div className="rounded-2xl border border-slate-900/8 bg-white/56 p-4 shadow-[0_12px_34px_rgba(17,24,39,0.045)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold tracking-normal text-slate-950">{ticket.id}</p>
        <span className="rounded-full border border-amber-700/10 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">{ticket.status}</span>
      </div>
      <p className="mt-2 text-sm font-light leading-6 text-slate-500">{ticket.topic || ticket.message}</p>
    </div>
  );
}
