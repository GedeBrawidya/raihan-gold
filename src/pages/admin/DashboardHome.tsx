import React, { useEffect, useState } from "react";
import { useSupabase, getGoldCategories, getSellPricesByCategory, getBuybackPricesByCategory } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatting";
import { DollarSign, Coins, Package } from "lucide-react";

interface DashboardData {
  sellPrice: number | null;
  buybackPrice: number | null;
  productCount: number;
}

export const DashboardHome: React.FC = () => {
  const { supabase } = useSupabase();
  const [data, setData] = useState<DashboardData>({
    sellPrice: null,
    buybackPrice: null,
    productCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and get latest category prices
      const categories = await getGoldCategories(supabase);
      let sellPrice = null;
      let buybackPrice = null;
      
      if (categories.length > 0) {
        const latestCategory = categories[0];
        const [sellPrices, buybackPrices] = await Promise.all([
          getSellPricesByCategory(supabase, latestCategory.id),
          getBuybackPricesByCategory(supabase, latestCategory.id),
        ]);
        
        // Get price for 1g as reference
        const sell1g = sellPrices.find((p) => p.weight === 1);
        const buyback1g = buybackPrices.find((p) => p.weight === 1);
        
        if (sell1g) sellPrice = sell1g.price;
        if (buyback1g) buybackPrice = buyback1g.price;
      }
      
      // Fetch product count
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      setData({
        sellPrice,
        buybackPrice,
        productCount: productCount || 0,
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">{currentDate}</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 rounded-lg p-8 border border-slate-800 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Harga Jual */}
          <div className="bg-slate-900 rounded-lg p-8 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">
                Harga Jual
              </p>
              <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="text-4xl font-semibold text-[#D4AF37]">
              {data.sellPrice ? formatCurrency(data.sellPrice) : "—"}
            </p>
            <p className="text-slate-500 text-xs mt-4">per gram</p>
          </div>

          {/* Card 2: Harga Buyback */}
          <div className="bg-slate-900 rounded-lg p-8 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">
                Harga Buyback
              </p>
              <Coins className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-4xl font-semibold text-gray-100">
              {data.buybackPrice ? formatCurrency(data.buybackPrice) : "—"}
            </p>
            <p className="text-slate-500 text-xs mt-4">per gram</p>
          </div>

          {/* Card 3: Total Katalog */}
          <div className="bg-slate-900 rounded-lg p-8 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">
                Total Katalog
              </p>
              <Package className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="text-4xl font-semibold text-gray-100">
              {data.productCount}
            </p>
            <p className="text-slate-500 text-xs mt-4">
              {data.productCount === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
