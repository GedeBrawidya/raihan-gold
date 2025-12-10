import { useState, useEffect, useMemo } from "react";
import { useSupabase, getDailyPrice, AntamDailyPrice } from "@/lib/supabase";
import { TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

const WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

interface PriceRow {
  weight: number;
  sellingPrice: number;
}

export const SellingPriceTable = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<AntamDailyPrice | null>(null);
  const [rows, setRows] = useState<PriceRow[]>([]);

  const loadPrice = async () => {
    try {
      setLoading(true);
      setError(null);
      const price = await getDailyPrice(supabase);
      if (price) {
        setPriceData(price);
        const generatedRows = WEIGHT_OPTIONS.map((weight) => ({
          weight,
          sellingPrice: price.sell_price_per_gram * weight,
        }));
        setRows(generatedRows);
      } else {
        setError("Harga tidak tersedia saat ini");
      }
    } catch (err: any) {
      console.error("Load price error:", err);
      setError(err?.message || "Gagal memuat harga");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrice();
  }, []);

  // Memoize formatted price
  const formattedPrice = useMemo(() => {
    return formatCurrency(priceData?.sell_price_per_gram || 0);
  }, [priceData?.sell_price_per_gram]);

  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-700/30 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  if (error && !priceData) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-300 font-semibold">{error}</p>
          <button
            onClick={loadPrice}
            className="text-xs text-red-300 hover:text-red-200 underline mt-2"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Harga Jual Emas Hari Ini
            </h3>
            <p className="text-sm text-slate-400">
              Harga per gram: <span className="text-gold font-bold">
                {formattedPrice}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={loadPrice}
          disabled={loading}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh prices"
        >
          <RefreshCw className={`w-5 h-5 text-gold ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gold">
                Berat (Gram)
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gold">
                Harga Hari Ini (IDR)
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gold">
                        {row.weight}g
                      </span>
                    </div>
                    <span className="text-white font-medium">
                      {row.weight} gram
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-lg font-bold text-gold">
                    {formatCurrency(row.sellingPrice)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gold">
                  {row.weight}g
                </span>
              </div>
              <span className="text-white font-medium">
                {row.weight} gram
              </span>
            </div>
            <span className="text-lg font-bold text-gold">
              {formatCurrency(row.sellingPrice)}
            </span>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
        <p className="text-xs text-blue-300 text-center">
          ℹ️ Harga dapat berubah sewaktu-waktu mengikuti fluktuasi pasar. Klik refresh untuk update terbaru.
        </p>
      </div>
    </div>
  );
};
