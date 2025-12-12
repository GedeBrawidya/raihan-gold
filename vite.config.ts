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
  // 👇 TAMBAHKAN BAGIAN BUILD INI
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Memisahkan library besar ke chunk sendiri
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Sisanya masuk ke vendor umum
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Menaikkan batas warning ke 1000kb (1MB) biar ga berisik
  },
}));