import { CommerceShell, PrimaryButton, SecondaryButton } from "../components/commerce/CommerceLayout";

export default function LoginPage() {
  return (
    <CommerceShell eyebrow="Customer Access" title="Login to your Simpcraftt account." description="Account access is prepared for profiles, saved addresses, warranty records, and future orders.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-xl rounded-lg border border-black/10 bg-white/76 p-6 dark:border-white/10 dark:bg-white/[0.045]">
          <form className="grid gap-4">
            <input type="email" placeholder="Email address" className="rounded-lg border border-black/10 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.05]" />
            <input type="password" placeholder="Password" className="rounded-lg border border-black/10 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.05]" />
            <PrimaryButton href="/profile">Login</PrimaryButton>
            <SecondaryButton href="/register">Create Account</SecondaryButton>
          </form>
        </div>
      </section>
    </CommerceShell>
  );
}
