import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatCurrency, cn, parseSafeDate } from "@/lib/utils"

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

export function RevenueExpenseChart({
    revenue,
    expense,
    data: chartData,
}) {
    const [activeChart, setActiveChart] = React.useState("pendapatan")

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
                    <button
                        data-active={activeChart === "beban"}
                        className="data-[active=true]:bg-muted/50 group relative flex flex-1 flex-col justify-center gap-1 border-t sm:border-t-0 sm:border-l px-6 py-4 text-left sm:px-8 sm:py-6 transition-colors"
                        onClick={() => setActiveChart("beban")}
                    >
                        <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                            Beban
                        </span>
                        <span className={cn(
                            "text-xl font-bold leading-none sm:text-2xl transition-colors font-mono",
                            activeChart === "beban" ? "text-rose-600" : ""
                        )}>
                            {formatCurrency(expense)}
                        </span>
                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={value => {
                                const date = parseSafeDate(value)
                                return date ? date.toLocaleDateString("id-ID", {
                                    month: "short",
                                    day: "numeric",
                                }) : value
                            }}
                        />
                        <YAxis 
                            hide 
                            domain={['auto', 'auto']}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    className="w-full"
                                    formatter={(value, name) => (
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="h-2 w-2 rounded-full" 
                                                    style={{ backgroundColor: name === 'pendapatan' ? chartConfig.pendapatan.color : chartConfig.beban.color }} 
                                                />
                                                <span className="text-muted-foreground capitalize">{name}</span>
                                            </div>
                                            <span className="font-mono font-bold">{formatCurrency(value)}</span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Line
                            dataKey={activeChart}
                            type="monotone"
                            stroke={chartConfig[activeChart].color}
                            strokeWidth={3}
                            dot={{
                                r: 4,
                                fill: chartConfig[activeChart].color,
                                strokeWidth: 0,
                            }}
                            activeDot={{
                                r: 6,
                                strokeWidth: 0,
                                fill: chartConfig[activeChart].color
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
