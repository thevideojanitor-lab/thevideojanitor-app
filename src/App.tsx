import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute, { PublicOnlyRoute } from "@/components/ProtectedRoute";

// Public Pages — NOT lazy (fast first paint for landing)
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

// Auth Pages
import AuthCallback from "@/pages/auth/AuthCallback";
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));

// Client Onboarding
const OnboardingLayout = lazy(() => import("@/pages/onboarding/OnboardingLayout"));
const BrandKitStep = lazy(() => import("@/pages/onboarding/BrandKitStep"));
const StyleStep = lazy(() => import("@/pages/onboarding/StyleStep"));
const PreferencesStep = lazy(() => import("@/pages/onboarding/PreferencesStep"));

// Editor Onboarding
const EditorOnboardingLayout = lazy(() => import("@/pages/editor/onboarding/EditorOnboardingLayout"));
const EditorProfileStep = lazy(() => import("@/pages/editor/onboarding/ProfileStep"));
const EditorSpecialtiesStep = lazy(() => import("@/pages/editor/onboarding/SpecialtiesStep"));
const EditorLaunchStep = lazy(() => import("@/pages/editor/onboarding/LaunchStep"));

// Layouts (lazy — only loaded when user is authenticated)
const DashboardLayout = lazy(() => import("@/layouts/DashboardLayout"));
const EditorLayout = lazy(() => import("@/layouts/EditorLayout"));
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));

// Dashboard Pages
const DashboardHome = lazy(() => import("@/pages/dashboard/DashboardHome"));
const SubmitPage = lazy(() => import("@/pages/dashboard/SubmitPage"));
const SubscriptionPage = lazy(() => import("@/pages/dashboard/SubscriptionPage"));
const ReviewPage = lazy(() => import("@/pages/dashboard/ReviewPage"));

// Editor Pages
const EditorHome          = lazy(() => import("@/pages/editor/EditorHome"))
const EditorPayouts       = lazy(() => import("@/pages/editor/EditorPayouts"))
const EditorPayoutsConnect = lazy(() => import("@/pages/editor/EditorPayoutsConnect"))
const EditorBankSetup     = lazy(() => import("@/pages/editor/EditorBankSetup"))

// Dashboard extras
const HelpPage = lazy(() => import("@/pages/dashboard/HelpPage"));

// Admin Pages
const AdminHome      = lazy(() => import("@/pages/admin/AdminHome"));
const AdminRequests  = lazy(() => import("@/pages/admin/AdminRequests"));
const AdminClients   = lazy(() => import("@/pages/admin/AdminClients"));
const AdminEditors   = lazy(() => import("@/pages/admin/AdminEditors"));
const AdminPayouts   = lazy(() => import("@/pages/admin/AdminPayouts"));
const AdminMatching  = lazy(() => import("@/pages/admin/AdminMatching"));
const AdminSettings  = lazy(() => import("@/pages/admin/AdminSettings"));

function AppSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FF5F15] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

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
          {/* ── Public landing pages — DO NOT MODIFY visuals ── */}
          <Route path="/" element={<Index />} />
          <Route path="/for-editors" element={<ForEditors />} />
          <Route path="/for-agencies" element={<ForAgencies />} />
          <Route path="/for-creators" element={<ForCreators />} />
          <Route path="/for-brands" element={<ForBrands />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/editors" element={<EditorsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/legal/refunds" element={<RefundPage />} />
          <Route path="/legal/cookies" element={<CookiePage />} />

          {/* ── Auth routes (public-only: redirect if already authed) ── */}
          <Route
            path="/auth/login"
            element={
              <PublicOnlyRoute>
                <AppSuspense>
                  <LoginPage />
                </AppSuspense>
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <PublicOnlyRoute>
                <AppSuspense>
                  <SignupPage />
                </AppSuspense>
              </PublicOnlyRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* ── Onboarding (client only, onboarding_complete=false) ── */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireRole="client" requireOnboarding>
                <AppSuspense>
                  <OnboardingLayout />
                </AppSuspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/onboarding/brand-kit" replace />} />
            <Route path="brand-kit" element={<AppSuspense><BrandKitStep /></AppSuspense>} />
            <Route path="style" element={<AppSuspense><StyleStep /></AppSuspense>} />
            <Route path="preferences" element={<AppSuspense><PreferencesStep /></AppSuspense>} />
          </Route>

          {/* ── Client dashboard ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole="client">
                <AppSuspense>
                  <DashboardLayout />
                </AppSuspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<AppSuspense><DashboardHome /></AppSuspense>} />
            <Route path="requests" element={<AppSuspense><DashboardHome /></AppSuspense>} />
            <Route path="requests/:requestId" element={<AppSuspense><ReviewPage /></AppSuspense>} />
            <Route path="review/:requestId" element={<AppSuspense><ReviewPage /></AppSuspense>} />
            <Route path="submit" element={<AppSuspense><SubmitPage /></AppSuspense>} />
            <Route path="subscription" element={<AppSuspense><SubscriptionPage /></AppSuspense>} />
            <Route path="help" element={<AppSuspense><HelpPage /></AppSuspense>} />
          </Route>

          {/* ── Editor onboarding (no editor_profile yet) ── */}
          <Route
            path="/editor/onboarding"
            element={
              <ProtectedRoute requireRole="editor" requireOnboarding>
                <AppSuspense>
                  <EditorOnboardingLayout />
                </AppSuspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/editor/onboarding/profile" replace />} />
            <Route path="profile"     element={<AppSuspense><EditorProfileStep /></AppSuspense>} />
            <Route path="specialties" element={<AppSuspense><EditorSpecialtiesStep /></AppSuspense>} />
            <Route path="launch"      element={<AppSuspense><EditorLaunchStep /></AppSuspense>} />
          </Route>

          {/* ── Editor dashboard ── */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute requireRole="editor">
                <AppSuspense>
                  <EditorLayout />
                </AppSuspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<AppSuspense><EditorHome /></AppSuspense>} />
            <Route path="queue" element={<AppSuspense><EditorHome /></AppSuspense>} />
            <Route path="completed" element={<AppSuspense><EditorHome /></AppSuspense>} />
            <Route path="earnings" element={<AppSuspense><EditorPayouts /></AppSuspense>} />
            <Route path="payouts" element={<AppSuspense><EditorPayouts /></AppSuspense>} />
            <Route path="payouts/connect" element={<AppSuspense><EditorPayoutsConnect /></AppSuspense>} />
            <Route path="payouts/bank-setup" element={<AppSuspense><EditorBankSetup /></AppSuspense>} />
            <Route path="help" element={<AppSuspense><EditorHome /></AppSuspense>} />
          </Route>

          {/* ── Admin panel ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AppSuspense>
                  <AdminLayout />
                </AppSuspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<AppSuspense><AdminHome /></AppSuspense>} />
            <Route path="requests" element={<AppSuspense><AdminRequests /></AppSuspense>} />
            <Route path="clients"  element={<AppSuspense><AdminClients /></AppSuspense>} />
            <Route path="editors"  element={<AppSuspense><AdminEditors /></AppSuspense>} />
            <Route path="payouts"  element={<AppSuspense><AdminPayouts /></AppSuspense>} />
            <Route path="matching" element={<AppSuspense><AdminMatching /></AppSuspense>} />
            <Route path="settings" element={<AppSuspense><AdminSettings /></AppSuspense>} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </HelmetProvider>
  );
}

export default App;
