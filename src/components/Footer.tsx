import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import logo from "@/assets/raihan-gold-logo.png";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const Footer = () => {
  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-secondary border-t border-gold/10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <ScrollReveal width="100%" animation="fadeUp" duration={0.5}>
            <div>
            <img src={logo} alt="Raihan Gold" className="h-16 w-auto mb-4" />
            <p className="text-cream/60 text-sm leading-relaxed">
              Mitra terpercaya untuk jual & beli emas berkualitas. Berkomitmen memberikan pelayanan terbaik.
            </p>
          </div>
          </ScrollReveal>

          {/* Quick Links */}
          <ScrollReveal width="100%" animation="fadeUp" delay={0.1} duration={0.5}>
            <div>
            <h4 className="text-cream font-serif font-semibold mb-4">
              Menu
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Beranda", href: "#beranda" },
                { label: "Harga Emas", href: "#harga-emas" },
                { label: "Produk", href: "#produk" },
                { label: "Tentang Kami", href: "#tentang" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="text-cream/60 hover:text-gold text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          </ScrollReveal>

          {/* Contact */}
          <ScrollReveal width="100%" animation="fadeUp" delay={0.2} duration={0.5}>
            <div>
            <h4 className="text-cream font-serif font-semibold mb-4">
              Kontak
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-cream/60 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-gold" />
                <span>bekasi dan yogyakarta</span>
              </li>
              <li className="flex items-center gap-3 text-cream/60 text-sm">
                <Phone className="w-4 h-4 text-gold" />
                <span>+628123456789</span>
              </li>
              <li className="flex items-center gap-3 text-cream/60 text-sm">
                <Mail className="w-4 h-4 text-gold" />
                <span>buy@raihangold.com</span>
              </li>
            </ul>
          </div>
          </ScrollReveal>

          {/* Hours */}
          <ScrollReveal width="100%" animation="fadeUp" delay={0.3} duration={0.5}>
            <div>
            <h4 className="text-cream font-serif font-semibold mb-4">
              Jam Operasional
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-cream/60 text-sm">
                <Clock className="w-4 h-4 text-gold" />
                <div>
                  <p>Senin - Sabtu</p>
                  <p className="text-cream">09:00 - 18:00 WIB</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-cream/60 text-sm">
                <Clock className="w-4 h-4 text-gold" />
                <div>
                  <p>Minggu & Hari Libur</p>
                  <p className="text-cream">Tutup</p>
                </div>
              </li>
            </ul>
          </div>
          </ScrollReveal>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gold/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-cream/40 text-sm">
              © {new Date().getFullYear()} Raihan Gold.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-cream/40 hover:text-gold text-sm transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-cream/40 hover:text-gold text-sm transition-colors">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
