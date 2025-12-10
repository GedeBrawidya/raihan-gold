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
    <section id="tentang" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 bg-gold/10 text-gold text-sm font-medium rounded-full mb-4">
              Tentang Kami
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-6">
              Mitra Terpercaya untuk{" "}
              <span className="luxury-text">Jual & Beli Emas</span> Anda
            </h2>
            <p className="text-cream/70 leading-relaxed mb-8">
              Raihan Gold hadir sebagai solusi jual & beli emas terpercaya di Indonesia. 
              Dengan pengalaman bertahun-tahun dalam industri logam mulia, kami berkomitmen 
              memberikan produk berkualitas tinggi dan pelayanan terbaik untuk setiap pelanggan.
            </p>
            <p className="text-cream/70 leading-relaxed">
              Kami menyediakan berbagai pilihan emas ANTAM (batangan & koin) dengan sertifikat resmi. 
              Tersedia pilihan berat dan nominal sesuai kebutuhan jual/beli Anda. Kepuasan dan kepercayaan 
              pelanggan adalah prioritas utama kami.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-2xl bg-slate-medium border border-gold/10 hover:border-gold/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-cream mb-2">
                  {feature.title}
                </h3>
                <p className="text-cream/60 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
