import React from "react";
import { Head } from "@inertiajs/react";
import { AppLayouts } from "@/pages/layouts/app-layout";

const breadcrumbs = [
    {
        title: "Dashboard",
        href: "/",
    },
    //   {
    //     title: "Settings", href: "/settings", },
];

export default function Dashboard(props) {
    return (
        <>
            <Head title="Dashboard" />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p>Welcome to your accounting dashboard.</p>
                </div>
            </AppLayouts>
        </>
    );
}
