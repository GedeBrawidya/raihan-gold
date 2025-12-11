import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Star, Trash2, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at?: string;
}

export const ReviewManager = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      console.error("Load reviews error:", err);
      toast({ title: "Error", description: "Gagal memuat reviews", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: true })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Sukses", description: "Review berhasil disetujui dan ditayangkan." });
      
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r))
      );
    } catch (err: any) {
      toast({ title: "Error", description: "Gagal menyetujui review", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus review ini permanen?")) return;

    try {
      setActionLoading(id);
      const { error } = await supabase.from("reviews").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Terhapus", description: "Review telah dihapus dari database." });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast({ title: "Error", description: "Gagal menghapus review", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const approvedReviews = reviews.filter((r) => r.is_approved);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Moderasi Review</h1>
          <p className="text-muted-foreground mt-1">
            Kelola ulasan pelanggan yang masuk dari halaman depan.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg text-sm font-semibold border border-amber-200 dark:border-amber-800">
            Pending: {pendingReviews.length}
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-200 dark:border-emerald-800">
            Live: {approvedReviews.length}
          </div>
        </div>
      </div>

      {/* SECTION 1: PENDING (Prioritas Utama) */}
      {/* Dibungkus kotak Amber agar mencolok */}
      {pendingReviews.length > 0 ? (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-amber-100/50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <h2 className="text-lg font-bold text-amber-800 dark:text-amber-200">
              Menunggu Persetujuan ({pendingReviews.length})
            </h2>
          </div>
          
          <div className="divide-y divide-amber-200/50 dark:divide-amber-800/30">
            {pendingReviews.map((review) => (
              <div key={review.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-amber-100/20 transition-colors">
                {/* User Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground text-lg">{review.customer_name}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">Baru</span>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < review.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground/80 italic">"{review.comment}"</p>
                </div>

                {/* Action Buttons (BOLD SOLID COLORS) */}
                <div className="flex gap-3 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => approveReview(review.id)}
                    disabled={actionLoading === review.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                  >
                    {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Setujui
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={actionLoading === review.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Empty State untuk Pending
        <div className="bg-muted/30 border border-dashed border-border rounded-xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground font-medium">Tidak ada review baru yang menunggu moderasi.</p>
        </div>
      )}

      {/* SECTION 2: APPROVED / LIVE */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 px-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Review Live di Website ({approvedReviews.length})
        </h2>
        
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {approvedReviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Pelanggan</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 w-1/2">Komentar</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {approvedReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{review.customer_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < review.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-xs" title={review.comment}>
                        {review.comment}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteReview(review.id)}
                          disabled={actionLoading === review.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-medium rounded-md transition-colors text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>Belum ada review yang disetujui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewManager;