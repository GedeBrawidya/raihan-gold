import React, { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase";
import {
  getGoldCategories,
  createGoldCategory,
  updateGoldCategory,
  deleteGoldCategory,
  getSellPricesByCategory,
  getBuybackPricesByCategory,
  upsertSellPrices,
  upsertBuybackPrices,
  GoldCategory,
  GoldWeightPrice,
  GOLD_WEIGHT_OPTIONS,
} from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Plus, Trash2, Edit2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const GoldPricesPage: React.FC = () => {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const [categories, setCategories] = useState<GoldCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State loading terpisah
  const [isSavingSell, setIsSavingSell] = useState(false);
  const [isSavingBuyback, setIsSavingBuyback] = useState(false);

  const [sellPrices, setSellPrices] = useState<GoldWeightPrice[]>([]);
  const [buybackPrices, setBuybackPrices] = useState<GoldWeightPrice[]>([]);
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GoldCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadPrices();
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getGoldCategories(supabase);

      // --- PERBAIKAN DISINI ---
      // Urutkan kategori berdasarkan Nama (Tahun) dari Besar ke Kecil (Descending)
      // Agar "2025" muncul di paling atas array
      const sortedData = data.sort((a, b) => 
        b.name.localeCompare(a.name, undefined, { numeric: true })
      );

      setCategories(sortedData);
      
      // Logic pilih otomatis: Karena sudah di-sort, index [0] adalah tahun terbaru
      if (sortedData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(sortedData[0].id);
      } else if (sortedData.length === 0) {
        setSelectedCategoryId(null);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadPrices = async () => {
    if (!selectedCategoryId) return;
    try {
      const [sellData, buybackData] = await Promise.all([
        getSellPricesByCategory(supabase, selectedCategoryId),
        getBuybackPricesByCategory(supabase, selectedCategoryId),
      ]);
      setSellPrices(sellData);
      setBuybackPrices(buybackData);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSavePrices = async (type: "sell" | "buyback") => {
    if (!selectedCategoryId) return;
    
    if (type === "sell") setIsSavingSell(true);
    else setIsSavingBuyback(true);

    try {
      const prices = type === "sell" ? sellPrices : buybackPrices;
      const rows = GOLD_WEIGHT_OPTIONS.map((weight) => {
        const existing = prices.find((p) => p.weight === weight);
        return {
          weight,
          price: existing?.price || 0,
        };
      });

      if (type === "sell") {
        await upsertSellPrices(supabase, selectedCategoryId, rows);
      } else {
        await upsertBuybackPrices(supabase, selectedCategoryId, rows);
      }

      toast({ title: "Sukses", description: `Harga ${type === "sell" ? "jual" : "buyback"} berhasil disimpan` });
      await loadPrices();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      if (type === "sell") setIsSavingSell(false);
      else setIsSavingBuyback(false);
    }
  };

  const handlePriceChange = (weight: number, value: string, type: "sell" | "buyback") => {
    const numValue = parseFloat(value.replace(/\D/g, "")) || 0;
    const prices = type === "sell" ? sellPrices : buybackPrices;
    const updated = [...prices];
    const index = updated.findIndex((p) => p.weight === weight);
    if (index >= 0) {
      updated[index] = { ...updated[index], price: numValue };
    } else {
      updated.push({ category_id: selectedCategoryId!, weight, price: numValue });
    }
    if (type === "sell") {
      setSellPrices(updated);
    } else {
      setBuybackPrices(updated);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast({ title: "Error", description: "Nama kategori harus diisi", variant: "destructive" });
      return;
    }
    try {
      const newCat = await createGoldCategory(supabase, categoryName.trim());
      toast({ title: "Sukses", description: "Kategori berhasil dibuat" });
      setCategoryDialogOpen(false);
      setCategoryName("");
      await loadCategories();
      setSelectedCategoryId(newCat.id); // Otomatis pilih kategori baru
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;
    try {
      await updateGoldCategory(supabase, editingCategory.id, { name: categoryName.trim() });
      toast({ title: "Sukses", description: "Kategori berhasil diupdate" });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      await loadCategories();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Yakin hapus kategori ini? Semua harga terkait akan ikut terhapus.")) return;
    try {
      await deleteGoldCategory(supabase, id);
      toast({ title: "Sukses", description: "Kategori berhasil dihapus" });
      await loadCategories();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const formatInputValue = (value: number): string => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const currentCategory = categories.find(c => c.id === selectedCategoryId);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Harga Emas</h1>
          <p className="text-muted-foreground">Kelola kategori dan harga jual/buyback per gramasi</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setCategoryName(""); setCategoryDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori Baru
        </Button>
      </div>

      {/* DROPDOWN UTAMA: Pilih kategori untuk diedit */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <Label className="text-lg font-semibold mb-4 block">Pilih Kategori untuk Diedit</Label>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <select
              value={selectedCategoryId || ""}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
            >
              {categories.length === 0 && <option value="">Belum ada kategori</option>}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {selectedCategoryId && currentCategory && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={() => { 
                  setEditingCategory(currentCategory); 
                  setCategoryName(currentCategory.name); 
                  setCategoryDialogOpen(true); 
                }}
                className="flex-1 md:flex-none"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Ubah Nama
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteCategory(selectedCategoryId)}
                className="flex-1 md:flex-none"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedCategoryId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* HARGA JUAL */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Harga Jual</h2>
              <Button 
                onClick={() => handleSavePrices("sell")} 
                disabled={isSavingSell} 
                size="sm"
              >
                {isSavingSell ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {GOLD_WEIGHT_OPTIONS.map((weight) => {
                const price = sellPrices.find((p) => p.weight === weight)?.price || 0;
                return (
                  <div key={weight} className="flex items-center gap-3">
                    <Label className="w-20 font-medium">{weight}g</Label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                      <Input
                        type="text"
                        value={formatInputValue(price)}
                        onChange={(e) => handlePriceChange(weight, e.target.value, "sell")}
                        className="pl-10 text-right font-mono"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HARGA BUYBACK */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Harga Buyback</h2>
              <Button 
                onClick={() => handleSavePrices("buyback")} 
                disabled={isSavingBuyback} 
                size="sm"
              >
                {isSavingBuyback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {GOLD_WEIGHT_OPTIONS.map((weight) => {
                const price = buybackPrices.find((p) => p.weight === weight)?.price || 0;
                return (
                  <div key={weight} className="flex items-center gap-3">
                    <Label className="w-20 font-medium">{weight}g</Label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                      <Input
                        type="text"
                        value={formatInputValue(price)}
                        onChange={(e) => handlePriceChange(weight, e.target.value, "buyback")}
                        className="pl-10 text-right font-mono"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>Masukkan nama kategori baru (Bebas, contoh: 2025)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Nama Kategori</Label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Contoh: 2025 "
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoldPricesPage;