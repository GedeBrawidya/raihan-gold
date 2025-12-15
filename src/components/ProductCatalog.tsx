import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useEffect, useState } from "react";
import { 
  useSupabase, 
  getProducts, 
  getGoldCategories, 
  getSellPricesByCategory,
  GoldCategory,
  GOLD_WEIGHT_OPTIONS 
} from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const ProductCatalog = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<GoldCategory[]>([]);
  
  // State untuk harga dinamis
  const [priceLookup, setPriceLookup] = useState<Record<number, Record<number, number>>>({});

  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  
  // Ubah default state null
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  // ==========================
  // LOAD DATA
  // ==========================
  async function load() {
    try {
      setLoading(true);

      const [productsData, categoriesData] = await Promise.all([
        getProducts(supabase),
        getGoldCategories(supabase),
      ]);

      setProducts(productsData ?? []);
      setCategories(categoriesData ?? []);

      // Ambil harga dinamis untuk setiap kategori
      if (categoriesData && categoriesData.length > 0) {
        const lookupTable: Record<number, Record<number, number>> = {};

        await Promise.all(
          categoriesData.map(async (cat) => {
            const prices = await getSellPricesByCategory(supabase, cat.id);
            const weightMap: Record<number, number> = {};
            prices.forEach((p) => {
              weightMap[p.weight] = p.price;
            });
            lookupTable[cat.id] = weightMap;
          })
        );
        setPriceLookup(lookupTable);
      }

    } catch (err) {
      console.error("Error loading catalog:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ==========================
  // LOGIC FILTER (DIPERBAIKI)
  // ==========================
  const filteredProducts = products.filter((p) => {
    // 1. Filter Status Aktif
    if (p.is_active === false) return false;

    // 2. Filter Berat
    if (selectedWeight !== null && p.weight !== selectedWeight) return false;

    // 3. Filter Kategori (FIXED)
    if (selectedCategoryId !== null) {
      // Kita pastikan kedua sisi adalah NUMBER agar pencocokan valid
      // p.category_id dari Supabase (int8) -> Number
      // selectedCategoryId dari State -> Number
      if (p.category_id !== selectedCategoryId) {
        return false;
      }
    }

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
          <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs md:text-sm font-medium rounded-full mb-4">
            Koleksi Emas
          </span>
          <h2 className="text-2xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Katalog Emas Antam
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-2">
            Pilih berat dan kategori yang sesuai. Harga terupdate otomatis.
          </p>
        </motion.div>

        {/* ==========================
            FILTERS
        =========================== */}
        <div className="mb-10 space-y-6">
          
          {/* Filter 1: Kategori */}
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Filter Kategori
            </h3>
            <select
              value={selectedCategoryId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                // PENTING: Ubah string dari dropdown menjadi Number dengan parseInt
                // Jika value kosong (""), set menjadi null agar filter mati
                setSelectedCategoryId(val ? parseInt(val) : null);
              }}
              className="w-full md:w-auto min-w-[200px] px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Berat */}
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Filter Berat (Gram)
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedWeight(null)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  selectedWeight === null
                    ? "bg-[#D4AF37] text-black"
                    : "bg-muted text-foreground hover:bg-[#D4AF37]/20"
                }`}
              >
                Semua
              </button>

              {GOLD_WEIGHT_OPTIONS.map((weight) => (
                <button
                  key={weight}
                  onClick={() => setSelectedWeight(weight)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    selectedWeight === weight
                      ? "bg-[#D4AF37] text-black"
                      : "bg-muted text-foreground hover:bg-[#D4AF37]/20"
                  }`}
                >
                  {weight}g
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==========================
            PRODUCT GRID
        =========================== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-60 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product, index) => {
              // Logic Harga
              let livePrice = product.price;

              if (product.category_id && priceLookup[product.category_id]) {
                const dynamicPrice = priceLookup[product.category_id][product.weight];
                if (dynamicPrice) {
                  livePrice = dynamicPrice;
                }
              }

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
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              Tidak ada produk yang sesuai filter.
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
               {/* Debugging info untuk membantumu melihat apa yang terjadi */}
               (Debug: Kategori Terpilih ID: {selectedCategoryId})
            </div>
            <button 
              onClick={() => { setSelectedCategoryId(null); setSelectedWeight(null); }}
              className="mt-4 text-sm text-[#D4AF37] hover:underline font-bold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
};