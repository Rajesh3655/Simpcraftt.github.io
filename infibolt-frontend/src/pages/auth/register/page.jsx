import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import { AccountAccess } from "../../../components/customer/AccountAccess";
import { AccountAtmosphere } from "../../../components/customer/PremiumAccount";

export default function RegisterPage() {
  return (
    <CommerceShell
      seoTitle="Create Account"
      seoDescription="Create a verified INFIBOLT account for device ownership, care records, and support."
    >
      <AccountAtmosphere>
        <MotionSection className="grid min-h-[calc(100svh-73px)] place-items-center px-5 py-12 sm:px-6 sm:py-16 md:px-8 lg:py-20">
          <AccountAccess initialMode="signup" />
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}
