import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
export default defineConfig({
    plugins: [
        react(),
        runtimeErrorOverlay(),
        ...(process.env.NODE_ENV !== "production" &&
            process.env.REPL_ID !== undefined
            ? [
                await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
            ]
            : []),
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client", "src"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
            "@assets": path.resolve(import.meta.dirname, "attached_assets"),
        },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
        // The output directory is relative to the project root, but since `root` is `client`,
        // we need to go up one level.
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8000', // Your backend server
                changeOrigin: true,
                secure: false,
                timeout: 30000,
                rewrite: (path) => {
                    console.log('[VITE PROXY] Rewriting:', path);
                    return path;
                },
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        console.log('[VITE PROXY] Request:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        console.log('[VITE PROXY] Response:', proxyRes.statusCode, req.url);
                    });
                    proxy.on('error', (err, req, res) => {
                        console.log('[VITE PROXY] Error:', err.message, req.url);
                    });
                }
            }
        }
    },
});
//# sourceMappingURL=vite.config.js.map
