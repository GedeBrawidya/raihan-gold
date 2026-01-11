import { useEffect, useRef } from "react";
import { useSupabase } from "@/lib/supabase";

/**
 * Hook untuk mencegah Supabase free tier dari sleep mode
 * dengan melakukan ping berkala ke database
 * 
 * @param intervalMinutes - Interval ping dalam menit (default: 5 menit)
 * @param enabled - Enable/disable keep-alive (default: true)
 */
export const useSupabaseKeepAlive = (
  intervalMinutes: number = 5,
  enabled: boolean = true // Aktif secara default
) => {
  const { supabase } = useSupabase();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip jika disabled
    if (!enabled) {
      return;
    }

    // Fungsi untuk ping database dengan query ringan
    const pingDatabase = async () => {
      try {
        // Query ringan ke tabel yang kecil (misalnya gold_categories)
        // Kita gunakan limit 1 untuk meminimalkan data transfer
        const { error } = await supabase
          .from("gold_categories")
          .select("id")
          .limit(1);

        if (error) {
          console.warn("Supabase keep-alive ping failed:", error.message);
        } else {
          // Hanya log di production untuk mengurangi noise di console
          if (import.meta.env.PROD) {
            console.log("✅ Supabase keep-alive ping successful");
          }
        }
      } catch (err) {
        console.warn("Supabase keep-alive ping error:", err);
      }
    };

    // Ping pertama kali saat component mount
    pingDatabase();

    // Set interval untuk ping setiap X menit
    // Supabase free tier biasanya sleep setelah 5-10 menit tidak ada aktivitas
    // Jadi kita ping setiap 5 menit untuk memastikan tidak sleep
    const intervalMs = intervalMinutes * 60 * 1000;
    intervalRef.current = setInterval(() => {
      pingDatabase();
    }, intervalMs);

    // Cleanup interval saat component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [supabase, intervalMinutes, enabled]);

  // Juga ping saat user kembali ke tab (visibility change)
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User kembali ke tab, lakukan ping
        supabase
          .from("gold_categories")
          .select("id")
          .limit(1)
          .then(() => {
            if (import.meta.env.PROD) {
              console.log("✅ Supabase keep-alive ping on tab focus");
            }
          })
          .catch((err) => {
            console.warn("Supabase keep-alive ping on tab focus failed:", err);
          });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [supabase, enabled]);
};

