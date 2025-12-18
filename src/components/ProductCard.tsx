import { motion } from "framer-motion";
import { MessageCircle, Weight, Calculator, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatting";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface Product {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  price: number;
  image_url: string | null;
  category_id?: number | null;
  is_active?: boolean;
}

interface ProductCardProps {
  product: Product;
  index: number;
  categoryName?: string; // <--- Props Baru (Opsional)
}

export const ProductCard = ({ product, index, categoryName }: ProductCardProps) => {
  const totalPrice = Number(product.price || 0);
  const pricePerGram = product.weight > 0 ? totalPrice / product.weight : 0;

  const formattedTotalPrice = formatCurrency(totalPrice);
  const formattedPricePerGram = formatCurrency(pricePerGram);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="
        group bg-card rounded-xl overflow-hidden 
        border border-border shadow-sm hover:shadow-lg 
        transition-all duration-300 flex flex-col h-full relative
      "
    >
      {/* --- IMAGE SECTION --- */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="
              w-full h-full object-cover 
              group-hover:scale-105 
              transition-transform duration-700
            "
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-slate-100 dark:bg-slate-800">
            No Image
          </div>
        )}

        {/* BADGE BERAT (Kiri Atas) */}
        <div className="absolute top-2 left-2 z-20">
          <span className="
              px-2.5 py-1 bg-black/70 backdrop-blur-md text-[#D4AF37] 
              text-[10px] md:text-xs font-bold 
              rounded-lg shadow-sm inline-flex items-center gap-1.5 border border-[#D4AF37]/30
            ">
            <Weight size={11} className="text-white" />
            {product.weight} gr
          </span>
        </div>

        {/* BADGE TAHUN / KATEGORI (Kanan Atas) - BARU */}
        {categoryName && (
          <div className="absolute top-2 right-2 z-20">
            <span className="
                px-2.5 py-1 bg-[#D4AF37] text-black 
                text-[10px] md:text-xs font-bold 
                rounded-lg shadow-sm inline-flex items-center gap-1.5
              ">
              <Calendar size={11} className="text-black" />
              {categoryName}
            </span>
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1 space-y-2">
          <h3 className="
              text-base md:text-lg font-serif font-bold 
              text-foreground line-clamp-2 leading-tight
              group-hover:text-[#D4AF37] transition-colors
            " title={product.name}>
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-8">
            {product.description || "Tidak ada deskripsi."}
          </p>
        </div>

        <div className="h-px w-full bg-border/50 my-4" />

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Total Harga</span>
            {totalPrice > 0 && (
              <span className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                <Calculator size={10} /> 
                ~{formattedPricePerGram}/g
              </span>
            )}
          </div>
          <p className="text-xl md:text-2xl font-bold text-[#D4AF37] tracking-tight">
            {totalPrice > 0 ? formattedTotalPrice : "Hubungi Admin"}
          </p>
        </div>

        <Button
          className={`
            w-full font-semibold text-sm shadow-md hover:shadow-lg
            py-2 md:py-5 min-h-[44px] transition-all
            ${totalPrice > 0 
              ? "bg-[#25D366] hover:bg-[#128C7E] text-white" 
              : "bg-slate-800 hover:bg-slate-900 text-white"
            }
          `}
          asChild
        >
          <a
            href={generateWhatsAppLink(
              product.name, 
              product.weight, 
              totalPrice > 0 ? formattedTotalPrice : "Tanya Harga"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>
              {totalPrice > 0 ? "Beli via WhatsApp" : "Tanya Ketersediaan"}
            </span>
          </a>
        </Button>
      </div>
    </motion.div>
  );
};