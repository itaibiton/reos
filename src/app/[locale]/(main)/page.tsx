import type { Metadata } from "next";
import {
  Hero,
  SocialProof,
  Features,
  Automation,
  Stats,
  CTA,
} from "@/components/newlanding";

export const metadata: Metadata = {
  title: "REOS - Real Estate Operating System",
  description:
    "The all-in-one real estate operating system connecting US investors with Israeli properties. From discovery to closing, all in one platform.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Features />
      <Automation />
      <Stats />
      <CTA />
    </>
  );
}
