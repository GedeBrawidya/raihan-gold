import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
  { label: "Products", icon: <Package size={20} />, path: "/admin/products" },
  { label: "Analytics", icon: <BarChart3 size={20} />, path: "/admin/analytics" },
  { label: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
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
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border-r border-white/30 backdrop-blur-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
            R
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Raihan
            </h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/40 hover:backdrop-blur-md"
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
                  className="w-1 h-6 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-md border border-white/20">
          <p className="text-xs text-gray-600 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user?.email || "Admin"}
          </p>
        </div>
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50/50 hover:bg-red-100 text-red-600 transition-all duration-200 border border-red-200/30"
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
