import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import { getBaseGoldPrice, updateBaseGoldPrice, BaseGoldPrice } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { Save } from "lucide-react";

export const GoldPricesPage: React.FC = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [basePrice, setBasePrice] = useState<BaseGoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleSave = async () => {
    try {
      const sellPrice = parseFloat(editForm.sell_price_per_gram);
      const buybackPrice = parseFloat(editForm.buyback_price_per_gram);

      if (isNaN(sellPrice) || isNaN(buybackPrice)) {
        toast({ title: "Validation Error", description: "Please enter valid numbers" });
        return;
      }

      await updateBaseGoldPrice(supabase, {
        sell_price_per_gram: sellPrice,
        buyback_price_per_gram: buybackPrice,
      });

      toast({ title: "Success", description: "Gold prices updated successfully" });
      await loadPrice();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!basePrice) {
    return <div className="p-8 text-center text-destructive">No gold price data found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Harga Emas</h1>
        <p className="text-muted-foreground">Update harga jual dan buyback emas per gram</p>
      </div>

      {/* Current Prices Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gold/10 dark:bg-[#2b2417]/10 border border-gold/20 rounded-lg p-6">
          <p className="text-sm text-[#D4AF37] dark:text-[#D4AF37] font-semibold mb-2">Harga Jual Saat Ini</p>
          <p className="text-3xl font-bold text-[#D4AF37]">{formatCurrency(basePrice.sell_price_per_gram)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">per gram</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <p className="text-sm text-slate-400 font-semibold mb-2">Harga Buyback Saat Ini</p>
          <p className="text-3xl font-bold text-slate-400">{formatCurrency(basePrice.buyback_price_per_gram)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">per gram</p>
        </div>
      </div>

      {/* Update Form */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Update Harga</h2>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Harga Jual per Gram (Rp)</label>
          <input
            type="number"
            value={editForm.sell_price_per_gram}
            onChange={(e) => setEditForm({ ...editForm, sell_price_per_gram: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Harga Buyback per Gram (Rp)</label>
          <input
            type="number"
            value={editForm.buyback_price_per_gram}
            onChange={(e) => setEditForm({ ...editForm, buyback_price_per_gram: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all"
        >
          <Save className="w-5 h-5" />
          Simpan Perubahan
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong>Terakhir diupdate:</strong> {formatDate(basePrice.updated_at)}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          💡 Harga di bawah ini akan digunakan untuk menghitung semua variasi berat emas di aplikasi.
        </p>
      </div>
    </div>
  );
};

export default GoldPricesPage;
