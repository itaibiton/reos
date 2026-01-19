"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Linkedin, Twitter, Github, type LucideIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface SocialLink {
  platform: "linkedin" | "twitter" | "github";
  url: string;
  label: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo?: string;
  photoAlt?: string;
  initials: string;
  avatarGradient: string;
  socialLinks: SocialLink[];
}

interface TeamMemberCardProps {
  member: TeamMember;
  shouldReduceMotion: boolean | null;
}

interface TeamSectionProps {
  className?: string;
}

// ============================================================================
// Data
// ============================================================================

const teamMembers: TeamMember[] = [
  {
    id: "sarah-mitchell",
    name: "Sarah Mitchell",
    role: "CEO & Founder",
    bio: "Former real estate investor who managed 200+ units before founding REOS. Sarah saw firsthand how fragmented property management software costs landlords thousands in lost time and revenue. She built REOS to bring enterprise-grade automation to property managers of all sizes.",
    initials: "SM",
    avatarGradient: "bg-gradient-to-br from-purple-500 to-purple-700",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/sarah-mitchell-reos",
        label: "Connect with Sarah Mitchell on LinkedIn",
      },
      {
        platform: "twitter",
        url: "https://twitter.com/sarahmitchellRE",
        label: "Follow Sarah Mitchell on Twitter",
      },
    ],
  },
  {
    id: "marcus-chen",
    name: "Marcus Chen",
    role: "Head of Engineering",
    bio: "Previously led backend infrastructure teams at Zillow and Stripe. Marcus specializes in building scalable, secure systems that handle millions of transactions. At REOS, he's architecting a platform that's both powerful for enterprises and intuitive for individual landlords.",
    initials: "MC",
    avatarGradient: "bg-gradient-to-br from-blue-500 to-blue-700",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/marcus-chen-eng",
        label: "Connect with Marcus Chen on LinkedIn",
      },
      {
        platform: "twitter",
        url: "https://twitter.com/marcusbuildsstuff",
        label: "Follow Marcus Chen on Twitter",
      },
      {
        platform: "github",
        url: "https://github.com/mchen",
        label: "View Marcus Chen on GitHub",
      },
    ],
  },
  {
    id: "emily-rodriguez",
    name: "Emily Rodriguez",
    role: "Lead Product Designer",
    bio: "Award-winning UX designer with a passion for simplifying complex workflows. Emily's design philosophy centers on empathy-driven interfaces that reduce cognitive load. She's redesigned REOS from the ground up to make property management feel effortless, not overwhelming.",
    initials: "ER",
    avatarGradient: "bg-gradient-to-br from-green-500 to-green-700",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/emily-rodriguez-design",
        label: "Connect with Emily Rodriguez on LinkedIn",
      },
      {
        platform: "twitter",
        url: "https://twitter.com/emilydesignsUX",
        label: "Follow Emily Rodriguez on Twitter",
      },
      {
        platform: "github",
        url: "https://github.com/erodriguez",
        label: "View Emily Rodriguez on GitHub",
      },
    ],
  },
  {
    id: "james-oconnor",
    name: "James O'Connor",
    role: "Head of Customer Success",
    bio: "James spent a decade as a property manager before joining REOS, managing portfolios ranging from single-family homes to 500-unit apartment complexes. He understands every pain point our customers face because he's lived them. Now, he ensures every REOS user gets the support they need to succeed.",
    initials: "JO",
    avatarGradient: "bg-gradient-to-br from-orange-500 to-orange-700",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/james-oconnor-cs",
        label: "Connect with James O'Connor on LinkedIn",
      },
      {
        platform: "twitter",
        url: "https://twitter.com/jamesREOSsupport",
        label: "Follow James O'Connor on Twitter",
      },
    ],
  },
];

// Social icons mapping
const socialIcons: Record<SocialLink["platform"], LucideIcon> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
};

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const avatarVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};

// Reduced motion variants (instant transitions)
const reducedMotionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.01,
    },
  },
};

const reducedMotionCardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.01,
    },
  },
};

// ============================================================================
// TeamMemberCard Component
// ============================================================================

function TeamMemberCard({ member, shouldReduceMotion }: TeamMemberCardProps) {
  const nameId = `${member.id}-name`;

  return (
    <motion.article
      variants={shouldReduceMotion ? reducedMotionCardVariants : cardVariants}
      aria-labelledby={nameId}
      className="h-full"
    >
      <Card
        className={cn(
          "group relative flex h-full min-h-[400px] flex-col items-center p-6 text-center",
          "border border-border bg-card text-card-foreground",
          "transition-all duration-300 ease-out",
          "hover:scale-105 hover:border-primary/20 hover:shadow-xl hover:z-10",
          "sm:min-h-[420px]"
        )}
      >
        {/* Avatar */}
        <motion.div
          variants={
            shouldReduceMotion ? reducedMotionCardVariants : avatarVariants
          }
          className="mb-4"
        >
          <Avatar
            className={cn(
              "h-28 w-28 ring-2 ring-primary/10",
              "transition-all duration-300",
              "group-hover:ring-primary/30 group-hover:scale-105",
              "sm:h-[120px] sm:w-[120px] lg:h-32 lg:w-32"
            )}
          >
            <AvatarImage
              src={member.photo}
              alt={member.photoAlt || `Headshot of ${member.name}`}
            />
            <AvatarFallback
              className={cn(
                "text-2xl font-bold text-white",
                member.avatarGradient
              )}
              aria-label={member.name}
            >
              {member.initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        {/* Name */}
        <h3
          id={nameId}
          className="mb-2 text-lg font-semibold leading-tight text-foreground md:text-xl"
        >
          {member.name}
        </h3>

        {/* Role */}
        <p className="mb-4 text-sm font-medium text-primary">{member.role}</p>

        {/* Bio */}
        <p className="mb-6 flex-grow text-sm leading-relaxed text-muted-foreground">
          {member.bio}
        </p>

        {/* Social Links */}
        <div
          className="flex items-center justify-center gap-3"
          role="list"
          aria-label={`${member.name}'s social profiles`}
        >
          {member.socialLinks.map((link) => {
            const Icon = socialIcons[link.platform];
            return (
              <a
                key={link.platform}
                href={link.url}
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full",
                  "text-muted-foreground transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary hover:scale-110",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </Card>
    </motion.article>
  );
}

// ============================================================================
// TeamSection Component
// ============================================================================

export function TeamSection({ className }: TeamSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      aria-labelledby="team-heading"
      className={cn(
        "bg-background py-12 md:py-14 lg:py-16",
        "px-4 md:px-6 lg:px-8",
        className
      )}
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 text-center lg:mb-12">
          <h2
            id="team-heading"
            className="mb-4 text-2xl font-bold text-foreground md:text-3xl lg:text-4xl"
          >
            Meet the Team
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Experts in real estate, technology, and customer success working
            together to transform property management.
          </p>
        </div>

        {/* Team Grid */}
        <motion.div
          variants={
            shouldReduceMotion
              ? reducedMotionContainerVariants
              : containerVariants
          }
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={cn(
            "grid",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
            "gap-6 md:gap-8"
          )}
        >
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default TeamSection;
