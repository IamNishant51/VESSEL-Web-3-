import Link from "next/link";

import { LandingNavigation } from "@/components/layout/landing-navigation";

const sections = [
  {
    title: "1. Overview",
    body: "This Privacy Policy explains how Vessel collects, uses, discloses, and protects information when you use our applications, websites, and related services.",
  },
  {
    title: "2. Information We Collect",
    body: "We may collect wallet public addresses, agent configuration data, execution metadata, interaction logs, device/browser information, and support communications.",
  },
  {
    title: "3. Wallet Data",
    body: "Vessel uses your wallet public key for authentication, ownership attribution, and feature authorization. We do not request or store your private keys or seed phrases.",
  },
  {
    title: "4. How We Use Information",
    body: "Information is used to operate the platform, provide orchestration features, enforce policy controls, troubleshoot issues, improve reliability, and maintain security.",
  },
  {
    title: "5. Execution Logs and Telemetry",
    body: "We may store execution traces, timestamps, and non-sensitive system events to support diagnostics, abuse prevention, and service quality improvements.",
  },
  {
    title: "6. Marketplace and Transaction Data",
    body: "If you interact with marketplace features, we may process listing metadata, pricing fields, and public transaction references necessary to render and reconcile activities.",
  },
  {
    title: "7. Legal Bases",
    body: "Where applicable, we process data based on contractual necessity, legitimate interests in secure service operations, user consent, and legal obligations.",
  },
  {
    title: "8. Data Sharing",
    body: "We may share information with infrastructure providers, analytics vendors, compliance partners, and integrated protocol services solely as needed to operate the platform. We do not sell personal data.",
  },
  {
    title: "9. Data Retention",
    body: "We retain data only as long as necessary for service delivery, security, legal compliance, and dispute resolution, after which data is deleted or anonymized where feasible.",
  },
  {
    title: "10. Security Measures",
    body: "Vessel applies administrative, technical, and organizational safeguards to protect data; however, no system can guarantee absolute security.",
  },
  {
    title: "11. Your Rights",
    body: "Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, or object to certain processing activities. You may contact us to submit requests.",
  },
  {
    title: "12. International Transfers",
    body: "Your information may be processed in regions other than your own. We take reasonable measures to ensure lawful transfer and protection standards.",
  },
  {
    title: "13. Children",
    body: "Vessel is not directed to children and is not intended for users below the legal age in their jurisdiction.",
  },
  {
    title: "14. Changes to this Policy",
    body: "We may revise this Privacy Policy from time to time. Material updates will be reflected by an updated effective date.",
  },
  {
    title: "15. Contact",
    body: "For privacy requests, email: privacy@vessel.engine",
  },
];

export default function PrivacyPage() {
   return (
     <div className="min-h-screen bg-[#fafafa] text-[#111112]">
       <LandingNavigation forceLight />
 
       <main className="mx-auto w-full max-w-[1100px] px-5 py-10 pt-8 sm:px-8 sm:py-12">
        <div className="rounded-xl border border-black/10 bg-white p-6 sm:p-10">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#9e1422]">LEGAL</p>
          <h1 className="mt-2 text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] text-black sm:text-[58px]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-[14px] text-black/65">Effective Date: April 4, 2026</p>
          <p className="mt-5 max-w-[780px] text-[16px] leading-relaxed text-black/75">
            This policy describes how Vessel handles data across wallet identity, orchestration workflows,
            marketplace interactions, and platform diagnostics.
          </p>

          <div className="mt-8 space-y-5">
            {sections.map((section) => (
              <section key={section.title} className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-black">{section.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-black/72">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
