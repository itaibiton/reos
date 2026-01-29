import { Metadata } from "next";
import ClientDetailContent from "@/components/vendor/ClientDetailContent";
import { use } from "react";

export const metadata: Metadata = {
  title: "Client Details | Reos",
  description: "View client information and documents",
};

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  return <ClientDetailContent clientId={clientId} />;
}
