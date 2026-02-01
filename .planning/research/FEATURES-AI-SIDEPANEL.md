# Feature Landscape: Platform-Wide AI Assistant Side Panel

**Domain:** Context-aware AI assistant side panel for multi-role real estate investment platform
**Researched:** 2026-02-01
**Overall Confidence:** HIGH (synthesis of SaaS platform patterns, PropTech trends, and REOS codebase analysis)

---

## Current State (What Already Exists)

Before defining new features, here is what REOS already has built:

| Capability | Status | Location |
|-----------|--------|----------|
| Claude AI chat with streaming | Built | `convex/ai/chat.ts`, `src/components/ai/AIChatPanel.tsx` |
| Property search tool (RAG-grounded) | Built | `convex/ai/tools/propertySearch.ts` |
| Provider search tool (RAG-grounded) | Built | `convex/ai/tools/providerSearch.ts` |
| Memory persistence (sliding window + summarization) | Built | `convex/ai/summarization.ts`, `convex/ai/threads.ts` |
| Investor profile context injection | Built | `convex/ai/context.ts` |
| Auto-greeting with profile-based recommendations | Built | `convex/ai/chat.ts` (isAutoGreeting flow) |
| Quick reply buttons | Built | `src/components/profile/QuickReplyButtons.tsx` |
| Rich response cards (property + provider) | Built | `PropertyRecommendationCard.tsx`, `ProviderRecommendationCard.tsx` |
| Stop generation | Built | AbortController in `convex/ai/chat.ts` |
| Clear memory | Built | `convex/ai/threads.ts` |
| Notification system (9 types, real-time) | Built | `convex/notifications.ts` |
| Role-based navigation and dashboards | Built | `src/lib/navigation.ts`, per-role sidebar configs |
| Human chat (deal-based + direct messaging) | Built | `src/app/[locale]/(app)/chat/page.tsx` |

**Key gap:** The AI assistant currently lives only on the investor profile summary page (`/profile/investor/summary`). It is NOT accessible from other pages, NOT available to other roles, and NOT context-aware (does not know which page the user is on).

---

## Table Stakes

Features users expect from a platform-wide AI assistant. Missing any of these means the assistant feels incomplete or broken.

### TS-01: Global Side Panel (Toggle Open/Close)

**Why Expected:** Every modern SaaS AI assistant (Microsoft Copilot, GitHub Copilot, Cursor, Notion AI) uses a collapsible side panel accessible from any page. Users expect to open the assistant without navigating away from their current context. The side panel pattern is described across all surveyed platforms as the dominant layout for AI assistants in complex tools.

**What It Means:**
- Right-side panel that slides in/out without disrupting main content
- Toggle via floating action button (FAB) and keyboard shortcut (Cmd/Ctrl+J or similar)
- Panel persists conversation state across page navigations
- Panel remembers open/closed preference across sessions
- Responsive: on mobile, opens as a bottom sheet or full-screen overlay
- Panel width ~360-400px on desktop (standard for side panels)

**Complexity:** Medium
**Dependencies:** Requires refactoring `AIChatPanel` out of the investor summary page into the `AppShell` layout. Existing `SidebarProvider` pattern from shadcn/ui can be adapted for a right-side panel. The existing `SidebarInset` pattern shows how content area adjusts when panels open.
**Confidence:** HIGH -- this is the single most universal pattern across all SaaS AI assistants.

---

### TS-02: Context Awareness (Current Page/Entity)

**Why Expected:** Microsoft Copilot knows what document you have open. GitHub Copilot knows what file you are editing. An assistant that asks "What property are you looking at?" when the user is staring at a property detail page feels unintelligent. Research shows that moving AI from a generic chatbox to a context-aware side panel on a report page eliminated 70% of the questions users were asking.

**What It Means:**
- Assistant receives current route and entity context automatically at send-time
- When on a property detail page: assistant knows which property (title, price, location, features)
- When on a deal page: assistant knows the deal stage, participants, and timeline
- When on the dashboard: assistant can reference dashboard metrics and recent activity
- When on the clients page (provider): assistant knows which clients they manage
- Context is injected into the system prompt at send-time (not stored in thread) to stay fresh
- The context augments, not replaces, the existing investor profile context

**Complexity:** Medium
**Dependencies:** Requires a React context provider (`AIContextProvider`) that tracks current route and any entity IDs on the page. Components on entity pages register their context. Existing `buildProfileContext` pattern in `convex/ai/context.ts` demonstrates the server-side approach -- extend it with page-level context passed from the client.
**Confidence:** HIGH -- Microsoft Copilot Chat does exactly this ("aware of the user's open content and able to engage with it").

---

### TS-03: Multi-Role Support

