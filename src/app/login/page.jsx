import { CommerceShell, PrimaryButton, SecondaryButton } from "../components/commerce/CommerceLayout";

export default function LoginPage() {
  return (
    <CommerceShell eyebrow="Customer Access" title="Login to your Simpcraftt account." description="Account access is prepared for profiles, saved addresses, warranty records, and future orders.">
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-xl lux-panel rounded-2xl p-6 sm:p-8">
          <form className="grid gap-4">
            <input type="email" placeholder="Email address" className="rounded-xl border border-[var(--lux-border)] bg-[var(--lux-surface)] px-4 py-3" />
            <input type="password" placeholder="Password" className="rounded-xl border border-[var(--lux-border)] bg-[var(--lux-surface)] px-4 py-3" />
            <PrimaryButton href="/profile">Login</PrimaryButton>
            <SecondaryButton href="/register">Create Account</SecondaryButton>
          </form>
        </div>
      </section>
    </CommerceShell>
  );
}

