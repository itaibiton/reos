"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Menu,
  Building2,
  Workflow,
  Shield,
  Home,
  Building,
  Factory,
  Users,
  FileCode,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const t = useTranslations("landing.navigation");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollingDown = currentScrollY > lastScrollY;

          // Different thresholds based on scroll direction
          if (scrollingDown && currentScrollY > 100) {
            setScrolled(true);
          } else if (!scrollingDown && currentScrollY < 80) {
            setScrolled(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 md:px-6 md:pt-4">
      <nav
        className={cn(
          "mx-auto border-b md:border bg-background/80 backdrop-blur-xl shadow-lg w-full max-w-[1280px] md:rounded-xl",
          scrolled ? "md:border-border/50 md:border-t-0 md:border-l-0 md:border-r-0" : "md:border-border/50",
          className
        )}
      >
        <div className="mx-auto px-3 sm:px-4 md:px-6 h-16 flex items-center justify-between gap-2">
          <a href="#" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded bg-foreground/5 border border-border flex items-center justify-center group-hover:border-border/100 transition-colors">
              <span className="font-medium tracking-tighter text-sm text-foreground">R</span>
            </div>
            <span className="font-normal text-sm tracking-widest text-foreground/90">{t("logo")}</span>
          </a>

          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Platform Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-light bg-transparent hover:bg-foreground/5 data-[state=open]:bg-foreground/5">
                    {t("menu.platform")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Building2 className="h-4 w-4" />
                              {t("platform.propertyManagement.title")}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t("platform.propertyManagement.description")}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Workflow className="h-4 w-4" />
                              {t("platform.automationEngine.title")}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t("platform.automationEngine.description")}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Shield className="h-4 w-4" />
                              {t("platform.enterpriseSecurity.title")}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t("platform.enterpriseSecurity.description")}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Solutions Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-light bg-transparent hover:bg-foreground/5 data-[state=open]:bg-foreground/5">
                    {t("menu.solutions")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Home className="h-4 w-4" />
                              {t("solutions.residential.title")}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t("solutions.residential.description")}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Building className="h-4 w-4" />
                              {t("solutions.commercial.title")}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t("solutions.commercial.description")}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="#"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Factory className="h-4 w-4" />
                              {t("solutions.industrial.title")}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t("solutions.industrial.description")}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Simple Links */}
                <NavigationMenuItem>
                  <a
                    href="#"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-light hover:bg-foreground/5 transition-colors"
                  >
                    {t("menu.institutions")}
                  </a>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <a
                    href="#"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-light hover:bg-foreground/5 transition-colors"
                  >
                    {t("menu.developers")}
                  </a>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex-shrink-0">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="min-h-[44px] min-w-[44px] w-[44px] h-[44px] flex items-center justify-center hover:bg-foreground/5 rounded-lg transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] px-0 pt-12">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                {/* Close button */}
                <SheetClose asChild>
                  <button
                    className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-foreground/5 rounded-lg transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>

                <div className="flex flex-col h-full">
                  {/* Accordion for Platform and Solutions */}
                  <Accordion type="single" collapsible className="px-4">
                    {/* Platform Accordion */}
                    <AccordionItem value="platform" className="border-b-0">
                      <AccordionTrigger className="py-4 text-base font-normal hover:no-underline hover:bg-foreground/5 px-2 rounded-lg min-h-[44px]">
                        {t("menu.platform")}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="flex flex-col gap-1">
                          <a
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-foreground/5 rounded-lg transition-colors"
                          >
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <span>{t("platform.propertyManagement.title")}</span>
                          </a>
                          <a
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-foreground/5 rounded-lg transition-colors"
                          >
                            <Workflow className="h-5 w-5 text-muted-foreground" />
                            <span>{t("platform.automationEngine.title")}</span>
                          </a>
                          <a
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-foreground/5 rounded-lg transition-colors"
                          >
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <span>{t("platform.enterpriseSecurity.title")}</span>
                          </a>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Solutions Accordion */}
                    <AccordionItem value="solutions" className="border-b-0">
                      <AccordionTrigger className="py-4 text-base font-normal hover:no-underline hover:bg-foreground/5 px-2 rounded-lg min-h-[44px]">
                        {t("menu.solutions")}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="flex flex-col gap-1">
                          <a
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-foreground/5 rounded-lg transition-colors"
                          >
                            <Home className="h-5 w-5 text-muted-foreground" />
                            <span>{t("solutions.residential.title")}</span>
                          </a>
                          <a
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-foreground/5 rounded-lg transition-colors"
                          >
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <span>{t("solutions.commercial.title")}</span>
                          </a>
                          <a
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-foreground/5 rounded-lg transition-colors"
                          >
                            <Factory className="h-5 w-5 text-muted-foreground" />
                            <span>{t("solutions.industrial.title")}</span>
                          </a>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Simple Links */}
                  <div className="px-4 mt-2 flex flex-col gap-1">
                    <a
                      href="#"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 min-h-[44px] text-base hover:bg-foreground/5 rounded-lg transition-colors flex items-center"
                    >
                      {t("menu.institutions")}
                    </a>
                    <a
                      href="#"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 min-h-[44px] text-base hover:bg-foreground/5 rounded-lg transition-colors flex items-center"
                    >
                      {t("menu.developers")}
                    </a>
                  </div>

                  {/* Mobile-only Log In and Get Started at bottom */}
                  <div className="mt-auto px-4 pb-8 flex flex-col gap-3">
                    <a
                      href="#"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 min-h-[44px] text-base text-center border border-border rounded-full hover:bg-foreground/5 transition-colors"
                    >
                      {t("actions.login")}
                    </a>
                    <a
                      href="#"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 min-h-[44px] text-base text-center bg-foreground text-background rounded-full hover:bg-foreground/90 transition-colors"
                    >
                      {t("actions.getStarted")}
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-xs font-medium text-foreground/80 hover:text-foreground transition-colors hidden sm:block">{t("actions.login")}</a>

            <a href="#" className="text-xs font-medium bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors">
              {t("actions.getStarted")}
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}
