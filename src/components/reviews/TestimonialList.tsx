import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSupabase } from "@/lib/supabase";
import { Star, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/formatting";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at?: string;
}

export const TestimonialList = () => {
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
        .order("created_at", { ascending: false })
        .limit(12); // Limit to 12 reviews for grid display

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      console.error("Load reviews error:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-gold/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Kepuasan Pelanggan Kami
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Ribuan pelanggan puas telah mempercayai kami untuk kebutuhan jual & beli emas mereka.
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-slate-800/50 backdrop-blur border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-colors"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={`${
                      i < review.rating ? "fill-gold text-gold" : "text-slate-600"
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3">
                "{review.comment}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-sm">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {review.customer_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {review.created_at
                        ? formatDate(new Date(review.created_at))
                        : "Baru saja"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Reviews Link (Optional) */}
        <div className="text-center mt-12">
          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg transition-colors"
          >
            Lihat Semua Reviews
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialList;
