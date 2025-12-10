import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, Box, Settings, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const GOLD = "#D4AF37";

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex gap-3 items-center px-4 py-2 rounded-lg text-sm transition-all ${
        isActive
          ? "bg-gold/20 text-gold font-semibold border-l-2 border-gold"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`
    }
  >
    <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
    <span>{children}</span>
  </NavLink>
);

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  const navLinks = [
    { to: "/admin", icon: <Home size={18} />, label: "Dashboard" },
    { to: "/admin/products", icon: <Box size={18} />, label: "Products" },
    { to: "/admin/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-slate-800 border-r border-slate-700 flex flex-col gap-6 p-4 transition-transform duration-300 z-40 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <Link
          to="/admin"
          className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-10 h-10 rounded-lg font-bold text-slate-900 flex items-center justify-center"
            style={{ background: GOLD }}
          >
            RG
          </div>
          <div>
            <div className="text-lg font-semibold text-white">Raihan Gold</div>
            <div className="text-xs text-slate-400">Admin Panel</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2">
          {navLinks.map((link) => (
            <SidebarLink key={link.to} to={link.to} icon={link.icon}>
              {link.label}
            </SidebarLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="space-y-3 border-t border-slate-700 pt-3">
          <div className="px-4 py-2 text-sm text-slate-400">
            Logged in as: <span className="text-white font-medium">{user?.email || "Admin"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-200 hover:bg-red-600/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Mobile close button */}
        <button className="md:hidden absolute top-4 right-4 text-slate-300" onClick={() => setMobileOpen(false)}>
          <X size={24} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-white">Admin Dashboard</h1>
          </div>
          <div className="text-sm text-slate-400">Welcome, {user?.email?.split("@")[0] || "Admin"}</div>
        </header>

        {/* Mobile overlay */}
        {mobileOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={() => setMobileOpen(false)} />}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
