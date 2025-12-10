import React, { createContext, useContext, useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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

// ============== BASE GOLD PRICE (Single Row) ==============

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

export const getProducts = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, weight, price, image_url, is_active, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("getProducts error:", err);
    throw err;
  }
};

export const getProductById = async (supabase: SupabaseClient, id: string) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, weight, price, image_url, is_active, created_at")
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
