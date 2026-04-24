// src/pages/legal/PrivacyPage.tsx
import SEO from "@/components/SEO";
import LegalLayout, { LegalSection, LegalList } from "@/components/LegalLayout";

const PrivacyPage = () => (
  <>
    <SEO
      title="Privacy Policy - TheVideoJanitors"
      description="Privacy Policy for TheVideoJanitors. How we collect, use, and protect your data."
    />
    <LegalLayout title="Privacy Policy" lastUpdated="January 2025">
      <LegalSection title="1. Information We Collect">
        <p>We collect information you provide directly:</p>
        <LegalList
          items={[
            "Name, email address, and account credentials",
            "Payment information (processed securely via Stripe — we do not store card data)",
            "Brand details, uploaded footage, and briefs submitted via the platform",
            "Communication with editors and support team",
            "Profile information including timezone, preferences, and notification settings",
          ]}
        />
        <p>We also collect automatically:</p>
        <LegalList
          items={[
            "Usage data: pages visited, features used, time on platform",
            "Device and browser information",
            "IP address and approximate location",
            "Cookies and similar tracking technologies",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <LegalList
          items={[
            "To provide, operate, and improve the Service",
            "To process payments and manage subscriptions",
            "To match clients with appropriate editors",
            "To communicate about your account, requests, and updates",
            "To monitor platform quality and resolve disputes",
            "To send service-related notifications (not marketing without consent)",
            "To comply with legal obligations",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Data Sharing">
        <p>We do not sell your personal data. We share data only with:</p>
        <LegalList
          items={[
            "Editors assigned to your requests (limited to job-relevant information)",
            "Payment processors (Stripe) for billing",
            "Analytics providers (anonymised and aggregated)",
            "Legal authorities when required by law",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Data Retention">
        <p>
          We retain your account data for as long as your account is active or as
          required by law. Uploaded footage and project files are retained for 90 days
          after request completion, then deleted unless you request earlier deletion.
        </p>
      </LegalSection>

      <LegalSection title="5. Your Rights">
        <p>You have the right to:</p>
        <LegalList
          items={[
            "Access the personal data we hold about you",
            "Request correction of inaccurate data",
            "Request deletion of your data (subject to legal obligations)",
            "Opt out of marketing communications at any time",
            "Data portability — request your data in a common format",
          ]}
        />
        <p>
          To exercise these rights, email{" "}
          <a
            href="mailto:privacy@thevideojanitors.com"
            className="text-primary hover:underline"
          >
            privacy@thevideojanitors.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>
          We implement industry-standard security measures including encryption in
          transit (TLS), secure payment processing via Stripe, and access controls.
          No method of transmission is 100% secure — we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          We use cookies for authentication, preferences, and analytics. See our{" "}
          <a href="/legal/cookies" className="text-primary hover:underline">
            Cookie Policy
          </a>{" "}
          for full details.
        </p>
      </LegalSection>

      <LegalSection title="8. Children">
        <p>
          The Service is not directed to children under 16. We do not knowingly
          collect data from children. If you believe a child has provided us with
          personal data, contact us immediately.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update this policy periodically. We'll notify you of material
          changes via email or platform notification. Continued use after changes
          constitutes acceptance.
        </p>
      </LegalSection>
    </LegalLayout>
  </>
);

export default PrivacyPage;