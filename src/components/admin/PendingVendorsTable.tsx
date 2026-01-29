"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VendorApprovalModal } from "./VendorApprovalModal";
import { Eye } from "lucide-react";

interface PendingVendor {
  _id: string;
  _creationTime: number;
  userId: string;
  providerType: "broker" | "mortgage_advisor" | "lawyer";
  companyName?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  specializations?: string[];
  serviceAreas?: string[];
  languages?: string[];
  bio?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  externalRecommendations?: string;
  approvalStatus?: string;
  submittedAt?: number;
  name?: string;
  email?: string;
  imageUrl?: string;
}

interface PendingVendorsTableProps {
  vendors: PendingVendor[];
}

export function PendingVendorsTable({ vendors }: PendingVendorsTableProps) {
  const t = useTranslations("adminVendors");
  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReview = (vendor: PendingVendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      broker: t("providerTypes.broker"),
      mortgage_advisor: t("providerTypes.mortgageAdvisor"),
      lawyer: t("providerTypes.lawyer"),
    };
    return labels[type] || type;
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.photo")}</TableHead>
              <TableHead>{t("columns.name")}</TableHead>
              <TableHead>{t("columns.type")}</TableHead>
              <TableHead>{t("columns.company")}</TableHead>
              <TableHead>{t("columns.submitted")}</TableHead>
              <TableHead className="text-end">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={vendor.imageUrl} alt={vendor.name} />
                    <AvatarFallback>{getInitials(vendor.name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <div>{vendor.name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">
                      {vendor.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getProviderTypeLabel(vendor.providerType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {vendor.companyName || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {vendor.submittedAt
                    ? formatDistanceToNow(vendor.submittedAt, {
                        addSuffix: true,
                      })
                    : "—"}
                </TableCell>
                <TableCell className="text-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReview(vendor)}
                  >
                    <Eye className="w-4 h-4 me-2" />
                    {t("review")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {vendors.map((vendor) => (
          <div
            key={vendor._id}
            className="rounded-lg border p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={vendor.imageUrl} alt={vendor.name} />
                <AvatarFallback>{getInitials(vendor.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{vendor.name || "Unknown"}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {vendor.email}
                </div>
                <Badge variant="outline" className="mt-2">
                  {getProviderTypeLabel(vendor.providerType)}
                </Badge>
              </div>
            </div>

            {vendor.companyName && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t("columns.company")}: </span>
                {vendor.companyName}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              {vendor.submittedAt
                ? formatDistanceToNow(vendor.submittedAt, { addSuffix: true })
                : "—"}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleReview(vendor)}
            >
              <Eye className="w-4 h-4 me-2" />
              {t("review")}
            </Button>
          </div>
        ))}
      </div>

      {/* Approval Modal */}
      {selectedVendor && (
        <VendorApprovalModal
          vendor={selectedVendor}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
