import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import { AccountAccess } from "../../../components/customer/AccountAccess";
import { AccountAtmosphere } from "../../../components/customer/PremiumAccount";
import { useLocation } from "react-router";

export default function LoginPage() {
  const location = useLocation();
  const queryRedirect = new URLSearchParams(location.search).get("redirect");
  const redirectTo = location.state?.from || queryRedirect || "/profile";

  return (
    <CommerceShell
      seoTitle="Customer Access"
      seoDescription="Secure INFIBOLT account access for products, warranty records, support, and ownership care."
    >
      <AccountAtmosphere>
        <MotionSection className="grid min-h-[calc(100svh-73px)] place-items-center px-5 py-12 sm:px-6 sm:py-16 md:px-8 lg:py-20">
          <AccountAccess initialMode="login" redirectTo={redirectTo} />
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}
