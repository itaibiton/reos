# REOS Landing Page Content

Based on the Webflow structure (new-landing.md) and REOS platform vision.

---

## HERO SECTION

```yaml
hero:
  badge: "The Future of Real Estate Investment"
  title: "Israeli Real Estate Investment, Simplified"
  subtitle: "The all-in-one platform connecting US investors with Israeli properties — from discovery to closing."
  cta_primary:
    text: "Start Investing"
    link: "/questionnaire"
  cta_secondary:
    text: "Explore Properties"
    link: "/properties"
  stats:
    - value: "$1.5B+"
      label: "Transaction Volume"
    - value: "500+"
      label: "Properties Listed"
    - value: "8"
      label: "Service Categories"
    - value: "24/7"
      label: "AI Support"
```

---

## TRUSTED BY SECTION

```yaml
trusted_by:
  title: "Trusted by Industry Leaders"
  logos:
    - name: "Douglas Elliman"
      logo: "/logos/douglas-elliman.svg"
    - name: "Sporn Group"
      logo: "/logos/sporn-group.svg"
    - name: "Bank Leumi"
      logo: "/logos/bank-leumi.svg"
    - name: "Premier Equities"
      logo: "/logos/premier-equities.svg"
    # Add more partner logos
```

---

## VALUE PROPOSITION CARD

```yaml
value_prop_card:
  title: "End-to-End Investment Journey"
  description: "REOS orchestrates your entire real estate investment — connecting you with vetted brokers, mortgage advisors, lawyers, and more through a single dashboard. No more juggling 6+ service providers independently."
  image: "/images/platform-dashboard.webp"
```

---

## FEATURES CAROUSEL

```yaml
features:
  section_title: "Everything You Need in One Platform"
  section_subtitle: "Here's why investors choose REOS for their Israeli real estate journey."
  items:
    - icon: "search"
      title: "Smart Property Discovery"
      description: "AI-powered search that understands your investment goals. Filter by ROI, location, property type, and budget — or just describe what you're looking for in plain English."
    
    - icon: "workflow"
      title: "Deal Flow Tracking"
      description: "Track every deal from interest to closing. Automatic handoffs between service providers, full activity history, and real-time status updates."
    
    - icon: "users"
      title: "Vetted Service Providers"
      description: "Access pre-screened Israeli professionals: brokers, mortgage advisors, lawyers, appraisers, tax consultants, and notaries — all specialized in working with US investors."
    
    - icon: "bot"
      title: "AI Investment Advisor"
      description: "Your 24/7 Claude-powered assistant that answers questions, explains Israeli market dynamics, and guides you through every decision."
    
    - icon: "chart"
      title: "Investment Analytics"
      description: "Comprehensive metrics for every property: ROI projections, yield calculations, appreciation estimates, and market comparisons."
    
    - icon: "globe"
      title: "Bilingual Experience"
      description: "Full Hebrew and English support with RTL interface. We bridge the language gap between you and Israeli service providers."
```

---

## SERVICES/ROLES SECTION

```yaml
services:
  title: "Your Dream Team, Assembled"
  subtitle: "REOS connects you with the right professionals at every stage of your investment."
  items:
    - icon: "building"
      title: "Real Estate Brokers"
      description: "Specialists in Israeli investment properties who understand US investor needs."
    
    - icon: "bank"
      title: "Mortgage Advisors"
      description: "Israeli mortgage experts who navigate financing options for foreign investors."
    
    - icon: "scale"
      title: "Real Estate Lawyers"
      description: "Legal professionals experienced in cross-border property transactions."
    
    - icon: "calculator"
      title: "Appraisers"
      description: "Certified valuators providing accurate property assessments."
    
    - icon: "receipt"
      title: "Tax Consultants"
      description: "US-Israel tax specialists optimizing your investment structure."
    
    - icon: "stamp"
      title: "Notaries"
      description: "Licensed notaries handling final documentation and closings."
```

---

## HOW IT WORKS

```yaml
how_it_works:
  title: "From Discovery to Keys in Hand"
  steps:
    - number: "01"
      title: "Tell Us Your Goals"
      description: "Complete our investor questionnaire. Our AI learns your preferences, budget, risk tolerance, and investment timeline."
    
    - number: "02"
      title: "Discover Properties"
      description: "Browse curated listings matched to your profile. Use AI-powered search or traditional filters to find your ideal investment."
    
    - number: "03"
      title: "Connect with Experts"
      description: "We match you with vetted service providers. Your dedicated broker guides you through property selection and negotiation."
    
    - number: "04"
      title: "Manage Your Deal"
      description: "Track progress in real-time as your deal moves through mortgage, legal, and closing stages. All parties coordinated through one dashboard."
    
    - number: "05"
      title: "Close & Celebrate"
      description: "Finalize your investment with confidence. Full documentation, clear ownership, and ongoing support for your new property."
```

---

## TESTIMONIALS

```yaml
testimonials:
  title: "What Our Investors Say"
  items:
    - quote: "REOS made investing in Israeli real estate feel as simple as buying property in my own backyard. The AI assistant answered all my questions, and the service providers were exceptional."
      author: "David K."
      role: "NYC Investor"
      company: "First-time Israeli property owner"
      avatar: "/testimonials/david.jpg"
    
    - quote: "As a busy professional, I needed a platform that could coordinate everything for me. REOS delivered — from finding the perfect Tel Aviv apartment to closing the deal remotely."
      author: "Sarah M."
      role: "Real Estate Investor"
      company: "Portfolio: 3 Israeli properties"
      avatar: "/testimonials/sarah.jpg"
    
    - quote: "The transparency is incredible. I could see exactly where my deal stood at every moment, and the handoff between my broker, mortgage advisor, and lawyer was seamless."
      author: "Michael R."
      role: "Investment Manager"
      company: "Family Office"
      avatar: "/testimonials/michael.jpg"
    
    - quote: "Finally, a platform that understands cross-border real estate. The bilingual support and vetted local experts made all the difference."
      author: "Jennifer L."
      role: "Attorney"
      company: "Investing personally in Herzliya"
      avatar: "/testimonials/jennifer.jpg"
```

