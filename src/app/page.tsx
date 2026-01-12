import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="text-center">
        <h1 className="text-4xl font-bold">REOS</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Real Estate Investment Platform
        </p>
        <Button className="mt-6">Get Started</Button>
      </main>
    </div>
  );
}
