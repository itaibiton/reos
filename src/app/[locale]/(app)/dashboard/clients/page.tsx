import { Metadata } from "next";
import ClientListContent from "@/components/vendor/ClientListContent";

export const metadata: Metadata = {
  title: "My Clients | Reos",
  description: "View and manage your clients",
};

export default function ClientsPage() {
  return <ClientListContent />;
}
