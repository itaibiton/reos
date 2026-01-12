import { ScrollArea } from "@/components/ui/scroll-area";

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <ScrollArea className="flex-1">
        <div className="container max-w-6xl py-8 px-6">{children}</div>
      </ScrollArea>
    </div>
  );
}
