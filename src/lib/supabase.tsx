import React, { createContext, useContext, useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Default list of weights we support throughout the UI.
export const GOLD_WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100] as const;

type SupabaseContextValue = {
  supabase: SupabaseClient;
};

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useMemo(() => createClient(SUPABASE_URL, SUPABASE_ANON_KEY), []);
  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>;
};

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used within SupabaseProvider");
  return ctx;
}

// ============== TYPES ==============

export interface Product {
  id: string;
  name: string;
  description: string;
  weight: number;
  price: number;
  image_url: string;
  is_active: boolean;
  category_id?: number | null; // Added category_id
  created_at: string;
}

// ============== BASE GOLD PRICE (Single Row) ==============
// NOTE: These legacy helpers are kept for backward compatibility.
// New UI uses category-based price tables below.

export interface BaseGoldPrice {
  id: number;
  sell_price_per_gram: number;
  buyback_price_per_gram: number;
  updated_at: string;
}

export const getBaseGoldPrice = async (supabase: SupabaseClient): Promise<BaseGoldPrice | null> => {
  try {
    const { data, error } = await supabase
      .from("gold_prices")
      .select("id, sell_price_per_gram, buyback_price_per_gram, updated_at")
      .limit(1)
      .single();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("getBaseGoldPrice error:", err);
    throw err;
  }
};

export const updateBaseGoldPrice = async (
  supabase: SupabaseClient,
  payload: {
    sell_price_per_gram?: number;
    buyback_price_per_gram?: number;
  }
) => {
  try {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (payload.sell_price_per_gram !== undefined) updateData.sell_price_per_gram = payload.sell_price_per_gram;
    if (payload.buyback_price_per_gram !== undefined) updateData.buyback_price_per_gram = payload.buyback_price_per_gram;

    const { data, error } = await supabase
      .from("gold_prices")
      .update(updateData)
      .eq("id", 1)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error("updateBaseGoldPrice error:", err);
    throw err;
  }
};

// ============== PRODUCTS CRUD ==============

export const getProducts = async (supabase: SupabaseClient): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      // UPDATED: Added category_id to select
      .select("id, name, description, weight, price, image_url, is_active, created_at, category_id")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("getProducts error:", err);
    throw err;
  }
};

export const getProductById = async (supabase: SupabaseClient, id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      // UPDATED: Added category_id to select
      .select("id, name, description, weight, price, image_url, is_active, created_at, category_id")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("getProductById error:", err);
    throw err;
  }
};

export const createProduct = async (
  supabase: SupabaseClient,
  payload: {
    name: string;
    description: string;
    weight: number;
    price: number;
    image_url: string;
    is_active: boolean;
    category_id?: number | null; // UPDATED: Accept category_id
  }
) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([{ ...payload, created_at: new Date().toISOString() }])
      .select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error("createProduct error:", err);
    throw err;
  }
};

export const updateProduct = async (
  supabase: SupabaseClient,
  id: string,
  payload: {
    name?: string;
    description?: string;
    weight?: number;
    price?: number;
    image_url?: string;
    is_active?: boolean;
    category_id?: number | null; // UPDATED: Accept category_id
  }
) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error("updateProduct error:", err);
    throw err;
  }
};

export const deleteProduct = async (supabase: SupabaseClient, id: string) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteProduct error:", err);
    throw err;
  }
};

// ============== FILE UPLOAD ==============

export const uploadProductImage = async (supabase: SupabaseClient, file: File) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("products").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;

    const publicUrlResp = supabase.storage.from("products").getPublicUrl(fileName);
    const publicUrl = (publicUrlResp as any)?.data?.publicUrl ?? null;
    return publicUrl;
  } catch (err) {
    console.error("uploadProductImage error:", err);
    throw err;
  }
};

// ============== ANTAM DAILY PRICE (Single Row) ==============

export interface AntamDailyPrice {
  id: number;
  sell_price_per_gram: number;
  buyback_price_per_gram: number;
  updated_at: string;
}

export const getDailyPrice = async (supabase: SupabaseClient): Promise<AntamDailyPrice | null> => {
  try {
    const { data, error } = await supabase
      .from("gold_prices")
      .select("id, sell_price_per_gram, buyback_price_per_gram, updated_at")
      .limit(1)
      .single();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("getDailyPrice error:", err);
    throw err;
  }
};

