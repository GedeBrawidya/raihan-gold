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
import { Plus, Edit2, Trash2, X, Package } from "lucide-react";

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
    loadProducts();
    loadBaseGoldPrice();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(supabase);
      setProducts(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadBaseGoldPrice = async () => {
    try {
      const price = await getBaseGoldPrice(supabase);
      if (price) {
        setBaseGoldPrice(price);
      }
    } catch (err: any) {
      console.error("Error loading base gold price:", err);
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
    
    // Auto-calculate price if base gold price is available
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
      await loadProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(supabase, id);
      toast({ title: "Success", description: "Product deleted" });
      await loadProducts();
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
            Kelola katalog produk emas Anda
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8860B] transition-colors font-medium"
        >
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="h-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
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
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Weight</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {product.weight}g
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Price</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-xs">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    product.is_active
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => startEdit(product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-xs font-medium"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-xs font-medium"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
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
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Product" : "Tambah Produk"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Gold Bar 100g"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Product description..."
                />
              </div>

              {/* Weight & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Weight (g) *
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
                      💰 Harga per gram: {formatCurrency(baseGoldPrice.sell_price_per_gram)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Price (IDR) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  {formData.weight && baseGoldPrice && (
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                      ✓ Auto: {formatCurrency(parseFloat(formData.price) || 0)}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Product Image
                </label>
                <div className="space-y-2">
                  {formData.image_url && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                      <img
                        src={formData.image_url}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
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
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  Active Product
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {uploading ? "Uploading..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
