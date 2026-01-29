import { Metadata } from "next";
import ClientDetailContent from "@/components/vendor/ClientDetailContent";

export const metadata: Metadata = {
  title: "Client Details | Reos",
  description: "View client information and documents",
};

export default function ClientDetailPage({
  params,
}: {
  params: { clientId: string };
}) {
  return <ClientDetailContent clientId={params.clientId} />;
}
