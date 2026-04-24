// src/pages/legal/RefundPage.tsx
import SEO from "@/components/SEO";
import LegalLayout, { LegalSection, LegalList } from "@/components/LegalLayout";

const RefundPage = () => (
  <>
    <SEO
      title="Refund Policy - TheVideoJanitors"
      description="Refund Policy for TheVideoJanitors. How credits, subscriptions, and refunds work."
    />
    <LegalLayout title="Refund Policy" lastUpdated="January 2025">
      <LegalSection title="Our Approach">
        <p>
          TheVideoJanitors operates on a credit-based subscription model. Because
          credits are issued immediately upon payment, our refund policy is designed
          to be fair while protecting the platform and our editors.
        </p>
      </LegalSection>

      <LegalSection title="1. Subscription Payments">
        <LegalList
          items={[
            "Subscription payments are non-refundable once credits have been issued",
            "This is standard for credit-based SaaS and subscription services",
            "If you cancel, your subscription remains active until the end of the billing period",
            "You will not be charged again after cancellation",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Credit Recharge Packs">
        <LegalList
          items={[
            "Credit recharge packs are non-refundable once purchased",
            "Credits do not expire while your subscription is active",
            "Credits expire at the end of the final billing period after cancellation",
            "Unused credits do not convert to cash under any circumstances",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. When Credits Are Returned">
        <p>
          We return credits (not cash) to your wallet in the following circumstances:
        </p>
        <LegalList
          items={[
            "Your editor fails to deliver within the agreed SLA and we cannot reassign",
            "A request fails due to a platform error on our side",
            "An editor submits work that completely ignores your brief (verified by admin review)",
            "A technical issue prevents your files from being accessible to the editor",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. When Refunds Are Considered">
        <p>
          Cash refunds are considered only in exceptional circumstances and at our
          sole discretion:
        </p>
        <LegalList
          items={[
            "Duplicate charges due to a billing error",
            "Charges made after a confirmed cancellation",
            "Platform outages exceeding 72 hours that prevent service delivery",
          ]}
        />
        <p>
          To request a refund review, contact{" "}
          <a
            href="mailto:billing@thevideojanitors.com"
            className="text-primary hover:underline"
          >
            billing@thevideojanitors.com
          </a>{" "}
          within 7 days of the charge.
        </p>
      </LegalSection>

      <LegalSection title="5. What Is Not Refundable">
        <LegalList
          items={[
            "Subscription fees for periods already used",
            "Credits spent on completed or delivered requests",
            "Credits used on requests where revisions were provided",
            "Payments where the client changed their mind after submission",
            "Credits requested after 30 days from the original transaction",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Dispute Resolution">
        <p>
          If you're unhappy with a delivered edit, the correct path is:
        </p>
        <LegalList
          items={[
            "Use your included revision rounds first",
            "Request an editor swap if the issue is performance-based",
            "Contact support if you believe a service failure occurred",
            "Allow us to investigate before initiating a chargeback",
          ]}
        />
        <p>
          Initiating a chargeback without first contacting support may result in
          account suspension while the dispute is reviewed.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          For billing questions, email{" "}
          <a
            href="mailto:billing@thevideojanitors.com"
            className="text-primary hover:underline"
          >
            billing@thevideojanitors.com
          </a>
          . We respond within 24 hours.
        </p>
      </LegalSection>
    </LegalLayout>
  </>
);

export default RefundPage;