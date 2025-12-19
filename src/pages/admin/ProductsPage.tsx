import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getGoldCategories,
  getAllGoldPrices, 
  GoldCategory,
  GOLD_WEIGHT_OPTIONS,
} from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatting";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Loader2, Filter, Calculator, RefreshCw, Save, CheckCircle2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  weight: number;
  price: number; // Harga tersimpan di DB
  image_url: string;
  is_active: boolean;
  category_id?: number;
  created_at: string;
}

export const ProductsPage: React.FC = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<GoldCategory[]>([]);
  const [masterPrices, setMasterPrices] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // State untuk loading sync
  const [filterCategoryId, setFilterCategoryId] = useState<number | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: "",
    price: "",
    image_url: "",
    is_active: true,
    category_id: "",
  });
  const [calculationInfo, setCalculationInfo] = useState<string>("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, allPricesData] = await Promise.all([
        getProducts(supabase),
        getGoldCategories(supabase),
        getAllGoldPrices(supabase),
      ]);

      const sortedProducts = (productsData || []).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setProducts(sortedProducts);
      setCategories(categoriesData || []);
      setMasterPrices(allPricesData || []); 
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // === FITUR BARU: SYNC SEMUA HARGA ===
  const handleSyncAllPrices = async () => {
    if (!confirm("Yakin ingin update semua harga produk di Database sesuai harga Master saat ini?")) return;
    
    setIsSyncing(true);
    let updatedCount = 0;

    try {
      // Kumpulkan promise update biar jalan paralel (ngebut)
      const updatePromises = products.map(async (product) => {
        const matchedMaster = masterPrices.find(
          p => p.category_id === product.category_id && p.weight === product.weight
        );

        if (matchedMaster) {
          const newPrice = matchedMaster.price * product.weight;
          
          // Cuma update kalau harganya beda
          if (newPrice !== product.price) {
            updatedCount++;
            return updateProduct(supabase, product.id, { price: newPrice });
          }
        }
        return null;
      });

      await Promise.all(updatePromises);
      
      toast({ 
        title: "Sync Berhasil", 
        description: `${updatedCount} produk berhasil diupdate harganya.` 
      });
      
      await loadInitialData(); // Reload data biar tampilan fresh

    } catch (err: any) {
      toast({ title: "Gagal Sync", description: err.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  // === FITUR BARU: SYNC SATU PRODUK ===
  const handleSyncSingle = async (product: Product, newPrice: number) => {
    try {
      setIsSyncing(true);
      await updateProduct(supabase, product.id, { price: newPrice });
      toast({ title: "Updated", description: "Harga produk disinkronkan." });
      await loadInitialData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  // Logic Form Kalkulasi
  useEffect(() => {
    const weightNum = parseFloat(formData.weight);
    const catId = parseInt(formData.category_id);
    if (!isNaN(weightNum) && !isNaN(catId) && masterPrices.length > 0) {
      const foundPriceData = masterPrices.find(
        (p) => p.category_id === catId && p.weight === weightNum
      );
      if (foundPriceData) {
        const basePricePerGram = foundPriceData.price;
        const calculatedTotalPrice = basePricePerGram * weightNum;
        setFormData((prev) => ({ ...prev, price: calculatedTotalPrice.toString() }));
        setCalculationInfo(`Auto: ${formatCurrency(basePricePerGram)}/gr × ${weightNum}gr`);
      } else {
        setCalculationInfo("Harga master belum diset.");
      }
    } else {
      setCalculationInfo("");
    }
  }, [formData.weight, formData.category_id, masterPrices]);

  const resetForm = () => {
    setFormData({ name: "", description: "", weight: "", price: "", image_url: "", is_active: true, category_id: "" });
    setEditingId(null);
    setCalculationInfo("");
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      weight: product.weight.toString(),
      price: product.price.toString(),
      image_url: product.image_url,
      is_active: product.is_active,
      category_id: product.category_id ? product.category_id.toString() : "",
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadProductImage(supabase, file);
      setFormData({ ...formData, image_url: url });
      toast({ title: "Success", description: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const weight = parseFloat(formData.weight);
      const price = parseFloat(formData.price);
      const categoryId = formData.category_id ? parseInt(formData.category_id) : null;
      if (!formData.name.trim()) return;
      if (!categoryId) return;

      const payload = {
        name: formData.name,
        description: formData.description,
        weight,
        price, 
        image_url: formData.image_url,
        is_active: formData.is_active,
        category_id: categoryId,
      };

      if (editingId) {
        await updateProduct(supabase, editingId, payload);
      } else {
        await createProduct(supabase, payload);
      }
      setModalOpen(false);
      resetForm();
      await loadInitialData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await deleteProduct(supabase, id);
      await loadInitialData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filterCategoryId === "all") return true;
    return product.category_id === filterCategoryId;
  });

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin"/></div>;

  // Hitung berapa produk yang Out of Sync (Harga DB != Harga Master)
  const outOfSyncCount = products.filter(p => {
    const master = masterPrices.find(mp => mp.category_id === p.category_id && mp.weight === p.weight);
    if (!master) return false;
    return master.price * p.weight !== p.price;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manajemen Produk</h1>
          <p className="text-slate-600 dark:text-slate-400">Harga di Admin ini sudah Real-time (Sync dengan Master Harga).</p>
        </div>
        <div className="flex gap-2">
            {/* BUTTON REFRESH DATA (Load ulang dari DB) */}
            <button onClick={loadInitialData} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors" title="Reload Data">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>

            {/* BUTTON SYNC MASSAL (Baru) */}
            {outOfSyncCount > 0 && (
              <button 
                onClick={handleSyncAllPrices} 
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 font-medium transition-colors"
              >
                {isSyncing ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18} />}
                Sync {outOfSyncCount} Harga
              </button>
            )}

            <button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8860B] font-medium shadow-md"
            >
            <Plus size={18} /> Tambah Produk
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-500" />
            <div className="flex gap-2">
                <button onClick={() => setFilterCategoryId("all")} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterCategoryId === "all" ? "bg-[#D4AF37] text-black" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>Semua</button>
                {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setFilterCategoryId(cat.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterCategoryId === cat.id ? "bg-[#D4AF37] text-black" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
            const matchedMaster = masterPrices.find(
                p => p.category_id === product.category_id && p.weight === product.weight
            );
            
            const displayPrice = matchedMaster ? matchedMaster.price * product.weight : product.price;
            const isSynced = matchedMaster && Math.abs(displayPrice - product.price) < 100;

            return (
                <div key={product.id} className={`bg-white dark:bg-slate-800 rounded-lg border overflow-hidden hover:shadow-lg transition-shadow relative ${!isSynced ? 'border-amber-400 dark:border-amber-600/50' : 'border-slate-200 dark:border-slate-700'}`}>
                    
                    {/* Gambar */}
                    <div className="h-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative">
                        {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : ( <span className="text-xs text-slate-400">No Image</span> )}
                        
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold">
                        {product.weight}g
                        </div>
                        {product.category_id && (
                            <div className="absolute top-2 left-2 bg-[#D4AF37]/90 text-black text-[10px] uppercase font-bold px-2 py-1 rounded">
                                {categories.find(c => c.id === product.category_id)?.name || "N/A"}
                            </div>
                        )}
                    </div>

                    <div className="p-4 space-y-3">
                        <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{product.description || "-"}</p>
                        </div>

                        <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-700 pt-3">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                                {matchedMaster ? "Live Price" : "Manual Price"}
                            </p>
                            <p className={`font-bold text-lg ${matchedMaster ? 'text-[#D4AF37]' : 'text-slate-600'}`}>
                                {formatCurrency(displayPrice)}
                            </p>
                            
                            {/* INDIKATOR SYNC INDIVIDUAL */}
                            {!isSynced && matchedMaster && (
                                <button 
                                  onClick={() => handleSyncSingle(product, displayPrice)}
                                  className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 hover:bg-amber-100 transition-colors"
                                >
                                    <RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} />
                                    DB Beda: {formatCurrency(product.price)} (Klik Sync)
                                </button>
                            )}
                            {isSynced && matchedMaster && (
                                <p className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1">
                                  <CheckCircle2 size={10}/> Synced
                                </p>
                            )}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${product.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                            {product.is_active ? "Active" : "Inactive"}
                        </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                        <button onClick={() => startEdit(product)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg border hover:bg-slate-100 text-xs font-medium">
                            <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 text-xs">
                            <Trash2 size={14} />
                        </button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Modal Form (Sama seperti sebelumnya) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b flex justify-between z-10">
              <h2 className="text-xl font-bold dark:text-white">{editingId ? "Edit Produk" : "Tambah Produk"}</h2>
              <button onClick={() => setModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">Nama Produk</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent dark:text-white" placeholder="Emas Antam 5g" />
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border dark:border-slate-600">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-white">Kategori</label>
                  <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:text-white">
                    <option value="">-- Pilih --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-semibold mb-2 dark:text-white">Berat (Gram)</label>
                   <select value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} disabled={!formData.category_id} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:text-white disabled:opacity-50">
                    <option value="">-- Pilih --</option>
                    {GOLD_WEIGHT_OPTIONS.map(w => <option key={w} value={w}>{w}g</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-white">Harga (Auto Update)</label>
                    <div className="relative">
                        <input type="number" value={formData.price} readOnly className="w-full px-4 py-2 border rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 pl-10 cursor-not-allowed" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    </div>
                    {calculationInfo && <p className="text-xs text-blue-600 mt-1 flex gap-1 items-center"><Calculator size={10}/> {calculationInfo}</p>}
                 </div>
                 <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-white">Deskripsi</label>
                    <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent dark:text-white"/>
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-semibold mb-2 dark:text-white">Foto</label>
                 <div className="flex gap-4">
                    {formData.image_url && <img src={formData.image_url} className="w-20 h-20 object-cover rounded border" />}
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} disabled={uploading} className="block w-full text-sm file:bg-[#D4AF37] file:border-0 file:rounded-lg file:px-4 file:py-2 file:text-black hover:file:bg-[#B8860B]" />
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 accent-[#D4AF37]" />
                 <span className="font-semibold text-sm dark:text-white">Aktifkan Produk</span>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800">
               <button onClick={() => setModalOpen(false)} className="px-5 py-2 border rounded-lg dark:text-white">Batal</button>
               <button onClick={handleSave} className="px-5 py-2 bg-[#D4AF37] rounded-lg font-bold text-black hover:bg-[#B8860B]">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;