"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Component showcases will be added in Task 2
function ButtonsInputsSection() {
  return <div className="space-y-8">Buttons & Inputs content coming...</div>;
}

function LayoutSection() {
  return <div className="space-y-8">Layout content coming...</div>;
}

function FeedbackSection() {
  return <div className="space-y-8">Feedback content coming...</div>;
}

function OverlaysSection() {
  return <div className="space-y-8">Overlays content coming...</div>;
}

function DataDisplaySection() {
  return <div className="space-y-8">Data Display content coming...</div>;
}

export default function DesignSystemPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
          <Badge variant="secondary">v1.0</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          REOS component library built with Shadcn/ui. Mira-style design with
          Inter font, compact radius (0.25rem), and neutral color palette.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">53</strong> components
          </span>
          <span>
            <strong className="text-foreground">Shadcn/ui</strong> base
          </span>
          <span>
            <strong className="text-foreground">new-york</strong> style
          </span>
        </div>
      </div>

      <Separator />

      {/* Category Tabs */}
      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="buttons">Buttons & Inputs</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="mt-6">
          <ButtonsInputsSection />
        </TabsContent>

        <TabsContent value="layout" className="mt-6">
          <LayoutSection />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <FeedbackSection />
        </TabsContent>

        <TabsContent value="overlays" className="mt-6">
          <OverlaysSection />
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <DataDisplaySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
