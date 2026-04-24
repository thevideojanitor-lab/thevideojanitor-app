// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";

// Public Pages
import Index from "@/pages/Index";
import ForEditors from "@/pages/ForEditors";
import ForAgencies from "@/pages/ForAgencies";
import ForCreators from "@/pages/ForCreators";
import ForBrands from "@/pages/ForBrands";
import HowItWorksPage from "@/pages/HowItWorksPage";
import PricingPage from "@/pages/PricingPage";
import ShowcasePage from "@/pages/ShowcasePage";
import AboutPage from "@/pages/AboutPage";
import FaqPage from "@/pages/FaqPage";
import ContactPage from "@/pages/ContactPage";
import EditorsPage from "@/pages/EditorsPage";
import NotFound from "@/pages/NotFound";

// Legal Pages
import TermsPage from "@/pages/legal/TermsPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import RefundPage from "@/pages/legal/RefundPage";
import CookiePage from "@/pages/legal/CookiePage";

function App() {
  return (
    <HelmetProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Main */}
          <Route path="/" element={<Index />} />

          {/* Solutions */}
          <Route path="/for-editors" element={<ForEditors />} />
          <Route path="/for-agencies" element={<ForAgencies />} />
          <Route path="/for-creators" element={<ForCreators />} />
          <Route path="/for-brands" element={<ForBrands />} />

          {/* Platform */}
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/editors" element={<EditorsPage />} />

          {/* Company */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Legal */}
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/legal/refunds" element={<RefundPage />} />
          <Route path="/legal/cookies" element={<CookiePage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </HelmetProvider>
  );
}

export default App;
