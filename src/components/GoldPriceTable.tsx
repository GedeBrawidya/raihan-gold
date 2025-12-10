import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Clock, MessageCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { useState, useEffect } from "react";
import { useSupabase, getBaseGoldPrice, getDailyPrice, AntamDailyPrice, BaseGoldPrice } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];

export const GoldPriceTable = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [basePrice, setBasePrice] = useState<BaseGoldPrice | null>(null);
  const [sellPriceRows, setSellPriceRows] = useState<Array<{ weight: number; price: number }>>([]);
  const [activeTab, setActiveTab] = useState<"sell" | "buyback">("sell");
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const baseData = await getBaseGoldPrice(supabase);
      if (!baseData) throw new Error("Unable to fetch gold price data");
      
      setBasePrice(baseData);
      
      // Generate sell price rows by calculating from base price
      const rows = WEIGHT_OPTIONS.map((weight) => ({
        weight,
        price: baseData.sell_price_per_gram * weight,
      }));
      setSellPriceRows(rows);
    } catch (err: any) {
      console.error("GoldPriceTable load error:", err);
      toast({ title: "Error loading prices", description: err?.message || String(err) });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="harga-emas" className="py-24 bg-gradient-to-b from-background to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-gold/10 text-gold text-sm font-medium rounded-full mb-4">
            💰 Harga Terkini
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Harga Emas Hari Ini
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Pantau harga jual dan buyback emas dengan real-time. Kami menjamin harga paling kompetitif di pasaran.
          </p>
        </motion.div>

        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border bg-muted/30">
              <button
                onClick={() => setActiveTab("sell")}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "sell"
                    ? "bg-gold text-black shadow-sm"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Harga Jual</span>
              </button>
              <button
                onClick={() => setActiveTab("buyback")}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "buyback"
                    ? "bg-gold text-black shadow-sm"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <TrendingDown className="w-5 h-5" />
                <span>Harga Buyback</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Tab 1: Selling Prices */}
              {activeTab === "sell" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Harga Jual Emas per Berat</h3>
                      <p className="text-muted-foreground mt-1">Harga emas per gram: {formatCurrency(basePrice?.sell_price_per_gram || 0)}</p>
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      <span className="text-sm font-medium hidden sm:inline">Refresh</span>
                    </button>
                  </div>

                  {/* Harga Jual Table */}
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Berat</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                            <div className="flex items-center justify-end gap-2">
                              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                              Harga Jual
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sellPriceRows.map((row, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="border-t border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-sm">
                                  <span className="text-white text-xs font-bold">{row.weight}g</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground text-base">{row.weight} gram</span>
                                  <span className="text-xs text-muted-foreground">Berat emas</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="text-lg font-bold text-[#D4AF37]">{formatCurrency(row.price)}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      ℹ️ Harga jual adalah harga ketika Anda membeli emas dari kami. Harga ditampilkan per berat yang berbeda.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Buyback Form */}
              {activeTab === "buyback" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <AntamPriceListWithForm basePrice={basePrice} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-muted/30 px-8 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Terakhir diperbarui: <span className="font-semibold text-foreground">{basePrice?.updated_at ? formatDate(new Date(basePrice.updated_at)) : "—"}</span></span>
              </div>
              <span className="text-xs">* Harga dapat berubah sewaktu-waktu mengikuti pasar</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ========== ANTAM PRICE LIST WITH FORM COMPONENT ==========

// Using shared formatCurrency from src/lib/formatting

interface AntamPriceRow {
  weight: number;
  sellPrice: number;
  buybackPrice: number;
  margin: number;
}

interface AntamPriceListWithFormProps {
  basePrice: BaseGoldPrice | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const AntamPriceListWithForm = ({ basePrice, onRefresh, isRefreshing }: AntamPriceListWithFormProps) => {
  const [priceRows, setPriceRows] = useState<AntamPriceRow[]>([]);
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const whatsappPhone = "628xxxx"; // Replace with actual number

  useEffect(() => {
    if (basePrice) {
      const rows = WEIGHT_OPTIONS.map((weight) => ({
        weight,
        sellPrice: basePrice.sell_price_per_gram * weight,
        buybackPrice: basePrice.buyback_price_per_gram * weight,
        margin: basePrice.sell_price_per_gram * weight - basePrice.buyback_price_per_gram * weight,
      }));
      setPriceRows(rows);
    }
  }, [basePrice]);

  const selectedRow = priceRows.find((r) => r.weight === selectedWeight);
  const estimatedPrice = selectedRow?.buybackPrice || 0;

  const handleWhatsApp = () => {
    if (!fullName.trim() || !phone.trim()) {
      toast({ title: "Error", description: "Mohon isi nama dan nomor HP", variant: "destructive" });
      return;
    }

    const message = `Halo admin, nama saya ${fullName}. Saya ingin buyback Antam ${selectedWeight}g. Estimasi harga: Rp ${formatCurrency(estimatedPrice).replace("Rp ", "")}. Nomor HP: ${phone}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappPhone}?text=${encodedMessage}`, "_blank");
  };

  const { toast } = useToast();

  if (!basePrice) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Harga tidak tersedia saat ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gold/10 dark:bg-[#2b2417]/10 border border-gold/20 rounded-lg p-4">
          <p className="text-sm text-[#D4AF37] font-semibold">Harga Jual (Per Gram)</p>
          <p className="text-3xl font-bold text-[#D4AF37] mt-2">{formatCurrency(basePrice.sell_price_per_gram)}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-400 font-semibold">Harga Buyback (Per Gram)</p>
          <p className="text-3xl font-bold text-slate-400 mt-2">{formatCurrency(basePrice.buyback_price_per_gram)}</p>
        </div>
      </div>

      {/* Antam Price List Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Daftar Harga Antam</h3>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Berat</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Harga Jual</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Harga Buyback</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Margin</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="border-t border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.weight}g</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-500">
                    {formatCurrency(row.sellPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-400">
                    {formatCurrency(row.buybackPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-amber-600">
                    {formatCurrency(row.margin)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buyback Form */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-border rounded-xl p-6 space-y-6">
        <h3 className="text-2xl font-bold text-foreground">Formulir Buyback Emas</h3>

        {/* Weight Selection */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Pilih Berat Emas (gram)
          </label>
          <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
            {WEIGHT_OPTIONS.map((weight) => (
              <button
                key={weight}
                onClick={() => setSelectedWeight(weight)}
                className={`py-2 px-2 rounded-lg font-semibold text-sm transition-all ${
                  selectedWeight === weight
                    ? "bg-gold text-black shadow-lg scale-105"
                    : "bg-white dark:bg-slate-700 text-foreground border border-border hover:border-gold"
                }`}
              >
                {weight}g
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Price Display */}
        <div className="bg-gradient-to-r from-gold/10 to-amber-500/10 border-2 border-gold rounded-xl p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Estimasi Harga Bersih</p>
          <p className="text-5xl font-bold text-gold">{formatCurrency(estimatedPrice)}</p>
          <p className="text-sm text-muted-foreground">untuk {selectedWeight}g emas Antam</p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Nama Lengkap *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Nomor HP/WA *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="628xxxxxxxxxx"
              className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
          Hubungi via WhatsApp
        </button>

        <p className="text-xs text-muted-foreground text-center">
          💡 Estimasi ini bersifat indikatif. Harga final akan dikonfirmasi setelah verifikasi kondisi emas Anda.
        </p>
      </div>
    </div>
  );
};
