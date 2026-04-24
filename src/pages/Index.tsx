import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import ShowcaseSection from "@/components/ShowcaseSection";
import WhyUsSection from "@/components/WhyUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import FinalCta from "@/components/FinalCta";
import EditorTrustSection from "@/components/EditorTrustSection";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <>
      <SEO
        title="TheVideoJanitors - Managed Short-Form Video Editing"
        description="Buy credits. Submit requests. Get matched with vetted editors. Polished reels back in 48 hours. No freelancer mess."
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <HeroSection />
        <HowItWorks />
        <EditorTrustSection />
        <PricingSection />
        <ShowcaseSection />
        <WhyUsSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCta />
        <Footer />
      </div>
    </>
  );
};

export default Index;
