import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import { getBaseGoldPrice, updateBaseGoldPrice, BaseGoldPrice } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { Save, Loader2 } from "lucide-react";

export const GoldPricesPage: React.FC = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [basePrice, setBasePrice] = useState<BaseGoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State form menyimpan string angka murni (contoh: "2850000")
  const [editForm, setEditForm] = useState({
    sell_price_per_gram: "",
    buyback_price_per_gram: "",
  });

  // Load base price
  useEffect(() => {
    loadPrice();
  }, []);

  const loadPrice = async () => {
    try {
      setLoading(true);
      const data = await getBaseGoldPrice(supabase);
      if (!data) throw new Error("No gold price data found");
      
      setBasePrice(data);
      setEditForm({
        sell_price_per_gram: data.sell_price_per_gram.toString(),
        buyback_price_per_gram: data.buyback_price_per_gram.toString(),
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER FUNCTIONS BARU ---

  // 1. Fungsi mengubah angka murni jadi format ribuan (untuk tampilan input)
  // Contoh: "2850000" -> "2.850.000"
  const formatInputValue = (value: string) => {
    if (!value) return "";
    // Hapus karakter non-digit dulu untuk jaga-jaga
    const number = value.replace(/\D/g, "");
    if (!number) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(number));
  };

  // 2. Handler saat user mengetik
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    // Ambil value raw dari input (contoh: "2.850.000")
    const rawValue = e.target.value;
    
    // Hapus semua titik/koma, sisakan angka saja (contoh: "2850000")
    const cleanValue = rawValue.replace(/\D/g, "");

    // Simpan ke state sebagai angka murni
    setEditForm((prev) => ({
      ...prev,
      [field]: cleanValue,
    }));
  };

  // -----------------------------

  const handleSave = async () => {
    try {
      setSaving(true);
      const sellPrice = parseFloat(editForm.sell_price_per_gram);
      const buybackPrice = parseFloat(editForm.buyback_price_per_gram);

      if (isNaN(sellPrice) || isNaN(buybackPrice)) {
        toast({ title: "Validasi Error", description: "Mohon masukkan angka yang valid", variant: "destructive" });
        return;
      }

      await updateBaseGoldPrice(supabase, {
        sell_price_per_gram: sellPrice,
        buyback_price_per_gram: buybackPrice,
      });

      toast({ title: "Sukses", description: "Harga emas berhasil diperbarui" });
      await loadPrice();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!basePrice) {
    return <div className="p-8 text-center text-destructive">Data harga emas tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 lg:p-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Harga Emas</h1>
        <p className="text-muted-foreground">Update harga jual dan buyback emas per gram secara real-time.</p>
      </div>

      {/* Current Prices Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gold/10 dark:bg-[#2b2417]/30 border border-gold/20 rounded-xl p-6">
          <p className="text-sm text-[#D4AF37] font-semibold mb-2 uppercase tracking-wide">Harga Jual Saat Ini</p>
          <p className="text-3xl md:text-4xl font-bold text-[#D4AF37]">{formatCurrency(basePrice.sell_price_per_gram)}</p>
          <p className="text-xs text-muted-foreground mt-2">per gram</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-500 font-semibold mb-2 uppercase tracking-wide">Harga Buyback Saat Ini</p>
          <p className="text-3xl md:text-4xl font-bold text-slate-500">{formatCurrency(basePrice.buyback_price_per_gram)}</p>
          <p className="text-xs text-muted-foreground mt-2">per gram</p>
        </div>
      </div>

      {/* Update Form */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground border-b border-border pb-4">Update Harga Baru</h2>

        <div className="grid gap-6">
          {/* Input Harga Jual */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Harga Jual per Gram (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
              <input
                type="text" // UBAH JADI TEXT AGAR BISA ADA TITIK
                value={formatInputValue(editForm.sell_price_per_gram)} // TAMPILKAN DENGAN FORMAT
                onChange={(e) => handlePriceChange(e, "sell_price_per_gram")} // HANDLE PERUBAHAN
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold font-mono text-lg"
              />
            </div>
          </div>

          {/* Input Harga Buyback */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Harga Buyback per Gram (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
              <input
                type="text" // UBAH JADI TEXT AGAR BISA ADA TITIK
                value={formatInputValue(editForm.buyback_price_per_gram)} // TAMPILKAN DENGAN FORMAT
                onChange={(e) => handlePriceChange(e, "buyback_price_per_gram")} // HANDLE PERUBAHAN
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold font-mono text-lg"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gold hover:bg-gold/90 text-slate-900 font-bold rounded-lg transition-all disabled:opacity-50 mt-4"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Menyimpan..." : "Simpan Perubahan Harga"}
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 flex gap-3">
        <div className="text-2xl">ℹ️</div>
        <div>
          <p className="text-sm text-foreground font-medium">
            Terakhir diupdate: {basePrice.updated_at ? formatDate(new Date(basePrice.updated_at)) : "-"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Perubahan harga di sini akan langsung mempengaruhi kalkulasi harga di halaman depan dan katalog produk. Pastikan nominal yang dimasukkan sudah benar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoldPricesPage;