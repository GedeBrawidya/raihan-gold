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
  // 👇 TAMBAHAN AMAN: 
  // Kita tidak memecah file (karena bikin error), 
  // tapi kita naikkan batas warning jadi 1600kb (1.6MB).
  // Hasilnya: Website tetap jalan normal, warning kuning hilang.
  build: {
    chunkSizeWarningLimit: 1600,
  },
}));