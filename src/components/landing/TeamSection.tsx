"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Linkedin, Twitter, Github, type LucideIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionWrapper, SectionHeader } from "./shared/SectionWrapper";

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
    bio: "Sarah spent twelve years building a 200-unit rental portfolio before realizing the software meant to help her was actually holding her back. She founded REOS to give property managers the automation tools she wished she had. When she's not leading the team, you'll find her mentoring first-time landlords.",
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
    bio: "Marcus built payment systems at Stripe and search infrastructure at Zillow before joining REOS. He's obsessed with creating software that feels fast and reliable, no matter how many properties you manage. His mission here: make enterprise-grade technology accessible to landlords of all sizes.",
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
    bio: "Emily believes property management software should feel intuitive from day one, not require a training manual. After designing products at Airbnb and Figma, she joined REOS to bring that same thoughtful approach to an industry often overlooked by great design. Every screen she creates starts with one question: what would make this easier?",
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
    bio: "Before joining REOS, James managed everything from single-family rentals to 500-unit apartment complexes. He knows what it's like to chase late payments at midnight and juggle maintenance requests during family dinner. Now he leads our support team with one goal: making sure you never feel like you're figuring this out alone.",
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

function TeamMemberCard({ member, shouldReduceMotion, index }: TeamMemberCardProps & { index: number }) {
  const nameId = `${member.id}-name`;
  const isEven = index % 2 === 0;

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
          "hover:border-landing-primary/30 hover:shadow-xl hover:z-10",
          "sm:min-h-[420px]",
          "overflow-hidden"
        )}
      >
        {/* Geometric corner accents */}
        <div
          className={cn(
            "absolute top-0 right-0 w-20 h-20",
            "transition-all duration-300",
            isEven ? "bg-landing-primary/5" : "bg-landing-accent/5",
            "group-hover:w-24 group-hover:h-24"
          )}
          style={{
            clipPath: "polygon(100% 0, 100% 100%, 0 0)",
          }}
          aria-hidden="true"
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 w-16 h-16",
            "transition-all duration-300",
            isEven ? "bg-landing-accent/5" : "bg-landing-primary/5",
            "group-hover:w-20 group-hover:h-20"
          )}
          style={{
            clipPath: "polygon(0 100%, 100% 100%, 0 0)",
          }}
          aria-hidden="true"
        />

        {/* Octagonal Avatar Frame */}
        <motion.div
          variants={
            shouldReduceMotion ? reducedMotionCardVariants : avatarVariants
          }
          className="mb-4 relative"
        >
          {/* Octagonal border frame */}
          <div
            className={cn(
              "absolute -inset-2",
              "transition-all duration-300",
              isEven
                ? "bg-gradient-to-br from-landing-primary/20 to-landing-accent/20"
                : "bg-gradient-to-br from-landing-accent/20 to-landing-primary/20",
              "clip-octagon",
              "group-hover:from-landing-primary/40 group-hover:to-landing-accent/40"
            )}
          />
          <Avatar
            className={cn(
              "relative h-28 w-28",
              "clip-octagon",
              "transition-all duration-300",
              "group-hover:scale-105",
              "sm:h-[120px] sm:w-[120px] lg:h-32 lg:w-32"
            )}
          >
            <AvatarImage
              src={member.photo}
              alt={member.photoAlt || `Headshot of ${member.name}`}
              className="clip-octagon"
            />
            <AvatarFallback
              className={cn(
                "text-2xl font-display tracking-wider text-white",
                isEven
                  ? "bg-gradient-to-br from-landing-primary to-landing-primary/80"
                  : "bg-gradient-to-br from-landing-accent to-landing-accent/80"
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
          className="mb-2 text-lg font-semibold leading-tight text-landing-text md:text-xl"
        >
          {member.name}
        </h3>

        {/* Role with accent color */}
        <p
          className={cn(
            "mb-4 text-sm font-medium",
            isEven ? "text-landing-primary" : "text-landing-accent"
          )}
        >
          {member.role}
        </p>

        {/* Bio */}
        <p className="mb-6 flex-grow text-sm leading-relaxed text-muted-foreground">
          {member.bio}
        </p>

        {/* Social Links with geometric shapes */}
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
                  "inline-flex h-10 w-10 items-center justify-center",
                  "text-muted-foreground transition-all duration-200",
                  isEven
                    ? "hover:bg-landing-primary/10 hover:text-landing-primary"
                    : "hover:bg-landing-accent/10 hover:text-landing-accent",
                  "hover:scale-110",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2"
                )}
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
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
  const t = useTranslations("landing.team");

  return (
    <SectionWrapper
      ref={ref}
      id="team"
      className={className}
      ariaLabelledBy="team-heading"
      animate={false}
    >
      {/* Section Header */}
      <SectionHeader
        title={t("title")}
        titleId="team-heading"
        subtitle={t("subtitle")}
        centered
      />

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
        {teamMembers.map((member, index) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            index={index}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

export default TeamSection;
