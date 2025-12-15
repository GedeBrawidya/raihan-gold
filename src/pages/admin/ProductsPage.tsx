import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getGoldCategories,
  getSellPricesByCategory,
  GoldCategory,
  GoldWeightPrice,
  GOLD_WEIGHT_OPTIONS,
} from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatting";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Package, RefreshCw, Loader2, Filter } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  weight: number;
  price: number;
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
  const [loading, setLoading] = useState(true);
  
  // State untuk Filter Kategori (Baru)
  const [filterCategoryId, setFilterCategoryId] = useState<number | "all">("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Price Calculation State
  const [currentCategoryPrices, setCurrentCategoryPrices] = useState<GoldWeightPrice[]>([]);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: "",
    price: "",
    image_url: "",
    is_active: true,
    category_id: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // Update harga otomatis saat form kategori berubah
  useEffect(() => {
    if (formData.category_id) {
      fetchPricesForCategory(parseInt(formData.category_id));
    } else {
      setCurrentCategoryPrices([]);
    }
  }, [formData.category_id]);

  // Update harga otomatis saat berat berubah
  useEffect(() => {
    const weightNum = parseFloat(formData.weight);
    if (weightNum && currentCategoryPrices.length > 0) {
      const foundPrice = currentCategoryPrices.find((p) => p.weight === weightNum);
      if (foundPrice) {
        setFormData((prev) => ({ ...prev, price: foundPrice.price.toString() }));
      }
    }
  }, [formData.weight, currentCategoryPrices]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(supabase),
        getGoldCategories(supabase),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchPricesForCategory = async (categoryId: number) => {
    try {
      setIsFetchingPrices(true);
      const prices = await getSellPricesByCategory(supabase, categoryId);
      setCurrentCategoryPrices(prices);
    } catch (error) {
      console.error("Failed to fetch prices", error);
    } finally {
      setIsFetchingPrices(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      weight: "",
      price: "",
      image_url: "",
      is_active: true,
      category_id: "",
    });
    setEditingId(null);
    setCurrentCategoryPrices([]);
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

      if (!formData.name.trim()) {
        toast({ title: "Error", description: "Nama produk wajib diisi" });
        return;
      }
      
      // Validasi tambahan: Wajib pilih kategori agar data rapi
      if (!categoryId) {
        toast({ title: "Error", description: "Pilih kategori harga terlebih dahulu" });
        return;
      }

      if (isNaN(weight) || isNaN(price)) {
        toast({ title: "Error", description: "Berat dan Harga harus valid" });
        return;
      }

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
        toast({ title: "Success", description: "Produk berhasil diupdate" });
      } else {
        await createProduct(supabase, payload);
        toast({ title: "Success", description: "Produk berhasil dibuat" });
      }

      setModalOpen(false);
      resetForm();
      await loadInitialData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await deleteProduct(supabase, id);
      toast({ title: "Success", description: "Produk dihapus" });
      await loadInitialData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  // --- LOGIC FILTERING ---
  const filteredProducts = products.filter((product) => {
    if (filterCategoryId === "all") return true;
    return product.category_id === filterCategoryId;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Manajemen Produk
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kelola katalog produk dan sinkronisasi harga.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8860B] transition-colors font-medium shadow-md"
        >
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      {/* --- FILTER BAR SECTION --- */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold pr-2 border-r border-slate-200 dark:border-slate-600">
                <Filter size={16} />
                <span>Filter:</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setFilterCategoryId("all")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        filterCategoryId === "all"
                            ? "bg-[#D4AF37] text-black shadow-sm"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                >
                    Semua
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategoryId(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                            filterCategoryId === cat.id
                                ? "bg-[#D4AF37] text-black shadow-sm"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Products Grid (Menampilkan filteredProducts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 dark:text-slate-500 text-sm">
                    No Image
                  </div>
                )}
                {/* Badge Berat */}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold">
                  {product.weight}g
                </div>
                {/* Badge Kategori (Opsional: Menampilkan nama kategori di kartu) */}
                {product.category_id && (
                    <div className="absolute top-2 left-2 bg-[#D4AF37]/90 text-black text-[10px] uppercase font-bold px-2 py-1 rounded">
                        {categories.find(c => c.id === product.category_id)?.name || "N/A"}
                    </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                    {product.description || "-"}
                  </p>
                </div>

                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Harga Jual</p>
                    <p className="font-bold text-[#D4AF37] text-lg">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    product.is_active 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                  }`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => startEdit(product)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-xs font-medium border border-slate-200 dark:border-slate-600"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-xs font-medium border border-red-100 dark:border-red-900/50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
          <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
             {filterCategoryId === "all" ? "Belum ada produk" : "Tidak ada produk di kategori ini"}
          </p>
          {filterCategoryId !== "all" && (
             <button onClick={() => setFilterCategoryId("all")} className="mt-2 text-[#D4AF37] text-sm hover:underline">
                 Lihat semua kategori
             </button>
          )}
        </div>
      )}

      {/* Form Modal (Sama seperti sebelumnya) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Emas Antam 5g"
                />
              </div>

              {/* Kategori & Berat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Sumber Kategori Harga *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value, weight: "" })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Berat Emas (Gram) *
                  </label>
                  <select
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    disabled={!formData.category_id || isFetchingPrices}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">-- Pilih Berat --</option>
                    {GOLD_WEIGHT_OPTIONS.map((weight) => (
                      <option key={weight} value={weight}>
                        {weight} gram
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Harga Jual (IDR) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  </div>
                </div>

                 <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Foto Produk
                </label>
                <div className="flex items-start gap-4">
                  {formData.image_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 shrink-0">
                      <img
                        src={formData.image_url}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded hover:bg-red-700 shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={uploading}
                      className="block w-full text-sm file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-[#D4AF37] file:text-black hover:file:bg-[#B8860B]"
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer">
                  Status Produk Aktif
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-800 p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end rounded-b-lg">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={uploading || isFetchingPrices}
                className="px-5 py-2.5 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8860B] font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;