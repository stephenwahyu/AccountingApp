"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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

const chartConfig = {
  operasional: {
    label: "Operasional",
    color: "var(--chart-1)",
  },
  investasi: {
    label: "Investasi",
    color: "var(--chart-2)",
  },
  pendanaan: {
    label: "Pendanaan",
    color: "var(--chart-3)",
  },
}

export function CashFlowChart({ data }) {
    const [activeChart, setActiveChart] = React.useState("operasional")
    
    const chartData = data?.chartData[activeChart] || [];

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Arus Kas</CardTitle>
                    <CardDescription>
                        Arus Kas pada Periode {data?.chartData?.[activeChart]?.[0]?.period || 'Saat Ini'}
                    </CardDescription>
                </div>
                <div className="flex">
                    {["operasional", "investasi", "pendanaan"].map((key) => (
                        <button
                            key={key}
                            data-active={activeChart === key}
                            className="data-[active=true]:bg-muted/50 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                            onClick={() => setActiveChart(key)}
                        >
                            <span className="text-muted-foreground text-xs">
                                {chartConfig[key].label}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                {new Intl.NumberFormat("id-ID", { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(data[key] || 0)}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
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
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    animationDuration={0}
                                    formatter={(value, name) => (
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: chartConfig[name]?.color }} />
                                            <div className="flex flex-1 justify-between">
                                                <span className="text-muted-foreground">{chartConfig[name]?.label || name}</span>
                                                <span className="font-bold">
                                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    labelFormatter={label => new Date(label).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}
                                />
                            }
                        />
                        <Bar
                            dataKey="amount"
                            fill={chartConfig[activeChart].color}
                            radius={4}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}