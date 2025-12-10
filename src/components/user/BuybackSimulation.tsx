import { useState, useEffect } from "react";
import { useSupabase, getDailyPrice } from "@/lib/supabase";
import { MessageCircle, Loader2 } from "lucide-react";

const WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const BuybackSimulation = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [buybackPricePerGram, setBuybackPricePerGram] = useState<number>(0);

  const whatsappPhone = "628xxxx"; // Replace with actual WhatsApp number

  useEffect(() => {
    loadPrice();
  }, []);

  const loadPrice = async () => {
    try {
      setLoading(true);
      const price = await getDailyPrice(supabase);
      if (price) {
        setBuybackPricePerGram(price.buyback_price_per_gram);
      }
    } catch (err) {
      console.error("Load price error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalEstimate = selectedWeight * buybackPricePerGram;

  const handleWhatsApp = () => {
    const message = `Halo admin, saya mau buyback Antam ${selectedWeight}g. Estimasi di web ${formatCurrency(totalEstimate)}. Mohon diproses.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg text-white">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Kalkulator Buyback Antam</h2>
        <p className="text-slate-300">
          Hitung estimasi harga jual kembali emas Antam Anda
        </p>
      </div>

      {/* Price Display */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 mb-8">
        <p className="text-slate-400 text-sm mb-2">Harga Buyback Per Gram</p>
        <p className="text-4xl font-bold text-gold">
          {formatCurrency(buybackPricePerGram)}
        </p>
      </div>

      {/* Weight Selection */}
      <div className="mb-8">
        <p className="text-slate-300 font-semibold mb-4">Pilih Berat Emas (gram)</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {WEIGHT_OPTIONS.map((weight) => (
            <button
              key={weight}
              onClick={() => setSelectedWeight(weight)}
              className={`py-3 px-2 sm:px-4 rounded-lg font-semibold transition-all ${
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

      {/* Result */}
      <div className="bg-gold/10 border border-gold/20 rounded-lg p-6 mb-8">
        <p className="text-slate-300 text-sm mb-2">Estimasi Harga Total</p>
        <p className="text-5xl font-bold text-gold mb-1">
          {formatCurrency(totalEstimate)}
        </p>
        <p className="text-slate-400 text-sm">
          untuk {selectedWeight}g emas Antam
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleWhatsApp}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
        Jual via WhatsApp
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center mt-6">
        * Estimasi ini bersifat indikatif dan dapat berubah tergantung kondisi pasar dan kondisi fisik emas.
      </p>
    </div>
  );
};
