import { motion } from "framer-motion";
import { MessageCircle, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatting";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface ProductCardProps {
  product: any;
  index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
  // Karena perhitungan (Base Price * Berat) sudah dilakukan di ProductCatalog.tsx,
  // di sini kita tinggal ambil product.price saja.
  const displayPrice = Number(product.price || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      // STYLE: Card adaptive (Light/Dark) dengan border halus
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {/* Placeholder Gradient Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-[#D4AF37]/20 blur-xl" />
        </div>
        
        <img
          src={product.image_url || product.imagePath}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10"
          loading="lazy"
        />

        {/* Badge Berat (Pojok Kiri Atas) */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-lg shadow-md inline-flex items-center gap-1">
            <Weight size={12} />
            {product.weight} gram
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-lg font-serif font-bold text-foreground mb-2 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        {/* Divider Tipis */}
        <div className="h-px w-full bg-border mb-4" />
        
        {/* Price Section */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Estimasi Harga</p>
          <div className="flex items-baseline gap-1">
            {/* HARGA: Warna Emas & Font Besar */}
            <p className="text-2xl font-bold text-[#D4AF37]">
              {formatCurrency(displayPrice)}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
          asChild
        >
          <a
            href={generateWhatsAppLink(product.name, product.weight)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Beli via WhatsApp
          </a>
        </Button>
      </div>
    </motion.div>
  );
};