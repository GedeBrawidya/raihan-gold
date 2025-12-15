import { useState, useEffect } from "react";
import { useSupabase, getGoldCategories, getBuybackPricesByCategory, GoldCategory, GOLD_WEIGHT_OPTIONS } from "@/lib/supabase";
import { MessageCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [categories, setCategories] = useState<GoldCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [buybackPrices, setBuybackPrices] = useState<Array<{ weight: number; price: number }>>([]);

  const whatsappPhone = "628xxxx"; // Replace with actual WhatsApp number

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadPrices();
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getGoldCategories(supabase);
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      console.error("Load categories error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrices = async () => {
    if (!selectedCategoryId) return;
    try {
      setLoading(true);
      const prices = await getBuybackPricesByCategory(supabase, selectedCategoryId);
      const priceList = prices.map((p) => ({ weight: p.weight, price: p.price }));
      setBuybackPrices(priceList);
      if (priceList.length > 0 && !priceList.find((p) => p.weight === selectedWeight)) {
        setSelectedWeight(priceList[0].weight);
      }
    } catch (err) {
      console.error("Load price error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPrice = buybackPrices.find((p) => p.weight === selectedWeight);
  const totalEstimate = selectedPrice?.price || 0;
  const buybackPricePerGram = selectedPrice ? selectedPrice.price / selectedWeight : 0;

  const handleWhatsApp = () => {
    const message = `Halo admin, saya mau buyback Antam ${selectedWeight}g. Estimasi di web ${formatCurrency(totalEstimate)}. Mohon diproses.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading && categories.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Tidak ada kategori tersedia</p>
      </div>
    );
  }

  const availableWeights = buybackPrices.map((p) => p.weight).filter((w) => GOLD_WEIGHT_OPTIONS.includes(w as any));

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg text-white">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Kalkulator Buyback Antam</h2>
        <p className="text-slate-300">
          Hitung estimasi harga jual kembali emas Antam Anda
        </p>
      </div>

      {/* Category Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-2">
          Pilih Kategori
        </label>
        <Select
          value={selectedCategoryId?.toString() || ""}
          onValueChange={(val) => setSelectedCategoryId(parseInt(val))}
        >
          <SelectTrigger className="bg-slate-700 text-white border-slate-600">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Display */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 mb-8">
        <p className="text-slate-400 text-sm mb-2">Harga Buyback Per Gram</p>
        <p className="text-4xl font-bold text-gold">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin inline-block" />
          ) : (
            formatCurrency(buybackPricePerGram)
          )}
        </p>
      </div>

      {/* Weight Selection */}
      <div className="mb-8">
        <p className="text-slate-300 font-semibold mb-4">Pilih Berat Emas (gram)</p>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : availableWeights.length === 0 ? (
          <p className="text-slate-400 text-center py-4">Tidak ada harga tersedia untuk kategori ini</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {availableWeights.map((weight) => (
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
        )}
      </div>

      {/* Result */}
      <div className="bg-gold/10 border border-gold/20 rounded-lg p-6 mb-8">
        <p className="text-slate-300 text-sm mb-2">Estimasi Harga Total</p>
        <p className="text-5xl font-bold text-gold mb-1">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin inline-block" />
          ) : (
            formatCurrency(totalEstimate)
          )}
        </p>
        <p className="text-slate-400 text-sm">
          untuk {selectedWeight}g emas Antam
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleWhatsApp}
        disabled={loading || !selectedPrice}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
