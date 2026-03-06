import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx", "resources/css/app.css"],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    "react-vendor": ["react", "react-dom"],
                    "inertia-vendor": ["@inertiajs/react"],
                    "recharts-vendor": ["recharts"],
                    "ui-vendor": ["lucide-react", "clsx", "tailwind-merge"],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
