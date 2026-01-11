import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLoginPage } from "./pages/admin/Login";
import { AdminLayout } from "./components/admin/AdminLayoutNew";
import { DashboardHome } from "./pages/admin/DashboardHome";
import { GoldPricesPage } from "./pages/admin/GoldPricesPage";
import { ProductsPage } from "./pages/admin/ProductsPage";
import { ReviewManager } from "./pages/admin/ReviewManager";
import { ScrollReveal } from "./components/ui/ScrollReveal";
import { useSupabaseKeepAlive } from "@/hooks/useSupabaseKeepAlive";

const queryClient = new QueryClient();

// Component untuk keep-alive Supabase
const SupabaseKeepAlive = () => {
  useSupabaseKeepAlive();
  return null; // Component ini tidak render apapun
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SupabaseKeepAlive />
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Index />} />
            
            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="gold-prices" element={<GoldPricesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="reviews" element={<ReviewManager />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;