import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getBaseGoldPrice,
  BaseGoldPrice,
} from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatting";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Package, RefreshCw } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  weight: number;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export const ProductsPage: React.FC = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [baseGoldPrice, setBaseGoldPrice] = useState<BaseGoldPrice | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: "",
    price: "",
    image_url: "",
    is_active: true,
  });

  // Load products and base gold price
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, basePriceData] = await Promise.all([
        getProducts(supabase),
        getBaseGoldPrice(supabase)
      ]);
      setProducts(productsData || []);
      setBaseGoldPrice(basePriceData);
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
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
    });
    setEditingId(null);
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
    });
    setModalOpen(true);
  };

  const handleWeightChange = (weight: string) => {
    setFormData({ ...formData, weight });
    
    // Auto-calculate price when adding/editing
    if (weight && baseGoldPrice) {
      const weightNum = parseFloat(weight);
      if (!isNaN(weightNum) && weightNum > 0) {
        const calculatedPrice = baseGoldPrice.sell_price_per_gram * weightNum;
        setFormData(prev => ({ ...prev, price: calculatedPrice.toString() }));
      }
    }
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
      // Simpan harga statis ke DB sebagai backup/history
      const price = parseFloat(formData.price);

      if (!formData.name.trim()) {
        toast({ title: "Error", description: "Product name is required" });
        return;
      }

      if (isNaN(weight) || isNaN(price)) {
        toast({ title: "Error", description: "Weight and price must be numbers" });
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        weight,
        price,
        image_url: formData.image_url,
        is_active: formData.is_active,
      };

      if (editingId) {
        await updateProduct(supabase, editingId, payload);
        toast({ title: "Success", description: "Product updated" });
      } else {
        await createProduct(supabase, payload);
        toast({ title: "Success", description: "Product created" });
      }

      setModalOpen(false);
      resetForm();
      await loadData(); // Reload all data
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(supabase, id);
      toast({ title: "Success", description: "Product deleted" });
      await loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Manajemen Produk
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kelola katalog produk emas Anda. Harga otomatis menyesuaikan Harga Dasar.
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

      {/* Info Bar */}
      {baseGoldPrice && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3 text-sm">
          <RefreshCw className="w-4 h-4 text-blue-500" />
          <span className="text-slate-700 dark:text-slate-300">
            Harga Dasar Emas Aktif: <strong>{formatCurrency(baseGoldPrice.sell_price_per_gram)}/gram</strong>. 
            Semua produk di bawah ini dikalkulasi berdasarkan harga ini.
          </span>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
           // 🔥 ADMIN JUGA MENAMPILKAN HARGA LIVE 🔥
           const currentPrice = baseGoldPrice 
             ? baseGoldPrice.sell_price_per_gram * product.weight 
             : product.price;

           return (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
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
                {/* Overlay Berat */}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold">
                  {product.weight}g
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                    {product.description}
                  </p>
                </div>

                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Live Price</p>
                    <p className="font-bold text-[#D4AF37] text-lg">
                      {formatCurrency(currentPrice)}
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

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => startEdit(product)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-xs font-medium border border-slate-200 dark:border-slate-600"
                  >
                    <Edit2 size={14} />
                    Edit Detail
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
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Belum ada produk</p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Product" : "Tambah Produk"}
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
                  placeholder="Contoh: Emas Antam 5g Certieye"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Keterangan produk, edisi, tahun, dll..."
                />
              </div>

              {/* Weight & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Berat (gram) *
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    step="0.01"
                  />
                  {baseGoldPrice && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Basis: {formatCurrency(baseGoldPrice.sell_price_per_gram)}/g
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Harga (IDR) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  {formData.weight && baseGoldPrice && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <RefreshCw size={10} /> Auto-calculated
                    </p>
                  )}
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
                      className="block w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-[#B8860B] cursor-pointer"
                    />
                    <p className="text-xs text-slate-500 mt-2">Format: JPG, PNG, WEBP. Max 2MB.</p>
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
                <div>
                  <label
                    htmlFor="is_active"
                    className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer block"
                  >
                    Status Produk Aktif
                  </label>
                  <p className="text-xs text-slate-500">Jika dimatikan, produk tidak akan muncul di katalog website.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end rounded-b-lg">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="px-5 py-2.5 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8860B] transition-colors font-bold disabled:opacity-50 shadow-md"
              >
                {uploading ? "Mengupload..." : editingId ? "Simpan Perubahan" : "Buat Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;