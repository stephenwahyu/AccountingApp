import { AppLayouts } from "@/pages/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { RevenueExpenseChart } from "./components/RevenueExpenseChart";
import { CashFlowChart } from "./components/CashFlowChart";
import { CashEquivalentBalance } from "./components/CashEquivalentBalance";
import { QuickShortcuts } from "./components/QuickShortcuts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router } from "@inertiajs/react";

const breadcrumbs = [
    {
        title: "Dashboard",
        href: "/",
    },
];

export default function Dashboard({
    fiscalPeriods,
    selectedPeriod,
    cashAndEquivalents,
    revenue,
    expense,
    revenueExpenseChart,
    cashFlowChart,
}) {
    function handlePeriodChange(value) {
        router.get(
            route("dashboard"),
            { period: value },
            { preserveState: true },
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <AppLayouts breadcrumbs={breadcrumbs}>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-muted-foreground">
                                Ringkasan keuangan terkini untuk bisnis Anda.
                            </p>
                        </div>
                        <div>
                            <Select
                                value={selectedPeriod.id.toString()}
                                onValueChange={handlePeriodChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Periode" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fiscalPeriods.map((period) => (
                                        <SelectItem
                                            key={period.id}
                                            value={period.id.toString()}
                                        >
                                            {period.period_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="">
                        <QuickShortcuts />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <CashEquivalentBalance accounts={cashAndEquivalents} />
                    </div>

                    <RevenueExpenseChart
                        revenue={revenue}
                        expense={expense}
                        data={revenueExpenseChart}
                    />
                    <CashFlowChart data={cashFlowChart} />
                </div>
            </AppLayouts>
        </>
    );
}
