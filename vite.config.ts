import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy same-origin para PDFs/API do Plone (contorna CORS do Varnish)
      "/__plone__": {
        target: "https://www3.ufac.br",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/__plone__/, ""),
        configure: (proxy) => {
          // Varnish do www3 ignora Authorization e só bypassa cache com cookie __ac.
          proxy.on("proxyReq", (proxyReq) => {
            if (proxyReq.getHeader("authorization") && !proxyReq.getHeader("cookie")) {
              proxyReq.setHeader("cookie", "__ac=ufac-editais");
            } else if (
              proxyReq.getHeader("authorization") &&
              !String(proxyReq.getHeader("cookie") || "").includes("__ac=")
            ) {
              const existing = String(proxyReq.getHeader("cookie") || "");
              proxyReq.setHeader(
                "cookie",
                existing ? `${existing}; __ac=ufac-editais` : "__ac=ufac-editais"
              );
            }
          });
          proxy.on("proxyRes", (proxyRes) => {
            proxyRes.headers["access-control-allow-origin"] = "*";
          });
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["pdfjs-dist"],
  },
});
