import { useState, useEffect, useMemo } from "react";
import { useSupabase, getBuybackPricesByCategory, GoldWeightPrice, GOLD_WEIGHT_OPTIONS } from "@/lib/supabase";
import { MessageCircle, RefreshCw, AlertCircle } from "lucide-react";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

interface BuybackCalculatorProps {
  categoryId: number;
}

export const BuybackCalculator = ({ categoryId }: BuybackCalculatorProps) => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [priceData, setPriceData] = useState<GoldWeightPrice[]>([]);

  const whatsappPhone = "628xxxx"; // Replace with actual WhatsApp number

  const loadPrice = async () => {
    try {
      setLoading(true);
      setError(null);
      const prices = await getBuybackPricesByCategory(supabase, categoryId);
      setPriceData(prices);
      if (prices.length > 0 && !prices.find((p) => p.weight === selectedWeight)) {
        setSelectedWeight(prices[0].weight);
      }
    } catch (err: any) {
      console.error("Load price error:", err);
      setError(err?.message || "Gagal memuat harga");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      loadPrice();
    }
  }, [categoryId]);

  // Memoize calculations
  const selectedPrice = useMemo(() => {
    return priceData.find((p) => p.weight === selectedWeight);
  }, [priceData, selectedWeight]);

  const estimatedPrice = selectedPrice?.price || 0;

  const handleWhatsApp = () => {
    const priceText = estimatedPrice.toLocaleString("id-ID");
    const message = `Halo admin, saya mau jual Emas Batangan Antam ukuran ${selectedWeight} gram. Estimasi di web Rp ${priceText}. Mohon diproses.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const SkeletonLoader = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-700/30 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  if (error && !priceData.length) {
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

  const availableWeights = priceData.map((p) => p.weight).filter((w) => GOLD_WEIGHT_OPTIONS.includes(w as any));

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg">
            <MessageCircle className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Jual Emas Batangan Antam Anda
            </h3>
            <p className="text-sm text-slate-400">
              Harga bervariasi per gramasi
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

      {/* Weight Selector - Buttons Grid */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Pilih Berat Emas Antam
        </label>
        <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
          {availableWeights.map((weight) => (
            <button
              key={weight}
              onClick={() => setSelectedWeight(weight)}
              className={`py-2 px-2 rounded-lg font-semibold text-sm transition-all ${
                selectedWeight === weight
                  ? "bg-gold text-black shadow-lg scale-105"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              {weight}g
            </button>
          ))}
        </div>
      </div>

      {/* Estimated Price Display */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-gold/30 rounded-xl p-8 text-center space-y-3">
        <p className="text-sm text-slate-400 font-medium">Estimasi Terima Bersih</p>
        <div className="text-5xl font-bold text-gold break-words">
          {formatCurrency(estimatedPrice)}
        </div>
        <p className="text-sm text-slate-500">
          untuk {selectedWeight}g emas Antam
        </p>
      </div>

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
        Jual Sekarang via WA
      </button>

      {/* Info Note */}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
        <p className="text-xs text-amber-300 text-center mb-2">
          💡 Estimasi ini bersifat indikatif. Harga final akan dikonfirmasi setelah verifikasi kondisi fisik emas.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
        <p className="text-xs text-red-300 text-center font-semibold">
          ⚠️ Kami hanya menerima buyback Emas Batangan Antam (Logam Mulia). Kami TIDAK menerima perhiasan, koin kolektor, atau emas dalam bentuk lainnya.
        </p>
      </div>
    </div>
  );
};
