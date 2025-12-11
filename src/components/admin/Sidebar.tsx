import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
  { label: "Gold Prices", icon: <DollarSign size={20} />, path: "/admin/gold-prices" },
  { label: "Products", icon: <Package size={20} />, path: "/admin/products" },
  { label: "Reviews", icon: <MessageSquare size={20} />, path: "/admin/reviews" },
];

export const Sidebar: React.FC<{ mobile?: boolean; onClose?: () => void }> = ({
  mobile = false,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (mobile && onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 border-r border-gold/10">
      {/* Logo Section */}
      <div className="p-6 border-b border-gold/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-slate-900 font-bold shadow-lg">
            R
          </div>
          <div>
            <h1 className="text-lg font-bold text-gold font-serif">
              Raihan Gold
            </h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path === "/admin" && location.pathname === "/admin/dashboard");
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gold text-slate-900 shadow-lg"
                  : "text-slate-300 hover:text-gold hover:bg-slate-800/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1 text-left font-medium text-sm">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1.5 h-6 bg-slate-900 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gold/10 space-y-3">
        <div className="px-4 py-3 rounded-lg bg-slate-800 border border-gold/20">
          <p className="text-xs text-slate-400 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-gold truncate">
            {user?.email || "Admin"}
          </p>
        </div>
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-all duration-200 border border-red-800/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </motion.button>
      </div>
    </div>
  );
};

export const SidebarToggle: React.FC<{
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}> = ({ isOpen, onToggle }) => {
  return (
    <motion.button
      onClick={() => onToggle(!isOpen)}
      className="p-2 rounded-xl hover:bg-white/30 backdrop-blur-md transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </motion.button>
  );
};
