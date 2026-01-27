"use client";

import { cn } from "@/lib/utils";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

interface NewFooterProps {
  className?: string;
}

const footerLinks = {
  platform: [
    { label: "Prime", href: "/platform/prime" },
    { label: "Trading", href: "/platform/trading" },
    { label: "Settlement", href: "/platform/settlement" },
    { label: "Custody", href: "/platform/custody" },
    { label: "Staking", href: "/platform/staking" },
    { label: "DeFi", href: "/platform/defi" },
    { label: "Assets supported", href: "/assets-supported" },
  ],
  whoWeServe: [
    { label: "Protocols", href: "/who-we-serve/protocols" },
    { label: "VC firms", href: "/who-we-serve/vc" },
    { label: "Hedge funds", href: "/who-we-serve/hedge-funds" },
    { label: "Wealth managers", href: "/who-we-serve/wealth-managers" },
    { label: "Asset managers", href: "/who-we-serve/asset-managers" },
    { label: "Corporations", href: "/who-we-serve/corporations" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "In the news", href: "/news" },
    { label: "Press kit", href: "/press" },
  ],
  resources: [
    { label: "Insights", href: "/insights" },
    { label: "Learn", href: "/learn" },
  ],
};

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "GitHub", href: "https://github.com", icon: Github },
];

export function NewFooter({ className }: NewFooterProps) {
  return (
    <footer
      className={cn(
        "relative bg-[#0a0a0a] border-t border-gray-800",
        className
      )}
    >
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo and description */}
          <div className="col-span-2">
            <div className="mb-6">
              <span className="text-2xl font-bold text-white">
                Anchorage Digital
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The most secure digital asset platform for institutions. 
              Custody, trading, staking, and more—all on infrastructure 
              trusted by the world&apos;s leading organizations.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Who we serve */}
          <div>
            <h4 className="text-white font-semibold mb-4">Who we serve</h4>
            <ul className="space-y-3">
              {footerLinks.whoWeServe.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources + Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="text-white font-semibold mb-4">Contact us</h4>
            <a
              href="mailto:contact@example.com"
              className="flex items-center gap-2 text-gray-400 text-sm hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              contact@example.com
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs text-gray-500 leading-relaxed">
            &ldquo;Anchorage Digital&rdquo; refers to services that are offered through 
            wholly-owned subsidiaries. Digital assets held in custody are not 
            guaranteed and are not subject to the insurance protections of the 
            FDIC or SIPC. Holdings of cryptocurrencies and other digital assets 
            are speculative and involve a substantial degree of risk, including 
            the risk of complete loss.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Anchorage Digital - All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="/privacy"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Privacy policy
              </a>
              <a
                href="/terms"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Terms &amp; conditions
              </a>
              <a
                href="/legal"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Legal
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default NewFooter;
