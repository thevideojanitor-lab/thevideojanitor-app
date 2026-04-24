// src/pages/legal/CookiePage.tsx
import SEO from "@/components/SEO";
import LegalLayout, { LegalSection, LegalList } from "@/components/LegalLayout";

const CookiePage = () => (
  <>
    <SEO
      title="Cookie Policy - TheVideoJanitors"
      description="Cookie Policy for TheVideoJanitors. How we use cookies and tracking technologies."
    />
    <LegalLayout title="Cookie Policy" lastUpdated="January 2025">
      <LegalSection title="1. What Are Cookies">
        <p>
          Cookies are small text files placed on your device when you visit a website.
          They help us provide a working, personalised experience and understand how
          the platform is being used.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies We Use">
        <p>
          <strong className="text-foreground">Essential Cookies</strong>
        </p>
        <p>Required for the platform to function. Cannot be disabled.</p>
        <LegalList
          items={[
            "Authentication — keeps you logged in between sessions",
            "Session management — tracks your current session state",
            "Security tokens — prevents CSRF and other attacks",
          ]}
        />

        <p className="mt-4">
          <strong className="text-foreground">Functional Cookies</strong>
        </p>
        <p>Remember your preferences to improve your experience.</p>
        <LegalList
          items={[
            "Billing cycle preference (monthly/quarterly/annual)",
            "Dashboard view preferences",
            "Notification settings",
          ]}
        />

        <p className="mt-4">
          <strong className="text-foreground">Analytics Cookies</strong>
        </p>
        <p>
          Help us understand how the platform is used so we can improve it.
          Data is anonymised and aggregated.
        </p>
        <LegalList
          items={[
            "Pages visited and time spent",
            "Features used and click patterns",
            "Error and performance tracking",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Third-Party Cookies">
        <p>Some third-party services we use may set their own cookies:</p>
        <LegalList
          items={[
            "Stripe — payment processing and fraud prevention",
            "Google Analytics — anonymised usage analytics (if enabled)",
            "Intercom or similar — support chat functionality (if enabled)",
          ]}
        />
        <p>
          These cookies are governed by the respective third parties' privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="4. Managing Cookies">
        <p>You can control cookies in the following ways:</p>
        <LegalList
          items={[
            "Browser settings — most browsers allow you to block or delete cookies",
            "Opt-out tools — analytics providers offer opt-out mechanisms",
            "Contact us — we'll assist with any cookie-related requests",
          ]}
        />
        <p>
          Note: disabling essential cookies will prevent the platform from functioning
          correctly. You may not be able to log in or submit requests.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookie Duration">
        <LegalList
          items={[
            "Session cookies — deleted when you close your browser",
            "Authentication cookies — last up to 30 days (or until you log out)",
            "Preference cookies — last up to 1 year",
            "Analytics cookies — typically 90 days to 2 years depending on provider",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Updates to This Policy">
        <p>
          We may update this Cookie Policy as the platform evolves. Material changes
          will be communicated via platform notification or email.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Questions about cookies? Email{" "}
          <a
            href="mailto:privacy@thevideojanitors.com"
            className="text-primary hover:underline"
          >
            privacy@thevideojanitors.com
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  </>
);

export default CookiePage;