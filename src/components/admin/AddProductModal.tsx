import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSupabase, uploadProductImage } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatting";

const WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];
const EDITION_OPTIONS = ["Kemasan Terbaru", "Kemasan Retro/Lama"];

type Product = {
  id?: string;
  name?: string;
  weight?: number | string;
  edition?: string;
  price?: number;
  margin?: number;
  description?: string;
  image_url?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productToEdit?: Product | null;
};

export const AddProductModal: React.FC<Props> = ({ open, onClose, onSuccess, productToEdit = null }) => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState<number | string>("");
  const [edition, setEdition] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [margin, setMargin] = useState<number | string>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name ?? "");
      setDescription(productToEdit.description ?? "");
      setWeight(productToEdit.weight ?? "");
      setEdition(productToEdit.edition ?? "");
      setPrice(productToEdit.price ?? "");
      setMargin(productToEdit.margin ?? 0);
      setImageUrl(productToEdit.image_url ?? null);
    } else {
      setName("");
      setDescription("");
      setWeight("");
      setEdition("");
      setPrice("");
      setMargin(0);
      setImageUrl(null);
      setImageFile(null);
    }
  }, [productToEdit, open]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const publicUrl = await uploadProductImage(supabase, file);
      setImageUrl(publicUrl);
      toast({ title: "Uploaded", description: "Image uploaded successfully" });
      return publicUrl;
    } catch (err: any) {
      console.error("upload error:", err);
      toast({ title: "Upload failed", description: err?.message || String(err) });
      throw err;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);

      // If a new image file is chosen, upload first
      if (imageFile) {
        await handleUpload(imageFile);
      }

      const payload: any = {
        name: name.trim(),
        edition: edition.trim() || null,
        description: description.trim() || null,
        weight: weight === "" ? null : Number(weight),
        price: price === "" ? null : Number(price),
        margin: margin === "" ? 0 : Number(margin),
        image_url: imageUrl,
      };

      if (productToEdit && productToEdit.id) {
        const { data, error } = await supabase.from("products").update(payload).eq("id", productToEdit.id).select();
        if (error) throw error;
        toast({ title: "Updated", description: "Product updated successfully" });
      } else {
        payload.created_at = new Date().toISOString();
        const { data, error } = await supabase.from("products").insert(payload).select();
        if (error) throw error;
        toast({ title: "Created", description: "Product added successfully" });
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err: any) {
      console.error("AddProductModal error:", err);
      if (err && err.status === 403) {
        toast({ title: "Permission denied", description: "Operation not allowed. Check RLS and storage policies." });
      } else {
        toast({ title: "Save failed", description: err?.message || String(err) });
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="relative bg-slate-800 w-full max-w-2xl p-6 rounded-xl shadow-2xl border border-slate-700 text-white"
      >
        <h3 className="text-xl font-semibold mb-4 text-gold">
          {productToEdit ? "Edit Emas Batangan" : "Tambah Emas Batangan"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/80">Nama Produk</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Emas Batangan Antam 1 Gram" className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white" />
            </div>
            <div>
              <label className="text-sm text-white/80">Berat (Gram)</label>
              <select value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white">
                <option value="">Pilih Berat</option>
                {WEIGHT_OPTIONS.map((w) => (
                  <option key={w} value={w}>{w}g</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/80">Edisi / Tahun</label>
              <select value={edition} onChange={(e) => setEdition(e.target.value)} required className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white">
                <option value="">Pilih Edisi</option>
                {EDITION_OPTIONS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/80">Harga Dasar (IDR)</label>
              <input type="number" value={price as any} onChange={(e) => setPrice(e.target.value)} required placeholder="0" className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white" />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/80">Margin / Fee Cetak (IDR)</label>
            <input type="number" value={margin as any} onChange={(e) => setMargin(e.target.value)} placeholder="0" className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white" />
            <p className="text-xs text-white/60 mt-1">Biaya tambahan yang ditambahkan ke harga dasar untuk produk ini</p>
          </div>

          <div>
            <label className="text-sm text-white/80">Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="e.g., Emas batangan Antam dengan sertifikat resmi, kemasan original" className="w-full mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 text-white" />
          </div>

          <div>
            <label className="text-sm text-white/80">Gambar</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="text-sm text-white/80"
              />
              {uploading && <div className="text-sm text-white/70">Uploading...</div>}
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="w-20 h-20 object-cover rounded ml-auto border border-slate-700" />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 text-white">
              Batal
            </button>
            <button type="submit" disabled={loading || uploading} className="px-5 py-2 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#b38f2e] text-slate-900 font-semibold">
              {loading ? "Menyimpan..." : productToEdit ? "Perbarui Produk" : "Tambah Produk"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProductModal;
