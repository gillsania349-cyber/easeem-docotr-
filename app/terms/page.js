import LegalPageShell, { LegalH2, LegalP, LegalUl, LegalNote } from "@/components/LegalPageShell";

export const metadata = {
  title: "Terms of Use — PakMed",
  description: "Terms of Use for PakMed — Pakistan's healthcare jobs, doctors, hospitals and market platform.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Use" updated="13 October 2026">
      <LegalP>
        Welcome to <strong>PakMed</strong>. These Terms of Use (“Terms”) explain the rules for using our website and
        related services that connect healthcare workers, hospitals, patients, and suppliers across Pakistan.
      </LegalP>
      <LegalP>
        By creating an account, browsing, posting, applying, messaging, or otherwise using PakMed, you agree to these
        Terms. If you do not agree, please do not use the platform.
      </LegalP>

      <LegalH2>1. Who we are</LegalH2>
      <LegalP>
        PakMed is a healthcare platform for Pakistan. People use it to find jobs, doctors, hospitals, clinics, labs,
        pharmacies, and medical equipment. An account is only required when you take an action such as apply, message,
        save, or post.
      </LegalP>

      <LegalH2>2. Eligibility</LegalH2>
      <LegalUl>
        <li>You must be able to form a binding agreement under applicable Pakistani law.</li>
        <li>If you represent a hospital, clinic, lab, pharmacy, or business, you confirm you are authorised to act for that organisation.</li>
        <li>Doctors who list themselves publicly are responsible for the accuracy of their credentials and practice details.</li>
      </LegalUl>

      <LegalH2>3. Accounts and verification</LegalH2>
      <LegalUl>
        <li>You must provide accurate information when signing up and keep your profile reasonably up to date.</li>
        <li>WhatsApp or email OTP verification may be used to confirm your contact details.</li>
        <li>You are responsible for keeping your login details secure and for activity under your account.</li>
        <li>We may suspend or block accounts that harm others, misuse the platform, or break these Terms.</li>
      </LegalUl>

      <LegalH2>4. Using PakMed</LegalH2>
      <LegalP>You agree to use PakMed only for lawful healthcare-related purposes, including:</LegalP>
      <LegalUl>
        <li>Browsing and applying for healthcare jobs</li>
        <li>Posting job openings if you are an authorised employer</li>
        <li>Finding doctors, hospitals, and related facilities</li>
        <li>Buying, selling, or requesting repair of medical equipment through the Market</li>
        <li>Building a CV and, if you choose, making it visible to employers</li>
      </LegalUl>
      <LegalP>You must not:</LegalP>
      <LegalUl>
        <li>Post false, misleading, fraudulent, or harmful content</li>
        <li>Impersonate another person or facility</li>
        <li>Harass users, spam, scrape data, or attempt unauthorised access</li>
        <li>Share private phone numbers or personal data of others without permission</li>
        <li>Use PakMed for illegal drugs, weapons, or non-healthcare scams</li>
      </LegalUl>

      <LegalH2>5. Jobs, doctors and marketplaces</LegalH2>
      <LegalUl>
        <li><strong>Jobs:</strong> Employers are responsible for job details, hiring decisions, and compliance with employment laws. PakMed does not guarantee interviews or employment.</li>
        <li><strong>Doctors directory:</strong> Listings appear only when a doctor’s profile is ready and they opt in. PakMed does not provide online appointment booking unless later stated.</li>
        <li><strong>Hospitals:</strong> Facility pages may show “Unverified” when PakMed has not checked the listing. Do not assume endorsement.</li>
        <li><strong>Market:</strong> Buyers and sellers deal with each other directly. PakMed is not a party to those transactions unless clearly stated for a specific paid feature.</li>
      </LegalUl>

      <LegalH2>6. Content you post</LegalH2>
      <LegalP>
        You keep ownership of content you submit (profiles, CVs, job posts, listings, messages, comments). You grant
        PakMed a licence to host, display, and process that content as needed to operate the service. You confirm you
        have the rights to post it.
      </LegalP>

      <LegalH2>7. Reports, moderation and safety</LegalH2>
      <LegalP>
        Signed-in users may report jobs, doctors, facilities, listings, posts, or comments. PakMed may review reports and
        take action, including removing content or blocking accounts, to keep the platform safe.
      </LegalP>

      <LegalH2>8. Privacy</LegalH2>
      <LegalP>
        How we handle personal data is described in our{" "}
        <a href="/privacy" style={{ color: "#0B57B7", fontWeight: 600 }}>
          Privacy Policy
        </a>
        . Phone numbers stay private by default unless a user chooses to share them.
      </LegalP>

      <LegalH2>9. Paid features</LegalH2>
      <LegalP>
        Most browsing is free. Some features may become paid later (for example unlocking certain doctor contact details
        after traffic grows). Any paid feature will be clearly described before you pay.
      </LegalP>

      <LegalH2>10. Disclaimers</LegalH2>
      <LegalUl>
        <li>PakMed is a connection platform, not a hospital, clinic, or medical advice service.</li>
        <li>We do not guarantee that every listing, profile, fee, or product description is complete or error-free.</li>
        <li>The service is provided “as is” to the extent permitted by law.</li>
      </LegalUl>

      <LegalH2>11. Limitation of liability</LegalH2>
      <LegalP>
        To the maximum extent allowed by applicable law, PakMed is not liable for indirect or consequential losses, or
        for disputes between users arising from jobs, clinical care, or marketplace deals arranged through the platform.
      </LegalP>

      <LegalH2>12. Changes</LegalH2>
      <LegalP>
        We may update these Terms as PakMed grows. The “Last updated” date at the top will change when we do. Continued
        use after updates means you accept the revised Terms.
      </LegalP>

      <LegalH2>13. Contact</LegalH2>
      <LegalP>
        Questions about these Terms:{" "}
        <a href="mailto:support@pakmed.pk" style={{ color: "#0B57B7", fontWeight: 600 }}>
          support@pakmed.pk
        </a>
      </LegalP>

      <LegalNote>
        This document is written in plain language for users and stakeholders. It is not a substitute for formal legal
        advice. Have your counsel review it before a public commercial launch if needed.
      </LegalNote>
    </LegalPageShell>
  );
}
