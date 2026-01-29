"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { DEAL_STAGES, DealStage } from "@/lib/deal-constants";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  UserMultiple02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

export default function ClientListContent() {
  const t = useTranslations("clientManagement");
  const router = useRouter();
  const clients = useQuery(api.clientManagement.getMyClients);
  const [searchQuery, setSearchQuery] = useState("");

  if (clients === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  type Client = (typeof clients)[number];
  const filteredClients = clients.filter(
    (client: Client) =>
      client.investorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.investorEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <HugeiconsIcon icon={UserMultiple02Icon} size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">{t("empty.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { count: clients.length })}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {t("columns.client")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {t("columns.property")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {t("columns.stage")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {t("columns.startDate")}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  {t("columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client: Client) => {
                const stage = DEAL_STAGES[client.currentStage as DealStage];
                return (
                  <tr
                    key={client.investorId}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => router.push(`/dashboard/clients/${client.investorId}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={client.investorImage} />
                          <AvatarFallback className="text-xs">
                            {getInitials(client.investorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{client.investorName}</p>
                          <p className="text-xs text-muted-foreground">{client.investorEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{client.propertyTitle}</td>
                    <td className="px-4 py-3">
                      {stage && (
                        <Badge variant="secondary" className={stage.color}>
                          {stage.label}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={16}
                        className="inline text-muted-foreground"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {filteredClients.map((client: Client) => {
          const stage = DEAL_STAGES[client.currentStage as DealStage];
          return (
            <div
              key={client.investorId}
              className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/30"
              onClick={() => router.push(`/dashboard/clients/${client.investorId}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.investorImage} />
                    <AvatarFallback>{getInitials(client.investorName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{client.investorName}</p>
                    <p className="text-xs text-muted-foreground">{client.investorEmail}</p>
                  </div>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-muted-foreground" />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{client.propertyTitle}</span>
                {stage && (
                  <Badge variant="secondary" className={stage.color}>
                    {stage.label}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(client.createdAt)}</p>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && searchQuery && (
        <div className="py-8 text-center text-muted-foreground">
          {t("noResults")}
        </div>
      )}
    </div>
  );
}
