import { Bell, Heart, PackageCheck, ShieldCheck, TicketCheck, UserRound } from "lucide-react";
import { Link } from "react-router";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { EmptyState, ProtectedRoute } from "../../components/AppStates";
import { useAppStore } from "../../store/appStore";

export default function ProfilePage() {
  const profile = useAppStore((state) => state.profile);
  const notifications = useAppStore((state) => state.notifications);
  const warranty = useAppStore((state) => state.warranty.claims);
  const support = useAppStore((state) => state.support.tickets);

  return (
    <CommerceShell eyebrow="Account" title="Profile" description="A protected customer dashboard for profile, warranty records, support tickets, wishlist, and future orders.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <ProtectedRoute>
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-2xl border border-slate-900/10 bg-white/75 p-6 shadow-sm">
              <UserRound className="h-7 w-7 text-slate-900" />
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{profile.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{profile.email}</p>
              <p className="mt-1 text-sm text-slate-500">{profile.phone}</p>
              <div className="mt-6 grid gap-2">
                <ProfileLink icon={PackageCheck} href="/orders" label="Orders" />
                <ProfileLink icon={Heart} href="/wishlist" label="Wishlist" />
                <ProfileLink icon={ShieldCheck} href="/warranty" label="Warranty" />
                <ProfileLink icon={TicketCheck} href="/support" label="Support" />
                <ProfileLink icon={UserRound} href="/settings" label="Settings" />
              </div>
            </aside>
            <div className="grid gap-6">
              <section className="grid gap-4 sm:grid-cols-3">
                <Metric label="Warranty claims" value={warranty.length} icon={ShieldCheck} />
                <Metric label="Support tickets" value={support.length} icon={TicketCheck} />
                <Metric label="Unread alerts" value={notifications.filter((item) => !item.read).length} icon={Bell} />
              </section>
              <EmptyState title="Your account workspace is ready" description="As soon as backend records are connected, this protected dashboard will populate with registered products, direct orders, warranty claims, and support conversations." action={<Link to="/products" className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">Explore products</Link>} />
            </div>
          </div>
        </ProtectedRoute>
      </MotionSection>
    </CommerceShell>
  );
}

function ProfileLink({ icon: Icon, href, label }) {
  return <Link to={href} className="flex items-center gap-3 rounded-xl border border-slate-900/10 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white"><Icon className="h-4 w-4" />{label}</Link>;
}

function Metric({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-slate-900/10 bg-white/75 p-5 shadow-sm"><Icon className="h-5 w-5 text-slate-900" /><p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p></div>;
}
