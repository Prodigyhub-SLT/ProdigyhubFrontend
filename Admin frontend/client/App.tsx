import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Index from "./pages/Index";
import CreateOrder from "./pages/CreateOrder";
import OrderDetail from "./pages/OrderDetail";
import NotFound from "./pages/NotFound";
import PublicOfferings from "./pages/PublicOfferings";
import UserDashboard from "./pages/UserDashboard";
import NewCustomerOnboarding from "./pages/NewCustomerOnboarding";
import DashboardRedirect from "./pages/DashboardRedirect";

// API Dashboard Pages
import ProductCatalogDashboard from "./pages/ProductCatalogDashboard";
import ProductOrderingDashboard from "./pages/ProductOrderingDashboard";
import ProductInventoryDashboard from "./pages/ProductInventoryDashboard";
import ProductQualificationDashboard from "./pages/ProductQualificationDashboard.tsx";
import EventManagementDashboard from "./pages/EventManagementDashboard";
import ProductConfigurationDashboard from "./pages/ProductConfigurationDashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary showDetails={process.env.NODE_ENV !== 'production'}>
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicOfferings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Dashboard Redirect Route */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } />
            
            {/* User Routes */}
            <Route path="/user/*" element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<UserDashboard />} />
                  {/* Add more user-specific routes here later */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            {/* New Customer Onboarding Route */}
            <Route path="/new-customer" element={
              <ProtectedRoute>
                <NewCustomerOnboarding />
              </ProtectedRoute>
            } />
            

            
            {/* Admin Routes with Layout */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Routes>
                    {/* Main Dashboard */}
                    <Route path="/" element={<Index />} />

                    {/* Enhanced Dashboard */}
                    <Route path="/enhanced" element={<EnhancedDashboard />} />
                    
                    {/* Order Management */}
                    <Route 
                      path="/orders/new" 
                      element={<CreateOrder />}
                    />
                    <Route 
                      path="/orders/:id" 
                      element={<OrderDetail />}
                    />
                    
                    {/* API Dashboard Routes with Permissions */}
                    <Route 
                      path="/catalog" 
                      element={<ProductCatalogDashboard />}
                    />
                    <Route 
                      path="/ordering" 
                      element={<ProductOrderingDashboard />}
                    />
                    <Route 
                      path="/inventory" 
                      element={<ProductInventoryDashboard />}
                    />
                    <Route 
                      path="/qualification" 
                      element={<ProductQualificationDashboard />}
                    />
                    <Route 
                      path="/events" 
                      element={<EventManagementDashboard />}
                    />
                    <Route
                      path="/configuration"
                      element={<ProductConfigurationDashboard />}
                    />

                    {/* Profile and Settings Routes */}
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/settings" element={<Settings />} />
                    
                    <Route path="/create-order" element={<CreateOrder />} />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
