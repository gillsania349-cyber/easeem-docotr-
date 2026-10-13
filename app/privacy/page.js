import LegalPageShell, { LegalH2, LegalP, LegalUl, LegalNote } from "@/components/LegalPageShell";

export const metadata = {
  title: "Privacy Policy — PakMed",
  description: "Privacy Policy for PakMed — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="13 October 2026">
      <LegalP>
        This Privacy Policy explains how <strong>PakMed</strong> collects, uses, shares, and protects information when
        you use our website and related services in Pakistan.
      </LegalP>
      <LegalP>
        You can browse many parts of PakMed without an account. We ask for an account when you want to apply, message,
        save, post, or use similar actions.
      </LegalP>

      <LegalH2>1. Information we collect</LegalH2>
      <LegalP>
        <strong>Account details:</strong> username, password, and a verified contact (WhatsApp number and/or email). City
        may be optional.
      </LegalP>
      <LegalP>
        <strong>Profile information:</strong> depending on your role — general profile, doctor profile, employer /
        facility profile, or business / seller profile. This can include name, job title, qualifications, facility
        details, photos, fees, timings, and similar fields you choose to provide.
      </LegalP>
      <LegalP>
        <strong>CV / resume data:</strong> education, experience, skills, achievements, photo, and uploaded CV files if
        you use the CV builder or upload a document.
      </LegalP>
      <LegalP>
        <strong>Activity data:</strong> job applications, saved items, messages, reports, market listings, comments, and
        similar actions you take while signed in.
      </LegalP>
      <LegalP>
        <strong>Technical data:</strong> basic device/browser information and usage logs needed to run, secure, and
        improve the service.
      </LegalP>

      <LegalH2>2. How we use information</LegalH2>
      <LegalUl>
        <li>Operate PakMed (jobs, directories, hospitals, market, messaging, saved items)</li>
        <li>Verify contacts with OTP and show a verified mark where applicable</li>
        <li>Help employers review applicants and public CVs that users opted into</li>
        <li>Show doctors and facilities in directories when profiles are complete and opted in</li>
        <li>Moderate reports and keep the platform safe</li>
        <li>Send important service messages (for example security or account notices)</li>
        <li>Improve features and fix issues</li>
      </LegalUl>

      <LegalH2>3. Phone number privacy</LegalH2>
      <LegalP>
        Doctors’ and sellers’ phone numbers are <strong>private by default</strong>. A number appears publicly only if
        the user chooses to share it. Guests who message a doctor may be asked for name and WhatsApp so the doctor can
        reply.
      </LegalP>

      <LegalH2>4. When we share information</LegalH2>
      <LegalP>We may share information in these situations:</LegalP>
      <LegalUl>
        <li>
          <strong>With other users,</strong> as needed for the feature you used (for example an employer seeing your
          application/CV, or a seller receiving your enquiry)
        </li>
        <li>
          <strong>With service providers</strong> who help us run PakMed (hosting, email, OTP/SMS or WhatsApp providers,
          cloud storage, analytics) — under appropriate safeguards
        </li>
        <li>
          <strong>For legal or safety reasons,</strong> when required by law or to protect users from harm or abuse
        </li>
      </LegalUl>
      <LegalP>We do not sell your personal information as a product.</LegalP>

      <LegalH2>5. Public vs private content</LegalH2>
      <LegalUl>
        <li>News posts from PakMed admin are public.</li>
        <li>Doctor and facility directory entries are public when opted in / listed.</li>
        <li>Market listings you publish are public.</li>
        <li>Draft profiles stay private until you preview and save/publish as live.</li>
        <li>Saved items and private messages stay in your account tools.</li>
      </LegalUl>

      <LegalH2>6. Cookies and similar technologies</LegalH2>
      <LegalP>
        We may use cookies or similar technologies for sign-in sessions, preferences, and basic analytics. You can
        control cookies through your browser settings; some features may not work without them.
      </LegalP>

      <LegalH2>7. Data retention</LegalH2>
      <LegalP>
        We keep information for as long as your account is active or as needed to provide the service, meet legal
        obligations, resolve disputes, and enforce our Terms. You may request deletion of your account subject to
        residual legal or safety retention needs.
      </LegalP>

      <LegalH2>8. Security</LegalH2>
      <LegalP>
        We use reasonable technical and organisational measures to protect personal data. No online service is
        completely secure; please use a strong password and protect your devices.
      </LegalP>

      <LegalH2>9. Children’s privacy</LegalH2>
      <LegalP>
        PakMed is intended for adults using healthcare professional, employer, patient, or supplier features. We do not
        knowingly collect personal information from children for account creation.
      </LegalP>

      <LegalH2>10. Your choices</LegalH2>
      <LegalUl>
        <li>Update profile details and visibility settings in your account</li>
        <li>Choose whether to list on Find a Doctor or make a CV visible to employers</li>
        <li>Choose whether to show your phone number</li>
        <li>Report content that appears unsafe or abusive</li>
        <li>Contact us to ask about access, correction, or deletion of your data</li>
      </LegalUl>

      <LegalH2>11. Third-party services</LegalH2>
      <LegalP>
        Hosting, OTP, email, storage, and similar tools may be provided by third parties. Those providers process data
        only as needed to support PakMed. Their own terms and privacy notices may also apply.
      </LegalP>

      <LegalH2>12. Changes to this policy</LegalH2>
      <LegalP>
        We may update this Privacy Policy as the product evolves. The “Last updated” date will change when we do.
        Significant changes may be highlighted in the product or by email/WhatsApp where appropriate.
      </LegalP>

      <LegalH2>13. Contact</LegalH2>
      <LegalP>
        Privacy questions:{" "}
        <a href="mailto:support@pakmed.pk" style={{ color: "#0B57B7", fontWeight: 600 }}>
          support@pakmed.pk
        </a>
      </LegalP>
      <LegalP>
        Related:{" "}
        <a href="/terms" style={{ color: "#0B57B7", fontWeight: 600 }}>
          Terms of Use
        </a>
      </LegalP>

      <LegalNote>
        This policy matches how PakMed is designed to work (browse first, act later; OTP identity; phone privacy by
        default; opt-in directories). Review with legal counsel before a full public launch if required.
      </LegalNote>
    </LegalPageShell>
  );
}
