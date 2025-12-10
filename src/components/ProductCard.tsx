import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/goldData";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface ProductCardProps {
  product: any;
  index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-light opacity-20" />
        </div>
        <img
          src={product.image_url || product.imagePath}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-gold text-secondary text-xs font-semibold rounded-full shadow-lg inline-flex items-center gap-1 whitespace-nowrap">
            <span className="text-sm">{product.weight}</span>
            <span className="text-xs font-medium">gram</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-serif font-semibold text-foreground mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {/* Weight Info */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
            <span className="font-semibold text-foreground">{product.weight}</span>
            <span>gram</span>
          </span>
        </div>
        
        {/* Price */}
        <div className="mb-4">
          <span className="text-xs text-muted-foreground">Harga Perkiraan</span>
          <p className="text-2xl font-bold luxury-text">{formatCurrency(Number(product.price ?? product.priceEstimation ?? 0))}</p>
        </div>

        {/* CTA Button */}
        <Button
          variant="whatsapp"
          className="w-full"
          asChild
        >
          <a
            href={generateWhatsAppLink(product.name, product.weight)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="w-4 h-4" />
            Beli via WhatsApp
          </a>
        </Button>
      </div>
    </motion.div>
  );
};