---

## FEATURED/BLOG SECTION

```yaml
featured:
  title: "Latest Insights"
  articles:
    - title: "Why US Investors Are Flocking to Israeli Real Estate in 2026"
      excerpt: "Record-low interest rates and strong market fundamentals make Israel an attractive destination."
      image: "/blog/israel-market-2026.jpg"
      link: "/blog/us-investors-israel-2026"
      category: "Market Trends"
    
    - title: "Understanding Israeli Property Taxes as a Foreign Investor"
      excerpt: "A comprehensive guide to purchase tax, capital gains, and annual property taxes."
      image: "/blog/israel-taxes.jpg"
      link: "/blog/israeli-property-taxes"
      category: "Tax Guide"
    
    - title: "Tel Aviv vs. Jerusalem: Where Should You Invest?"
      excerpt: "Comparing ROI, appreciation, and rental yields in Israel's two largest markets."
      image: "/blog/tlv-vs-jlm.jpg"
      link: "/blog/tel-aviv-vs-jerusalem"
      category: "Investment Strategy"
```

---

## CONTACT FORM

```yaml
contact:
  title: "Get Started Today"
  subtitle: "Tell us about your investment goals and we'll connect you with the right team."
  fields:
    - name: "name"
      label: "Full Name"
      type: "text"
      required: true
    
    - name: "email"
      label: "Email Address"
      type: "email"
      required: true
    
    - name: "phone"
      label: "Phone Number"
      type: "tel"
      required: false
    
    - name: "investor_type"
      label: "I am a..."
      type: "select"
      options:
        - "First-time investor"
        - "Experienced investor"
        - "Real estate professional"
        - "Family office / Institution"
      required: true
    
    - name: "budget"
      label: "Investment Budget (USD)"
      type: "select"
      options:
        - "$100K - $300K"
        - "$300K - $500K"
        - "$500K - $1M"
        - "$1M - $5M"
        - "$5M+"
      required: true
    
    - name: "timeline"
      label: "Investment Timeline"
      type: "select"
      options:
        - "Ready to invest now"
        - "Within 3 months"
        - "Within 6 months"
        - "Just exploring"
      required: true
    
    - name: "interests"
      label: "Areas of Interest"
      type: "checkbox"
      options:
        - "Tel Aviv"
        - "Jerusalem"
        - "Herzliya"
        - "Netanya"
        - "Haifa"
        - "Other"
    
    - name: "message"
      label: "Tell us more about your goals"
      type: "textarea"
      required: false
  
  submit_button: "Request Consultation"
  privacy_note: "By submitting, you agree to our Privacy Policy and Terms of Service."
```

---

## FOOTER

```yaml
footer:
  brand:
    name: "REOS"
    tagline: "Real Estate Investment, Simplified"
  
  navigation:
    - section: "Platform"
      links:
        - text: "Properties"
          url: "/properties"
        - text: "For Investors"
          url: "/investors"
        - text: "For Providers"
          url: "/providers"
        - text: "Pricing"
          url: "/pricing"
    
    - section: "Company"
      links:
        - text: "About Us"
          url: "/about"
        - text: "Team"
          url: "/team"
        - text: "Careers"
          url: "/careers"
        - text: "Contact"
          url: "/contact"
    
    - section: "Resources"
      links:
        - text: "Blog"
          url: "/blog"
        - text: "Market Reports"
          url: "/reports"
        - text: "Investment Guide"
          url: "/guide"
        - text: "FAQ"
          url: "/faq"
    
    - section: "Legal"
      links:
        - text: "Privacy Policy"
          url: "/privacy"
        - text: "Terms of Service"
          url: "/terms"
        - text: "Cookie Policy"
          url: "/cookies"
  
  social:
    - platform: "LinkedIn"
      url: "https://linkedin.com/company/reos"
    - platform: "Twitter"
      url: "https://twitter.com/reos_invest"
    - platform: "Instagram"
      url: "https://instagram.com/reos_invest"
  
  contact:
    email: "hello@reos.com"
    phone: "+1 (212) XXX-XXXX"
    address: "New York, NY"
  
  copyright: "© 2026 REOS. All rights reserved."
  disclaimer: "REOS is a technology platform connecting investors with service providers. We do not provide financial, legal, or tax advice. All investments carry risk."
```

---

## META / SEO

```yaml
meta:
  title: "REOS | Israeli Real Estate Investment Platform for US Investors"
  description: "The all-in-one platform connecting US investors with Israeli properties. AI-powered search, vetted service providers, and end-to-end deal management."
  keywords:
    - "Israeli real estate investment"
    - "US investors Israel property"
    - "Tel Aviv real estate"
    - "Israel property investment platform"
    - "Cross-border real estate"
  og_image: "/og-image.jpg"
```

---

## NOTES FOR IMPLEMENTATION

1. **Tone**: Professional but approachable. We're simplifying a complex process.
2. **Audience**: US investors (especially NYC), ranging from first-timers to experienced.
3. **Key differentiator**: End-to-end orchestration, not just property listings.
4. **Trust signals**: Team experience ($1.5B transactions), AI technology, vetted providers.
5. **CTAs**: Push toward questionnaire (qualified leads) over generic browsing.

---

*Generated for REOS v1.7 Landing Page*
