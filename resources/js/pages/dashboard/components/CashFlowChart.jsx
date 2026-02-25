"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { formatCurrency, formatCompactNumber, cn } from "@/lib/utils"

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

export function CashFlowChart({ data }) {
    const [activeChart, setActiveChart] = React.useState("operasional")
    
    const chartData = data?.chartData[activeChart] || [];

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
                    {["operasional", "investasi", "pendanaan"].map((key) => (
                        <button
                            key={key}
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
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <BarChart
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
                                const date = new Date(value)
                                return date.toLocaleDateString("id-ID", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis hide />
                        <ChartTooltip
                            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    className="w-full"
                                    formatter={(value, name) => (
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="h-2 w-2 rounded-full" 
                                                    style={{ backgroundColor: chartConfig[activeChart]?.color }} 
                                                />
                                                <span className="text-muted-foreground capitalize">{activeChart}</span>
                                            </div>
                                            <span className="font-mono font-bold">{formatCurrency(value)}</span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Bar
                            dataKey="amount"
                            fill={chartConfig[activeChart]?.color}
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
