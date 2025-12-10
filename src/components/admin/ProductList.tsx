import React, { useEffect, useState } from "react";
import { useSupabase, listProducts } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/goldData";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  onReload?: () => void;
  onEdit?: (product: any) => void;
};

export const ProductList: React.FC<Props> = ({ onReload, onEdit }) => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  async function load() {
    try {
      setLoading(true);
      const rows = await listProducts(supabase);
      setProducts(rows ?? []);
    } catch (err: any) {
      console.error("listProducts error:", err);
      toast({ title: "Error", description: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from("products").delete().eq("id", id).select();
      if (error) throw error;
      toast({ title: "Deleted", description: "Product removed" });
      await load();
      onReload && onReload();
    } catch (err: any) {
      console.error("handleDelete error:", err);
      if (err && err.status === 403) {
        toast({ title: "Delete failed", description: "Permission denied. Check RLS or login as admin." });
      } else {
        toast({ title: "Delete failed", description: err?.message || String(err) });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead className="text-slate-400 text-left">
            <tr>
              <th className="px-2 py-2">Image</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Weight (g)</th>
              <th className="px-2 py-2">Price (IDR)</th>
              <th className="px-2 py-2">Stock</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-300">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-300">
                  No products
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t border-slate-700">
                  <td className="px-2 py-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center text-slate-400">No</div>
                    )}
                  </td>
                  <td className="px-2 py-3 text-white">{p.name}</td>
                  <td className="px-2 py-3">{p.weight ?? "-"}</td>
                  <td className="px-2 py-3">{formatCurrency(Number(p.price ?? 0))}</td>
                  <td className="px-2 py-3">{p.stock ?? 0}</td>
                  <td className="px-2 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit && onEdit(p)} className="px-3 py-1 rounded-lg bg-slate-700 text-white inline-flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="px-3 py-1 rounded-lg bg-red-600 text-white inline-flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
