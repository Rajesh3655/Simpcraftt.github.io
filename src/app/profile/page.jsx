import { AccountShell, FutureCommerceNotice } from "../components/commerce/CommerceLayout";

export default function ProfilePage() {
  return (
    <AccountShell title="Your account dashboard." description="Profile, addresses, order history, registered products, and warranty claims live here.">
      <div className="space-y-5">
        <FutureCommerceNotice title="Customer accounts launching soon" />
        {["Saved addresses", "Order history", "Registered products", "Warranty claims"].map((item) => (
          <div key={item} className="lux-panel rounded-2xl p-6">
            <h2 className="text-xl font-black">{item}</h2>
            <p className="mt-3 text-sm leading-7 text-black/68 dark:text-white/70">This customer module is ready for backend connection and authenticated data.</p>
          </div>
        ))}
      </div>
    </AccountShell>
  );
}

