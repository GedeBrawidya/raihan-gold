import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { 
  useSupabase, 
  getProducts, 
  getGoldCategories, 
  getAllGoldPrices, // <--- JANGAN LUPA IMPORT INI (Fungsi baru di step 1)
  GoldCategory,
  GOLD_WEIGHT_OPTIONS 
} from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const ProductCatalog = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<GoldCategory[]>([]);
  
  // STATE BARU: Untuk menyimpan Master Harga Emas
  const [goldPrices, setGoldPrices] = useState<any[]>([]);

  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ==========================
  // LOAD DATA
  // ==========================
  async function load() {
    try {
      setLoading(true);

      const [productsData, categoriesData, pricesData] = await Promise.all([
        getProducts(supabase),
        getGoldCategories(supabase),
        getAllGoldPrices(supabase), // <--- Ambil Master Harga
      ]);

      const sortedProducts = (productsData ?? []).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const sortedCategories = (categoriesData ?? []).sort((a, b) => 
        b.name.localeCompare(a.name, undefined, { numeric: true })
      );

      setProducts(sortedProducts);
      setCategories(sortedCategories);
      setGoldPrices(pricesData ?? []); // Simpan Master Harga

    } catch (err) {
      console.error("Error loading catalog:", err);
      toast({ title: "Gagal memuat katalog", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ==========================
  // LOGIC FILTER
  // ==========================
  const filteredProducts = products.filter((p) => {
    if (p.is_active === false) return false;
    if (selectedWeight !== null && p.weight !== selectedWeight) return false;
    if (selectedCategoryId !== null && p.category_id !== selectedCategoryId) return false;
    return true;
  });

  return (
    <section id="produk" className="py-12 md:py-24 bg-background relative">
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
            Harga terupdate otomatis mengikuti pasar (Real-time).
          </p>
        </motion.div>

        {/* ==========================
            FILTERS
        =========================== */}
        <div className="mb-10 space-y-6">
          {/* Filter 1: Kategori */}
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Filter Edisi Tahun
            </h3>
            <select
              value={selectedCategoryId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCategoryId(val ? parseInt(val) : null);
              }}
              className="w-full md:w-auto min-w-[200px] px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Semua Edisi</option>
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
              const category = categories.find(c => c.id === product.category_id);

              // === LOGIC HITUNG HARGA DINAMIS ===
              // 1. Cari data harga per gram yang cocok (Kategori & Berat sama)
              const matchedPriceData = goldPrices.find(
                (gp) => gp.category_id === product.category_id && gp.weight === product.weight
              );

              // 2. Hitung harga baru
              // Kalau ketemu setting harganya -> Pakai (HargaPerGram * BeratProduk)
              // Kalau TIDAK ketemu -> Pakai harga lama yg tersimpan di produk (Fallback)
              const dynamicPrice = matchedPriceData 
                ? (matchedPriceData.price * product.weight) 
                : product.price;

              return (
                <ProductCard
                  key={product.id}
                  index={index}
                  product={product}
                  categoryName={category?.name}
                  onImageClick={(url) => setSelectedImage(url)}
                  // 👇 KITA KIRIM HARGA UPDATE DISINI
                  displayPrice={dynamicPrice} 
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              Tidak ada produk yang sesuai filter.
            </p>
            <button 
              onClick={() => { setSelectedCategoryId(null); setSelectedWeight(null); }}
              className="mt-4 text-sm text-[#D4AF37] hover:underline font-bold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* ==========================
          MODAL / LIGHTBOX GAMBAR
      =========================== */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)} 
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <button className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-2">
              <X size={24} />
            </button>

            <motion.img
              src={selectedImage}
              alt="Zoomed Product"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};