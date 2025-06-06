import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          // Keep the original file name for special files
          if (assetInfo.name === '_redirects' || assetInfo.name === '404.html') {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
