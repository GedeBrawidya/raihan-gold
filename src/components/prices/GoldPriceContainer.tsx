import { useState, useEffect, useMemo } from "react";
import { useSupabase, getDailyPrice, AntamDailyPrice } from "@/lib/supabase";
import { SellingPriceTable } from "./SellingPriceTable";
import { BuybackCalculator } from "./BuybackCalculator";
import { ShoppingBag, RefreshCw, Clock, TrendingUp } from "lucide-react";

type TabType = "sell" | "buyback";

export const GoldPriceContainer = () => {
  const { supabase } = useSupabase();
  const [activeTab, setActiveTab] = useState<TabType>("sell");
  const [priceData, setPriceData] = useState<AntamDailyPrice | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPrice = async () => {
    try {
      setLoading(true);
      const price = await getDailyPrice(supabase);
      if (price) {
        setPriceData(price);
      }
    } catch (err) {
      console.error("Load price error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrice();
  }, []);

  // Memoize formatted time
  const formattedUpdatedTime = useMemo(() => {
    if (!priceData?.updated_at) return "—";
    const date = new Date(priceData.updated_at);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [priceData?.updated_at]);

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-gold" />
            <span className="inline-block px-4 py-1 bg-gold/10 text-gold text-sm font-semibold rounded-full">
              Harga Real-Time
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Harga Emas Hari Ini
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Periksa harga jual dan buyback emas Antam dengan mudah.
            Harga diperbarui secara real-time mengikuti fluktuasi pasar.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700 backdrop-blur">
            <button
              onClick={() => setActiveTab("sell")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold transition-all duration-200 ${
                activeTab === "sell"
                  ? "bg-gold text-black shadow-lg"
                  : "text-white hover:bg-slate-700/50"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Beli Emas</span>
              <span className="sm:hidden text-xs">Beli</span>
            </button>
            <button
              onClick={() => setActiveTab("buyback")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold transition-all duration-200 ${
                activeTab === "buyback"
                  ? "bg-gold text-black shadow-lg"
                  : "text-white hover:bg-slate-700/50"
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              <span className="hidden sm:inline">Jual Emas / Buyback</span>
              <span className="sm:hidden text-xs">Jual</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 md:p-8 shadow-xl backdrop-blur">
          <div className="animate-in fade-in duration-300">
            {activeTab === "sell" && <SellingPriceTable />}
            {activeTab === "buyback" && <BuybackCalculator />}
          </div>
        </div>

        {/* Footer - Last Updated */}
        <div className="max-w-4xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Terakhir diperbarui: <span className="text-gold font-semibold">
                {formattedUpdatedTime}
              </span>
            </span>
          </div>
          {!loading && (
            <button
              onClick={loadPrice}
              disabled={loading}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh prices"
            >
              <RefreshCw className={`w-4 h-4 text-gold ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
