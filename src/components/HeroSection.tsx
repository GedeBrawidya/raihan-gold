import { motion } from "framer-motion";
import { ArrowDown, Shield, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  const features = [
    { icon: Shield, label: "Terpercaya" },
    { icon: Award, label: "Bersertifikat" },
    { icon: Clock, label: "Cepat & Aman" },
  ];

  return (
    <section
      id="beranda"
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-slate-dark to-secondary py-20 md:py-0"
    >
      {/* Decorative Elements (Adjusted size for mobile) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-40 md:w-80 h-40 md:h-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full border border-gold/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[500px] md:h-[800px] rounded-full border border-gold/5" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gold/10 border border-gold/20 mb-6 md:mb-8"
          >
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs md:text-sm font-medium">Jual & Beli Emas Terpercaya</span>
          </motion.div>

          {/* Main Heading - Responsive Font Sizes */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-cream mb-4 md:mb-6 leading-tight"
          >
            Jual & Beli Emas{" "}
            <span className="luxury-text block sm:inline">Premium</span>
            <span className="block sm:inline"> Bersama Raihan Gold</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm md:text-xl text-cream/70 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Jual & Beli Emas ANTAM (batangan & koin) berkualitas tinggi
            dengan harga kompetitif dan pelayanan terbaik.
          </motion.p>

          {/* CTA Buttons - Stack on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-12 md:mb-16 w-full px-4"
          >
            <Button variant="gold" size="lg" className="w-full sm:w-auto h-12 md:h-14 text-base md:text-lg" asChild>
              <a href="#harga-emas">Lihat Harga Emas</a>
            </Button>
            <Button variant="goldOutline" size="lg" className="w-full sm:w-auto h-12 md:h-14 text-base md:text-lg" asChild>
              <a href="#produk">Katalog Produk</a>
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="flex items-center gap-2 text-cream/60"
              >
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                <span className="text-xs md:text-sm font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <motion.a
          href="#harga-emas"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-cream/40 hover:text-gold transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-5 h-5" />
        </motion.a>
      </motion.div>
    </section>
  );
};