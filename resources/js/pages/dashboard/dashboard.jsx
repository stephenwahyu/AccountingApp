import { AppLayouts } from "@/pages/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { RevenueExpenseChart } from "./components/RevenueExpenseChart";
import { CashFlowChart } from "./components/CashFlowChart";
import { CashEquivalentBalance } from "./components/CashEquivalentBalance";
import { QuickShortcuts } from "./components/QuickShortcuts";
import { StatsCards } from "./components/StatsCards";
import { RecentJournals } from "./components/RecentJournals";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router } from "@inertiajs/react";
import { CalendarDays } from "lucide-react";

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
    stats,
    revenueExpenseChart,
    cashFlowChart,
    recentJournals
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
                <div className="flex flex-col gap-8 pb-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-muted-foreground">
                                Selamat datang kembali! Berikut adalah ringkasan keuangan bisnis Anda.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-card border rounded-lg p-1 shadow-sm">
                            <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground border-r">
                                <CalendarDays className="h-4 w-4" />
                                <span>Periode:</span>
                            </div>
                            <Select
                                value={selectedPeriod.id.toString()}
                                onValueChange={handlePeriodChange}
                            >
                                <SelectTrigger className="border-0 shadow-none focus:ring-0 w-[180px] bg-transparent font-semibold h-9">
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

                    {/* Stats Overview */}
                    <StatsCards stats={stats} />

                    {/* Quick Actions */}
                    <QuickShortcuts />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Charts Column */}
                        <div className="xl:col-span-2 space-y-6">
                            <RevenueExpenseChart
                                revenue={stats.revenue}
                                expense={stats.expense}
                                data={revenueExpenseChart}
                            />
                            <CashFlowChart data={cashFlowChart} />
                        </div>

                        {/* Sidebar Column */}
                        <div className="xl:col-span-1 space-y-6">
                            <CashEquivalentBalance accounts={cashAndEquivalents} />
                            <RecentJournals journals={recentJournals} />
                        </div>
                    </div>
                </div>
            </AppLayouts>
        </>
    );
}
