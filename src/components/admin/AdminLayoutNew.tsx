import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { 
  Menu, 
  X, 
  LogOut, 
  Home, 
  Package, 
  DollarSign, 
  MessageSquare // 👈 1. SAYA TAMBAHKAN IMPORT ICON INI
} from "lucide-react";

interface NavLink {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navLinks: NavLink[] = [
  { label: "Dashboard", icon: <Home size={20} />, path: "/admin/dashboard" },
  { label: "Gold Prices", icon: <DollarSign size={20} />, path: "/admin/gold-prices" },
  { label: "Products", icon: <Package size={20} />, path: "/admin/products" },
  // 👇 2. SAYA TAMBAHKAN MENU REVIEWS DI SINI
  { label: "Reviews", icon: <MessageSquare size={20} />, path: "/admin/reviews" }, 
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 z-50 lg:z-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Raihan Admin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Emas Management
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(link.path)
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Logged in as</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.email || "Admin"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex-1 ml-4 lg:ml-0">
            {navLinks.find((l) => isActive(l.path))?.label || "Admin"}
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;