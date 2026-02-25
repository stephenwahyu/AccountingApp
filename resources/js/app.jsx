import "./bootstrap";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { initializeTheme } from './hooks/use-appearance';

initializeTheme();

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./pages/**/*.jsx", { eager: true });
        return pages[`./pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <Toaster position="top-right" closeButton richColors />
            </>
        );
    },
});
