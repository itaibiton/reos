"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TestThemePage() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Theme System Test</h1>
        <p className="text-muted-foreground">
          Test page to verify theme switching works correctly. This page will be removed after Phase 38.
        </p>
      </div>

      {/* Theme Switcher */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Switcher Component</CardTitle>
          <CardDescription>
            Select a theme to test. Changes should persist across page refreshes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThemeSwitcher />

          {mounted && (
            <div className="flex gap-2 items-center text-sm">
              <span className="text-muted-foreground">Current:</span>
              <Badge variant="secondary">{theme}</Badge>
              <span className="text-muted-foreground">Resolved:</span>
              <Badge variant="outline">{resolvedTheme}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample UI Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Sample UI Elements</CardTitle>
          <CardDescription>
            These elements should transition smoothly when theme changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted">
              <CardContent className="p-4">
                <p className="font-medium">Muted Card</p>
                <p className="text-sm text-muted-foreground">
                  Background should transition smoothly.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-accent">
              <CardContent className="p-4">
                <p className="font-medium">Accent Card</p>
                <p className="text-sm text-accent-foreground">
                  Colors should animate on theme switch.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Verification Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Checklist</CardTitle>
          <CardDescription>
            Manual verification steps for theme system requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>THM-01: Toggle switches between Light/Dark/System</li>
            <li>THM-02: Refresh page - theme should persist (check localStorage key: &quot;theme&quot;)</li>
            <li>THM-03: No flash of wrong theme on page load</li>
            <li>THM-04: Select &quot;System&quot;, change OS dark mode - app should follow</li>
            <li>THM-05: Theme transitions animate smoothly (300ms)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
