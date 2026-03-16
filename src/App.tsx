import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
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
import Insight from "./pages/Insight";
import Meditation from "./pages/Meditation";
import AstroEdu from "./pages/AstroEdu";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={
          <motion.div key="auth" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Auth />
          </motion.div>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={
          <motion.div key="onboarding" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Onboarding /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/guide" element={
          <motion.div key="guide" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><OnboardingGuide /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/insight" element={
          <motion.div key="insight" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Insight /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/meditation" element={
          <motion.div key="meditation" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Meditation /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/edu" element={
          <motion.div key="edu" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><AstroEdu /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/dashboard" element={
          <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/dreams" element={
          <motion.div key="dreams" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Dreams /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/mentor" element={
          <motion.div key="mentor" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Mentor /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/premium" element={
          <motion.div key="premium" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Premium /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/karmic-match" element={
          <motion.div key="karmic-match" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><KarmicMatch /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/chambers" element={
          <motion.div key="chambers" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><SoulChambers /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/whoami" element={
          <motion.div key="whoami" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><WhoAmI /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/privacy" element={
          <motion.div key="privacy" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Privacy />
          </motion.div>
        } />
        <Route path="/terms" element={
          <motion.div key="terms" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Terms />
          </motion.div>
        } />
        <Route path="/synastry" element={
          <motion.div key="synastry" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Synastry /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="/profile" element={
          <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProtectedRoute><Profile /></ProtectedRoute>
          </motion.div>
        } />
        <Route path="*" element={
          <motion.div key="notfound" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <NotFound />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
