"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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

// Format currency
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

// Format month label
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

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
      <span className="ml-1 text-sm text-muted-foreground">
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
function EmptyState() {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
          <BarChart3 size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Analytics Data Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Analytics will appear here once you start receiving service requests
          and completing deals.
        </p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const analytics = useQuery(api.providerAnalytics.getProviderAnalytics);

  // Loading state
  if (analytics === undefined) {
    return <AnalyticsSkeleton />;
  }

  // Not a provider or no data
  if (analytics === null) {
    return <EmptyState />;
  }

  // Check if there's any meaningful data
  const hasData =
    analytics.totalRequests > 0 ||
    analytics.completedDeals > 0 ||
    analytics.activeDeals > 0;

  if (!hasData) {
    return <EmptyState />;
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
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your performance metrics and business insights
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Deals"
          value={analytics.completedDeals}
          icon={<CheckCircle size={20} />}
          subtitle={
            analytics.activeDeals > 0
              ? `${analytics.activeDeals} active`
              : undefined
          }
        />
        <StatCard
          title="Active Deals"
          value={analytics.activeDeals}
          icon={<Briefcase size={20} />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          icon={<TrendingUp size={20} />}
          subtitle={`${analytics.acceptedRequests} of ${analytics.totalRequests} requests`}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <Star size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analytics.totalReviews > 0 ? (
              <>
                <StarRating rating={analytics.avgRating} />
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.totalReviews} reviews
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Revenue & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} />
              Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">
                {formatCurrency(analytics.totalDealValue)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total value of completed deals
              </p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Average deal value
                </span>
                <span className="font-semibold">
                  {formatCurrency(analytics.avgDealValue)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Note: Actual earnings depend on your commission agreements
            </p>
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Average Response Time
              </p>
              <p className="text-2xl font-bold">
                {analytics.avgResponseTimeHours < 1
                  ? `${Math.round(analytics.avgResponseTimeHours * 60)} min`
                  : `${analytics.avgResponseTimeHours.toFixed(1)} hrs`}
              </p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">Request Breakdown</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm">
                    {analytics.acceptedRequests} accepted
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle size={14} className="text-red-500" />
                  <span className="text-sm">
                    {analytics.declinedRequests} declined
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hourglass size={14} className="text-yellow-500" />
                  <span className="text-sm">
                    {analytics.pendingRequests} pending
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
            Monthly Trends
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
                  name="Requests"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="deals"
                  name="Completed Deals"
                  fill="hsl(142.1, 76.2%, 36.3%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No trend data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
