import AppLayouts from "@/pages/layouts/app-layout";
import { Head, Deferred } from "@inertiajs/react";
import React, { Suspense, lazy } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router } from "@inertiajs/react";
import { CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickShortcuts } from "./components/QuickShortcuts";
import { StatsCards } from "./components/StatsCards";
import { RecentJournals } from "./components/RecentJournals";
import { CashEquivalentBalance } from "./components/CashEquivalentBalance";

// Lazy load heavy chart components
const RevenueExpenseChart = lazy(() => import("./components/RevenueExpenseChart"));
const CashFlowChart = lazy(() => import("./components/CashFlowChart"));

const breadcrumbs = [
    {
        title: "Dashboard",
        href: "/",
    },
];

const StatsSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-40" />
                </CardContent>
            </Card>
        ))}
    </div>
);

const ChartSkeleton = () => (
    <Card className="shadow-sm">
        <CardHeader className="flex flex-col items-stretch border-b p-0 xl:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex grow border-t xl:border-t-0">
                <div className="flex-1 p-6 border-l"><Skeleton className="h-8 w-24" /></div>
                <div className="flex-1 p-6 border-l"><Skeleton className="h-8 w-24" /></div>
            </div>
        </CardHeader>
        <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
        </CardContent>
    </Card>
);

const RecentJournalsSkeleton = () => (
    <Card className="col-span-full xl:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

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
            <Head>
                <title>Dashboard</title>
            </Head>
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
                    <Deferred data="stats" fallback={<StatsSkeleton />}>
                        <StatsCards stats={stats} />
                    </Deferred>

                    {/* Quick Actions */}
                    <QuickShortcuts />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Charts Column */}
                        <div className="xl:col-span-2 space-y-6">
                            <Deferred data={['stats', 'revenueExpenseChart']} fallback={<ChartSkeleton />}>
                                <Suspense fallback={<ChartSkeleton />}>
                                    <RevenueExpenseChart
                                        revenue={stats?.revenue || 0}
                                        expense={stats?.expense || 0}
                                        data={revenueExpenseChart}
                                    />
                                </Suspense>
                            </Deferred>
                            
                            <Deferred data="cashFlowChart" fallback={<ChartSkeleton />}>
                                <Suspense fallback={<ChartSkeleton />}>
                                    <CashFlowChart data={cashFlowChart} />
                                </Suspense>
                            </Deferred>
                        </div>

                        {/* Sidebar Column */}
                        <div className="xl:col-span-1 space-y-6">
                            <CashEquivalentBalance accounts={cashAndEquivalents} />
                            
                            <Deferred data="recentJournals" fallback={<RecentJournalsSkeleton />}>
                                <RecentJournals journals={recentJournals} />
                            </Deferred>
                        </div>
                    </div>
                </div>
            </AppLayouts>
        </>
    );
}