**Why Expected:** REOS serves investors, brokers, mortgage advisors, lawyers, and admins. Each role has different data access, different questions, and different needs. A single investor-only assistant cannot serve as a platform-wide assistant.

**What It Means:**
- Role-specific system prompts:
  - Investor: property guidance, deal tracking, portfolio questions, market insights
  - Broker: client management, lead status, deal pipeline, listing management
  - Mortgage Advisor: application tracking, pre-approval status, financing guidance
  - Lawyer: contract status, document requirements, legal compliance
  - Admin: vendor approvals, platform stats, user management, system health
- Role-specific tools:
  - Investor: `searchProperties`, `searchProviders` (existing), plus new tools
  - Broker: `listClients`, `getDealPipeline`, `searchProperties`
  - Admin: `getPendingVendors`, `getPlatformStats`
- Role-specific context injection:
  - Investor: questionnaire profile (existing), saved properties, deal status
  - Provider: service provider profile, client list, specializations
  - Admin: platform metrics, queue sizes
- Single agent with role-conditional instructions and tools (preferred over separate agents to reduce maintenance)

**Complexity:** High
**Dependencies:** Requires extending `convex/ai/agent.ts` (currently `investorAssistant` only). Needs new context builders per role and new tools for broker/admin use cases. Existing `effectiveRole` from `useCurrentUser()` hook handles role detection. Admin's `viewingAsRole` must be respected.
**Confidence:** HIGH -- Amazon Bedrock inline agents and ClearPeople Atlas both demonstrate dynamic role-based agents at scale.

---

### TS-04: Streaming Responses with Typing Indicator

**Why Expected:** Already built for investor assistant. Must carry forward to the global side panel without regression. Research consistently identifies "dead air" during AI response generation as the top UX failure.

**What It Means:**
- Word-by-word token streaming in the side panel
- Typing indicator shown within 200ms of message send
- Stop generation button during streaming
- Streaming cursor component showing active generation

**Complexity:** Low (already built)
**Dependencies:** Existing `useAIChat` hook, `StreamingCursor.tsx`, `TypingIndicator.tsx` components.
**Confidence:** HIGH -- already implemented and working.

---

### TS-05: Cross-Session Memory Persistence

**Why Expected:** Already built. Users expect the assistant to remember previous conversations across sessions. Must carry forward.

**What It Means:**
- Thread-per-user persistence in Convex
- Sliding window (10 recent messages) + summarization for older messages
- Profile data always fresh and never summarized
- Clear memory option with confirmation dialog

**Complexity:** Low (already built)
**Dependencies:** Existing `convex/ai/threads.ts`, `convex/ai/summarization.ts`. Threshold: summarize at 15 messages, keep 10 recent verbatim.
**Confidence:** HIGH -- already implemented.

---

### TS-06: Rich Response Rendering

**Why Expected:** Already built for property and provider cards. Users expect the assistant to show structured, interactive content -- not just plain text. In real estate, showing a property card with image, price, and action buttons is expected.

**What It Means:**
- Property recommendation cards with save/view actions (existing)
- Provider recommendation cards with add-to-team actions (existing)
- Markdown rendering for structured text responses
- Inline links that navigate within the platform
- Future: deal status cards, document summary cards

**Complexity:** Low (mostly built, extend for new entity types)
**Dependencies:** Existing `PropertyRecommendationCard`, `ProviderRecommendationCard`, `PropertyCardRenderer`, `ProviderCardRenderer`. New card types follow same pattern.
**Confidence:** HIGH.

---

### TS-07: Quick Actions / Suggested Prompts

**Why Expected:** Research overwhelmingly shows that open-ended prompt boxes cause user paralysis. The majority of users do not know what to ask. Quick action buttons reduce cognitive load and guide users toward valuable interactions. Adobe Experience Cloud, Microsoft Copilot, and most SaaS AI assistants offer pre-configured prompts ("discovery prompts").

**What It Means:**
- Context-sensitive suggested prompts displayed when panel opens or conversation is empty
- Role-specific suggestions:
  - Investor: "Show me properties in my budget", "What is the status of my deals?", "Help me build my team"
  - Broker: "Summarize my active clients", "Show new property listings", "Which deals need follow-up?"
  - Admin: "Show pending vendor approvals", "Platform health summary"
- Page-specific suggestions:
  - Property detail page: "Tell me about this property", "Compare with my saved properties", "Start a deal"
  - Deal page: "What is the next step for this deal?", "Summarize deal timeline"
  - Dashboard: "Show my portfolio performance", "What needs my attention today?"
- Quick reply chips after AI responses for common follow-up actions
- Suggestions update as context changes (page navigation, role switch)

**Complexity:** Medium
**Dependencies:** Existing `QuickReplyButtons` component pattern. Needs extension for role-awareness and page-awareness. Requires TS-02 (Context Awareness) for page-specific suggestions.
**Confidence:** HIGH -- 70% of user queries are contextual questions about what they are looking at.

