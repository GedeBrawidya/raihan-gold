import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSupabase } from "@/lib/supabase";
import { Star, Loader2, Quote } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at?: string;
}

export const TestimonialTicker = () => {
  const { supabase } = useSupabase();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovedReviews();
  }, []);

  const loadApprovedReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      console.error("Load reviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 md:h-40 bg-secondary">
        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (reviews.length === 0) return null;

  const displayReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className="py-16 md:py-24 bg-secondary overflow-hidden relative border-t border-gold/5 -mb-px">
      
      <div className="container mx-auto px-4 mb-10 md:mb-12 text-center relative z-10">
        <ScrollReveal width="100%" animation="fadeUp" duration={0.6}>
          <div>
            <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs md:text-sm font-medium rounded-full mb-4">
              Testimoni
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-4">
              Apa Kata <span className="text-gold block sm:inline">Pelanggan Kami?</span>
            </h2>
            <p className="text-cream/60 max-w-2xl mx-auto text-sm md:text-base px-2">
              Kepercayaan Anda adalah aset terbesar kami. Berikut adalah pengalaman mereka berbelanja di Raihan Gold.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Marquee Container */}
      <div className="overflow-hidden flex pb-8 md:pb-12">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex gap-4 md:gap-8 pl-4"
        >
          {displayReviews.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              // Mobile: Width 300px, Desktop: 400px
              className="flex-shrink-0 w-[300px] md:w-[400px]"
            >
              <div className="h-full p-6 md:p-8 rounded-2xl bg-slate-medium border border-gold/10 hover:border-gold/30 transition-colors flex flex-col justify-between relative group">
                
                {/* Icon Quote - Hidden on small mobile to save space, visible on larger */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 opacity-10 group-hover:opacity-100 transition-opacity duration-500">
                    <Quote className="w-6 h-6 md:w-8 md:h-8 text-gold" />
                </div>

                <div>
                    <div className="flex gap-1 mb-4 md:mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14} // Smaller stars on mobile
                          className={`${
                            i < review.rating ? "fill-gold text-gold" : "text-slate-600 fill-slate-700"
                          } md:w-4 md:h-4`} // Larger on desktop
                        />
                      ))}
                    </div>

                    <p className="text-cream/80 text-sm md:text-base mb-6 leading-relaxed italic line-clamp-4">
                      "{review.comment}"
                    </p>
                </div>

                <div className="flex items-center gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gold/5 mt-auto">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <span className="text-gold font-serif font-bold text-base md:text-lg">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-cream font-serif font-semibold tracking-wide text-sm md:text-base truncate">
                        {review.customer_name}
                    </p>
                    <p className="text-[10px] md:text-xs text-cream/50 uppercase tracking-widest mt-0.5">
                      {review.created_at 
                        ? new Date(review.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })
                        : "-"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Fade Gradients - Hidden on very small screens if annoying */}
      <div className="absolute top-0 left-0 h-full w-12 md:w-24 bg-gradient-to-r from-secondary to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 h-full w-12 md:w-24 bg-gradient-to-l from-secondary to-transparent pointer-events-none z-10" />
      
      {/* Bottom padding untuk memastikan background konsisten */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-secondary pointer-events-none" />
    </section>
  );
};