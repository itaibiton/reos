import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to REOS</CardTitle>
          <CardDescription>
            Real Estate Investment Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Connect US investors with Israeli properties through streamlined deal flow
            tracking from interest to close. Work with trusted service providers including
            brokers, mortgage advisors, and lawyers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