---

### TS-08: Error Handling and Graceful Degradation

**Why Expected:** AI responses can fail (rate limits, network errors, model errors). Users expect clear error messages and retry capability, not silent failures or broken states.

**What It Means:**
- Clear error display in the chat panel (partially built -- error state exists in `useAIChat`)
- Retry button on failed messages
- Rate limiting feedback ("Please wait a moment before sending another message")
- Offline state handling (panel shows reconnection status when Convex WebSocket disconnects)
- Fallback messaging when AI cannot answer ("I do not have enough information to answer that. Here are some things I can help with...")
- Graceful handling of long responses (scroll management, truncation awareness)

**Complexity:** Low-Medium
**Dependencies:** Existing error state in `useAIChat`. Convex real-time reconnection is handled automatically by the SDK.
**Confidence:** HIGH -- standard error handling patterns.

---

### TS-09: Accessibility and Keyboard Navigation

**Why Expected:** SaaS platforms must be accessible. The AI panel should be usable via keyboard only, support screen readers, and follow WCAG guidelines.

**What It Means:**
- Keyboard shortcut to toggle panel (Cmd/Ctrl+J or similar -- avoid conflicts with browser shortcuts)
- Focus management: focus moves to input when panel opens, returns to trigger when panel closes
- Escape key closes panel
- ARIA labels on all interactive elements (send button, stop button, clear button)
- Screen reader announcements for new AI messages (`aria-live="polite"`)
- Tab navigation within panel components
- Proper color contrast ratios for message bubbles and cards

**Complexity:** Low-Medium
**Dependencies:** shadcn/ui components already include accessibility fundamentals. Need to wire up keyboard shortcuts and focus management at the panel level.
**Confidence:** HIGH -- well-documented patterns.

---

### TS-10: Mobile-Responsive Design

**Why Expected:** REOS already has mobile bottom navigation (`MobileBottomNav`) and mobile-specific layouts. The AI assistant must work on mobile without breaking the existing layout.

**What It Means:**
- On mobile: AI opens as a full-screen overlay or bottom drawer (not a side panel -- insufficient screen width)
- Floating action button positioned above mobile bottom nav bar (currently 80px high)
- Touch-friendly input area with auto-resize textarea
- Proper virtual keyboard handling (input stays visible when keyboard opens)
- Swipe-to-dismiss gesture for closing the panel
- Messages scroll properly with touch, respecting safe areas

**Complexity:** Medium
**Dependencies:** Existing `useIsMobile()` hook for breakpoint detection. Sheet or Drawer component from shadcn/ui for mobile overlay. Must coordinate with existing `MobileBottomNav` component and the `pb-20` spacing in `AppShell`.
**Confidence:** HIGH -- established mobile patterns for chat interfaces.

---

## Differentiators

Features that set REOS apart from competitors. Not expected by default, but create genuine competitive advantage when done well.

### DIFF-01: Page-Specific Quick Actions (Deep Context Integration)

**Value Proposition:** Go beyond "I know what page you are on" to "I can take actions on this page for you." The assistant is not just aware of context -- it can act within it. This transforms the assistant from a conversational tool into a workflow co-pilot. Research shows this is the defining characteristic of assistants that users actually use vs. those that "rot in a corner chat bubble."

**What It Means:**
- On a property detail page: "Save this property", "Start a deal for this property", "Compare with my saved properties"
- On a deal page: "Summarize this deal", "What is the next step?", "Message my broker about this"
- On the dashboard: "Show me my portfolio performance", "Which deals need attention?"
- On the clients page (for providers): "Which clients have not been contacted this week?"
- Actions execute through existing Convex mutations -- the AI calls tools that perform real actions
- Every action requires explicit user confirmation before execution (see AF-01)

**Complexity:** High
**Dependencies:** Requires new AI tools for each action domain (deal creation, property save, navigation). Needs careful permission checking per role. Depends on TS-02 (Context Awareness).
**Confidence:** MEDIUM -- the pattern is proven (Microsoft Copilot takes actions in Office, AppFolio Realm-X automates property management workflows), but the specific tools need to be designed per REOS domain.

---

### DIFF-02: Proactive Contextual Nudges

**Value Proposition:** The assistant does not wait for the user to ask -- it surfaces relevant information at the right moment. This is the frontier of SaaS AI in 2026. Research reports 40% increase in feature adoption and 25% reduction in time-to-first-value from well-implemented proactive nudges.

