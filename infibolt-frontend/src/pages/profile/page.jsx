import { Bell, Heart, PackageCheck, ShieldCheck, TicketCheck, UserRound } from "lucide-react";
import { Link } from "react-router";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { EmptyState, ProtectedRoute } from "../../components/AppStates";
import { AccountAtmosphere, AccountCard, SoftStatus } from "../../components/customer/PremiumAccount";
import { useAppStore } from "../../store/appStore";

export default function ProfilePage() {
  const profile = useAppStore((state) => state.profile);
  const notifications = useAppStore((state) => state.notifications);
  const warranty = useAppStore((state) => state.warranty.claims);
  const support = useAppStore((state) => state.support.tickets);

  return (
    <CommerceShell
      eyebrow="Account"
      title="Your ownership space."
      description="Products, care, support, and preferences arranged around the way you use INFIBOLT."
    >
      <AccountAtmosphere>
        <MotionSection className="px-5 pb-16 sm:px-6 md:px-8 md:pb-20">
          <ProtectedRoute>
            <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[310px_1fr]">
              <AccountCard className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
                    <UserRound className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <SoftStatus>Member</SoftStatus>
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-normal text-slate-950">{profile.name}</h2>
                <p className="mt-2 text-sm font-light leading-6 text-slate-500">{profile.email}</p>
                <p className="text-sm font-light leading-6 text-slate-500">{profile.phone}</p>
                <div className="mt-6 grid gap-2">
                  <ProfileLink icon={PackageCheck} href="/orders" label="Orders" />
                  <ProfileLink icon={Heart} href="/wishlist" label="Wishlist" />
                  <ProfileLink icon={ShieldCheck} href="/warranty" label="Warranty" />
                  <ProfileLink icon={TicketCheck} href="/support" label="Support" />
                  <ProfileLink icon={UserRound} href="/settings" label="Settings" />
                </div>
              </AccountCard>

              <div className="grid gap-5">
                <section className="grid gap-4 sm:grid-cols-3">
                  <Metric label="Care records" value={warranty.length} icon={ShieldCheck} />
                  <Metric label="Conversations" value={support.length} icon={TicketCheck} />
                  <Metric label="Quiet alerts" value={notifications.filter((item) => !item.read).length} icon={Bell} />
                </section>
                <AccountCard className="p-6 sm:p-8">
                  <div className="max-w-2xl">
                    <SoftStatus>Device ecosystem</SoftStatus>
                    <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">Ready for your first registered product.</h2>
                    <p className="mt-3 text-sm font-light leading-7 text-slate-600">
                      Once you register a product or open a care request, this space becomes a timeline of ownership: serials, invoices, warranty movement, and support updates.
                    </p>
                  </div>
                  <div className="mt-7">
                    <EmptyState title="No product timeline yet" description="Explore the collection or submit a warranty request to begin your INFIBOLT ownership record." action={<Link to="/products" className="premium-button account-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white">Explore products</Link>} />
                  </div>
                </AccountCard>
              </div>
            </div>
          </ProtectedRoute>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}

function ProfileLink({ icon: Icon, href, label }) {
  return (
    <Link to={href} className="group flex min-h-[46px] items-center gap-3 rounded-2xl border border-slate-900/8 bg-white/52 px-4 text-sm font-medium text-slate-700 transition duration-200 hover:border-slate-900/14 hover:bg-white/86 hover:text-slate-950">
      <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-slate-950" strokeWidth={1.8} />
      {label}
    </Link>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <AccountCard className="p-5">
      <Icon className="h-5 w-5 text-slate-500" strokeWidth={1.8} />
      <p className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </AccountCard>
  );
}
