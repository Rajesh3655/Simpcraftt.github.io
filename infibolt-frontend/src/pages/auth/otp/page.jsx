import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import { AccountAccess } from "../../../components/customer/AccountAccess";
import { AccountAtmosphere } from "../../../components/customer/PremiumAccount";

export default function OtpPage() {
  return (
    <CommerceShell
      seoTitle="Account Recovery"
      seoDescription="Reset your INFIBOLT account password with secure verification."
    >
      <AccountAtmosphere>
        <MotionSection className="grid min-h-[calc(100svh-73px)] place-items-center px-5 py-12 sm:px-6 sm:py-16 md:px-8 lg:py-20">
          <AccountAccess initialMode="reset" />
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}
