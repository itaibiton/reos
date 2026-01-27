"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Menu,
  Sun,
  Moon,
  Building2,
  Workflow,
  Shield,
  Home,
  Building,
  Factory,
  Users,
  FileCode,
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

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
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
      className="fixed top-0 left-0 right-0 z-50"
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
          "mx-auto border bg-background/80 backdrop-blur-xl shadow-lg transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)]",
          scrolled ? "border-border/50 border-t-0 border-l-0 border-r-0" : "border-border/50",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-foreground/5 border border-border flex items-center justify-center group-hover:border-border/100 transition-colors">
              <span className="font-medium tracking-tighter text-sm text-foreground">R</span>
            </div>
            <span className="font-normal text-sm tracking-widest text-foreground/90">REOS</span>
          </a>

          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Platform Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-light bg-transparent hover:bg-foreground/5 data-[state=open]:bg-foreground/5">
                    Platform
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
                              Property Management
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Centralized platform for managing your entire portfolio
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
                              Automation Engine
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Automate workflows and reduce manual operations
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
                              Enterprise Security
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Bank-grade security and compliance infrastructure
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
                    Solutions
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
                              Residential
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Purpose-built for multifamily and residential properties
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
                              Commercial
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Optimize office, retail, and mixed-use properties
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
                              Industrial
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Manage warehouses and industrial facilities at scale
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
                    Institutions
                  </a>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <a
                    href="#"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-light hover:bg-foreground/5 transition-colors"
                  >
                    Developers
                  </a>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="text-xs font-medium text-foreground/80 hover:text-foreground transition-colors hidden sm:block">Log in</a>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg hover:bg-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            <a href="#" className="text-xs font-medium bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </motion.nav>
    </motion.div>
  );
}
