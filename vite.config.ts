import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // For GitHub Pages, set base to your repository name if using a custom domain
  // or to '/repository-name/' if using github.io/repository-name
  base: "/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
    // Generate source maps for better debugging
    sourcemap: true,
    rollupOptions: {
      output: {
        // Ensure proper handling of entry files
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep the original file name for _redirects and 404.html
          if (assetInfo.name === '_redirects' || assetInfo.name === '404.html') return '[name][extname]';
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
