"use client";

import { useQuery } from "convex/react";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Clock,
  Star,
  DollarSign,
  CheckCircle,
  XCircle,
  Hourglass,
  BarChart3,
} from "lucide-react";

// Stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, icon, subtitle, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === "up" && <TrendingUp size={12} className="text-green-500" />}
            {trend === "down" && <TrendingDown size={12} className="text-red-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Star rating display
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={
            star <= Math.round(rating)
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300"
          }
        />
      ))}
      <span className="ms-1 text-sm text-muted-foreground">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

// Loading skeleton
function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
          <BarChart3 size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold mb-2">{t("empty.title")}</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t("empty.description")}
        </p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const format = useFormatter();
  const locale = useLocale();
  const analytics = useQuery(api.providerAnalytics.getProviderAnalytics);

  // Format currency with abbreviated suffix for large values
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${format.number(amount / 1000000, { style: 'decimal', maximumFractionDigits: 1 })}M`;
    }
    if (amount >= 1000) {
      return `${format.number(amount / 1000, { style: 'decimal', maximumFractionDigits: 0 })}K`;
    }
    return format.number(amount, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  // Format month label using locale
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format.dateTime(date, { month: 'short' });
  };

  // Loading state
  if (analytics === undefined) {
    return <AnalyticsSkeleton />;
  }

  // Not a provider or no data
  if (analytics === null) {
    return <EmptyState t={t} />;
  }

  // Check if there's any meaningful data
  const hasData =
    analytics.totalRequests > 0 ||
    analytics.completedDeals > 0 ||
    analytics.activeDeals > 0;

  if (!hasData) {
    return <EmptyState t={t} />;
  }

  // Prepare chart data
  const chartData = analytics.monthlyTrends.map((item) => ({
    month: formatMonth(item.month),
    deals: item.deals,
    requests: item.requests,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("stats.totalDeals")}
          value={analytics.totalDeals}
          icon={<Briefcase size={20} />}
          subtitle={t("stats.dealBreakdown", {
            active: analytics.activeDeals,
            completed: analytics.completedDeals,
          })}
        />
        <StatCard
          title={t("stats.completedDeals")}
          value={analytics.completedDeals}
          icon={<CheckCircle size={20} />}
          subtitle={
            analytics.activeDeals > 0
              ? `${analytics.activeDeals} ${t("stats.active")}`
              : undefined
          }
        />
        {analytics.brokerSalesCount !== null && (
          <StatCard
            title={t("stats.brokerSales")}
            value={analytics.brokerSalesCount}
            icon={<DollarSign size={20} />}
            subtitle={t("stats.closedAsBroker")}
          />
        )}
        <StatCard
          title={t("stats.conversionRate")}
          value={`${analytics.conversionRate}%`}
          icon={<TrendingUp size={20} />}
          subtitle={t("stats.requestsOf", { accepted: analytics.acceptedRequests, total: analytics.totalRequests })}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.avgRating")}
            </CardTitle>
            <Star size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analytics.totalReviews > 0 ? (
              <>
                <StarRating rating={analytics.avgRating} />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("stats.reviews", { count: analytics.totalReviews })}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("stats.noReviews")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deal Status Breakdown */}
      {analytics.stageBreakdown && Object.keys(analytics.stageBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              {t("statusBreakdown.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(analytics.stageBreakdown).map(([stage, count]) => {
                const stageColors: Record<string, string> = {
                  interest: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                  broker_assigned: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
                  mortgage: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
                  legal: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
                  closing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                };
                const stageLabels: Record<string, string> = {
                  interest: t("stages.interest"),
                  broker_assigned: t("stages.brokerAssigned"),
                  mortgage: t("stages.mortgage"),
                  legal: t("stages.legal"),
                  closing: t("stages.closing"),
                  completed: t("stages.completed"),
                  cancelled: t("stages.cancelled"),
                };
                return (
                  <div
                    key={stage}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${stageColors[stage] || "bg-gray-100 text-gray-800"}`}
                  >
                    <span>{stageLabels[stage] || stage}</span>
                    <span className="rounded-full bg-white/50 px-2 py-0.5 text-xs font-bold">
                      {count as number}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Second Row: Revenue & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} />
              {t("dealValue.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">
                {formatCurrency(analytics.totalDealValue)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("dealValue.total")}
              </p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t("dealValue.average")}
                </span>
                <span className="font-semibold">
                  {formatCurrency(analytics.avgDealValue)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              {t("dealValue.commissionNote")}
            </p>
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              {t("performance.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t("performance.avgResponseTime")}
              </p>
              <p className="text-2xl font-bold">
                {analytics.avgResponseTimeHours < 1
                  ? `${Math.round(analytics.avgResponseTimeHours * 60)} min`
                  : `${analytics.avgResponseTimeHours.toFixed(1)} hrs`}
              </p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">{t("performance.requestBreakdown")}</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm">
                    {t("performance.accepted", { count: analytics.acceptedRequests })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle size={14} className="text-red-500" />
                  <span className="text-sm">
                    {t("performance.declined", { count: analytics.declinedRequests })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hourglass size={14} className="text-yellow-500" />
                  <span className="text-sm">
                    {t("performance.pending", { count: analytics.pendingRequests })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={20} />
            {t("trends.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.some((d) => d.deals > 0 || d.requests > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="requests"
                  name={t("trends.requests")}
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="deals"
                  name={t("trends.completedDeals")}
                  fill="hsl(142.1, 76.2%, 36.3%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {t("trends.noData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
