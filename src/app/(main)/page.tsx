import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">REOS</h1>
        <p className="text-lg text-muted-foreground">
          Real Estate Investment Platform
        </p>
        <p className="text-muted-foreground">
          Connect US investors with Israeli properties through streamlined deal flow
          tracking from interest to close.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
