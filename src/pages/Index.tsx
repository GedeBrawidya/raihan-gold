import { HelmetProvider } from "react-helmet-async";
import { SEOMeta } from "@/components/SEOMeta";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { GoldPriceTable } from "@/components/GoldPriceTable";
import { ProductCatalog } from "@/components/ProductCatalog";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialTicker } from "@/components/reviews/TestimonialTicker";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <HelmetProvider>
      <SEOMeta />
      
      <div className="min-h-screen bg-background text-foreground selection:bg-[#D4AF37] selection:text-black"> 
        <Header />
        <main>
          <HeroSection />
          
          {/* Section 1: Harga Emas */}
          <GoldPriceTable />
          
          {/* Section 2: Katalog (Background Putih/Polos) */}
          <ProductCatalog />

          {/* SECTION REVIEW: UPDATED GRADIENT TOP */}
          <section 
            id="review-form" 
            // 👇 PERUBAHAN DISINI:
            // bg-gradient-to-b: Gradasi ke bawah
            // from-slate-50: Mulai dari Abu tipis di ATAS
            // to-background: Berakhir di Putih/Background asli di BAWAH
            className="py-24 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900 dark:to-background relative"
          >
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                
                {/* Badge Emas */}
                <span className="inline-block px-4 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium rounded-full mb-4">
                  Testimoni Pelanggan
                </span>
                
                {/* Judul: Hitam (Adaptive) */}
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
                  Puas dengan <span className="text-[#D4AF37]">Layanan Kami?</span>
                </h2>
                
                {/* Deskripsi */}
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  Bagikan pengalaman transaksi emas Anda bersama Raihan Gold. Masukan Anda sangat berarti bagi kami.
                </p>
              </div>
              
              {/* Form Component (Hitam Mewah) */}
              <ReviewForm onSuccess={() => console.log("Review terkirim!")} />
            </div>
          </section>

          {/* Testimonial Ticker Section */}
          <div className="">
             <TestimonialTicker />
          </div>

          {/* About Section */}
          <AboutSection />

        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default Index;