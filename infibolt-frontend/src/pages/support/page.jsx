import { MessageSquare, Send, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommerceShell, FAQList, MotionSection, SecondaryButton } from "../../components/commerce/CommerceLayout";
import { EmptyState, PageLoader } from "../../components/AppStates";
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
    const ticket = await createSupportTicket(form);
    setSubmitting(false);
    setForm({ name: "", email: "", topic: "Warranty", message: "" });
    toast.success("Support ticket created", { description: `${ticket.id} is now in your support queue.` });
  };

  return (
    <CommerceShell eyebrow="Support" title="Care is part of the product." description="Create a support case, keep the conversation organized, and track every update from one calm workspace.">
      <MotionSection className="pb-10 md:pb-16 lg:pb-20">
        <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
          <form onSubmit={submit} className="premium-surface grid gap-5 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Create support ticket</h2>
            <Field label="Full name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} required />
            <Field label="Email" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} required />
            <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Topic</span><select value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} className="premium-control min-h-[48px] px-4 text-sm font-medium"><option>Warranty</option><option>Marketplace purchase</option><option>Product information</option><option>Partnership</option></select></label>
            <Field label="Message" value={form.message} onChange={(message) => setForm((current) => ({ ...current, message }))} textarea required />
            <button disabled={submitting} className="premium-button inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] disabled:opacity-60"><Send className="h-4 w-4" />{submitting ? "Submitting..." : "Submit ticket"}</button>
          </form>
          <div className="space-y-5">
            <div className="premium-surface p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Your ticket queue</h2>
              <div className="mt-5 grid gap-3">
                {status === "loading" && <PageLoader label="Loading tickets" />}
                {status === "error" && <EmptyState title="Ticket queue unavailable" description={error} />}
                {status === "success" && tickets.length === 0 && <EmptyState title="No tickets yet" description="Create your first support request and it will appear here." />}
                {tickets.map((ticket) => <div key={ticket.id} className="rounded-xl border border-slate-900/10 bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-900">{ticket.id}</p><span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">{ticket.status}</span></div><p className="mt-2 text-sm text-slate-500">{ticket.topic || ticket.message}</p></div>)}
              </div>
            </div>
            <div className="premium-surface p-6">
              <MessageSquare className="h-5 w-5 text-slate-900" />
              <p className="mt-3 text-sm leading-7 text-slate-600">Need fast help? Start WhatsApp with product serial and marketplace order details.</p>
              <div className="mt-5"><SecondaryButton href="https://wa.me/1234567890" external>Start WhatsApp Chat</SecondaryButton></div>
            </div>
            <FAQList />
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false, required }) {
  return <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>{textarea ? <textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} rows={5} className="premium-control px-4 py-3 text-sm font-medium outline-none" /> : <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="premium-control min-h-[48px] px-4 text-sm font-medium outline-none" />}</label>;
}
