import { HelmetProvider } from "react-helmet-async";
import { SEOMeta } from "@/components/SEOMeta";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { GoldPriceTable } from "@/components/GoldPriceTable";
import { ProductCatalog } from "@/components/ProductCatalog";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <HelmetProvider>
      <SEOMeta />
      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <GoldPriceTable />
          <ProductCatalog />
          <AboutSection />
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default Index;
