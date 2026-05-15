import { CommerceShell, PrimaryButton, SecondaryButton } from "../components/commerce/CommerceLayout";

export default function RegisterPage() {
  return (
    <CommerceShell eyebrow="Customer Access" title="Create your account." description="Registration will support OTP/email verification when authentication is connected.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-xl rounded-lg border border-black/10 bg-white/76 p-6 dark:border-white/10 dark:bg-white/[0.045]">
          <form className="grid gap-4">
            <input placeholder="Full name" className="rounded-lg border border-black/10 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.05]" />
            <input type="email" placeholder="Email address" className="rounded-lg border border-black/10 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.05]" />
            <input type="password" placeholder="Password" className="rounded-lg border border-black/10 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.05]" />
            <PrimaryButton href="/profile">Create Account</PrimaryButton>
            <SecondaryButton href="/login">Already have an account</SecondaryButton>
          </form>
        </div>
      </section>
    </CommerceShell>
  );
}
