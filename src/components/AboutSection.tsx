import { motion } from "framer-motion";
import { Shield, Award, Users, Gem } from "lucide-react";

export const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Terpercaya",
      description: "Beroperasi dengan integritas tinggi dan transparansi harga.",
    },
    {
      icon: Award,
      title: "Bersertifikat",
      description: "Semua produk dilengkapi sertifikat keaslian resmi.",
    },
    {
      icon: Users,
      title: "Pelayanan Prima",
      description: "Tim profesional siap membantu kebutuhan jual/beli Anda.",
    },
    {
      icon: Gem,
      title: "Kualitas Terbaik",
      description: "Hanya menjual emas dengan kemurnian tertinggi.",
    },
  ];

  return (
    <section id="tentang" className="py-12 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Layout Utama: 1 Kolom di Mobile, 2 Kolom di Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start lg:items-center">
          
          {/* Bagian Kiri: Teks & Judul */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left" // Mobile: Center, Desktop: Left
          >
            <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs md:text-sm font-medium rounded-full mb-4">
              Tentang Kami
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-4 md:mb-6 leading-tight">
              Mitra Terpercaya untuk{" "}
              <span className="luxury-text block lg:inline">Jual & Beli Emas</span> Anda
            </h2>
            <p className="text-cream/70 leading-relaxed mb-6 text-sm md:text-base">
              Raihan Gold hadir sebagai solusi jual & beli emas terpercaya di Indonesia. 
              Dengan pengalaman bertahun-tahun dalam industri logam mulia, kami berkomitmen 
              memberikan produk berkualitas tinggi.
            </p>
            <p className="text-cream/70 leading-relaxed text-sm md:text-base hidden md:block">
              Kami menyediakan berbagai pilihan emas ANTAM (Logam Mulia) dengan sertifikat resmi. 
              Kepuasan dan kepercayaan pelanggan adalah prioritas utama kami.
            </p>
          </motion.div>

          {/* Bagian Kanan: Grid Kartu Fitur */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                // Card Style: Padding disesuaikan biar enak dilihat di HP
                className="p-5 rounded-2xl bg-slate-medium border border-gold/10 hover:border-gold/30 transition-colors flex flex-row sm:flex-col items-center sm:items-start gap-4 text-left"
              >
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                
                {/* Text Container */}
                <div>
                  <h3 className="text-base md:text-lg font-serif font-semibold text-cream mb-1 md:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-cream/60 text-xs md:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};