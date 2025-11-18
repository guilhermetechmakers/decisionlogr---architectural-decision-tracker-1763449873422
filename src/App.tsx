import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import CreateDecisionPage from "@/pages/CreateDecisionPage";
import DecisionDetailPage from "@/pages/DecisionDetailPage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import ProfilePage from "@/pages/ProfilePage";
import HelpPage from "@/pages/HelpPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ServerErrorPage from "@/pages/ServerErrorPage";
import ClientViewPage from "@/pages/ClientViewPage";
import SearchPage from "@/pages/SearchPage";
import { ConsentBannerWrapper } from "@/components/cookies/ConsentBannerWrapper";
import { TosUpdateWrapper } from "@/components/terms/TosUpdateWrapper";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/decisions/new" element={<CreateDecisionPage />} />
          <Route path="/decisions/:id" element={<DecisionDetailPage />} />
          <Route path="/share/:token" element={<ClientViewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ConsentBannerWrapper />
        <TosUpdateWrapper />
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
