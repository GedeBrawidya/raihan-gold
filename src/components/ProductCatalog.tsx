import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useEffect, useState } from "react";
import { useSupabase, getProducts, getBaseGoldPrice } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];

const EDITION_OPTIONS = [
  { value: "terbaru", label: "Kemasan Terbaru" },
  { value: "retro", label: "Kemasan Retro/Lama" },
];

export const ProductCatalog = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [basePrice, setBasePrice] = useState<any>(null);

  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // ==========================
  // LOAD DATA
  // ==========================
  async function load() {
    try {
      setLoading(true);

      const [rows, basePriceData] = await Promise.all([
        getProducts(supabase),
        getBaseGoldPrice(supabase),
      ]);

      setProducts(rows ?? []);
      setBasePrice(basePriceData ?? null);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Gagal memuat produk",
        description: "Periksa koneksi atau konfigurasi Supabase.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ==========================
  // FILTER PRODUK
  // ==========================
  const filteredProducts = products.filter((p) => {
    if (p.is_active === false) return false;
    if (selectedWeight !== null && p.weight !== selectedWeight) return false;
    if (
      selectedEdition &&
      p.description?.toLowerCase().includes(selectedEdition) === false
    )
      return false;
    return true;
  });

  return (
    <section id="produk" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs md:text-sm font-medium rounded-full mb-4">
            Koleksi Emas
          </span>
          <h2 className="text-2xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Katalog Emas Antam
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-2">
            Pilih berat dan edisi yang sesuai kebutuhan investasi Anda.
          </p>
        </motion.div>

        {/* ==========================
            FILTERS
        =========================== */}
        <div className="mb-10 space-y-6">
          {/* Weight Filter */}
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Filter Berat (Gram)
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedWeight(null)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  selectedWeight === null
                    ? "bg-gold text-black"
                    : "bg-muted text-foreground hover:bg-gold/20"
                }`}
              >
                Semua
              </button>

              {WEIGHT_OPTIONS.map((weight) => (
                <button
                  key={weight}
                  onClick={() => setSelectedWeight(weight)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    selectedWeight === weight
                      ? "bg-gold text-black"
                      : "bg-muted text-foreground hover:bg-gold/20"
                  }`}
                >
                  {weight}g
                </button>
              ))}
            </div>
          </div>

          {/* Edition Filter */}
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Filter Edisi
            </h3>
            <select
              value={selectedEdition ?? ""}
              onChange={(e) =>
                setSelectedEdition(e.target.value || null)
              }
              className="w-full md:w-auto px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">Semua Edisi</option>
              {EDITION_OPTIONS.map((edition) => (
                <option key={edition.value} value={edition.value}>
                  {edition.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ==========================
            PRODUCT GRID
        =========================== */}
        {loading ? (
          <div className="grid grid-cols 1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-muted rounded-lg h-60 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols 1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product, index) => {
              const livePrice = basePrice
                ? basePrice.sell_price_per_gram * product.weight
                : product.price;

              return (
                <ProductCard
                  key={product.id}
                  index={index}
                  product={{ ...product, price: livePrice }}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Produk tidak ditemukan.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
