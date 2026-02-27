import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Dreams from "./pages/Dreams";
import Mentor from "./pages/Mentor";
import Premium from "./pages/Premium";
import Profile from "./pages/Profile";
import KarmicMatch from "./pages/KarmicMatch";
import SoulChambers from "./pages/SoulChambers";
import NotFound from "./pages/NotFound";
import WhoAmI from "./pages/WhoAmI";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Synastry from "./pages/Synastry";
import OnboardingGuide from "./pages/OnboardingGuide";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
    <Route path="/guide" element={<ProtectedRoute><OnboardingGuide /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/dreams" element={<ProtectedRoute><Dreams /></ProtectedRoute>} />
    <Route path="/mentor" element={<ProtectedRoute><Mentor /></ProtectedRoute>} />
    <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
    <Route path="/karmic-match" element={<ProtectedRoute><KarmicMatch /></ProtectedRoute>} />
    <Route path="/chambers" element={<ProtectedRoute><SoulChambers /></ProtectedRoute>} />
    <Route path="/whoami" element={<ProtectedRoute><WhoAmI /></ProtectedRoute>} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/synastry" element={<ProtectedRoute><Synastry /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
