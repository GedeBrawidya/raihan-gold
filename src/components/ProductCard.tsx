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
  const displayPrice = Number(product.price || 0);
  const formattedPrice = formatCurrency(displayPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="
        group bg-card rounded-xl overflow-hidden 
        border border-border shadow-sm hover:shadow-lg 
        transition-all duration-300 flex flex-col h-full
      "
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={product.image_url || product.imagePath}
          alt={product.name}
          className="
            w-full h-full object-cover 
            group-hover:scale-105 
            transition-transform duration-700
          "
          loading="lazy"
        />

        {/* Badge Berat */}
        <div className="absolute top-2 left-2 z-20">
          <span className="
            px-2 py-0.5 
            bg-[#D4AF37] text-black 
            text-[10px] md:text-xs font-bold 
            rounded-md shadow
            inline-flex items-center gap-1
          ">
            <Weight size={10} />
            {product.weight} gram
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="
            text-base md:text-lg 
            font-serif font-bold 
            text-foreground mb-1
            line-clamp-1 group-hover:text-[#D4AF37] transition-colors
          ">
            {product.name}
          </h3>

          <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2 leading-snug">
            {product.description}
          </p>
        </div>

        <div className="h-px w-full bg-border mb-3" />

        {/* Price */}
        <div className="mb-3">
          <p className="text-[10px] md:text-xs text-muted-foreground mb-1">Estimasi Harga</p>
          <p className="text-xl md:text-2xl font-bold text-[#D4AF37]">
            {formattedPrice}
          </p>
        </div>

        <Button
          className="
            w-full bg-green-600 hover:bg-green-700 
            text-white font-semibold text-sm 
            py-2 md:py-3
            shadow-md hover:shadow-lg
          "
          asChild
        >
          <a
            href={generateWhatsAppLink(product.name, product.weight, formattedPrice)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <MessageCircle className="w-4 h-4 mr-1 inline-block" />
            Beli via WhatsApp
          </a>
        </Button>

      </div>
    </motion.div>
  );
};

