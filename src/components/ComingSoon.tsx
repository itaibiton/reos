import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <Construction className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md">
        {description || "This feature is coming soon. We're working hard to bring you this functionality."}
      </p>
    </div>
  );
}
