import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useEffect, useState } from "react";
import { useSupabase, getProducts, getBaseGoldPrice } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatting";

const WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];
const EDITION_OPTIONS = [
  { value: "terbaru", label: "Kemasan Terbaru (Certieye)" },
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

  async function load() {
    try {
      setLoading(true);
      const [rows, basePriceData] = await Promise.all([
        getProducts(supabase),
        getBaseGoldPrice(supabase),
      ]);
      setProducts(rows ?? []);
      setBasePrice(basePriceData);
    } catch (err: any) {
      console.error("ProductCatalog load error:", err);
      toast({ title: "Error loading products", description: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter products by weight and edition
  const filteredProducts = products.filter((p) => {
    if (p.is_active === false) return false;
    if (selectedWeight !== null && p.weight !== selectedWeight) return false;
    if (selectedEdition && p.description?.toLowerCase().includes(selectedEdition) === false) return false;
    return true;
  });

  return (
    <section id="produk" className="py-24 bg-background">
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
            Koleksi Emas Antam
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Katalog Emas Batangan Antam
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pusat Jual Beli Emas Antam Terpercaya. Kami menyediakan emas batangan (logam mulia) berkualitas tinggi dengan sertifikat resmi. Pilih berat dan edisi yang sesuai kebutuhan Anda.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 space-y-6"
        >
          {/* Weight Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Filter Berat (Gram)
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedWeight(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedWeight === null
                    ? "bg-gold text-black"
                    : "bg-muted text-foreground hover:bg-gold/20"
                }`}
              >
                Semua Berat
              </button>
              {WEIGHT_OPTIONS.map((weight) => (
                <button
                  key={weight}
                  onClick={() => setSelectedWeight(weight)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Filter Edisi
            </h3>
            <select
              value={selectedEdition ?? ""}
              onChange={(e) => setSelectedEdition(e.target.value || null)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">Semua Edisi</option>
              {EDITION_OPTIONS.map((edition) => (
                <option key={edition.value} value={edition.value}>
                  {edition.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Produk tidak ditemukan dengan filter yang dipilih.
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">Tidak menemukan berat atau edisi yang Anda cari? Hubungi kami untuk permintaan khusus.</p>
          <a
            href="#tentang"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors"
          >
            Hubungi tim kami →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

