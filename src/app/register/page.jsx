import { CommerceShell, PrimaryButton, SecondaryButton } from "../components/commerce/CommerceLayout";

export default function RegisterPage() {
  return (
    <CommerceShell eyebrow="Customer Access" title="Create your account." description="Registration will support OTP/email verification when authentication is connected.">
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-xl lux-panel rounded-2xl p-6 sm:p-8">
          <form className="grid gap-4">
            <input placeholder="Full name" className="rounded-xl border border-[var(--lux-border)] bg-[var(--lux-surface)] px-4 py-3" />
            <input type="email" placeholder="Email address" className="rounded-xl border border-[var(--lux-border)] bg-[var(--lux-surface)] px-4 py-3" />
            <input type="password" placeholder="Password" className="rounded-xl border border-[var(--lux-border)] bg-[var(--lux-surface)] px-4 py-3" />
            <PrimaryButton href="/profile">Create Account</PrimaryButton>
            <SecondaryButton href="/login">Already have an account</SecondaryButton>
          </form>
        </div>
      </section>
    </CommerceShell>
  );
}

