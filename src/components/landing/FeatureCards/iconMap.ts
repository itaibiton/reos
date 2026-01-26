import { Search, GitBranch, MessageSquare, Sparkles, type LucideIcon } from "lucide-react";

/**
 * Type-safe icon mapping for feature cards
 * Keys match icon field in translation files
 */
export const iconMap: Record<string, LucideIcon> = {
  // FEAT-01: Property Discovery
  search: Search,

  // FEAT-02: Deal Flow
  dealFlow: GitBranch,

  // FEAT-03: Communication
  communication: MessageSquare,

  // FEAT-04: AI Assistant
  aiAssistant: Sparkles,
} as const;

// Type helper for translation validation
export type IconKey = keyof typeof iconMap;
