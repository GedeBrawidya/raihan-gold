import { useState, useEffect } from "react";
import { useSupabase, getGoldCategories, getSellPricesByCategory, getBuybackPricesByCategory, GoldCategory } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

interface PriceRow {
  weight: number;
  sellPrice: number;
  buybackPrice: number;
}

export const PriceListTable = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<GoldCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [rows, setRows] = useState<PriceRow[]>([]);

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
      const [sellData, buybackData] = await Promise.all([
        getSellPricesByCategory(supabase, selectedCategoryId),
        getBuybackPricesByCategory(supabase, selectedCategoryId),
      ]);

      const sellMap = new Map(sellData.map((p) => [p.weight, p.price]));
      const buybackMap = new Map(buybackData.map((p) => [p.weight, p.price]));

      const allWeights = Array.from(new Set([...sellData.map((p) => p.weight), ...buybackData.map((p) => p.weight)])).sort((a, b) => a - b);

      const generatedRows = allWeights.map((weight) => ({
        weight,
        sellPrice: sellMap.get(weight) || 0,
        buybackPrice: buybackMap.get(weight) || 0,
      }));

      setRows(generatedRows);
    } catch (err) {
      console.error("Load price error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center min-h-96">
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

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Daftar Harga Emas Antam
        </h2>
        <p className="text-muted-foreground">
          Harga jual dan buyback untuk berbagai varian berat emas Antam
        </p>
      </div>

      {/* Category Selector */}
      <div className="bg-card border border-border rounded-lg p-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Pilih Kategori
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

      {/* Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-6 py-4 text-left font-semibold text-foreground">
                  Berat (Gram)
                </th>
                <th className="px-6 py-4 text-right font-semibold text-foreground">
                  Harga Jual
                </th>
                <th className="px-6 py-4 text-right font-semibold text-foreground">
                  Harga Buyback
                </th>
                <th className="px-6 py-4 text-right font-semibold text-foreground">
                  Selisih
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Tidak ada data harga tersedia
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const difference = row.sellPrice - row.buybackPrice;
                  return (
                    <tr
                      key={idx}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-gold">
                              {row.weight}g
                            </span>
                          </div>
                          <span className="font-semibold text-foreground">
                            {row.weight} gram
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(row.sellPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(row.buybackPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(difference)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Tidak ada data harga tersedia
            </div>
          ) : (
            rows.map((row, idx) => {
              const difference = row.sellPrice - row.buybackPrice;
              return (
                <div key={idx} className="p-4 space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gold">
                        {row.weight}g
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {row.weight} gram
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Harga Jual</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(row.sellPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Harga Buyback</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(row.buybackPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-muted-foreground text-sm">Selisih</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(difference)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          📊 Kategori: <span className="font-semibold">{selectedCategory?.name || "—"}</span>. Harga dapat berubah sewaktu-waktu mengikuti pasar.
        </p>
      </div>
    </div>
  );
};
