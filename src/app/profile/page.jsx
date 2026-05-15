import { AccountShell, FutureCommerceNotice } from "../components/commerce/CommerceLayout";

export default function ProfilePage() {
  return (
    <AccountShell title="Your account dashboard." description="Profile, addresses, order history, registered products, and warranty claims live here.">
      <div className="space-y-5">
        <FutureCommerceNotice title="Customer accounts launching soon" />
        {["Saved addresses", "Order history", "Registered products", "Warranty claims"].map((item) => (
          <div key={item} className="rounded-lg border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.045]">
            <h2 className="text-xl font-black">{item}</h2>
            <p className="mt-3 text-sm leading-6 text-black/62 dark:text-white/62">This customer module is ready for backend connection and authenticated data.</p>
          </div>
        ))}
      </div>
    </AccountShell>
  );
}
