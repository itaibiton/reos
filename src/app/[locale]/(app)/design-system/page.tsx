"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";

// Showcase wrapper component
function ShowcaseSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="rounded-lg border bg-card p-6">{children}</div>
    </div>
  );
}

// Buttons & Inputs Section
function ButtonsInputsSection() {
  return (
    <div className="space-y-8">
      <ShowcaseSection
        title="Button Variants"
        description="All button style variants available"
      >
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Button Sizes"
        description="Size variants: default, sm, lg, icon"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <span className="text-lg">+</span>
          </Button>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Input" description="Text input with label">
        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" placeholder="Enter your email" />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Textarea" description="Multi-line text input">
        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Type your message here" />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Select" description="Dropdown selection">
        <div className="w-full max-w-sm">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Checkbox"
        description="Toggle with label"
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Switch" description="Toggle switch">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Radio Group" description="Single selection">
        <RadioGroup defaultValue="option-one">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <RadioGroupItem value="option-one" id="option-one" />
            <Label htmlFor="option-one">Option One</Label>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <RadioGroupItem value="option-two" id="option-two" />
            <Label htmlFor="option-two">Option Two</Label>
          </div>
        </RadioGroup>
      </ShowcaseSection>
    </div>
  );
}

// Layout Section
function LayoutSection() {
  return (
    <div className="space-y-8">
      <ShowcaseSection
        title="Card"
        description="Container with header, content, and footer"
      >
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content area of the card.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Action</Button>
          </CardFooter>
        </Card>
      </ShowcaseSection>

      <ShowcaseSection
        title="Separator"
        description="Visual divider between content"
      >
        <div className="space-y-4">
          <p>Content above</p>
          <Separator />
          <p>Content below</p>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Tabs" description="Tabbed content navigation">
        <Tabs defaultValue="tab1" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            Content for Tab 1
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            Content for Tab 2
          </TabsContent>
          <TabsContent value="tab3" className="mt-4">
            Content for Tab 3
          </TabsContent>
        </Tabs>
      </ShowcaseSection>

      <ShowcaseSection
        title="Accordion"
        description="Collapsible content sections"
      >
        <Accordion type="single" collapsible className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that match your design system.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ShowcaseSection>
    </div>
  );
}

// Feedback Section
function FeedbackSection() {
  return (
    <div className="space-y-8">
      <ShowcaseSection title="Alert" description="Informational messages">
        <div className="space-y-4 max-w-md">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default alert for general information.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>
              This is a destructive alert for errors.
            </AlertDescription>
          </Alert>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Badge" description="Status indicators">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Progress" description="Progress indicator">
        <div className="w-full max-w-md space-y-2">
          <Progress value={33} />
          <Progress value={66} />
          <Progress value={100} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Skeleton" description="Loading placeholder">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Spinner" description="Loading indicator">
        <div className="flex items-center gap-4">
          <Spinner className="size-4" />
          <Spinner className="size-6" />
          <Spinner className="size-8" />
        </div>
      </ShowcaseSection>
    </div>
  );
}

// Overlays Section
function OverlaysSection() {
  return (
    <div className="space-y-8">
      <ShowcaseSection title="Dialog" description="Modal dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog description. You can add forms or other content
                here.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ShowcaseSection>

      <ShowcaseSection title="Sheet" description="Slide-out panel">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription>
                This is a sheet panel that slides in from the side.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </ShowcaseSection>

      <ShowcaseSection title="Dropdown Menu" description="Context menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ShowcaseSection>

      <ShowcaseSection title="Tooltip" description="Hover information">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ShowcaseSection>

      <ShowcaseSection title="Popover" description="Click-triggered overlay">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Popover Title</h4>
              <p className="text-sm text-muted-foreground">
                This is a popover with more detailed content.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </ShowcaseSection>
    </div>
  );
}

// Data Display Section
function DataDisplaySection() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-8">
      <ShowcaseSection title="Table" description="Data table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>
                <Badge>Active</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>
                <Badge variant="secondary">Pending</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </ShowcaseSection>

      <ShowcaseSection title="Avatar" description="User avatar with fallback">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Calendar" description="Date picker calendar">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </ShowcaseSection>
    </div>
  );
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
