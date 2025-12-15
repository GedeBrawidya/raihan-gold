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
import { formatCurrency } from "@/lib/formatting";
import { Save, Loader2, Plus, Trash2, Edit2, X } from "lucide-react";
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
  const [saving, setSaving] = useState(false);
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
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
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
    try {
      setSaving(true);
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
      setSaving(false);
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
      setSelectedCategoryId(newCat.id);
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
      if (selectedCategoryId === id) {
        setSelectedCategoryId(categories.find((c) => c.id !== id)?.id || null);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const formatInputValue = (value: number): string => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Harga Emas</h1>
          <p className="text-muted-foreground">Kelola kategori dan harga jual/buyback per gramasi</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setCategoryName(""); setCategoryDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Category Selector */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Label className="text-lg font-semibold mb-4 block">Pilih Kategori</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Button
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={selectedCategoryId === cat.id ? "bg-gold text-black" : ""}
              >
                {cat.name}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setCategoryDialogOpen(true); }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {selectedCategoryId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sell Prices */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Harga Jual</h2>
              <Button onClick={() => handleSavePrices("sell")} disabled={saving} size="sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {GOLD_WEIGHT_OPTIONS.map((weight) => {
                const price = sellPrices.find((p) => p.weight === weight)?.price || 0;
                return (
                  <div key={weight} className="flex items-center gap-3">
                    <Label className="w-20">{weight}g</Label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                      <Input
                        type="text"
                        value={formatInputValue(price)}
                        onChange={(e) => handlePriceChange(weight, e.target.value, "sell")}
                        className="pl-10"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buyback Prices */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Harga Buyback</h2>
              <Button onClick={() => handleSavePrices("buyback")} disabled={saving} size="sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {GOLD_WEIGHT_OPTIONS.map((weight) => {
                const price = buybackPrices.find((p) => p.weight === weight)?.price || 0;
                return (
                  <div key={weight} className="flex items-center gap-3">
                    <Label className="w-20">{weight}g</Label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                      <Input
                        type="text"
                        value={formatInputValue(price)}
                        onChange={(e) => handlePriceChange(weight, e.target.value, "buyback")}
                        className="pl-10"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>Masukkan nama kategori (contoh: tahun emas)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Nama Kategori</Label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Contoh: 2024"
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
