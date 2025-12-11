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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Admin Login - PUBLIC */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Admin Routes - PROTECTED */}
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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
