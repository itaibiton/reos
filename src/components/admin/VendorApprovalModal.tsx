"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Building2,
  FileText,
  Clock,
  MapPin,
  Languages,
  Globe,
  MessageSquare,
} from "lucide-react";

interface VendorApprovalModalProps {
  vendor: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VendorApprovalModal({
  vendor,
  open,
  onOpenChange,
}: VendorApprovalModalProps) {
  const t = useTranslations("adminVendors");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const approveVendor = useMutation(api.serviceProviderProfiles.approveVendor);
  const rejectVendor = useMutation(api.serviceProviderProfiles.rejectVendor);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await approveVendor({ profileId: vendor._id });
      toast.success(t("approveSuccess"));
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to approve vendor:", error);
      toast.error("Failed to approve vendor");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await rejectVendor({
        profileId: vendor._id,
        reason: rejectionReason || undefined,
      });
      toast.success(t("rejectSuccess"));
      onOpenChange(false);
      setShowRejectInput(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject vendor:", error);
      toast.error("Failed to reject vendor");
    } finally {
      setIsProcessing(false);
    }
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

  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      broker: t("providerTypes.broker"),
      mortgage_advisor: t("providerTypes.mortgageAdvisor"),
      lawyer: t("providerTypes.lawyer"),
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("profileDetails")}</DialogTitle>
          <DialogDescription>
            {t("reviewDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={vendor.imageUrl} alt={vendor.name} />
              <AvatarFallback className="text-lg">
                {getInitials(vendor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{vendor.name || "Unknown"}</h2>
              <Badge variant="outline" className="mt-2">
                {getProviderTypeLabel(vendor.providerType)}
              </Badge>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {vendor.email}
                </div>
                {vendor.phoneNumber && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {vendor.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t("professionalDetails")}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground mb-1">
                  {t("fields.company")}
                </div>
                <div>{vendor.companyName || "—"}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground mb-1">
                  {t("fields.license")}
                </div>
                <div>{vendor.licenseNumber || "—"}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground mb-1">
                  {t("fields.experience")}
                </div>
                <div>{vendor.yearsExperience || 0} years</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground mb-1">
                  {t("fields.specializations")}
                </div>
                <div className="flex flex-wrap gap-1">
                  {vendor.specializations && vendor.specializations.length > 0 ? (
                    vendor.specializations.map((spec: string) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Area */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t("serviceArea")}
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-muted-foreground mb-1">
                  {t("fields.serviceAreas")}
                </div>
                <div className="flex flex-wrap gap-1">
                  {vendor.serviceAreas && vendor.serviceAreas.length > 0 ? (
                    vendor.serviceAreas.map((area: string) => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground mb-1">
                  {t("fields.languages")}
                </div>
                <div className="flex flex-wrap gap-1">
                  {vendor.languages && vendor.languages.length > 0 ? (
                    vendor.languages.map((lang: string) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bio */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t("bio")}
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {vendor.bio || "—"}
            </p>
          </div>

          {/* Additional Info */}
          {(vendor.websiteUrl || vendor.externalRecommendations) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  {t("additional")}
                </h3>
                <div className="space-y-3 text-sm">
                  {vendor.websiteUrl && (
                    <div>
                      <div className="font-medium text-muted-foreground mb-1 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t("fields.website")}
                      </div>
                      <a
                        href={vendor.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {vendor.websiteUrl}
                      </a>
                    </div>
                  )}
                  {vendor.externalRecommendations && (
                    <div>
                      <div className="font-medium text-muted-foreground mb-1 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {t("fields.recommendations")}
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {vendor.externalRecommendations}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Submission Info */}
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("submittedAt")}:{" "}
              {vendor.submittedAt
                ? format(vendor.submittedAt, "PPp")
                : "Unknown"}
            </div>
          </div>

          {/* Rejection Input */}
          {showRejectInput && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("rejectionReason")}</label>
              <Textarea
                placeholder={t("rejectionReasonPlaceholder")}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          {!showRejectInput ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectInput(true)}
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 me-2" />
                {t("reject")}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Spinner className="w-4 h-4 me-2" />
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 me-2" />
                    {t("approve")}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectionReason("");
                }}
                disabled={isProcessing}
              >
                {t("cancelReject")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner className="w-4 h-4 me-2" />
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 me-2" />
                    {t("confirmReject")}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
