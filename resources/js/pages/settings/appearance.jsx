import { Head } from "@inertiajs/react";

import AppearanceTabs from "@/components/appearance-tabs";
import HeadingSmall from "@/components/heading-small";

import SettingsLayout from "@/pages/layouts/settings/layout";

export default function Appearance() {
    return (
        <SettingsLayout>
            <div className="space-y-6">
                <HeadingSmall
                    title="Pengaturan Tampilan"
                    description="Perbarui pengaturan tampilan akun Anda"
                />
                <AppearanceTabs />
            </div>
        </SettingsLayout>
    );
}
