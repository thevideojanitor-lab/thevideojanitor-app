import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CreatorPainPoints from "@/components/CreatorPainPoints";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import ShowcaseSection from "@/components/ShowcaseSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <CreatorPainPoints />
      <HowItWorks />
      <PricingSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
      <Footer />
    </div>
  );
};

export default Index;
