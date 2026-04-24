// src/pages/legal/TermsPage.tsx
import SEO from "@/components/SEO";
import LegalLayout, { LegalSection, LegalList } from "@/components/LegalLayout";

const TermsPage = () => (
  <>
    <SEO
      title="Terms of Service - TheVideoJanitors"
      description="Terms of Service for TheVideoJanitors. Read our terms before using the platform."
    />
    <LegalLayout title="Terms of Service" lastUpdated="January 2025">
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using TheVideoJanitors platform ("Service"), you agree to be
          bound by these Terms of Service. If you do not agree, do not use the Service.
        </p>
        <p>
          These terms apply to all users including clients, editors, and visitors.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <p>
          TheVideoJanitors is a managed short-form video editing platform that connects
          clients with vetted video editors. Clients purchase credit-based subscription
          plans and submit editing requests. Editors are assigned to fulfil requests
          based on skills, availability, and style matching.
        </p>
      </LegalSection>

      <LegalSection title="3. Account Registration">
        <p>You must create an account to use the Service. You agree to:</p>
        <LegalList
          items={[
            "Provide accurate, current, and complete information",
            "Maintain the security of your login credentials",
            "Notify us immediately of any unauthorised account access",
            "Accept responsibility for all activity under your account",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Credits and Subscriptions">
        <LegalList
          items={[
            "Credits are the internal currency of TheVideoJanitors",
            "Credits are issued upon successful subscription payment",
            "Subscription payments are non-refundable once credits have been issued",
            "Unused credits roll over while your subscription remains active",
            "Credits do not convert to cash and have no monetary value outside the platform",
            "Credit recharge packs are non-refundable once purchased",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Acceptable Use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            "Upload content that is illegal, harmful, or infringes third-party rights",
            "Attempt to contact editors or clients outside the platform",
            "Abuse the revision or swap policy",
            "Use the platform to facilitate competing services",
            "Submit fraudulent requests or chargebacks without legitimate reason",
            "Share your account credentials with others",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Editor Relationships">
        <p>
          Editors on the platform are independent contractors, not employees of
          TheVideoJanitors. We act as an intermediary and quality controller.
          Clients agree not to solicit or hire editors directly outside the platform
          during their subscription and for 12 months after termination.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <p>
          Upon completion and payment of a request, clients own the final delivered
          video content. Raw footage uploaded by clients remains their property at all times.
          TheVideoJanitors retains the right to use anonymised examples for portfolio
          and marketing purposes unless you opt out in writing.
        </p>
      </LegalSection>

      <LegalSection title="8. Cancellation">
        <LegalList
          items={[
            "You may cancel your subscription at any time before the next renewal date",
            "Cancellation stops future billing — no refund on the current period",
            "Access and credits remain available until the end of the current billing period",
            "Credits expire at the end of the final billing period after cancellation",
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <p>
          TheVideoJanitors is not liable for indirect, incidental, or consequential
          damages arising from use of the Service. Our total liability is limited to
          the amount paid by you in the 30 days preceding the claim.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to Terms">
        <p>
          We reserve the right to modify these terms at any time. Continued use of
          the Service after changes constitutes acceptance. We will notify users of
          material changes via email or platform notification.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these terms? Email us at{" "}
          <a
            href="mailto:legal@thevideojanitors.com"
            className="text-primary hover:underline"
          >
            legal@thevideojanitors.com
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  </>
);

export default TermsPage;