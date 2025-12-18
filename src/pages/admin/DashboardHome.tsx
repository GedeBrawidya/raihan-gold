import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import { 
  getGoldCategories, 
  getSellPricesByCategory, 
  getBuybackPricesByCategory 
} from "@/lib/supabase";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Calendar, 
  DollarSign, 
  Activity, 
  Star, 
  MessageSquare 
} from "lucide-react";

interface ReviewStats {
  totalReviews: number;
  averageRating: string;
  counts: { [key: number]: number };
}

interface DashboardStats {
  sellPrice1g: number | null;
  buybackPrice1g: number | null;
  productCount: number;
  categoryName: string;
  reviews: ReviewStats;
}

export const DashboardHome: React.FC = () => {
  const { supabase } = useSupabase();
  const [stats, setStats] = useState<DashboardStats>({
    sellPrice1g: null,
    buybackPrice1g: null,
    productCount: 0,
    categoryName: "-",
    reviews: {
      totalReviews: 0,
      averageRating: "0.0",
      counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
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

      // --- 1. LOGIC HARGA EMAS ---
      const categories = await getGoldCategories(supabase);
      
      let sellPrice1g = null;
      let buybackPrice1g = null;
      let categoryName = "-";
      
      if (categories && categories.length > 0) {
        // PERBAIKAN LOGIC SORTING:
        // Kita urutkan berdasarkan NAMA secara DESCENDING (Besar ke Kecil)
        // Agar "2025" muncul di atas "2023"
        // Opsi 'numeric: true' memastikan angka dibaca sebagai angka (bukan string murni)
        const sortedCategories = [...categories].sort((a, b) => {
           return b.name.localeCompare(a.name, undefined, { numeric: true });
        });

        // Ambil yang paling atas (Tahun Terbesar / 2025)
        const latestCategory = sortedCategories[0];
        
        categoryName = latestCategory.name;
        
        // Ambil Harga berdasarkan Kategori Tersebut
        const [sellPrices, buybackPrices] = await Promise.all([
          getSellPricesByCategory(supabase, latestCategory.id),
          getBuybackPricesByCategory(supabase, latestCategory.id),
        ]);

        // Cari harga berat 1 gram
        const sell1g = sellPrices.find((p) => p.weight === 1);
        const buyback1g = buybackPrices.find((p) => p.weight === 1);

        if (sell1g) sellPrice1g = sell1g.price;
        if (buyback1g) buybackPrice1g = buyback1g.price;
      }
      
      // --- 2. LOGIC TOTAL PRODUK ---
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // --- 3. LOGIC STATISTIK REVIEW ---
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("rating")
        .eq("is_approved", true);

      const reviewStats: ReviewStats = {
        totalReviews: 0,
        averageRating: "0.0",
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };

      if (reviewsData && reviewsData.length > 0) {
        reviewStats.totalReviews = reviewsData.length;
        
        let sumRating = 0;
        reviewsData.forEach((r) => {
          sumRating += r.rating;
          if (reviewStats.counts[r.rating] !== undefined) {
            reviewStats.counts[r.rating]++;
          }
        });

        reviewStats.averageRating = (sumRating / reviewsData.length).toFixed(1);
      }

      setStats({
        sellPrice1g,
        buybackPrice1g,
        productCount: productCount || 0,
        categoryName,
        reviews: reviewStats,
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
              <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
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
            Ringkasan performa toko, harga emas, dan ulasan pelanggan.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          {today}
        </div>
      </div>

      {/* Grid Cards Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: HARGA JUAL */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm relative overflow-hidden group">
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
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">
              Harga Jual (1g)
            </p>
            <p className="text-3xl font-bold text-[#D4AF37] mt-2">
              {stats.sellPrice1g ? formatCurrency(stats.sellPrice1g) : "Belum diset"}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Kategori: <span className="font-semibold">{stats.categoryName}</span>
            </p>
          </div>
        </div>

        {/* CARD 2: HARGA BUYBACK */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown size={100} className="text-blue-500" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Activity className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">
              Harga Buyback (1g)
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.buybackPrice1g ? formatCurrency(stats.buybackPrice1g) : "Belum diset"}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Estimasi penerimaan user
            </p>
          </div>
        </div>

        {/* CARD 3: TOTAL PRODUK */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package size={100} className="text-purple-500" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Package className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">
              Total Produk
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.productCount} <span className="text-lg font-normal text-slate-400">Item</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Dalam katalog aktif & non-aktif
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: STATISTIK REVIEW (GOOGLE MAPS STYLE) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
            <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kepuasan Pelanggan</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Berdasarkan ulasan yang telah disetujui</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* KIRI: Total & Rata-rata */}
          <div className="text-center md:text-left min-w-[150px]">
            <div className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
              {stats.reviews.averageRating}
            </div>
            <div className="flex justify-center md:justify-start gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={20} 
                  className={`${
                    star <= Math.round(parseFloat(stats.reviews.averageRating)) 
                      ? "fill-[#D4AF37] text-[#D4AF37]" 
                      : "text-slate-300 dark:text-slate-600"
                  }`} 
                />
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stats.reviews.totalReviews} Ulasan
            </p>
          </div>

          {/* KANAN: Progress Bar per Bintang */}
          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.reviews.counts[rating] || 0;
              const percentage = stats.reviews.totalReviews > 0 
                ? (count / stats.reviews.totalReviews) * 100 
                : 0;

              return (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <span className="w-3 font-medium text-slate-600 dark:text-slate-400">{rating}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;