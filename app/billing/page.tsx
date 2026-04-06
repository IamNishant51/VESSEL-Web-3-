import { PricingPage } from "@/components/billing/pricing-page";
import { LandingNavigation } from "@/components/layout/landing-navigation";

export const metadata = {
  title: "Billing & Pricing - VESSEL",
  description: "Upgrade your VESSEL subscription",
};

export default function BillingPage() {
  return (
    <>
      <LandingNavigation forceLight />
      <PricingPage />
    </>
  );
}
