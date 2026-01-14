"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

// Format date for chart axis
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

// Format price for display
const formatPrice = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

// Calculate percentage change
const calculateChange = (data: Array<{ priceUsd: number }>) => {
  if (data.length < 2) return null;
  const firstPrice = data[0].priceUsd;
  const lastPrice = data[data.length - 1].priceUsd;
  const change = ((lastPrice - firstPrice) / firstPrice) * 100;
  return change;
};

const chartConfig = {
  priceUsd: {
    label: "Price/m\u00B2",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ValueHistoryChartProps {
  city: string;
}

export function ValueHistoryChart({ city }: ValueHistoryChartProps) {
  const priceHistory = useQuery(api.priceHistory.getByCity, { city });

  // Loading state
  if (priceHistory === undefined) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  // Empty data state
  if (priceHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No price history available for this area
      </div>
    );
  }

  // Transform data for chart - filter to market averages for area trends
  const chartData = priceHistory
    .filter((entry) => entry.eventType === "market_avg")
    .map((entry) => ({
      date: entry.date,
      priceUsd: entry.priceUsd,
      formattedDate: formatDate(entry.date),
    }));

  // If no market_avg data, use all data points
  const displayData =
    chartData.length > 0
      ? chartData
      : priceHistory.map((entry) => ({
          date: entry.date,
          priceUsd: entry.priceUsd,
          formattedDate: formatDate(entry.date),
        }));

  const priceChange = calculateChange(displayData);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">Price History</h3>
      {/* Header with change indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{city}</p>
        {priceChange !== null && (
          <span
            className={`text-sm font-medium ${
              priceChange >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart
          data={displayData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-priceUsd)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-priceUsd)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="formattedDate"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return formatDate(payload[0].payload.date);
                  }
                  return "";
                }}
                formatter={(value) => formatPrice(value as number)}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="priceUsd"
            stroke="var(--color-priceUsd)"
            fill="url(#fillPrice)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
