"use client";

import { useTranslations, useFormatter } from "next-intl";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface MetricGaugeProps {
  value: number | undefined | null;
  maxValue: number;
  label: string;
  color: string;
  suffix?: string;
  formatAsCurrency?: boolean;
}

function MetricGauge({
  value,
  maxValue,
  label,
  color,
  suffix = "%",
  formatAsCurrency = false,
}: MetricGaugeProps) {
  const format = useFormatter();

  const displayValue = value ?? 0;
  const percentage = Math.min((displayValue / maxValue) * 100, 100);

  // Determine color based on performance thresholds
  const getColor = () => {
    if (value === undefined || value === null) return "hsl(var(--muted-foreground))";
    const ratio = displayValue / maxValue;
    if (ratio >= 0.6) return "hsl(142.1 76.2% 36.3%)"; // Green
    if (ratio >= 0.3) return "hsl(47.9 95.8% 53.1%)"; // Amber
    return "hsl(var(--muted-foreground))"; // Gray
  };

  const chartData = [
    {
      name: label,
      value: percentage,
      fill: color || getColor(),
    },
  ];

  const formattedValue =
    value === undefined || value === null
      ? "N/A"
      : formatAsCurrency
        ? format.number(displayValue, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })
        : `${displayValue.toFixed(1)}${suffix}`;

  return (
    <div className="flex flex-col items-center group">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={10}
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "hsl(var(--muted))" }}
              dataKey="value"
              cornerRadius={5}
              className="transition-all duration-300 group-hover:opacity-90"
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Value in center */}
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <span className="text-lg sm:text-xl font-bold transition-transform duration-200 group-hover:scale-105">
            {formattedValue}
          </span>
        </div>
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">
        {label}
      </span>
    </div>
  );
}

interface InvestmentMetricsChartProps {
  expectedRoi?: number | null;
  capRate?: number | null;
  cashOnCash?: number | null;
  monthlyRent?: number | null;
}

export function InvestmentMetricsChart({
  expectedRoi,
  capRate,
  cashOnCash,
  monthlyRent,
}: InvestmentMetricsChartProps) {
  const t = useTranslations("properties");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-6">
      <MetricGauge
        value={expectedRoi}
        maxValue={20}
        label={t("details.expectedRoi")}
        color="hsl(142.1 76.2% 36.3%)"
      />
      <MetricGauge
        value={capRate}
        maxValue={15}
        label={t("details.capRate")}
        color="hsl(221.2 83.2% 53.3%)"
      />
      <MetricGauge
        value={cashOnCash}
        maxValue={15}
        label={t("details.cashOnCash")}
        color="hsl(262.1 83.3% 57.8%)"
      />
      <MetricGauge
        value={monthlyRent}
        maxValue={10000}
        label={t("details.monthlyRent")}
        color="hsl(24.6 95% 53.1%)"
        formatAsCurrency
        suffix=""
      />
    </div>
  );
}
