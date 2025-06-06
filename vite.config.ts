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
        // Copy _redirects file to the output directory
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          // Keep the original file name for _redirects
          if (assetInfo.name === '_redirects') return '[name][extname]';
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
