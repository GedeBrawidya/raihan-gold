import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Clock, MessageCircle, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";
import { useState, useEffect } from "react";
import { 
  useSupabase, 
  getGoldCategories, 
  getSellPricesByCategory, 
  getBuybackPricesByCategory, 
  GoldCategory 
} from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const GoldPriceTable = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState<GoldCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sellPriceRows, setSellPriceRows] = useState<Array<{ weight: number; price: number }>>([]);
  const [buybackPriceRows, setBuybackPriceRows] = useState<Array<{ weight: number; price: number }>>([]);
  const [activeTab, setActiveTab] = useState<"sell" | "buyback">("sell");
  const { supabase } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadPrices();
    }
  }, [selectedCategoryId]);

  // --- LOGIKA SORTING TAHUN TERBARU ---
  const loadCategories = async () => {
    try {
      const data = await getGoldCategories(supabase);

      // Kita sort array berdasarkan angka tahun di dalam string nama
      // Contoh: "Antam 2025" -> diambil 2025
      const sortedData = [...data].sort((a, b) => {
        // Regex mengambil angka pertama yg ditemukan
        const yearA = parseInt(a.name.match(/\d+/)?.[0] || "0");
        const yearB = parseInt(b.name.match(/\d+/)?.[0] || "0");
        
        // Urutkan Descending (Besar ke Kecil)
        // Jadi 2026 akan muncul sebelum 2025, dst.
        return yearB - yearA; 
      });

      setCategories(sortedData);

      // Default pilih item pertama (yang tahunnya paling besar)
      if (sortedData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(sortedData[0].id);
      }
    } catch (err: any) {
      console.error("Load categories error:", err);
      toast({ title: "Error loading categories", description: err?.message || String(err) });
    }
  };

  const loadPrices = async () => {
    if (!selectedCategoryId) return;
    setIsRefreshing(true);
    try {
      const [sellData, buybackData] = await Promise.all([
        getSellPricesByCategory(supabase, selectedCategoryId),
        getBuybackPricesByCategory(supabase, selectedCategoryId),
      ]);

      setSellPriceRows(
        sellData.map((p) => ({
          weight: p.weight,
          price: p.price,
        }))
      );

      setBuybackPriceRows(
        buybackData.map((p) => ({
          weight: p.weight,
          price: p.price,
        }))
      );
    } catch (err: any) {
      console.error("GoldPriceTable load error:", err);
      toast({ title: "Error loading prices", description: err?.message || String(err) });
    } finally {
      setIsRefreshing(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <section id="harga-emas" className="py-12 md:py-24 bg-gradient-to-b from-background to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal width="100%" animation="fadeUp" duration={0.6}>
          <div className="text-center mb-10 md:mb-16">
            <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs md:text-sm font-medium rounded-full mb-4">
              💰 Harga Terkini
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 break-words">
              Harga Emas Hari Ini
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-lg px-2">
              Pantau harga jual dan buyback emas dengan real-time. Kami menjamin harga paling kompetitif.
            </p>
          </div>
        </ScrollReveal>

        {/* Main Card Container */}
        <ScrollReveal width="100%" animation="fadeUp" delay={0.2} duration={0.6}>
          <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-xl md:rounded-2xl shadow-xl border border-border overflow-hidden">
            {/* Category Selector */}
            {categories.length > 0 && (
              <div className="p-4 md:p-6 border-b border-border bg-muted/30">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Pilih Kategori (Tahun)
                </label>
                <Select
                  value={selectedCategoryId?.toString() || ""}
                  onValueChange={(val) => setSelectedCategoryId(parseInt(val))}
                >
                  <SelectTrigger className="bg-background">
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
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-border bg-muted/30">
              <button
                onClick={() => setActiveTab("sell")}
                className={`flex-1 px-2 py-3 md:px-6 md:py-4 font-semibold transition-all flex items-center justify-center gap-2 text-xs md:text-base ${
                  activeTab === "sell"
                    ? "bg-[#D4AF37] text-black shadow-sm"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Harga Jual</span>
              </button>
              <button
                onClick={() => setActiveTab("buyback")}
                className={`flex-1 px-2 py-3 md:px-6 md:py-4 font-semibold transition-all flex items-center justify-center gap-2 text-xs md:text-base ${
                  activeTab === "buyback"
                    ? "bg-[#D4AF37] text-black shadow-sm"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Harga Buyback</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-8">
              {/* Tab 1: Selling Prices */}
              {activeTab === "sell" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground">Harga Jual</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Kategori: {selectedCategory?.name || "—"}
                      </p>
                    </div>
                    <button
                      onClick={loadPrices}
                      disabled={isRefreshing}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg transition-colors disabled:opacity-50 text-sm"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      Refresh Data
                    </button>
                  </div>

                  {/* Responsive Table Wrapper */}
                  <div className="overflow-x-auto rounded-lg border border-border -mx-4 sm:mx-0">
                    <table className="w-full min-w-[300px]">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Berat</th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-foreground">Harga Dasar/Gr</th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-semibold text-foreground">Total Harga</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sellPriceRows.map((row, index) => {
                          const totalPrice = row.price * row.weight;
                          return (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: false, amount: 0.3 }}
                              transition={{ duration: 0.4, delay: index * 0.05 }}
                              className="border-t border-border hover:bg-muted/50 transition-colors"
                            >
                              <td className="px-4 md:px-6 py-3 md:py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-amber-500 flex items-center justify-center shadow-sm shrink-0">
                                    <span className="text-white text-[10px] md:text-xs font-bold">{row.weight}g</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-foreground text-sm md:text-base">{row.weight} gram</span>
                                    <span className="text-[10px] md:text-xs text-muted-foreground">Logam Mulia</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-5">
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  {formatCurrency(row.price)} /gr
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-3 md:py-5 text-right">
                                <span className="text-sm md:text-lg font-bold text-[#D4AF37]">
                                  {formatCurrency(totalPrice)}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Buyback Form */}
              {activeTab === "buyback" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <AntamBuybackCalculator
                    categoryId={selectedCategoryId}
                    buybackPrices={buybackPriceRows}
                    onRefresh={loadPrices}
                    isRefreshing={isRefreshing}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-muted/30 px-4 md:px-8 py-3 md:py-4 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-muted-foreground gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span>
                  Kategori: <span className="font-semibold text-foreground">{selectedCategory?.name || "—"}</span>
                </span>
              </div>
              <span className="text-[10px] md:text-xs italic">* Harga dapat berubah sewaktu-waktu</span>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// ==========================================
// SUB-COMPONENT: Buyback Logic (Calculator)
// ==========================================

const AntamBuybackCalculator = ({
  categoryId,
  buybackPrices,
  onRefresh,
  isRefreshing,
}: {
  categoryId: number | null;
  buybackPrices: Array<{ weight: number; price: number }>;
  onRefresh: () => void;
  isRefreshing: boolean;
}) => {
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");
  const { toast } = useToast();

  // FILTER: Hanya Yogyakarta dan Bekasi
  const placeOptions = ["Yogyakarta", "Bekasi"];

  useEffect(() => {
    if (buybackPrices.length > 0 && !buybackPrices.find((p) => p.weight === selectedWeight)) {
      setSelectedWeight(buybackPrices[0].weight);
    }
  }, [buybackPrices]);

  // --- LOGIKA HITUNG ---
  const selectedPriceData = buybackPrices.find((p) => p.weight === selectedWeight);
  const pricePerGram = selectedPriceData?.price || 0;
  const pricePerUnit = pricePerGram * selectedWeight;
  const totalEstimate = pricePerUnit * quantity;
  // ---------------------

  const handleWhatsApp = () => {
    if (!fullName.trim() || !phone.trim() || !place.trim()) {
      toast({
        title: "Validasi Error",
        description: "Mohon lengkapi Nama, Nomor HP/WA, dan Tempat Anda.",
        variant: "destructive",
      });
      return;
    }

    if (quantity < 1) {
       toast({
        title: "Validasi Error",
        description: "Jumlah barang minimal 1.",
        variant: "destructive",
      });
      return;
    }

    const formattedTotal = formatCurrency(totalEstimate);
    const text = `Halo Admin Raihan Gold, 👋

Saya ingin mengajukan *Buyback* (Jual Kembali) emas dengan detail sebagai berikut:

👤 *Nama Lengkap:* ${fullName}
📱 *Nomor HP/WA:* ${phone}
📍 *Tempat:* ${place}
⚖️ *Berat Emas:* ${selectedWeight} gram
🔢 *Jumlah:* ${quantity} keping
💰 *Estimasi Total:* ${formattedTotal}

Mohon informasi mengenai prosedur penyerahan barang dan pengecekan selanjutnya. Terima kasih.`;

    const whatsappNumber = "6285190044083";
    const encodedMessage = encodeURIComponent(text);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  if (!categoryId || buybackPrices.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Loading prices...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Price Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Kiri: Harga Dasar */}
        <div className="bg-[#D4AF37]/10 dark:bg-[#2b2417]/10 border border-[#D4AF37]/20 rounded-lg p-4 text-center sm:text-left">
          <p className="text-xs md:text-sm text-[#D4AF37] font-semibold">Harga Buyback /gram</p>
          <p className="text-xl md:text-3xl font-bold text-[#D4AF37] mt-1">
            {formatCurrency(pricePerGram)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
             (Dasar perhitungan)
          </p>
        </div>

        {/* Kanan: Total Estimasi */}
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center sm:text-left">
          <p className="text-xs md:text-sm text-slate-400 font-semibold">Total Estimasi</p>
          <p className="text-xl md:text-3xl font-bold text-slate-400 mt-1">
             {formatCurrency(totalEstimate)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
             {selectedWeight}g x {quantity} pcs
          </p>
        </div>
      </div>

      {/* Buyback Calculator Form */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-border rounded-xl p-4 md:p-6 space-y-6">
        <h3 className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 md:w-6 md:h-6" />
            Hitung Estimasi Buyback
        </h3>

        {/* Weight Buttons */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Pilih Berat (gram)</label>
          <div className="flex flex-wrap gap-2">
            {buybackPrices.map((p) => (
              <button
                key={p.weight}
                onClick={() => setSelectedWeight(p.weight)}
                className={`py-2 px-3 md:px-4 rounded-lg font-semibold text-xs md:text-sm transition-all flex-grow sm:flex-grow-0 ${
                  selectedWeight === p.weight
                    ? "bg-[#D4AF37] text-black shadow-lg scale-105"
                    : "bg-white dark:bg-slate-700 text-foreground border border-border hover:border-[#D4AF37]"
                }`}
              >
                {p.weight}g
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Input */}
        <div>
           <label className="block text-sm font-semibold text-foreground mb-2">Jumlah Barang (Keping)</label>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-white border border-border hover:bg-muted flex items-center justify-center font-bold text-lg"
              >
                -
              </button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-24 text-center font-bold text-lg"
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg bg-white border border-border hover:bg-muted flex items-center justify-center font-bold text-lg"
              >
                +
              </button>
           </div>
        </div>

        {/* Highlight Result */}
        <div className="bg-gradient-to-r from-[#D4AF37]/10 to-amber-500/10 border-2 border-[#D4AF37] rounded-xl p-4 md:p-6 text-center">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Estimasi yang Anda terima</p>
          <p className="text-3xl md:text-5xl font-bold text-[#D4AF37] my-2">{formatCurrency(totalEstimate)}</p>
          <p className="text-xs text-muted-foreground">
            {quantity} keping x ( {selectedWeight}g x {formatCurrency(pricePerGram)} )
          </p>
        </div>

        {/* Contact Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama Lengkap"
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nomor WhatsApp"
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
          />

          {/* DROPDOWN TEMPAT - FULL WIDTH */}
          <div className="md:col-span-2 relative">
            <select
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className={`w-full px-4 py-3 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none appearance-none cursor-pointer transition-all ${
                place === "" ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              <option value="" disabled>
                Pilih Tempat / Domisili
              </option>
              {placeOptions.map((option, index) => (
                <option key={index} value={option} className="text-foreground bg-background">
                  {option}
                </option>
              ))}
            </select>
            
            {/* Custom Chevron Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-muted-foreground">
              <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
          Ajukan Buyback via WA
        </button>
      </div>
    </div>
  );
};