import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 👇 SOLUSI AMAN:
  // Kita TIDAK memecah file secara manual (karena berisiko blank putih).
  // Kita cuma menaikkan batas limit warning jadi 2000kb (2MB).
  // Hasilnya: Website lancar, warning hilang.
  build: {
    chunkSizeWarningLimit: 2000, 
  },
}));