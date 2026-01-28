"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
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

  // Add custom styles to override NavigationMenu default hover colors
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      [data-slot="navigation-menu-content"] a:hover {
        background-color: transparent !important;
        color: white !important;
      }
      [data-slot="navigation-menu-content"] a:focus {
        background-color: transparent !important;
        color: white !important;
      }
      [data-slot="navigation-menu-content"] li a:hover {
        background-color: transparent !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <>
    {/* Desktop Navigation - Animated */}
    <motion.div
      animate={{
        paddingLeft: scrolled ? "0px" : "24px",
        paddingRight: scrolled ? "0px" : "24px",
        paddingTop: scrolled ? "0px" : "16px",
      }}
      transition={{
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1],
      }}
      className="hidden md:block fixed top-0 left-0 right-0 z-50"
    >
      <motion.nav
        initial={false}
        animate={{
          borderRadius: scrolled ? "0px" : "12px",
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 1, 0.5, 1],
        }}
        style={{
          width: scrolled ? "100%" : "min(1280px, 100%)",
        }}
        className={cn(
          "mx-auto border bg-[#050A12] shadow-lg transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)]",
          scrolled ? "border-white/10 border-t-0 border-l-0 border-r-0" : "border-white/10",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-2">
          <a href="#" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-white/30 transition-colors">
              <span className="font-medium tracking-tighter text-sm text-white">R</span>
            </div>
            <span className="font-normal text-sm tracking-widest text-white/90">{t("logo")}</span>
          </a>

          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Platform Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-light bg-transparent text-white/80 hover:bg-white/5 hover:text-white data-[state=open]:bg-white/5 data-[state=open]:text-white">
                    {t("menu.platform")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#050A12] border-white/10">
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li>
                        <a
                          href="#"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors  text-white"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <Building2 className="h-4 w-4" />
                            {t("platform.propertyManagement.title")}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-white/60">
                            {t("platform.propertyManagement.description")}
                          </p>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors  text-white"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <Workflow className="h-4 w-4" />
                            {t("platform.automationEngine.title")}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-white/60">
                            {t("platform.automationEngine.description")}
                          </p>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors  text-white"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <Shield className="h-4 w-4" />
                            {t("platform.enterpriseSecurity.title")}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-white/60">
                            {t("platform.enterpriseSecurity.description")}
                          </p>
                        </a>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Solutions Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-light bg-transparent text-white/80 hover:bg-white/5 hover:text-white data-[state=open]:bg-white/5 data-[state=open]:text-white">
                    {t("menu.solutions")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-[#050A12] border-white/10">
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li>
                        <a
                          href="#"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors  text-white"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <Home className="h-4 w-4" />
                            {t("solutions.residential.title")}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-white/60">
                            {t("solutions.residential.description")}
                          </p>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors  text-white"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <Building className="h-4 w-4" />
                            {t("solutions.commercial.title")}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-white/60">
                            {t("solutions.commercial.description")}
                          </p>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors  text-white"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <Factory className="h-4 w-4" />
                            {t("solutions.industrial.title")}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-white/60">
                            {t("solutions.industrial.description")}
                          </p>
                        </a>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Simple Links */}
                <NavigationMenuItem>
                  <a
                    href="#"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent text-white/80 hover:text-white px-4 py-2 text-sm font-light hover:bg-white/5 transition-colors"
                  >
                    {t("menu.institutions")}
                  </a>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <a
                    href="#"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent text-white/80 hover:text-white px-4 py-2 text-sm font-light hover:bg-white/5 transition-colors"
                  >
                    {t("menu.developers")}
                  </a>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="text-xs font-medium text-white/70 hover:text-white transition-colors hidden sm:block">{t("actions.login")}</a>

            <a href="#" className="text-xs font-medium bg-white text-[#050A12] px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
              {t("actions.getStarted")}
            </a>
          </div>
        </div>
      </motion.nav>
    </motion.div>

    {/* Mobile Navigation - Always visible, fixed at top */}
    <nav
      className="md:hidden fixed top-0 left-0 right-0 border-b border-white/10 bg-[#050A12] shadow-lg overflow-x-hidden"
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 9999,
        width: '100%'
      }}
    >
      <div className="w-full max-w-[100vw] px-2 h-16 flex items-center justify-between gap-1">
        <a href="#" className="flex items-center gap-1.5 group flex-shrink min-w-0">
          <div className="w-8 h-8 rounded bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-white/30 transition-colors flex-shrink-0">
            <span className="font-medium tracking-tighter text-sm text-white">R</span>
          </div>
          <span className="font-normal text-sm tracking-widest text-white/90 truncate">{t("logo")}</span>
        </a>

        {/* Mobile Menu Trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="min-h-[44px] min-w-[44px] w-[44px] h-[44px] flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors flex-shrink-0 text-white"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] px-0 pt-12 bg-[#050A12] border-white/10">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Close button */}
              <SheetClose asChild>
                <button
                  className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors text-white"
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
                    <AccordionTrigger className="py-4 text-base font-normal hover:no-underline hover:bg-white/5 text-white px-2 rounded-lg min-h-[44px]">
                      {t("menu.platform")}
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="flex flex-col gap-1">
                        <a
                          href="#"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-white/5 rounded-lg transition-colors text-white"
                        >
                          <Building2 className="h-5 w-5 text-white/60" />
                          <span>{t("platform.propertyManagement.title")}</span>
                        </a>
                        <a
                          href="#"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-white/5 rounded-lg transition-colors text-white"
                        >
                          <Workflow className="h-5 w-5 text-white/60" />
                          <span>{t("platform.automationEngine.title")}</span>
                        </a>
                        <a
                          href="#"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-white/5 rounded-lg transition-colors text-white"
                        >
                          <Shield className="h-5 w-5 text-white/60" />
                          <span>{t("platform.enterpriseSecurity.title")}</span>
                        </a>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Solutions Accordion */}
                  <AccordionItem value="solutions" className="border-b-0">
                    <AccordionTrigger className="py-4 text-base font-normal hover:no-underline hover:bg-white/5 text-white px-2 rounded-lg min-h-[44px]">
                      {t("menu.solutions")}
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="flex flex-col gap-1">
                        <a
                          href="#"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-white/5 rounded-lg transition-colors text-white"
                        >
                          <Home className="h-5 w-5 text-white/60" />
                          <span>{t("solutions.residential.title")}</span>
                        </a>
                        <a
                          href="#"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-white/5 rounded-lg transition-colors text-white"
                        >
                          <Building className="h-5 w-5 text-white/60" />
                          <span>{t("solutions.commercial.title")}</span>
                        </a>
                        <a
                          href="#"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm hover:bg-white/5 rounded-lg transition-colors text-white"
                        >
                          <Factory className="h-5 w-5 text-white/60" />
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
                    className="px-4 py-3 min-h-[44px] text-base hover:bg-white/5 rounded-lg transition-colors flex items-center text-white"
                  >
                    {t("menu.institutions")}
                  </a>
                  <a
                    href="#"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 min-h-[44px] text-base hover:bg-white/5 rounded-lg transition-colors flex items-center text-white"
                  >
                    {t("menu.developers")}
                  </a>
                </div>

                {/* Mobile-only Log In and Get Started at bottom */}
                <div className="mt-auto px-4 pb-8 flex flex-col gap-3">
                  <a
                    href="#"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 min-h-[44px] text-base text-center border border-white/20 rounded-full hover:bg-white/5 transition-colors text-white"
                  >
                    {t("actions.login")}
                  </a>
                  <a
                    href="#"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 min-h-[44px] text-base text-center bg-white text-[#050A12] rounded-full hover:bg-white/90 transition-colors"
                  >
                    {t("actions.getStarted")}
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
      </div>
    </nav>
    </>
  );
}