**What It Means:**
- When an investor views properties but has not started a deal in 2 weeks: "I noticed you have been browsing properties. Ready to take the next step?"
- When a deal is stuck at a stage for too long: "Your deal with [property] has been in the legal stage for 3 weeks. Would you like me to check with your lawyer?"
- When a provider has unresponded client messages: "You have 3 unanswered client messages from today."
- Nudges appear as a badge/dot on the AI panel toggle button (similar to notification badges)
- When panel opens, pending nudge is displayed as the first message or banner
- Nudges are rate-limited: maximum 1-2 per day to avoid annoyance
- Nudges are dismissible and respect user preferences

**Complexity:** High
**Dependencies:** Requires backend logic to detect nudge conditions (Convex scheduled functions or cron jobs). Needs careful UX design to avoid being intrusive. Could leverage existing notification infrastructure in `convex/notifications.ts`.
**Confidence:** MEDIUM -- the concept is well-validated, but implementation requires tuning. Most SaaS platforms deliver nudges via in-app notifications, not specifically through the AI assistant.

---

### DIFF-03: Slash Commands for Power Users

**Value Proposition:** Power users who interact with the AI frequently can bypass the natural language interface for common actions. Type `/` to see available commands. This mirrors patterns from Slack, Notion, Discord, and Cursor that developers and power users already know.

**What It Means:**
- `/search [criteria]` -- quick property search
- `/deal [property]` -- start a deal workflow
- `/status` -- show all active deal statuses
- `/compare [property1] [property2]` -- compare two properties side by side
- `/team` -- show dream team recommendations
- `/navigate [page]` or `/go [page]` -- jump to a specific page
- `/help` -- show available commands
- Commands autocomplete in a popup as user types after `/`
- Commands are role-specific (investors see different commands than providers)

**Complexity:** Medium
**Dependencies:** Needs a command parser in the chat input component (`AIChatInput.tsx`). Commands map to existing AI tools or direct navigation actions. No backend changes required -- commands are parsed on the frontend and either sent as specially-formatted messages or trigger direct actions.
**Confidence:** HIGH -- slash commands are a well-known pattern with straightforward implementation.

---

### DIFF-04: Cross-Entity Intelligence

**Value Proposition:** The assistant can connect dots across different parts of the platform that a user might not connect manually. This is where AI genuinely adds value over a traditional UI. ClickUp Brain exemplifies this by acting as a "neural network connecting tasks, documents, and people."

**What It Means:**
- "Which of my saved properties match the criteria my broker recommended?" (connects saved properties + broker conversations)
- "What is the average price per sqm in the areas I am looking at?" (connects property search + market data)
- "Are any of my deals at risk of stalling?" (analyzes deal timeline data across all active deals)
- For brokers: "Which of my clients have the highest chance of closing soon?" (analyzes deal stages + activity signals)
- For admins: "Which vendor categories have the longest approval queue?" (analyzes vendor submission data)

**Complexity:** High
**Dependencies:** Requires tools that can query across multiple Convex tables and synthesize results. The existing tool pattern (`createTool` from `@convex-dev/agent`) supports this, but new tools need to be written for each cross-entity query.
**Confidence:** MEDIUM -- the AI model is capable of this reasoning. The complexity is in writing comprehensive tools and ensuring the AI uses them correctly without hallucinating connections.

---

### DIFF-05: Conversation Threading / Topic Switching

**Value Proposition:** Instead of one monolithic conversation, allow the user to start separate threads on different topics. "Help me find a property" and "Explain Israeli tax implications" should not be mixed together.

**What It Means:**
- Multiple conversation threads per user, shown as tabs or a thread selector dropdown in the panel header
- Each thread maintains its own context and memory
- Quick switch between threads without losing place
- Thread titles auto-generated from the first user message
- Archive and delete individual threads
- New thread creation with a "+" button

**Complexity:** Medium-High
**Dependencies:** The Convex Agent framework (`@convex-dev/agent`) already supports multiple threads per user natively. The `convex/ai/threads.ts` currently creates one thread per user via `getOrCreateThread` -- needs to support multiple threads with a list/select UI. UI changes to show thread management in the panel header.
**Confidence:** HIGH for the backend (agent framework already supports it natively), MEDIUM for the UX (adds complexity to a side panel that should stay simple).

---

### DIFF-06: Multilingual Intelligence (English + Hebrew)

**Value Proposition:** REOS already supports English and Hebrew throughout the platform via `next-intl`. The AI assistant should respond in the user's preferred language and understand queries in both languages. This is not just a nice-to-have for a platform connecting US investors with Israeli properties -- it is fundamental to the value proposition.

**What It Means:**
- Assistant detects user language from locale setting (`useLocale()`) and responds in that language
- Claude supports Hebrew natively -- no additional models needed
- Property names, locations, and legal terms may appear in Hebrew or English regardless of locale
- System prompts include language instructions
- UI text (quick actions, suggestions, error messages) uses existing `next-intl` infrastructure
- Code-switching support: users can ask in English and switch to Hebrew mid-conversation

