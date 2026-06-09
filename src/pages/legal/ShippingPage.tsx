// src/pages/legal/ShippingPage.tsx
import SEO from "@/components/SEO";
import LegalLayout, { LegalSection, LegalList } from "@/components/LegalLayout";

const ShippingPage = () => (
  <>
    <SEO
      title="Delivery Policy - TheVideoJanitors"
      description="Delivery Policy for TheVideoJanitors. How and when edited videos are delivered."
    />
    <LegalLayout title="Delivery Policy" lastUpdated="June 2026">
      <LegalSection title="Digital Service — No Physical Shipping">
        <p>
          TheVideoJanitors is a fully digital video-editing service. We do not ship
          any physical goods. All deliverables are provided electronically through
          your account dashboard.
        </p>
      </LegalSection>

      <LegalSection title="1. How Edits Are Delivered">
        <LegalList
          items={[
            "Completed edits are delivered digitally via your dashboard under the relevant request",
            "You receive an in-app notification and email when an edit is ready to review",
            "Final approved files can be streamed and downloaded from the request page",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Delivery Timeline">
        <LegalList
          items={[
            "Standard turnaround is 48 hours from the time an editor is matched to your request",
            "Each request includes up to 3 revision rounds; revisions extend the timeline accordingly",
            "Turnaround may vary with footage length, edit complexity, and queue load",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Access & Availability">
        <LegalList
          items={[
            "Delivered files remain accessible while your subscription is active",
            "Project files are retained for 90 days after request completion, then deleted",
            "Download your final files before the retention window ends",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Delivery Issues">
        <p>
          If a delivery is delayed beyond the agreed timeline or a file is inaccessible,
          contact{" "}
          <a
            href="mailto:support@thevideojanitor.com"
            className="text-primary hover:underline"
          >
            support@thevideojanitor.com
          </a>
          . Where a delivery fails due to a platform error, credits are returned per our{" "}
          <a href="/legal/refunds" className="text-primary hover:underline">
            Refund Policy
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  </>
);

export default ShippingPage;
