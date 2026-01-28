"use client";

import { useState, useRef, useEffect } from "react";
import { motion, type Variants, useScroll, useTransform, useMotionValue, animate, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";
import RotatingText from "@/components/ui/rotating-text";
import {
  ArrowRight,
  PlayCircle,
  Menu,
  PieChart,
  Building2,
  Users,
  Wallet,
  FileText,
  Settings,
  ChevronRight,
  Building,
  Home,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Menu items are now generated dynamically using translations inside the component

const assets = [
  { name: "Skyline Tower", icon: Building, status: "Active", noi: "$1.2M", valuation: "$45.2M", color: "blue" },
  { name: "Highland Park", icon: Home, status: "Review", noi: "$850K", valuation: "$12.8M", color: "purple" },
  { name: "Westside Retail", icon: Store, status: "Active", noi: "$2.1M", valuation: "$68.4M", color: "orange" },
];

const activities = [
  { title: "New Lease Signed", detail: "Unit 402 • 10 mins ago", highlight: true },
  { title: "Maintenance Request", detail: "HVAC • 1 hour ago", highlight: false },
  { title: "Rent Payment Processed", detail: "Auto-pay • 2 hours ago", highlight: false },
  { title: "Valuation Update", detail: "System • 5 hours ago", highlight: false },
];

// CountUp Component
function CountUp({ 
  value, 
  duration = 2,
  isVisible = true 
}: { 
  value: string; 
  duration?: number;
  isVisible?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState("0");
  const hasAnimatedRef = useRef(false);

  // Handle special case "24/7" - no animation needed
  if (value.includes("/")) {
    return <span>{value}</span>;
  }

  // Extract numeric value and suffix
  // Handle formats like: "$1.5B+", "500+", "8", "98%", "1,200+"
  const match = value.match(/^([$]?)([\d,.]+)([BMK%\+]*)$/);
  const prefix = match ? match[1] : "";
  const numericStr = match ? match[2].replace(/,/g, "") : "0";
  const numericValue = parseFloat(numericStr) || 0;
  const suffix = match ? match[3] : "";

  useEffect(() => {
    if (!isVisible) {
      setDisplayValue("0");
      hasAnimatedRef.current = false;
      return;
    }

    if (hasAnimatedRef.current) return; // Don't re-animate if already animated

    hasAnimatedRef.current = true;
    
    const startTime = Date.now();
    const startValue = 0;
    const endValue = numericValue;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function (easeOut)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      if (suffix.includes("B")) {
        // Handle billions
        setDisplayValue(prefix + current.toFixed(1) + suffix);
      } else if (suffix.includes("M")) {
        // Handle millions
        setDisplayValue(prefix + current.toFixed(1) + suffix);
      } else if (suffix.includes("K")) {
        // Handle thousands
        setDisplayValue(prefix + Math.floor(current).toLocaleString() + suffix);
      } else if (suffix.includes("%")) {
        // Handle percentages
        setDisplayValue(Math.floor(current) + suffix);
      } else if (suffix.includes("+")) {
        // Handle numbers with +
        setDisplayValue(prefix + Math.floor(current).toLocaleString() + suffix);
      } else {
        // Plain numbers
        setDisplayValue(prefix + Math.floor(current).toLocaleString() + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        // Ensure final value is set correctly
        if (suffix.includes("B") || suffix.includes("M")) {
          setDisplayValue(prefix + endValue.toFixed(1) + suffix);
        } else if (suffix.includes("+")) {
          setDisplayValue(prefix + Math.floor(endValue).toLocaleString() + suffix);
        } else {
          setDisplayValue(prefix + Math.floor(endValue).toLocaleString() + suffix);
        }
      }
    };

    requestAnimationFrame(updateValue);
  }, [numericValue, duration, isVisible, suffix, prefix]);

  return <span>{displayValue}</span>;
}

// DecryptedText Component
function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  isVisible = true
}: {
  text: string;
  speed?: number;
  maxIterations?: number;
  isVisible?: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const prevTextRef = useRef(text);

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/";

  useEffect(() => {
    if (!isVisible) {
      setDisplayText("");
      return;
    }

    // Reset animation when text changes
    if (prevTextRef.current !== text) {
      prevTextRef.current = text;
    }

    let iteration = 0;
    const totalIterations = text.length * 3; // More iterations for longer animation
    let currentIteration = 0;

    const interval = setInterval(() => {
      // Calculate which characters should be revealed based on progress
      const progress = currentIteration / totalIterations;
      const revealedCount = Math.floor(progress * text.length);

      const newText = text
        .split("")
        .map((letter, index) => {
          if (letter === " " || letter === ":" || letter === "/" || letter === ".") return letter; // Preserve special chars
          if (index < revealedCount) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      setDisplayText(newText);

      currentIteration++;

      if (currentIteration >= totalIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isVisible]);

  if (!isVisible) {
    return <span>{text}</span>;
  }

  return <span>{displayText || text}</span>;
}

// Stats are now generated dynamically using translations inside the component

// Properties view content
const propertiesData = [
  { name: "Tel Aviv Tower", location: "Tel Aviv", units: "45", occupancy: "92%", value: "$28.5M", color: "blue" },
  { name: "Jerusalem Heights", location: "Jerusalem", units: "32", occupancy: "88%", value: "$19.2M", color: "purple" },
  { name: "Haifa Bay", location: "Haifa", units: "28", occupancy: "95%", value: "$15.8M", color: "orange" },
  { name: "Herzliya Marina", location: "Herzliya", units: "18", occupancy: "100%", value: "$32.1M", color: "green" },
];

export function Hero({ className }: HeroProps) {
  const t = useTranslations("landing.hero");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Track scroll progress through the hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  // Stats fade in earlier (when scroll progress reaches 0.1, very early)
  const statsOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.1, 0.3], [60, 0]);

  // Switch stats and mockup content at middle of scroll (0.4-0.6)
  const switchProgress = useTransform(scrollYProgress, [0.4, 0.6], [0, 1], {
    clamp: true,
  });

  // Initial content - fade out and scale down (card swap effect)
  const initialContentOpacity = useTransform(switchProgress, [0, 0.5], [1, 0]);
  const initialContentScale = useTransform(switchProgress, [0, 0.5], [1, 0.95]);

  // Switched content - fade in and scale up (card swap effect)
  const switchedContentOpacity = useTransform(switchProgress, [0.5, 1], [0, 1]);
  const switchedContentScale = useTransform(switchProgress, [0.5, 1], [0.95, 1]);

  // Scroll progress for bottom border indicator (0 to 100%)
  const scrollProgressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Track when stats become visible for animations
  const [initialStatsVisible, setInitialStatsVisible] = useState(false);
  const [switchedStatsVisible, setSwitchedStatsVisible] = useState(false);

  // Track active menu item based on scroll
  const [activeMenuItem, setActiveMenuItem] = useState<"Overview" | "Properties">("Overview");

  // URL changes based on active menu item
  const mockupUrl = activeMenuItem === "Overview"
    ? "reos.internal/dashboard/overview"
    : "reos.internal/dashboard/properties";

  useMotionValueEvent(statsOpacity, "change", (latest) => {
    if (latest > 0.3 && !initialStatsVisible) {
      setInitialStatsVisible(true);
    }
  });

  useMotionValueEvent(switchedContentOpacity, "change", (latest) => {
    if (latest > 0.3 && !switchedStatsVisible) {
      setSwitchedStatsVisible(true);
    }
  });

  useMotionValueEvent(switchProgress, "change", (latest) => {
    if (latest > 0.5) {
      setActiveMenuItem("Properties");
    } else {
      setActiveMenuItem("Overview");
    }
  });

  // Check initial values on mount
  useEffect(() => {
    const checkInitial = () => {
      const statsOp = statsOpacity.get();
      const switchedOp = switchedContentOpacity.get();
      if (statsOp > 0.3 && !initialStatsVisible) {
        setInitialStatsVisible(true);
      }
      if (switchedOp > 0.3 && !switchedStatsVisible) {
        setSwitchedStatsVisible(true);
      }
    };
    checkInitial();
    const interval = setInterval(checkInitial, 100);
    return () => clearInterval(interval);
  }, [statsOpacity, switchedContentOpacity, initialStatsVisible, switchedStatsVisible]);


  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <motion.header
      ref={heroRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className={cn("relative pt-32 pb-20 md:pt-48 md:pb-32 bg-grid border-b border-border/50", className)}
      style={{ minHeight: "400vh" }}
    >
      {/* Ambient Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Centered Hero Content */}
        <motion.div
          variants={fadeInUp}
          className="mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-foreground/5 backdrop-blur-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-light tracking-wide text-foreground/70 uppercase">{t("badge")}</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-7xl font-light tracking-tighter text-foreground mb-6 leading-[1.1]">
            <span className="md:inline">
              {t("heading").split(" ").slice(0, Math.ceil(t("heading").split(" ").length / 2)).join(" ")}
            </span>
            <br className="md:hidden" />{" "}
            <span className="md:inline">
              {t("heading").split(" ").slice(Math.ceil(t("heading").split(" ").length / 2)).join(" ")}
            </span>{" "}
            <br />
            <span className="block md:inline">
              <RotatingText
              texts={[
                t("roles.investors"),
                t("roles.mortgageAdvisors"),
                t("roles.brokers"),
                t("roles.lawyers"),
                t("roles.appraisers"),
                t("roles.propertyManagers")
              ]}
              mainClassName="px-2 md:px-3 lg:px-4 bg-foreground text-background overflow-hidden py-0.5 md:py-1 justify-center rounded-lg"
              // staggerFrom="first"
              staggerFrom="random"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.01}
              splitLevelClassName="overflow-hidden pb-0.5 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              animatePresenceMode="popLayout"
              rotationInterval={2500}
            />
            </span>
            {/* <RotatingText
  texts={['React', 'Bits', 'Is', 'Cool!']}
  mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
  staggerFrom={"last"}
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "-120%" }}
  staggerDuration={0.025}
  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
  transition={{ type: "spring", damping: 30, stiffness: 400 }}
  rotationInterval={2000}
/> */}
          </h1>

          <p className="text-lg md:text-xl text-foreground/50 font-light max-w-2xl mb-10 leading-relaxed">
            {t("subheading")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 ">
            <a
              href="/questionnaire"
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-all w-full sm:w-auto min-h-[44px]"
            >
              <span>{t("cta.primary")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/properties"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-border bg-foreground/5 backdrop-blur-sm text-foreground rounded-full text-sm font-medium hover:bg-foreground/10 transition-colors w-full sm:w-auto min-h-[44px]"
            >
              <span>{t("cta.secondary")}</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Dashboard Preview */}
      <div
        className="sticky z-20 mt-20 max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8 top-16 md:top-[calc(50vh-275px)]"
      >
        <motion.div variants={fadeInUp}>
        {/* MacBook-style bezel - Silver on light, Space Gray on dark */}
        <div className="relative rounded-[20px] p-3 bg-gradient-to-b from-[#e8e8e8] via-[#d4d4d4] to-[#e8e8e8] dark:from-[#1a1a1a] dark:via-[#0f0f0f] dark:to-[#1a1a1a] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] select-none">
          {/* Inner shadow for depth */}
          <div className="absolute inset-0 rounded-[20px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none"></div>

          {/* Glossy reflection overlay */}
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-white/[0.15] dark:from-white/[0.03] via-transparent to-transparent pointer-events-none"></div>

          {/* Screen */}
          <div className="relative rounded-xl border border-black/10 dark:border-white/5 bg-card shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] overflow-hidden">
            {/* Scroll Progress Indicator - Bottom Border */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-foreground z-50"
              style={{
                width: scrollProgressWidth,
              }}
            />
            {/* Mockup Header */}
            <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-xl">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"></div>
              </div>
            <div className="ml-4 flex-1 flex justify-center">
              <div className="h-5 w-64 bg-foreground/5 rounded text-[10px] flex items-center justify-center text-muted-foreground font-mono">
                <DecryptedText text={mockupUrl} speed={30} isVisible={true} />
              </div>
            </div>
          </div>

          {/* Mockup Body */}
          <div className="flex h-[400px] sm:h-[450px] md:h-[550px]">
            {/* Animated Sidebar */}
            <div
              className={cn(
                "hidden md:flex flex-col border-r border-border/50 bg-card/95 backdrop-blur-xl relative transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20",
                sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
              )}
            >
              {/* Sidebar Background */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="w-full h-full bg-gradient-to-b from-foreground/[0.03] to-transparent"></div>
              </div>

              {/* Sidebar Header / Toggle */}
              <div className="h-14 flex items-center px-4 border-b border-border/50 relative z-10 shrink-0">
                <button
                  onClick={toggleSidebar}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                >
                  <Menu className="w-[18px] h-[18px]" />
                </button>
                <span className="sidebar-text ml-3 text-sm font-medium text-foreground tracking-tight whitespace-nowrap">
                  {t("dashboard.workspace")}
                </span>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-3 space-y-1 relative z-10 overflow-hidden">
                {/* Section Label */}
                <div className="sidebar-label px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground/75 font-semibold transition-opacity duration-200">
                  {t("dashboard.sections.main")}
                </div>
                {[
                  { icon: PieChart, label: t("dashboard.menu.overview"), key: "Overview" },
                  { icon: Building2, label: t("dashboard.menu.properties"), key: "Properties" },
                  { icon: Users, label: t("dashboard.menu.tenants"), key: "Tenants", badge: "12" },
                  { icon: Wallet, label: t("dashboard.menu.financials"), key: "Financials" },
                ].map((item, index) => {
                  const isActive = item.key === activeMenuItem;
                  return (
                    <button
                      key={index}
                      className={cn(
                        "flex items-center w-full px-3 py-2 rounded-lg transition-all group/item",
                        isActive
                          ? "bg-foreground/10 text-foreground border border-border/50 shadow-sm"
                          : "text-foreground/50 hover:text-foreground hover:bg-foreground/5 border border-transparent hover:border-border/50"
                      )}
                    >
                      <item.icon className="shrink-0 w-[18px] h-[18px]" />
                      <span className="sidebar-text ml-3 text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="sidebar-text ml-auto text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="sidebar-text ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Section Label */}
                <div className="sidebar-label px-3 py-4 text-[10px] uppercase tracking-wider text-muted-foreground/75 font-semibold transition-opacity duration-200">
                  {t("dashboard.sections.operations")}
                </div>

                {[
                  { icon: FileText, label: t("dashboard.menu.documents") },
                  { icon: Settings, label: t("dashboard.menu.settings") },
                ].map((item, index) => (
                  <button
                    key={index}
                    className="flex items-center w-full px-3 py-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 border border-transparent hover:border-border/50 transition-all group/item"
                  >
                    <item.icon className="shrink-0 w-[18px] h-[18px]" />
                    <span className="sidebar-text ml-3 text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sidebar Footer */}
              <div className="p-3 mt-auto border-t border-border/50 relative z-10">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium shrink-0 shadow-lg shadow-blue-900/20 ring-1 ring-white/10">
                    JS
                  </div>
                  <div className="sidebar-text flex flex-col overflow-hidden">
                    <span className="text-xs font-medium text-foreground truncate">{t("dashboard.user.name")}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{t("dashboard.user.role")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-hidden relative bg-background/50">
              {/* Initial Content - Overview */}
              <motion.div className="absolute inset-0 p-6" style={{ opacity: initialContentOpacity, scale: initialContentScale }}>
                {/* Header Area */}
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-xl font-light text-foreground mb-1">{t("dashboard.portfolioPerformance")}</h3>
                    <p className="text-xs text-muted-foreground">{t("dashboard.lastUpdated")}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 border border-border rounded text-xs text-foreground/60 hover:text-foreground cursor-pointer hover:bg-foreground/5 transition-colors">
                      {t("dashboard.timePeriods.oneDay")}
                    </div>
                    <div className="px-3 py-1.5 border border-border rounded text-xs text-foreground/60 hover:text-foreground cursor-pointer hover:bg-foreground/5 transition-colors">
                      {t("dashboard.timePeriods.oneWeek")}
                    </div>
                    <div className="px-3 py-1.5 bg-foreground text-background border border-foreground rounded text-xs font-medium cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      {t("dashboard.timePeriods.oneMonth")}
                    </div>
                    <div className="px-3 py-1.5 border border-border rounded text-xs text-foreground/60 hover:text-foreground cursor-pointer hover:bg-foreground/5 transition-colors">
                      {t("dashboard.timePeriods.oneYear")}
                    </div>
                  </div>
                </div>

                {/* Chart Mockup */}
                <div className="h-64 w-full flex items-end justify-between gap-1 mb-10 border-b border-border/50 pb-4 relative">
                  {/* Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-px bg-foreground/5"></div>
                    <div className="w-full h-px bg-foreground/5"></div>
                    <div className="w-full h-px bg-foreground/5"></div>
                    <div className="w-full h-px bg-foreground/5"></div>
                  </div>

                  {/* Bars */}
                  {[40, 55, 45, 70, 60, 85, 65, 75, 90, 80].map((height, index) => (
                    <div
                      key={index}
                      className="w-full bg-gradient-to-t from-blue-500/10 to-blue-500/40 rounded-t-sm hover:bg-blue-500/50 transition-all cursor-crosshair relative group"
                      style={{ height: `${height}%` }}
                    >
                      {index === 8 && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground/90 backdrop-blur text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium shadow-lg transform translate-y-1 group-hover:translate-y-0 duration-200">
                          $42.5M Valuation
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Data Table */}
                <div className="grid grid-cols-4 text-xs text-muted-foreground mb-3 px-2 font-medium tracking-wide">
                  <div>{t("dashboard.tableHeaders.asset")}</div>
                  <div>{t("dashboard.tableHeaders.status")}</div>
                  <div>{t("dashboard.tableHeaders.noi")}</div>
                  <div className="text-right">{t("dashboard.tableHeaders.valuation")}</div>
                </div>
                <div className="space-y-1">
                  {assets.map((asset, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 items-center p-2 rounded hover:bg-foreground/5 cursor-pointer transition-colors border border-transparent hover:border-border/50 group"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded flex items-center justify-center border",
                          asset.color === "blue" && "bg-blue-500/20 text-blue-400 border-blue-500/20 group-hover:border-blue-500/40",
                          asset.color === "purple" && "bg-purple-500/20 text-purple-400 border-purple-500/20 group-hover:border-purple-500/40",
                          asset.color === "orange" && "bg-orange-500/20 text-orange-400 border-orange-500/20 group-hover:border-orange-500/40"
                        )}>
                          <asset.icon className="w-[14px] h-[14px]" />
                        </div>
                        <span className="text-foreground text-xs font-medium">{asset.name}</span>
                      </div>
                      <div>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] border flex w-fit items-center gap-1",
                          asset.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        )}>
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            asset.status === "Active" ? "bg-green-400" : "bg-yellow-400"
                          )}></div>
                          {asset.status}
                        </span>
                      </div>
                      <div className="text-foreground/80 text-xs font-mono group-hover:text-foreground transition-colors">
                        {asset.noi}
                      </div>
                      <div className="text-right text-foreground text-xs font-mono">{asset.valuation}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Switched Content - Properties */}
              <motion.div className="absolute inset-0 p-6" style={{ opacity: switchedContentOpacity, scale: switchedContentScale }}>
                {/* Header Area */}
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-xl font-light text-foreground mb-1">{t("dashboard.propertiesPortfolio")}</h3>
                    <p className="text-xs text-muted-foreground">{t("dashboard.propertiesSubtitle")}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 border border-border rounded text-xs text-foreground/60 hover:text-foreground cursor-pointer hover:bg-foreground/5 transition-colors">
                      {t("dashboard.filters.all")}
                    </div>
                    <div className="px-3 py-1.5 border border-border rounded text-xs text-foreground/60 hover:text-foreground cursor-pointer hover:bg-foreground/5 transition-colors">
                      {t("dashboard.filters.active")}
                    </div>
                    <div className="px-3 py-1.5 bg-foreground text-background border border-foreground rounded text-xs font-medium cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      {t("dashboard.filters.featured")}
                    </div>
                  </div>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {propertiesData.map((property, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-1">{property.name}</h4>
                          <p className="text-xs text-muted-foreground">{property.location}</p>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded flex items-center justify-center border",
                          property.color === "blue" && "bg-blue-500/20 text-blue-400 border-blue-500/20",
                          property.color === "purple" && "bg-purple-500/20 text-purple-400 border-purple-500/20",
                          property.color === "orange" && "bg-orange-500/20 text-orange-400 border-orange-500/20",
                          property.color === "green" && "bg-green-500/20 text-green-400 border-green-500/20"
                        )}>
                          <Building className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground mb-1">Units</div>
                          <div className="text-foreground font-medium">{property.units}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Occupancy</div>
                          <div className="text-foreground font-medium">{property.occupancy}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Value</div>
                          <div className="text-foreground font-medium font-mono">{property.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Properties Table */}
                <div className="grid grid-cols-5 text-xs text-muted-foreground mb-3 px-2 font-medium tracking-wide">
                  <div>{t("dashboard.tableHeaders.property")}</div>
                  <div>{t("dashboard.tableHeaders.location")}</div>
                  <div>{t("dashboard.tableHeaders.units")}</div>
                  <div>{t("dashboard.tableHeaders.occupancy")}</div>
                  <div className="text-right">{t("dashboard.tableHeaders.value")}</div>
                </div>
                <div className="space-y-1">
                  {propertiesData.map((property, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-5 items-center p-2 rounded hover:bg-foreground/5 cursor-pointer transition-colors border border-transparent hover:border-border/50 group"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded flex items-center justify-center border",
                          property.color === "blue" && "bg-blue-500/20 text-blue-400 border-blue-500/20 group-hover:border-blue-500/40",
                          property.color === "purple" && "bg-purple-500/20 text-purple-400 border-purple-500/20 group-hover:border-purple-500/40",
                          property.color === "orange" && "bg-orange-500/20 text-orange-400 border-orange-500/20 group-hover:border-orange-500/40",
                          property.color === "green" && "bg-green-500/20 text-green-400 border-green-500/20 group-hover:border-green-500/40"
                        )}>
                          <Building className="w-[14px] h-[14px]" />
                        </div>
                        <span className="text-foreground text-xs font-medium">{property.name}</span>
                      </div>
                      <div className="text-foreground/80 text-xs">{property.location}</div>
                      <div className="text-foreground/80 text-xs font-medium">{property.units}</div>
                      <div className="text-foreground/80 text-xs font-medium">{property.occupancy}</div>
                      <div className="text-right text-foreground text-xs font-mono">{property.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Detail Panel */}
            <div className="w-72 border-l border-border bg-background hidden lg:block p-4 z-10">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">{t("dashboard.activityLog")}</div>
              <div className="space-y-6 relative">
                {/* Timeline Line */}
                <div className="absolute left-1.5 top-2 bottom-0 w-px bg-border"></div>

                {activities.map((activity, index) => (
                  <div key={index} className="relative pl-6">
                    <div className={cn(
                      "absolute left-0 top-1 w-3 h-3 rounded-full bg-background border z-10",
                      activity.highlight ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "border-foreground/20"
                    )}></div>
                    <p className="text-xs text-foreground">{activity.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{activity.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Stats Section - Below Mockup */}
        <div className="mt-14 max-w-4xl mx-auto px-4 sm:px-6 relative">
          {/* Initial Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
            style={{ opacity: initialContentOpacity, scale: initialContentScale }}
          >
            {[
              { value: t("stats.initial.transactionVolume.value"), label: t("stats.initial.transactionVolume.label") },
              { value: t("stats.initial.propertiesListed.value"), label: t("stats.initial.propertiesListed.label") },
              { value: t("stats.initial.serviceCategories.value"), label: t("stats.initial.serviceCategories.label") },
              { value: t("stats.initial.aiSupport.value"), label: t("stats.initial.aiSupport.label") },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-2 tracking-tight">
                  <CountUp value={stat.value} duration={2} isVisible={initialStatsVisible} />
                </div>
                <div className="text-sm text-foreground/50 font-light">
                  <DecryptedText text={stat.label} speed={50} isVisible={initialStatsVisible} />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Switched Stats */}
          <motion.div
            className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
            style={{ opacity: switchedContentOpacity, scale: switchedContentScale }}
          >
            {[
              { value: t("stats.switched.totalAssets.value"), label: t("stats.switched.totalAssets.label") },
              { value: t("stats.switched.activeUnits.value"), label: t("stats.switched.activeUnits.label") },
              { value: t("stats.switched.citiesCovered.value"), label: t("stats.switched.citiesCovered.label") },
              { value: t("stats.switched.satisfactionRate.value"), label: t("stats.switched.satisfactionRate.label") },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-2 tracking-tight">
                  <CountUp value={stat.value} duration={2} isVisible={switchedStatsVisible} />
                </div>
                <div className="text-sm text-foreground/50 font-light">
                  <DecryptedText text={stat.label} speed={50} isVisible={switchedStatsVisible} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
