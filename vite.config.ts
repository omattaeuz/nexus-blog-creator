import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",        // expõe em localhost e no IP local (IPv6/IPv4)
    port: 8080,

    proxy: {
      "/webhook": {
        target: "https://primary-production-e91c.up.railway.app",
        changeOrigin: true,
        secure: true,            // upstream é HTTPS
        rewrite: (p) => p,       // mantém o path 1:1 (/webhook/...)
      },
    },

  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.json'],
  build: {
    rollupOptions: {
      external: ['ioredis', 'redis'],
    },
  },
  optimizeDeps: {
    exclude: ['ioredis', 'redis'],
  },
}));