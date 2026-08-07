import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.hostname.includes('supabase.co'),
            handler: 'NetworkOnly',
          }
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      manifest: {
        name: "Roberts Enterprises FamousAI",
        short_name: "FamousAI",
        description: "AI-powered operations, scheduling, sales, customer, inventory, and business management for Roberts Enterprises.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui", "browser"],
        orientation: "any",
        theme_color: "#1c1917",
        background_color: "#fafaf9",
        categories: ["business", "productivity", "finance"],
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          { name: "Today", url: "/", description: "View today's operations" },
          { name: "Appointments", url: "/", description: "View appointments" },
          { name: "Schedule", url: "/", description: "View staff schedule" }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
            "lucide-react",
          ],
          "vendor-charts": ["recharts"],
          "vendor-stripe": ["@stripe/react-stripe-js", "@stripe/stripe-js"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
