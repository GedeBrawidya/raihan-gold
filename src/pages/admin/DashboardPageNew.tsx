import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import { getBaseGoldPrice, getProducts, BaseGoldPrice } from "@/lib/supabase";
import { DollarSign, Package } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { supabase } = useSupabase();
  const [stats, setStats] = useState({
    goldPrice: null as BaseGoldPrice | null,
    products: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const priceData = await getBaseGoldPrice(supabase);
      const products = await getProducts(supabase);
      setStats({
        goldPrice: priceData,
        products: products.length,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Selamat datang di admin panel Raihan Gold
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gold Sell Price Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Harga Jual (Per Gram)
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.goldPrice ? formatCurrency(stats.goldPrice.sell_price_per_gram) : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Updated: {stats.goldPrice ? new Date(stats.goldPrice.updated_at).toLocaleDateString("id-ID") : "—"}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Products
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.products}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DashboardPage;