**Complexity:** Medium
**Dependencies:** Existing `next-intl` infrastructure. Claude's multilingual capabilities. System prompt localization. New i18n keys for AI-specific UI text (suggestions, error messages, panel labels).
**Confidence:** HIGH -- Claude handles Hebrew well. The main work is translating system prompts and ensuring tool outputs handle both languages.

---

### DIFF-07: AI-Powered Navigation ("Take Me To...")

**Value Proposition:** Users can ask the assistant to navigate them anywhere in the platform. Instead of learning the navigation structure, they describe where they want to go. This is a quick win with high utility and low implementation cost.

**What It Means:**
- "Take me to my deals" -> navigates to `/deals`
- "Show me the property I saved yesterday" -> navigates to `/properties/saved`
- "Open my broker's profile" -> navigates to relevant provider profile
- "Go to settings" -> navigates to `/settings`
- Navigation happens via a tool that returns a navigation intent (URL + optional entity ID), which the frontend executes via the Next.js router
- Works with the existing routing structure

**Complexity:** Low-Medium
**Dependencies:** Needs a navigation tool that maps intents to routes. The `src/lib/navigation.ts` already has the full route map per role. The tool returns a URL; the frontend's `useRouter()` executes the navigation.
**Confidence:** HIGH -- simple tool with well-defined inputs and outputs.

---

### DIFF-08: Feedback and Response Quality Loop

**Value Proposition:** Users can rate AI responses (thumbs up/down) and request regeneration. This both improves user satisfaction ("I can tell it when it is wrong") and provides data for improving AI instructions over time.

**What It Means:**
- Thumbs up/down buttons on each AI message
- "Regenerate response" button on AI messages
- Feedback stored in Convex for later analysis
- Negative feedback optionally prompts for a brief reason ("Not accurate", "Not helpful", "Too verbose")
- Feedback data can inform system prompt refinements

**Complexity:** Low-Medium
**Dependencies:** New feedback mutation in Convex. UI additions to `ChatMessage` component. No AI changes required -- this is purely a data collection and UX feature.
**Confidence:** HIGH -- standard pattern, low risk, immediate user value.

---

## Anti-Features

Features to deliberately NOT build. These are common mistakes in the AI assistant domain that waste development time or actively harm user experience.

### AF-01: DO NOT Build a Fully Autonomous Agent That Takes Actions Without Confirmation

