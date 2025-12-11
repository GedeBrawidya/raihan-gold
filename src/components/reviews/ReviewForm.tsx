import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSupabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Star, Send, Loader2 } from "lucide-react";

interface ReviewFormProps {
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSuccess }) => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    rating: 5,
    comment: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name.trim()) {
      toast({ title: "Validasi", description: "Nama tidak boleh kosong", variant: "destructive" });
      return;
    }
    if (formData.comment.trim().length < 10) {
      toast({ title: "Validasi", description: "Komentar minimal 10 karakter", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("reviews").insert({
        customer_name: formData.customer_name.trim(),
        rating: formData.rating,
        comment: formData.comment.trim(),
        is_approved: false,
      });

      if (error) throw error;

      toast({
        title: "Terkirim!",
        description: "Review Anda menunggu persetujuan admin.",
        className: "bg-slate-900 text-gold border-slate-800",
      });

      setFormData({ customer_name: "", rating: 5, comment: "" });
      onSuccess?.();
    } catch (err: any) {
      toast({ title: "Error", description: "Gagal mengirim review", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      
      // STYLE MATCHING TESTIMONIAL TICKER:
      // bg-slate-medium (Hitam Elegan) + border-gold/10
      className="bg-slate-medium border border-gold/10 rounded-2xl p-8 md:p-10 max-w-2xl mx-auto shadow-2xl relative overflow-hidden group"
    >
      {/* Efek Glow Emas Halus di Pojok (Sama seperti Ticker hover effect tapi statis) */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-5 blur-[80px] pointer-events-none" />

      {/* Header Form */}
      <div className="mb-8 relative z-10">
        <h3 className="text-2xl font-serif font-bold text-cream mb-2">
          Bagikan <span className="text-gold">Pengalaman Anda</span>
        </h3>
        <p className="text-cream/60 leading-relaxed text-sm">
          Bantu pelanggan lain menemukan kualitas terbaik dari Raihan Gold.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Input Nama */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cream/80">Nama Lengkap *</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            placeholder="Contoh: Budi Santoso"
            required
            disabled={loading}
            // INPUT STYLE: bg-slate-900 (Lebih gelap dari card) agar terlihat 'dalam'
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-gold/10 text-cream placeholder-cream/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
          />
        </div>

        {/* Input Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cream/80 block mb-2">Rating Layanan *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                disabled={loading}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={32}
                  className={`${
                    star <= formData.rating
                      ? "fill-gold text-gold" // Emas Solid (Sama kayak Ticker)
                      : "text-slate-600 fill-slate-700" // Abu Gelap (Sama kayak Ticker)
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Input Komentar */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cream/80">Ulasan *</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Ceritakan pengalaman transaksi Anda..."
            rows={4}
            required
            disabled={loading}
            minLength={10}
            // TEXTAREA STYLE: Samakan dengan Input
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-gold/10 text-cream placeholder-cream/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
          />
        </div>

        {/* Tombol Submit: Emas Solid */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gold hover:bg-yellow-600 text-slate-900 font-bold tracking-wide rounded-xl transition-all shadow-lg hover:shadow-gold/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              MENGIRIM...
            </>
          ) : (
            <>
              KIRIM REVIEW
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ReviewForm;