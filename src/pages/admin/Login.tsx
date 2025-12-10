import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await auth.login(email.trim(), password);
    setLoading(false);
    if (res.ok) {
      toast({ title: "Signed in", description: "Welcome back" });
      navigate("/admin", { replace: true });
    } else {
      const message = res.error?.message || "Invalid email or password";
      toast({ title: "Sign in failed", description: message });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700 text-white"
      >
        <h2 className="text-2xl font-semibold mb-4 text-gold">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/90">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/30"
              placeholder="you@domain.com"
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/90">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/30"
              placeholder="gold"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#b38f2e] text-slate-900 font-semibold shadow-md" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-white/70">Use Supabase account (email/password). Example admin email: <strong className="text-white">gedepujaa9@gmail.com</strong></div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
