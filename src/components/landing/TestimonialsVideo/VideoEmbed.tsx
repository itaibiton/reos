"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface VideoEmbedProps {
  videoId: string;
  fallbackImage: string;
  title: string;
  playLabel?: string;
}

// ============================================================================
// VideoEmbed Component
// ============================================================================

export function VideoEmbed({
  videoId,
  fallbackImage,
  title,
  playLabel = "Play video",
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted shadow-lg">
      {/* Fallback image */}
      {!isPlaying && (
        <img
          src={fallbackImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Play button overlay */}
      {!isPlaying && (
        <motion.button
          initial={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          onClick={() => setIsPlaying(true)}
          className={cn(
            "absolute inset-0 flex items-center justify-center z-10",
            "bg-black/30 hover:bg-black/40 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2"
          )}
          aria-label={playLabel}
        >
          <div className="w-20 h-20 rounded-full bg-landing-primary flex items-center justify-center shadow-xl">
            <Play className="w-10 h-10 text-white fill-white ms-1" />
          </div>
        </motion.button>
      )}

      {/* YouTube iframe */}
      {isPlaying && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}

export default VideoEmbed;
