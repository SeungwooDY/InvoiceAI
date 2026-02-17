"use client";

import { Toaster } from "../components/ui/toaster";
import { Toaster as Sonner } from "../components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";

// Pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Invoices from "../pages/Invoices";
import InvoiceDetail from "../pages/InvoiceDetail";
import Payables from "../pages/Payables";
import PaymentRuns from "../pages/PaymentRuns";
import PaymentRunDetail from "../pages/PaymentRunDetail";
import CreatePaymentRun from "../pages/CreatePaymentRun";
import PaymentProjection from "../pages/PaymentProjection";
import Approvals from "../pages/Approvals";
import Vendors from "../pages/Vendors";
import VendorDetail from "../pages/VendorDetail";
import Reconciliation from "../pages/Reconciliation";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Onboarding from "../pages/Onboarding";
import NotFound from "../pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if user has no organization
  if (user && !user.organizationId) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Determine where to send an authenticated user from /login
  const authenticatedRedirect = user?.organizationId
    ? "/app/dashboard"
    : "/onboarding";

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={isLoading ? null : isAuthenticated ? <Navigate to={authenticatedRedirect} replace /> : <Login />}
      />
      <Route
        path="/onboarding"
        element={isLoading ? null : !isAuthenticated ? <Navigate to="/login" replace /> : <Onboarding />}
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="payables" element={<Payables />} />
        <Route path="payables/create-payment-run" element={<CreatePaymentRun />} />
        <Route path="payment-runs" element={<PaymentRuns />} />
        <Route path="payment-runs/:id" element={<PaymentRunDetail />} />
        <Route path="payment-projection" element={<PaymentProjection />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/:id" element={<VendorDetail />} />
        <Route path="reconciliation" element={<Reconciliation />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <SessionProvider>
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
  </SessionProvider>
);

export default App;
