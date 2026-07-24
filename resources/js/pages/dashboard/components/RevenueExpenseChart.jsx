import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { formatCurrency, cn, parseSafeDate } from "@/lib/utils"

// Lazy load Chart component
const Line = React.lazy(() => import("react-chartjs-2").then(m => ({ default: m.Line })));

const chartConfig = {
  pendapatan: {
    label: "Pendapatan",
    color: "#10b981", // Emerald 500
  },
  beban: {
    label: "Beban",
    color: "#f43f5e", // Rose 500
  },
}

export default function RevenueExpenseChart({
    revenue,
    expense,
    data: chartData,
}) {
    const [activeChart, setActiveChart] = React.useState("pendapatan")
    const [chartLoaded, setChartLoaded] = React.useState(false);

    // Register Chart.js only once when needed
    React.useEffect(() => {
        import("chart.js").then((module) => {
            const {
              Chart,
              CategoryScale,
              LinearScale,
              PointElement,
              LineElement,
              Title,
              Tooltip: ChartTooltip,
              Legend,
              Filler,
            } = module;

            Chart.register(
              CategoryScale,
              LinearScale,
              PointElement,
              LineElement,
              Title,
              ChartTooltip,
              Legend,
              Filler
            );
            setChartLoaded(true);
        });
    }, []);

    const data = {
        labels: chartData.map(item => {
            const date = parseSafeDate(item.date)
            return date ? date.toLocaleDateString("id-ID", {
                month: "short",
                day: "numeric",
            }) : item.date
        }),
        datasets: [
            {
                label: chartConfig[activeChart].label,
                data: chartData.map(item => item[activeChart]),
                borderColor: chartConfig[activeChart].color,
                backgroundColor: chartConfig[activeChart].color + "20", // Add 20% opacity
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: chartConfig[activeChart].color,
                pointBorderWidth: 0,
                pointHoverRadius: 6,
                tension: 0.4,
                fill: true,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                titleColor: "#64748b",
                bodyColor: "#1e293b",
                borderColor: "#e2e8f0",
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#64748b",
                    font: {
                        size: 11
                    },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 7
                },
                border: {
                    display: false
                }
            },
            y: {
                display: false,
                grid: {
                    display: false
                }
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col items-stretch border-b p-0 xl:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle className="text-xl">Trend Keuangan</CardTitle>
                    <CardDescription>
                        Pergerakan pendapatan dan beban harian.
                    </CardDescription>
                </div>
                <div className="flex grow flex-col sm:flex-row border-t xl:border-t-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    data-active={activeChart === "pendapatan"}
                                    className="min-w-0 data-[active=true]:bg-primary/5 group relative flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:border-l sm:px-8 sm:py-6 transition-colors"
                                    onClick={() => setActiveChart("pendapatan")}
                                >
                                    <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                                        Pendapatan
                                    </span>
                                    <span
                                    className={cn(
                                        "min-w-0 truncate text-xl sm:text-2xl font-bold leading-none font-mono transition-all duration-200",
                                        activeChart === "pendapatan"
                                        ? "text-emerald-600"
                                        : "text-muted-foreground"
                                    )}
                                    >
                                    {formatCurrency(revenue)}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-mono">{formatCurrency(revenue)}</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    data-active={activeChart === "beban"}
                                    className="data-[active=true]:bg-muted/50 group relative flex flex-1 flex-col justify-center gap-1 border-t sm:border-t-0 sm:border-l px-6 py-4 text-left sm:px-8 sm:py-6 transition-colors"
                                    onClick={() => setActiveChart("beban")}
                                >
                                    <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                                        Beban
                                    </span>
                                    <span className={cn(
                                        "min-w-0 truncate text-xl font-bold leading-none sm:text-2xl transition-colors font-mono",
                                        activeChart === "beban" ? "text-rose-600" : "text-muted-foreground"
                                    )}>
                                        {formatCurrency(expense)}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-mono">{formatCurrency(expense)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <div className="h-[300px] w-full">
                    {chartLoaded && (
                        <React.Suspense fallback={<div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">Memuat Grafik...</div>}>
                            <Line data={data} options={options} />
                        </React.Suspense>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
