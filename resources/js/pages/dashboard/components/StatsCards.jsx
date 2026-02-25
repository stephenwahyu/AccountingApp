import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Briefcase, 
    Building2, 
    CreditCard 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const StatCard = ({ title, value, icon: Icon, description, trend, trendValue, colorClass }) => (
    <Card className="overflow-hidden  shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
            <div className={cn("p-2 rounded-lg shadow-sm", colorClass)}>
                <Icon className="h-3 w-3 text-white" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold tracking-tight font-mono">
                {formatCurrency(value)}
            </div>
            {description && (
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            )}
            {trend && (
                <div className="flex items-center mt-2">
                    {trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                    ) : (
                        <TrendingDown className="h-3 w-3 text-rose-500 mr-1" />
                    )}
                    <span className={cn("text-xs font-medium", trend === 'up' ? "text-emerald-600" : "text-rose-600")}>
                        {trendValue}
                    </span>
                </div>
            )}
        </CardContent>
    </Card>
);

export function StatsCards({ stats }) {
    const cards = [
        {
            title: "Pendapatan",
            value: stats.revenue,
            icon: TrendingUp,
            colorClass: "bg-emerald-500",
            description: "Total pendapatan periode ini"
        },
        {
            title: "Beban",
            value: stats.expense,
            icon: TrendingDown,
            colorClass: "bg-rose-500",
            description: "Total pengeluaran periode ini"
        },
        {
            title: "Laba Bersih",
            value: stats.net_profit,
            icon: DollarSign,
            colorClass: stats.net_profit >= 0 ? "bg-blue-500" : "bg-destructive",
            description: "Keuntungan bersih periode ini"
        },
        {
            title: "Total Aset",
            value: stats.total_assets,
            icon: Building2,
            colorClass: "bg-amber-500",
            description: "Nilai seluruh kekayaan"
        },
        {
            title: "Total Liabilitas",
            value: stats.total_liabilities,
            icon: CreditCard,
            colorClass: "bg-purple-500",
            description: "Total kewajiban/utang"
        },
        {
            title: "Total Ekuitas",
            value: stats.total_equity,
            icon: Briefcase,
            colorClass: "bg-indigo-500",
            description: "Nilai modal pemilik"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </div>
    );
}
