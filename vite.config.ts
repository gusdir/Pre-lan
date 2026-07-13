import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa las dependencias en chunks de vendor para mejorar el cacheo
        // entre versiones de la app (el navegador solo re-descarga lo que cambia).
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
              return "react-vendor";
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory"))
              return "charts-vendor";
            if (id.includes("@supabase")) return "supabase-vendor";
            return "vendor";
          }
        },
      },
    },
  },
});
