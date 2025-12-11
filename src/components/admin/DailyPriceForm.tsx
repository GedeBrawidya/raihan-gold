import { useState, useEffect } from "react";
import { useSupabase, getDailyPrice, updateDailyPrice, AntamDailyPrice } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { DollarSign, Save, Loader2 } from "lucide-react";

export const DailyPriceForm = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [buybackPrice, setBuybackPrice] = useState("");

  useEffect(() => {
    loadPrice();
  }, []);

  const loadPrice = async () => {
    try {
      setLoading(true);
      const price = await getDailyPrice(supabase);
      if (price) {
        setSellPrice(String(price.sell_price_per_gram));
        setBuybackPrice(String(price.buyback_price_per_gram));
      }
    } catch (err: any) {
      console.error("Load price error:", err);
      toast({
        title: "Error",
        description: "Gagal memuat harga saat ini",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!sellPrice.trim() || !buybackPrice.trim()) {
      toast({
        title: "Validation Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    const sellNum = parseFloat(sellPrice);
    const buybackNum = parseFloat(buybackPrice);

    if (isNaN(sellNum) || isNaN(buybackNum)) {
      toast({
        title: "Validation Error",
        description: "Harga harus berupa angka",
        variant: "destructive",
      });
      return;
    }

    if (sellNum <= 0 || buybackNum <= 0) {
      toast({
        title: "Validation Error",
        description: "Harga harus lebih besar dari 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await updateDailyPrice(supabase, {
        sell_price_per_gram: sellNum,
        buyback_price_per_gram: buybackNum,
      });
      toast({
        title: "Success",
        description: "Harga emas berhasil diperbarui",
      });
    } catch (err: any) {
      console.error("Save price error:", err);
      toast({
        title: "Error",
        description: err?.message || "Gagal menyimpan harga",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gold/10 rounded-lg">
          <DollarSign className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Perbarui Harga Emas Antam</h2>
          <p className="text-sm text-muted-foreground mt-1">Kelola harga jual dan buyback harian</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Harga Jual */}
        <CurrencyInput
          label="Harga Jual Dasar (per gram)"
          value={sellPrice}
          onChange={(value) => setSellPrice(String(value))}
          placeholder="0"
          required
        />
        <p className="text-xs text-muted-foreground -mt-4">
          Harga dasar per gram untuk penjualan emas Antam
        </p>

        {/* Harga Buyback */}
        <CurrencyInput
          label="Harga Buyback Dasar (per gram)"
          value={buybackPrice}
          onChange={(value) => setBuybackPrice(String(value))}
          placeholder="0"
          required
        />
        <p className="text-xs text-muted-foreground -mt-4">
          Harga dasar per gram untuk pembelian kembali (buyback) emas Antam
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            💡 Harga ini akan digunakan untuk menghitung semua variasi berat (0.5g - 100g) di halaman publik dan kalkulator buyback.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Harga
            </>
          )}
        </button>
        <button
          onClick={loadPrice}
          disabled={loading || saving}
          className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Batalkan
        </button>
      </div>
    </div>
  );
};
