import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSupabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { supabase } = useSupabase();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // If session exists and has user, user is authenticated
        if (data?.session?.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Unexpected error during session check:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [supabase]);

  // Loading state - show spinner while checking session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto mb-4" />
          <p className="text-slate-400">Mengecek akses...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated - render children
  return children;
};

export default ProtectedRoute;
