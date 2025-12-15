import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import { 
  getGoldCategories, 
  getSellPricesByCategory, 
  getBuybackPricesByCategory 
} from "@/lib/supabase";
import { TrendingUp, TrendingDown, Package, Calendar, DollarSign, Activity } from "lucide-react";

interface DashboardStats {
  sellPrice1g: number | null;
  buybackPrice1g: number | null;
  productCount: number;
  categoryName: string;
}

export const DashboardHome: React.FC = () => {
  const { supabase } = useSupabase();
  const [stats, setStats] = useState<DashboardStats>({
    sellPrice1g: null,
    buybackPrice1g: null,
    productCount: 0,
    categoryName: "-",
  });
  const [loading, setLoading] = useState(true);

  // Format Tanggal: "Senin, 15 Desember 2025"
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // 1. Ambil Kategori Terbaru (Biasanya ID paling besar atau Created At terbaru)
      // Kita ambil array[0] dari getGoldCategories karena biasanya sudah di-sort desc
      const categories = await getGoldCategories(supabase);
      
      let sellPrice1g = null;
      let buybackPrice1g = null;
      let categoryName = "-";
      
      if (categories.length > 0) {
        const latestCategory = categories[0];
        categoryName = latestCategory.name;
        
        // 2. Ambil Harga berdasarkan Kategori Terbaru
        const [sellPrices, buybackPrices] = await Promise.all([
          getSellPricesByCategory(supabase, latestCategory.id),
          getBuybackPricesByCategory(supabase, latestCategory.id),
        ]);

        // Cari harga berat 1 gram sebagai patokan dashboard
        const sell1g = sellPrices.find((p) => p.weight === 1);
        const buyback1g = buybackPrices.find((p) => p.weight === 1);

        if (sell1g) sellPrice1g = sell1g.price;
        if (buyback1g) buybackPrice1g = buyback1g.price;
      }
      
      // 3. Hitung Total Produk (Pakai count 'exact' biar ringan, ga perlu download datanya)
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      setStats({
        sellPrice1g,
        buybackPrice1g,
        productCount: count || 0,
        categoryName,
      });

    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
         <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Ringkasan performa toko dan harga emas hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          {today}
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: HARGA JUAL (Highlight) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          {/* Background Decoration */}
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={100} className="text-[#D4AF37]" />
          </div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-[#D4AF37]/10 rounded-xl">
              <DollarSign className="text-[#D4AF37]" size={24} />
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
              LIVE
            </span>
          </div>
          
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Harga Jual (1 Gram)
            </p>
            <p className="text-3xl font-bold text-[#D4AF37] mt-2">
              {stats.sellPrice1g ? formatCurrency(stats.sellPrice1g) : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Sumber: Kategori {stats.categoryName}
            </p>
          </div>
        </div>

        {/* CARD 2: HARGA BUYBACK */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown size={100} className="text-blue-500" />
          </div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Activity className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Harga Buyback (1 Gram)
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.buybackPrice1g ? formatCurrency(stats.buybackPrice1g) : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Estimasi penerimaan user
            </p>
          </div>
        </div>

        {/* CARD 3: TOTAL PRODUK */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package size={100} className="text-purple-500" />
          </div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Package className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Total Katalog Produk
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.productCount} <span className="text-lg font-normal text-slate-400">Item</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Produk aktif & tidak aktif
            </p>
          </div>
        </div>

      </div>

     
    </div>
  );
};

export default DashboardHome;