**Why Avoid:** The "agentic AI" trend encourages letting the AI act autonomously -- create deals, send messages, make bookings. This is a liability in a real estate investment platform where transactions involve significant money. The Air Canada chatbot lawsuit (court ruled the company responsible for the chatbot's incorrect promises about bereavement discounts) is a cautionary tale.

**What to Do Instead:** Always show a preview of the action and require explicit user confirmation before executing. "I can start a deal for this property. Would you like me to proceed?" with a confirm/cancel UI -- never silent execution. The AI proposes, the human disposes.

---

### AF-02: DO NOT Replace the Existing Chat System

**Why Avoid:** REOS has a full deal-based and direct messaging chat system on the `/chat` page with multi-layout support, participant drag-and-drop, and conversation management. The AI assistant is a separate product from human-to-human chat. Conflating them creates confusion -- users will not know if they are talking to AI or a person.

**What to Do Instead:** Keep the AI assistant as a clearly labeled, visually distinct side panel. Use different styling (distinct background color, AI avatar icon, "AI Assistant" header prominently displayed). Never mix AI messages into human chat threads. The AI panel and the human chat page are separate systems that may reference each other but do not merge.

---

### AF-03: DO NOT Build a General-Purpose Chatbot

**Why Avoid:** Allowing the AI to answer questions about anything (weather, recipes, general knowledge) dilutes its value and creates liability. Research explicitly warns: "A chatbot that has no personality feels generic" -- but the personality should be domain-specific. The assistant should be an expert on REOS and real estate investing in Israel, not a general chatbot.

**What to Do Instead:** Constrain the system prompt to REOS domain topics. When asked off-topic questions, respond with: "I specialize in real estate investment and the REOS platform. For general questions, I would recommend..." Guardrails in the system prompt handle this -- the existing `investorAssistant` agent already has domain-specific instructions.

---

### AF-04: DO NOT Store Sensitive Financial Data in AI Context

**Why Avoid:** Passing actual bank account numbers, SSNs, full financial documents, or passport details to Claude creates a privacy and compliance risk. The AI context is sent to Anthropic's API and processed externally. Research highlights that security vulnerabilities in AI chatbots create compliance violations and potential lawsuits.

**What to Do Instead:** Only pass structured, non-sensitive data to the AI context: budget ranges, investment preferences, deal stages, property metadata. Never pass raw financial documents through the AI. If the user asks about documents, reference them by name/type but do not include their contents in the prompt.

---

### AF-05: DO NOT Build Voice Input (Yet)

**Why Avoid:** Voice-to-text adds significant complexity (speech recognition, noise handling, mobile permissions, accessibility implications) for marginal benefit in a platform where users are primarily browsing properties and reviewing documents. The ROI is low relative to the effort.

**What to Do Instead:** Focus on text-based interaction. Voice can be a future enhancement after the core text experience is polished and validated with real users.

---

### AF-06: DO NOT Pre-Fetch AI Responses on Page Load

**Why Avoid:** Generating an AI response every time a user navigates to a page wastes API tokens (Claude is not free), adds latency to page loads, and annoys users who did not ask for help. The auto-greeting pattern on the investor summary page works because it is a one-time onboarding moment -- replicating it on every page is an anti-pattern. Research warns against building "AI features users ignore" and notes that users choose a "familiar 30-second workaround over an unfamiliar 5-second AI solution."

**What to Do Instead:** The AI panel opens with an empty state showing suggested prompts and only generates responses when the user explicitly sends a message. Proactive nudges (DIFF-02) are generated server-side on a schedule, not on every page load.

---

### AF-07: DO NOT Build a Separate Mobile App for the AI Assistant

**Why Avoid:** REOS is a web application with mobile-responsive design. Building a separate mobile app or native wrapper for the AI assistant would fragment the codebase and user experience.

**What to Do Instead:** Use responsive design patterns (bottom sheet on mobile, side panel on desktop) within the existing Next.js application. The `useIsMobile()` hook already handles breakpoint detection.

---

### AF-08: DO NOT Show Raw AI Confidence Scores to End Users

**Why Avoid:** Displaying "85% confidence" or "AI is uncertain" to non-technical real estate investors creates anxiety and erodes trust without providing actionable information. Research on AI trust patterns shows users either ignore confidence indicators or become disproportionately cautious.

**What to Do Instead:** Build confidence-based behavior into the AI's natural language. Low-confidence responses should use qualifying language naturally ("Based on the available data, it appears..." vs. assertive "The property costs $X"). This is handled through system prompt instructions, not UI elements.

---

### AF-09: DO NOT Build an "AI Settings" Page with Model Selection

**Why Avoid:** Exposing model selection, temperature controls, or token limits to end users is an engineering vanity feature. Real estate investors do not care about "Claude Sonnet vs. Claude Haiku." This adds UI complexity that serves no user need.

**What to Do Instead:** Make all model and parameter decisions server-side. Use the appropriate model for each task automatically (Claude Sonnet for conversations, Claude Haiku for summarization -- already implemented this way in `convex/ai/agent.ts` and `convex/ai/summarization.ts`).

---

## Feature Dependencies

```
TS-01 (Global Side Panel)        <-- FOUNDATION: everything depends on this
  |
  +-- TS-02 (Context Awareness)  <-- depends on panel being available globally
  |     |
  |     +-- TS-07 (Quick Actions)        <-- suggestions depend on context
  |     |
  |     +-- DIFF-01 (Page-Specific Actions) <-- actions depend on context
  |     |
  |     +-- DIFF-02 (Proactive Nudges)   <-- nudges surface in the panel
  |
  +-- TS-03 (Multi-Role Support) <-- panel shows different content per role
  |     |
  |     +-- DIFF-03 (Slash Commands)     <-- commands are role-specific
  |     |
  |     +-- DIFF-04 (Cross-Entity Intel) <-- tools are role-specific
  |
  +-- TS-04 (Streaming)          <-- already built, carry forward
  |
  +-- TS-05 (Memory)             <-- already built, carry forward
  |
  +-- TS-06 (Rich Responses)     <-- already built, carry forward
  |
  +-- TS-10 (Mobile Responsive)  <-- panel layout adapts to mobile

TS-08 (Error Handling)           <-- independent, applies to all AI interactions
TS-09 (Accessibility)            <-- independent, applies to all panel interactions

DIFF-05 (Threading)              <-- can be added after TS-01 without blocking others
DIFF-06 (Multilingual)           <-- can be added after TS-03 (needs role prompts first)
DIFF-07 (Navigation)             <-- depends on TS-02 (context) but otherwise independent
DIFF-08 (Feedback Loop)          <-- independent, can be added to any AI message
```

---

## MVP Recommendation

For the initial milestone, prioritize building the **infrastructure** that enables all future features:

### Phase 1: Global Panel Shell + Multi-Role (Must-Build First)

Build the side panel container and extend the AI from investor-only to all roles.

1. **TS-01** (Global Side Panel) -- this is the foundation everything else depends on
2. **TS-03** (Multi-Role Support) -- without this, only investors benefit
3. **TS-04** (Streaming) -- carry forward existing implementation
4. **TS-05** (Memory) -- carry forward existing implementation
5. **TS-06** (Rich Responses) -- carry forward existing implementation
6. **TS-10** (Mobile Responsive) -- mobile users must be served from day one

### Phase 2: Context Awareness + Suggestions + Polish

Make the assistant genuinely useful by understanding where the user is.

7. **TS-02** (Context Awareness) -- transforms the assistant from generic to smart
8. **TS-07** (Quick Actions / Suggested Prompts) -- reduces friction dramatically
9. **TS-08** (Error Handling) -- production readiness
10. **TS-09** (Accessibility) -- basic keyboard nav and screen reader support
11. **DIFF-08** (Feedback Loop) -- low effort, high signal

### Phase 3: Differentiators

Features that create competitive advantage.

12. **DIFF-01** (Page-Specific Quick Actions) -- the "wow" moment
13. **DIFF-07** (AI Navigation) -- quick win, high utility
14. **DIFF-06** (Multilingual) -- essential for Hebrew-speaking users

### Defer to Post-Milestone

- **DIFF-02** (Proactive Nudges) -- requires backend scheduling infrastructure and careful UX tuning
- **DIFF-03** (Slash Commands) -- nice-to-have for power users, not critical for launch
- **DIFF-04** (Cross-Entity Intelligence) -- requires many new tools, better to add incrementally
- **DIFF-05** (Conversation Threading) -- adds UI complexity, single thread is fine for MVP

---

## Complexity Summary

| Feature | ID | Complexity | Recommended Phase |
|---------|-----|-----------|-------------------|
| Global Side Panel | TS-01 | Medium | 1 |
| Context Awareness | TS-02 | Medium | 2 |
| Multi-Role Support | TS-03 | High | 1 |
| Streaming (existing) | TS-04 | Low | 1 |
| Memory (existing) | TS-05 | Low | 1 |
| Rich Responses (existing) | TS-06 | Low | 1 |
| Quick Actions | TS-07 | Medium | 2 |
| Error Handling | TS-08 | Low-Medium | 2 |
| Accessibility | TS-09 | Low-Medium | 2 |
| Mobile Responsive | TS-10 | Medium | 1 |
| Page-Specific Actions | DIFF-01 | High | 3 |
| Proactive Nudges | DIFF-02 | High | Post |
| Slash Commands | DIFF-03 | Medium | Post |
| Cross-Entity Intelligence | DIFF-04 | High | Post |
| Conversation Threading | DIFF-05 | Medium-High | Post |
| Multilingual | DIFF-06 | Medium | 3 |
| AI Navigation | DIFF-07 | Low-Medium | 3 |
| Feedback Loop | DIFF-08 | Low-Medium | 2 |

---

## Competitive Landscape Reference

How AI assistants are implemented in comparable platforms:

| Platform | Approach | Notable Features | Relevance to REOS |
|----------|----------|-----------------|-------------------|
| AppFolio Realm-X | Embedded AI copilot across property management | Conversational interface, message generation (500K messages in 30 days), 24/7 leasing assistant | HIGH -- closest PropTech comparison |
| Microsoft Copilot | Right-side panel in Office apps | Context-aware (knows open document), takes actions (edit, format, summarize) | HIGH -- gold standard for side panel UX |
| GitHub Copilot | IDE-integrated side panel | Inline suggestions + chat panel, context-aware of current file | MEDIUM -- different domain, same panel pattern |
| Cursor | Code editor AI side panel | Toggle with keyboard shortcut, context-aware, multi-model | MEDIUM -- panel UX patterns relevant |
| Notion AI | Inline + command menu | Slash commands, block-level AI, context of current page | HIGH -- slash commands and context patterns |
| ClickUp Brain | Neural network across workspace | Cross-entity intelligence, connects tasks/docs/people | HIGH -- cross-entity pattern reference |
| Compass (RE) | Lead nurturing chatbot | Follow-up messaging, prospect engagement | LOW -- different approach (lead gen bot) |
| Structurely (RE) | AI lead nurturing assistant | 12-month text/email nurturing | LOW -- external communication, not in-app |

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|-----------|-----------|
| Table Stakes features | HIGH | Universal patterns across Microsoft Copilot, GitHub Copilot, Notion AI, Adobe AI Assistant, and surveyed SaaS platforms |
| Differentiator feasibility | MEDIUM-HIGH | Patterns exist in production (Copilot actions, AppFolio Realm-X, ClickUp Brain) but REOS-specific implementation needs custom design |
| Anti-features | HIGH | Backed by multiple failure case studies (Air Canada lawsuit, Character.AI incidents) and consistent industry guidance against autonomous actions, general chatbots, and confidence score UIs |
| Complexity estimates | MEDIUM | Based on codebase analysis (existing agent infrastructure, component patterns) but actual complexity depends on edge cases discovered during implementation |
| Phase ordering | HIGH | Dependency chain is deterministic -- panel must exist before context, context before actions |
| Mobile patterns | HIGH | Established patterns, existing mobile infrastructure in REOS (useIsMobile, MobileBottomNav) |

---

## Sources

### SaaS AI Assistant Patterns
- [10 AI-Driven UX Patterns Transforming SaaS in 2026 - Orbix](https://www.orbix.studio/blogs/ai-driven-ux-patterns-saas-2026)
- [Exploring AI Design Patterns in SaaS Products - UX Studio](https://www.uxstudioteam.com/ux-blog/ai-design-patterns-in-saas-products)
- [How to Design an AI Assistant That Actually Helps - Muzli/Medium](https://medium.muz.li/how-to-design-an-ai-assistant-users-actually-use-81b0fc7dc0ec)
- [Where Should AI Sit in Your UI? - UX Collective](https://uxdesign.cc/where-should-ai-sit-in-your-ui-1710a258390e)
- [AI Assistant UI Guide - Adobe Experience Cloud](https://experienceleague.adobe.com/en/docs/experience-cloud-ai/experience-cloud-ai/ai-assistant/ai-assistant-ui)
- [Why Most SaaS AI Features Fail - Very Creatives](https://verycreatives.com/blog/why-most-saas-ai-features-fail)

### PropTech AI
- [Conversational AI for Real Estate - Crescendo.ai](https://www.crescendo.ai/blog/conversational-ai-for-real-estate)
- [PropTech Trends 2025: How AI Is Shaping Real Estate - Sparrowlane](https://sparrowlane.io/blog/proptech-trends-2025-ai)
- [Proptech in 2026: How Agentic AI Is Reshaping Real Estate - ICSC](https://www.icsc.com/news-and-views/icsc-exchange/next-phase-of-proptech-agentic-ai-in-2026)
- [The Best AI Tools for Real Estate - V7 Labs](https://www.v7labs.com/blog/best-ai-tools-for-real-estate)

### Context-Aware Copilots
- [Microsoft 365 Copilot Chat Overview - Microsoft Learn](https://learn.microsoft.com/en-us/copilot/overview)
- [CopilotKit - The Agentic Framework for In-App AI Copilots](https://www.copilotkit.ai/)
- [Build Dynamic Role-Based AI Agent Using Amazon Bedrock - AWS](https://aws.amazon.com/blogs/machine-learning/build-a-dynamic-role-based-ai-agent-using-amazon-bedrock-inline-agents/)
- [Contextual AI Assistant - ClearPeople](https://www.clearpeople.com/blog/enhancing-your-ai-assistant-with-contextual-relevance)

### Proactive AI and Nudges
- [Proactive AI Nudges: Automated Customer Guidance - EverAfter](https://www.everafter.ai/glossary/proactive-ai-nudges)
- [Top 9 Must-Have SaaS AI Features - ProCreator](https://procreator.design/blog/top-saas-ai-features-your-product-needs/)
- [SaaS AI Assistants 2025: Automating Workflow - Redlio Designs](https://redliodesigns.com/blog/saas-ai-assistants-2025-automating-workflow)
- [Year Ender 2025: AI Assistants Rise from Reactive to Proactive - Business Standard](https://www.business-standard.com/technology/tech-news/year-ender-2025-ai-assistants-rise-alexa-siri-google-assistant-chatgpt-meta-gemini-125122200324_1.html)

### Anti-Patterns and Failures
- [Chatbots Are AI Anti-Patterns - Medium/The Startup](https://medium.com/swlh/chatbots-are-ai-anti-patterns-c5334b403794)
- [10+ Epic LLM/Chatbot Failures in 2026 - AIMultiple](https://research.aimultiple.com/chatbot-fail/)
- [AI Chatbot Mistakes - Sparkout Tech](https://www.sparkouttech.com/ai-chatbot-mistakes/)
- [Designing for AI Assistants: Solving Key Challenges - Medium](https://medium.com/@eleana_gkogka/designing-for-ai-assistants-solving-key-challenges-through-ui-ux-e869358d048c)
- [When Chatbots Go Wrong - EdgeTier](https://www.edgetier.com/chatbots-the-new-risk-in-ai-customer-service/)

### UI Libraries and Implementation
- [assistant-ui - TypeScript/React Library for AI Chat](https://www.assistant-ui.com/)
- [31 Chatbot UI Examples from Product Designers - Eleken](https://www.eleken.co/blog-posts/chatbot-ui-examples)

---

*Research conducted: 2026-02-01*
*Researcher confidence: HIGH for table stakes, MEDIUM-HIGH for differentiators*