export const updateDailyPrice = async (
  supabase: SupabaseClient,
  payload: {
    sell_price_per_gram: number;
    buyback_price_per_gram: number;
  }
) => {
  try {
    const { data, error } = await supabase
      .from("gold_prices")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1) // Update the single row
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error("updateDailyPrice error:", err);
    throw err;
  }
};

// ============== CATEGORY-BASED GOLD PRICES ==============

export interface GoldCategory {
  id: number;
  name: string;
  created_at: string | null;
}

export interface GoldWeightPrice {
  id?: number;
  category_id: number;
  weight: number;
  price: number;
  updated_at?: string | null;
}

export const getGoldCategories = async (supabase: SupabaseClient): Promise<GoldCategory[]> => {
  const { data, error } = await supabase
    .from("gold_categories")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createGoldCategory = async (supabase: SupabaseClient, name: string): Promise<GoldCategory> => {
  const { data, error } = await supabase
    .from("gold_categories")
    .insert([{ name }])
    .select("id, name, created_at")
    .single();
  if (error) throw error;
  return data;
};

export const updateGoldCategory = async (
  supabase: SupabaseClient,
  id: number,
  payload: { name: string }
): Promise<GoldCategory> => {
  const { data, error } = await supabase
    .from("gold_categories")
    .update(payload)
    .eq("id", id)
    .select("id, name, created_at")
    .single();
  if (error) throw error;
  return data;
};

export const deleteGoldCategory = async (supabase: SupabaseClient, id: number) => {
  const { error } = await supabase.from("gold_categories").delete().eq("id", id);
  if (error) throw error;
  return true;
};

export const getSellPricesByCategory = async (
  supabase: SupabaseClient,
  categoryId: number
): Promise<GoldWeightPrice[]> => {
  const { data, error } = await supabase
    .from("gold_sell_prices")
    .select("id, category_id, weight, price, updated_at")
    .eq("category_id", categoryId)
    .order("weight", { ascending: true });
  if (error) throw error;
  return data || [];
};

export const getBuybackPricesByCategory = async (
  supabase: SupabaseClient,
  categoryId: number
): Promise<GoldWeightPrice[]> => {
  const { data, error } = await supabase
    .from("gold_buyback_prices")
    .select("id, category_id, weight, price, updated_at")
    .eq("category_id", categoryId)
    .order("weight", { ascending: true });
  if (error) throw error;
  return data || [];
};

export const upsertSellPrices = async (
  supabase: SupabaseClient,
  categoryId: number,
  rows: Array<{ weight: number; price: number }>
): Promise<GoldWeightPrice[]> => {
  // First, delete existing prices for this category
  const { error: deleteError } = await supabase
    .from("gold_sell_prices")
    .delete()
    .eq("category_id", categoryId);
  
  if (deleteError) {
    console.error("Delete error:", deleteError);
    throw deleteError;
  }

  // Then insert new prices
  const payload = rows
    .filter((row) => row.price > 0) // Only insert rows with price > 0
    .map((row) => ({
      category_id: categoryId,
      weight: row.weight,
      price: row.price,
      updated_at: new Date().toISOString(),
    }));

  if (payload.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("gold_sell_prices")
    .insert(payload)
    .select("id, category_id, weight, price, updated_at")
    .order("weight", { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const upsertBuybackPrices = async (
  supabase: SupabaseClient,
  categoryId: number,
  rows: Array<{ weight: number; price: number }>
): Promise<GoldWeightPrice[]> => {
  // First, delete existing prices for this category
  const { error: deleteError } = await supabase
    .from("gold_buyback_prices")
    .delete()
    .eq("category_id", categoryId);
  
  if (deleteError) {
    console.error("Delete error:", deleteError);
    throw deleteError;
  }

  // Then insert new prices
  const payload = rows
    .filter((row) => row.price > 0) // Only insert rows with price > 0
    .map((row) => ({
      category_id: categoryId,
      weight: row.weight,
      price: row.price,
      updated_at: new Date().toISOString(),
    }));

  if (payload.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("gold_buyback_prices")
    .insert(payload)
    .select("id, category_id, weight, price, updated_at")
    .order("weight", { ascending: true });
  
  if (error) throw error;
  return data || [];
};