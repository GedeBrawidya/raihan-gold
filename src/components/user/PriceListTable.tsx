import { useState, useEffect } from "react";
import { useSupabase, getDailyPrice, AntamDailyPrice } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

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
  sellPrice: number;
  buybackPrice: number;
}

export const PriceListTable = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState<AntamDailyPrice | null>(null);
  const [rows, setRows] = useState<PriceRow[]>([]);

  useEffect(() => {
    loadPrice();
  }, []);

  const loadPrice = async () => {
    try {
      setLoading(true);
      const price = await getDailyPrice(supabase);
      if (price) {
        setPriceData(price);
        // Generate table rows
        const generatedRows = WEIGHT_OPTIONS.map((weight) => ({
          weight,
          sellPrice: price.sell_price_per_gram * weight,
          buybackPrice: price.buyback_price_per_gram * weight,
        }));
        setRows(generatedRows);
      }
    } catch (err) {
      console.error("Load price error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center min-h-96">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Harga tidak tersedia</p>
      </div>
    );
  }

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
              {rows.map((row, idx) => {
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
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {rows.map((row, idx) => {
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
          })}
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          📊 Harga diperbarui pada {priceData.updated_at ? new Date(priceData.updated_at).toLocaleString("id-ID") : "—"}. Harga dapat berubah sewaktu-waktu mengikuti pasar.
        </p>
      </div>
    </div>
  );
};
