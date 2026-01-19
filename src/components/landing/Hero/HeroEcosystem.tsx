"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Building2,
  Users,
  Wrench,
  LineChart,
  FileText,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ServiceNode {
  id: string;
  icon: LucideIcon;
  label: string;
  angle: number; // Position around the circle (in degrees)
}

interface HeroEcosystemProps {
  className?: string;
}

// ============================================================================
// Data - 6 Services positioned around center
// ============================================================================

const serviceNodes: ServiceNode[] = [
  { id: "properties", icon: Building2, label: "Properties", angle: 270 },
  { id: "tenants", icon: Users, label: "Tenants", angle: 330 },
  { id: "maintenance", icon: Wrench, label: "Maintenance", angle: 30 },
  { id: "analytics", icon: LineChart, label: "Analytics", angle: 90 },
  { id: "documents", icon: FileText, label: "Documents", angle: 150 },
  { id: "communication", icon: MessageSquare, label: "Communication", angle: 210 },
];

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const centerNodeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

const serviceNodeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.5 + i * 0.1,
    },
  }),
};

const connectionVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.8,
        ease: "easeOut" as const,
        delay: 0.8 + i * 0.1,
      },
      opacity: {
        duration: 0.3,
        delay: 0.8 + i * 0.1,
      },
    },
  }),
};

const pulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const floatVariants = {
  initial: { y: 0 },
  animate: (i: number) => ({
    y: [-3, 3, -3],
    transition: {
      duration: 3 + i * 0.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: i * 0.2,
    },
  }),
};

// ============================================================================
// Helper Functions
// ============================================================================

function getNodePosition(angle: number, radius: number) {
  const radian = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius,
  };
}

// ============================================================================
// Center Node (REOS Hub)
// ============================================================================

function CenterNode({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.g
      variants={centerNodeVariants}
      className="origin-center"
    >
      {/* Outer glow ring */}
      <motion.circle
        cx="200"
        cy="200"
        r="50"
        className="fill-landing-primary/10"
        variants={shouldReduceMotion ? {} : pulseVariants}
        initial="initial"
        animate={shouldReduceMotion ? "initial" : "animate"}
      />

      {/* Main hexagonal shape */}
      <path
        d="M200 160 L235 180 L235 220 L200 240 L165 220 L165 180 Z"
        className="fill-landing-primary stroke-landing-primary/50"
        strokeWidth="2"
      />

      {/* Inner accent */}
      <path
        d="M200 175 L222 188 L222 212 L200 225 L178 212 L178 188 Z"
        className="fill-landing-accent"
      />

      {/* Center text */}
      <text
        x="200"
        y="205"
        textAnchor="middle"
        className="fill-white font-display text-lg"
        style={{ fontSize: "14px", letterSpacing: "0.1em" }}
      >
        REOS
      </text>
    </motion.g>
  );
}

// ============================================================================
// Service Node Component
// ============================================================================

function ServiceNodeComponent({
  node,
  index,
  centerX,
  centerY,
  radius,
  shouldReduceMotion,
}: {
  node: ServiceNode;
  index: number;
  centerX: number;
  centerY: number;
  radius: number;
  shouldReduceMotion: boolean | null;
}) {
  const Icon = node.icon;
  const pos = getNodePosition(node.angle, radius);
  const x = centerX + pos.x;
  const y = centerY + pos.y;

  return (
    <motion.g
      custom={index}
      variants={serviceNodeVariants}
    >
      <motion.g
        custom={index}
        variants={shouldReduceMotion ? {} : floatVariants}
        initial="initial"
        animate={shouldReduceMotion ? "initial" : "animate"}
      >
        {/* Node background hexagon */}
        <path
          d={`M${x} ${y - 28} L${x + 24} ${y - 14} L${x + 24} ${y + 14} L${x} ${y + 28} L${x - 24} ${y + 14} L${x - 24} ${y - 14} Z`}
          className="fill-background stroke-landing-primary/30"
          strokeWidth="2"
        />

        {/* Icon container */}
        <foreignObject x={x - 16} y={y - 16} width="32" height="32">
          <div className="flex items-center justify-center w-full h-full">
            <Icon
              className="w-5 h-5 text-landing-primary"
              aria-hidden="true"
            />
          </div>
        </foreignObject>

        {/* Label */}
        <text
          x={x}
          y={y + 45}
          textAnchor="middle"
          className="fill-landing-text/70 text-xs font-medium"
          style={{ fontSize: "11px" }}
        >
          {node.label}
        </text>
      </motion.g>
    </motion.g>
  );
}

// ============================================================================
// Connection Lines
// ============================================================================

function ConnectionLines({
  centerX,
  centerY,
  radius,
  shouldReduceMotion,
}: {
  centerX: number;
  centerY: number;
  radius: number;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <g>
      {serviceNodes.map((node, index) => {
        const pos = getNodePosition(node.angle, radius - 30);
        const x = centerX + pos.x;
        const y = centerY + pos.y;

        return (
          <motion.line
            key={`connection-${node.id}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            className="stroke-landing-primary/30"
            strokeWidth="2"
            strokeDasharray="4 4"
            custom={index}
            variants={shouldReduceMotion ? {} : connectionVariants}
          />
        );
      })}
    </g>
  );
}

// ============================================================================
// Data Flow Dots (animated particles along connections)
// ============================================================================

function DataFlowDot({
  node,
  centerX,
  centerY,
  radius,
  index,
  shouldReduceMotion,
}: {
  node: ServiceNode;
  centerX: number;
  centerY: number;
  radius: number;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const pos = getNodePosition(node.angle, radius - 30);

  if (shouldReduceMotion) return null;

  return (
    <motion.circle
      r="3"
      className="fill-landing-accent"
      initial={{ cx: centerX, cy: centerY, opacity: 0 }}
      animate={{
        cx: [centerX, centerX + pos.x, centerX],
        cy: [centerY, centerY + pos.y, centerY],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        delay: 1.5 + index * 0.3,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut",
      }}
    />
  );
}

// ============================================================================
// HeroEcosystem Component
// ============================================================================

export function HeroEcosystem({ className }: HeroEcosystemProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const shouldReduceMotion = useReducedMotion();

  const centerX = 200;
  const centerY = 200;
  const radius = 130;

  return (
    <div className={cn("relative w-full max-w-md mx-auto", className)}>
      <motion.svg
        ref={ref}
        viewBox="0 0 400 400"
        className="w-full h-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        role="img"
        aria-label="REOS platform ecosystem showing connected services: Properties, Tenants, Maintenance, Analytics, Documents, and Communication"
      >
        {/* Decorative outer ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 40}
          className="fill-none stroke-landing-primary/10"
          strokeWidth="1"
          strokeDasharray="8 8"
        />

        {/* Connection lines (behind nodes) */}
        <ConnectionLines
          centerX={centerX}
          centerY={centerY}
          radius={radius}
          shouldReduceMotion={shouldReduceMotion}
        />

        {/* Data flow animations */}
        {serviceNodes.map((node, index) => (
          <DataFlowDot
            key={`flow-${node.id}`}
            node={node}
            centerX={centerX}
            centerY={centerY}
            radius={radius}
            index={index}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}

        {/* Service nodes */}
        {serviceNodes.map((node, index) => (
          <ServiceNodeComponent
            key={node.id}
            node={node}
            index={index}
            centerX={centerX}
            centerY={centerY}
            radius={radius}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}

        {/* Center REOS hub */}
        <CenterNode shouldReduceMotion={shouldReduceMotion} />
      </motion.svg>
    </div>
  );
}

export default HeroEcosystem;
