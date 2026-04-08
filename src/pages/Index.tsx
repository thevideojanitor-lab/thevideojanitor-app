import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AgencyPainPoints from "@/components/AgencyPainPoints";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <AgencyPainPoints />
      <HowItWorks />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
      <Footer />
    </div>
  );
};

export default Index;
