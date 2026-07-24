import "./bootstrap";
import { createInertiaApp } from "@inertiajs/react";
import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { initializeTheme } from './hooks/use-appearance';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

initializeTheme();

createInertiaApp({
    title: (title) => title ? `${title} - Sistem Akuntansi` : 'Sistem Akuntansi',
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob("./pages/**/*.jsx", { eager: false })
        ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <Toaster position="top-right" closeButton richColors />
            </>
        );
    },
});
