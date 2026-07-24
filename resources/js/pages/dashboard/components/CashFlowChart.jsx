"use client"

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

// Lazy load Chart.js and components
const Bar = React.lazy(() => import("react-chartjs-2").then(m => ({ default: m.Bar })));

// Config remains static
const chartConfig = {
  operasional: {
    label: "Operasional",
    color: "#3b82f6", // Blue 500
  },
  investasi: {
    label: "Investasi",
    color: "#f59e0b", // Amber 500
  },
  pendanaan: {
    label: "Pendanaan",
    color: "#8b5cf6", // Violet 500
  },
}

export default function CashFlowChart({ data }) {
    const [activeChart, setActiveChart] = React.useState("operasional")
    const [chartLoaded, setChartLoaded] = React.useState(false);
    
    // Register Chart.js only once when needed
    React.useEffect(() => {
        import("chart.js").then((module) => {
            const { 
                Chart, 
                CategoryScale, 
                LinearScale, 
                BarElement, 
                Title, 
                Tooltip: ChartTooltip, 
                Legend 
            } = module;
            
            Chart.register(
                CategoryScale,
                LinearScale,
                BarElement,
                Title,
                ChartTooltip,
                Legend
            );
            setChartLoaded(true);
        });
    }, []);

    const rawData = data?.chartData[activeChart] || [];

    const chartData = {
        labels: rawData.map(item => {
            const date = parseSafeDate(item.date)
            return date ? date.toLocaleDateString("id-ID", {
                month: "short",
                day: "numeric",
            }) : item.date
        }),
        datasets: [
            {
                label: chartConfig[activeChart].label,
                data: rawData.map(item => item.amount),
                backgroundColor: chartConfig[activeChart].color,
                borderRadius: 4,
                barThickness: 30,
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
                    <CardTitle className="text-xl">Arus Kas</CardTitle>
                    <CardDescription>
                        Detail arus kas masuk dan keluar.
                    </CardDescription>
                </div>
                <div className="flex grow flex-col sm:flex-row border-t xl:border-t-0">
                    <TooltipProvider>
                        {["operasional", "investasi", "pendanaan"].map((key) => (
                            <Tooltip key={key}>
                                <TooltipTrigger asChild>
                                    <button
                                        data-active={activeChart === key}
                                        className="min-w-0 data-[active=true]:bg-primary/5 group relative flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left border-t sm:border-t-0 sm:border-l sm:px-8 sm:py-6 transition-colors first:border-t-0"
                                        onClick={() => setActiveChart(key)}
                                    >
                                        <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                                            {chartConfig[key].label}
                                        </span>
                                        <span
                                        className={cn(
                                            "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xl sm:text-2xl font-bold leading-none font-mono transition-colors",
                                            activeChart === key && (
                                            key === "operasional"
                                                ? "text-blue-600"
                                                : key === "investasi"
                                                ? "text-amber-600"
                                                : "text-violet-600"
                                            )
                                        )}
                                        >
                                        {formatCurrency(data[key] || 0)}
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-mono">{formatCurrency(data[key] || 0)}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <div className="h-[300px] w-full">
                    {chartLoaded && (
                        <React.Suspense fallback={<div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">Memuat Grafik...</div>}>
                            <Bar data={chartData} options={options} />
                        </React.Suspense>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
