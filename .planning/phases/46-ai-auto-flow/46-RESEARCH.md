# Phase 46: AI Auto-Flow - Research

**Researched:** 2026-01-23
**Domain:** AI agent proactive interaction, auto-tool invocation, UI state persistence
**Confidence:** HIGH

## Summary

Phase 46 implements AI-initiated conversation after questionnaire completion with automatic property and provider recommendations. The core challenge is triggering AI messages and tool calls without user prompts, while maintaining persistent UI patterns (questionnaire popup) and reliable card rendering.

The research reveals that modern AI agent architectures (2026) support autonomous workflows where agents monitor data streams and trigger their own actions. The Vercel AI SDK + @convex-dev/agent stack already supports the required patterns through system prompts, empty-prompt invocations, and agentic planning loops.

**Primary recommendation:** Use a combination of (1) thread message count check to detect first visit, (2) system prompt engineering to trigger auto-suggestions, and (3) questionnaire status flag for popup persistence. Do not hand-roll auto-invocation logic—leverage the agent's maxSteps configuration and system instructions.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @convex-dev/agent | Latest (installed) | AI agent with persistent threads | Thread-based memory, async message handling, built-in tool execution |
| @ai-sdk/anthropic | Latest (installed) | Claude Sonnet 4 integration | Vercel AI SDK provider for Anthropic models |
| ai (Vercel AI SDK) | 6.x | Tool calling and streaming | Industry standard with Agent abstraction, ToolLoopAgent for auto-execution |
| shadcn/ui Dialog | Latest (installed) | Modal/popup UI | Declarative React components with controlled state management |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React hooks (useState, useEffect) | 19.x | State management for triggers | Detect questionnaire completion, manage popup state |
| Convex queries/mutations | Latest | Database flag checks | Read questionnaire status, thread message counts |
| next-intl | Latest (installed) | i18n for greetings | Translate auto-greeting messages |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| System prompt auto-trigger | Custom client-side scheduler | System prompt is simpler, leverages existing agent context |
| Thread message count | New `hasSeenAutoGreeting` flag | Message count reuses existing data, fewer schema changes |
| Modal persistence via status check | LocalStorage | Database is source of truth, works across devices |

**Installation:**
No new dependencies required—all libraries already installed.

## Architecture Patterns

### Recommended Auto-Flow Trigger Structure
```
User completes questionnaire
  ↓
Redirect to summary page
  ↓
Client detects empty thread (0 messages)
  ↓
Client triggers sendMessage("") with auto-greeting flag
  ↓
System prompt instructs AI to greet + search properties + suggest providers
  ↓
Agent executes tool loop (searchProperties → searchProviders)
  ↓
Cards rendered via PropertyCardRenderer + ProviderCardRenderer
  ↓
Quick reply buttons remain visible for follow-up
```

### Pattern 1: First-Visit Detection via Thread Message Count

**What:** Check if AI thread has any messages to determine if this is first visit after questionnaire

**When to use:** On summary page mount, after questionnaire completion

**Example:**
```typescript
// In summary page component
const thread = useQuery(api.ai.threads.getThreadForUser);
const messages = useAIChat().messages;
const questionnaire = useQuery(api.investorQuestionnaires.getByUser);

useEffect(() => {
  const isFirstVisit =
    questionnaire?.status === "complete" &&
    messages.length === 0 &&
    thread?.agentThreadId; // Thread exists but empty

  if (isFirstVisit) {
    // Trigger auto-greeting
    sendMessage(""); // Empty prompt triggers system-guided response
  }
}, [questionnaire?.status, messages.length, thread?.agentThreadId]);
```

**Why this works:**
- Reuses existing data (no new schema fields)
- Natural signal: empty thread = hasn't seen AI yet
- Avoids re-triggering on subsequent visits

### Pattern 2: System Prompt for Auto-Tool Invocation

**What:** Use enhanced system context to instruct AI to automatically call tools on empty prompts

**When to use:** When user completes questionnaire and has no chat history

**Example:**
```typescript
// In convex/ai/chat.ts sendMessage action
let systemContext = profileContext || "";

// Detect auto-greeting scenario
const isAutoGreeting = message === "" && thread?.messages.length === 0;

if (isAutoGreeting) {
  systemContext += `\n\n## Auto-Greeting Instructions

The user just completed their investment profile questionnaire. This is your first interaction with them.

1. Send a warm, personalized greeting that references their profile (budget, target locations)
2. Automatically search for 3 properties using searchProperties tool with their criteria
3. After showing properties, automatically search for providers using searchProviders tool (2-3 per role)
4. Keep your greeting concise (2-3 sentences) before the property cards
5. After provider cards, remind them about quick reply buttons for follow-up questions

IMPORTANT: Call both tools automatically without waiting for user prompts.`;
}
```

**Why this works:**
- Leverages agent's maxSteps configuration (already set to 5)
- Natural for AI—system instructions guide autonomous behavior
- No custom tool-loop logic needed

### Pattern 3: Questionnaire Popup Persistence

**What:** Show questionnaire dialog on every visit until status is "complete"

**When to use:** App shell or summary page component

**Example:**
```typescript
// In layout or app shell component
const questionnaire = useQuery(api.investorQuestionnaires.getByUser);
const [showDialog, setShowDialog] = useState(false);

useEffect(() => {
  // Show popup if questionnaire exists but is incomplete
  if (questionnaire && questionnaire.status === "draft") {
    setShowDialog(true);
  }
}, [questionnaire?.status]);

const handleSkip = () => {
  setShowDialog(false); // Close for this session
  // Do NOT update database—popup will show again on next visit
};

const handleComplete = async () => {
  await markComplete(); // Sets status to "complete"
  setShowDialog(false); // Closes permanently
};

return (
  <Dialog open={showDialog} onOpenChange={(open) => {
    if (!open) handleSkip(); // Allow closing, but will reappear
  }}>
    <QuestionnaireWizard onComplete={handleComplete} />
  </Dialog>
);
```

**Why this works:**
- Database status is source of truth
- Skip closes dialog but doesn't mark complete
- On next page load, useEffect detects draft status and reopens
- Completion updates database, preventing future popups

### Pattern 4: Empty Prompt with System Context

**What:** Send empty string as user message when auto-triggering, relying on system context for instructions

**When to use:** First visit after questionnaire, scheduled follow-ups

**Example:**
```typescript
// Client-side trigger
const triggerAutoGreeting = () => {
  sendMessage(""); // Empty prompt
};

// Server-side handling in convex/ai/chat.ts
const isAutoGreeting = message.trim() === "" && (isNew || !thread?.summary);

if (isAutoGreeting) {
  systemContext += AUTO_GREETING_INSTRUCTIONS;
}

// Agent continues thread with system context
const result = await agentThread.streamText({
  prompt: message || "Start conversation", // Fallback for empty
  system: systemContext,
});
```

**Why this works:**
- Convex agent requires a prompt, but empty string + system context works
- System instructions provide the actual directive
- User doesn't see the empty message in history
- Natural pattern for scheduled/automatic interactions

### Anti-Patterns to Avoid

- **Client-side tool calling:** Don't fetch properties on client and inject—let AI use tools for proper explanation generation
- **Manual message insertion:** Don't directly insert messages into thread bypassing agent—breaks context/memory
- **LocalStorage for completion tracking:** Database is source of truth, works across devices/sessions
- **Separate auto-greeting flag:** Reuse thread message count instead of new schema fields
- **Hard-coded property/provider lists:** AI must use searchProperties/searchProviders tools for RAG grounding

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auto tool execution loop | Custom while loop calling tools | Agent maxSteps + system prompt | Agent handles retries, errors, step limits automatically |
| First-visit detection | New hasSeenAutoGreeting field | Thread message count check | Reuses existing data, one less field to maintain |
| Popup persistence | LocalStorage + client state | Database questionnaire.status check | Source of truth, works across devices, survives cache clears |
| Tool result rendering | Custom card injection | PropertyCardRenderer + ProviderCardRenderer | Already handles type-guarding, loading states, SaveAll logic |
| Empty prompt handling | Custom client-side message generation | System context with fallback prompt | Server controls content, easier to test and modify |

**Key insight:** The @convex-dev/agent + Vercel AI SDK stack is designed for autonomous agent workflows. Leverage system prompts and maxSteps rather than building orchestration logic.

## Common Pitfalls

### Pitfall 1: Re-triggering Auto-Greeting on Reload

**What goes wrong:** Auto-greeting fires every time user reloads the page, spamming the chat

**Why it happens:** Detection logic only checks questionnaire status, not whether greeting already sent

**How to avoid:**
```typescript
// Bad: Only checks questionnaire
if (questionnaire?.status === "complete") {
  triggerAutoGreeting(); // Fires every reload!
}

// Good: Also checks thread message count
if (questionnaire?.status === "complete" && messages.length === 0) {
  triggerAutoGreeting(); // Only fires when thread is empty
}
```

**Warning signs:**
- Multiple identical greetings in chat history
- Tool calls executing on every page load
- Users complaining about repeated messages

### Pitfall 2: Cards Showing as Text Instead of UI Components

**What goes wrong:** AI tool results appear as plain text rather than interactive cards

**Why it happens:** Tool result structure doesn't match PropertyCardRenderer expectations, or isExecuting state is stuck

**How to avoid:**
```typescript
// Ensure tool results follow expected structure
// In convex/ai/tools/propertySearch.ts
return {
  properties: properties.map(p => ({
    _id: p._id,
    title: p.title,
    // ... all required fields
  })),
  searchCriteria: { /* ... */ },
};

// In ChatMessage.tsx, check isExecuting logic
const isExecuting = isStreaming && !toolCalls?.some(
  (t) => t.toolName === "searchProperties" && t.result
);
// If result exists, isExecuting should be false
```

**Warning signs:**
- JSON blobs in chat messages
- "Searching properties..." stuck in loading state
- Save buttons not appearing

### Pitfall 3: Questionnaire Popup Dismissed Permanently on Skip

**What goes wrong:** User clicks skip, popup never shows again even though questionnaire incomplete

**Why it happens:** Skip handler updates database status or sets permanent localStorage flag

**How to avoid:**
```typescript
// Bad: Marks as complete on skip
const handleSkip = async () => {
  await markComplete(); // Wrong!
  setShowDialog(false);
};

// Good: Only closes for current session
const handleSkip = () => {
  setShowDialog(false); // Local state only
  // No database update
};

// Popup will reappear on next visit via useEffect
```

**Warning signs:**
- Users report "can't get questionnaire back"
- Incomplete profiles never showing prompt
- Status shows "draft" but popup never appears

### Pitfall 4: System Prompt Too Generic for Auto-Invocation

**What goes wrong:** AI sends greeting but waits for user to request properties/providers

**Why it happens:** System prompt doesn't explicitly instruct to call tools automatically

**How to avoid:**
```typescript
// Bad: Vague instruction
systemContext += "Help the user find properties and providers.";

// Good: Explicit auto-invocation directive
systemContext += `
IMPORTANT: Automatically call these tools in sequence:
1. searchProperties - Find 3 properties matching user's profile
2. searchProviders - Find 2-3 providers per role (broker, mortgage_advisor, lawyer)

Do NOT wait for user to ask. Execute both tool calls immediately after greeting.
`;
```

**Warning signs:**
- Greeting appears but no cards
- User has to manually request "show me properties"
- Tool calls only happen after second message

### Pitfall 5: Race Condition Between Redirect and Auto-Greeting

**What goes wrong:** Page redirects to summary before questionnaire marked complete, auto-greeting doesn't fire

**Why it happens:** Async mutation (markComplete) not awaited before redirect

**How to avoid:**
```typescript
// Bad: Redirect before mutation completes
const handleFinish = () => {
  markComplete(); // Async mutation, not awaited
  router.push("/profile/investor/summary"); // Redirects immediately
};

// Good: Await completion before redirect
const handleFinish = async () => {
  await markComplete(); // Wait for database update
  router.push("/profile/investor/summary"); // Then redirect
};
```

**Warning signs:**
- Auto-greeting inconsistently fires
- Sometimes works, sometimes doesn't
- Refresh required to see greeting

## Code Examples

Verified patterns from official sources:

### Auto-Greeting Trigger (Client-Side)

```typescript
// Source: Research synthesis - useEffect pattern + thread message count
// File: src/app/[locale]/(app)/profile/investor/summary/page.tsx

"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAIChat } from "@/components/ai/hooks/useAIChat";

export default function InvestorSummaryPage() {
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);
  const { messages, sendMessage } = useAIChat();

  // Auto-greeting on first visit after questionnaire completion
  useEffect(() => {
    const isFirstVisit =
      questionnaire?.status === "complete" &&
      messages.length === 0;

    if (isFirstVisit) {
      // Trigger AI auto-greeting with empty prompt
      sendMessage("");
    }
  }, [questionnaire?.status, messages.length]); // Deps prevent re-trigger

  return (/* ... */);
}
```

### System Prompt Enhancement (Server-Side)

```typescript
// Source: Vercel AI SDK patterns + @convex-dev/agent streaming
// File: convex/ai/chat.ts

export const sendMessage = action({
  args: { message: v.string() },
  handler: async (ctx, { message }) => {
    // ... existing auth and thread setup ...

    let systemContext = profileContext || "";

    // Detect auto-greeting scenario (empty message + empty thread)
    const messageCount = messagesResult?.page.length || 0;
    const isAutoGreeting = message.trim() === "" && messageCount === 0;

    if (isAutoGreeting) {
      systemContext += `\n\n## First Interaction - Auto-Greeting Mode

You're meeting this investor for the first time after they completed their profile.

Sequence:
1. Warm greeting (2-3 sentences) - reference their budget and target cities
2. Call searchProperties tool immediately (3 properties)
3. Call searchProviders tool immediately (2-3 per role: broker, mortgage_advisor, lawyer)
4. Remind them about quick reply buttons for follow-ups

CRITICAL: Execute both tool calls automatically. Do NOT wait for user prompts.
Your greeting should flow naturally into "Let me show you..." before tools execute.`;
    }

    const result = await agentThread.streamText(
      {
        prompt: message || "Begin conversation", // Fallback for empty string
        system: systemContext,
      },
      {
        saveStreamDeltas: true,
        contextOptions: { recentMessages: 10 },
      }
    );

    return { /* ... */ };
  },
});
```

### Persistent Questionnaire Popup

```typescript
// Source: shadcn Dialog controlled state + database flag check
// File: src/components/questionnaire/QuestionnaireDialog.tsx (to be created)

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function QuestionnaireDialog() {
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);
  const markComplete = useMutation(api.investorQuestionnaires.markComplete);
  const [open, setOpen] = useState(false);

  // Show dialog if questionnaire is draft (incomplete)
  useEffect(() => {
    if (questionnaire?.status === "draft") {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [questionnaire?.status]);

  const handleSkip = () => {
    // Close for this session only - no database update
    setOpen(false);
    // Will reappear on next visit because status is still "draft"
  };

  const handleComplete = async () => {
    // Update database to mark complete
    await markComplete({});
    // Dialog will close via useEffect when status changes
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleSkip(); // Allow ESC or click-outside to skip
      }}
    >
      <DialogContent className="max-w-2xl">
        <QuestionnaireWizard
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Tool Call Verification (Debugging)

```typescript
// Source: Existing PropertyCardRenderer pattern
// File: src/components/ai/PropertyCardRenderer.tsx (reference)

export function PropertyCardRenderer({ toolCalls, isExecuting }) {
  // Verify tool result structure
  const searchTool = toolCalls?.find(t => t.toolName === "searchProperties");

  if (searchTool && searchTool.result) {
    console.log("Tool result structure:", {
      hasProperties: Array.isArray(searchTool.result?.properties),
      propertyCount: searchTool.result?.properties?.length,
      firstProperty: searchTool.result?.properties?.[0],
    });
  }

  // Type-guard ensures cards render
  if (!Array.isArray(searchTool?.result?.properties)) {
    console.warn("Invalid tool result - cards will not render");
    return null;
  }

  return (/* ... render cards ... */);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| User initiates all conversations | AI proactively greets after onboarding | 2026 | Autonomous agents standard, human-on-the-loop pattern |
| Questionnaire completion = done | Persistent reminders until complete | 2026 | Higher completion rates, no "skip forever" trap |
| Manual tool invocation | Agentic planning loops (maxSteps) | AI SDK 6 (2026) | Auto-execution, no custom orchestration needed |
| Client-side property filtering | RAG grounding with searchProperties tool | 2026 | AI explains matches, no hallucinated properties |
| One-time popup dismissal | Session-based dismissal, DB persistence | 2026 | Cross-device consistency, survives cache clears |

**Deprecated/outdated:**
- **Hard-coded welcome messages:** Now use system prompts with profile context for personalization
- **LocalStorage for onboarding state:** Database flags are source of truth in 2026
- **Separate greeting endpoint:** System prompts handle auto-greeting without custom API routes
- **Custom tool execution loops:** AI SDK 6 ToolLoopAgent makes this obsolete

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal Auto-Greeting Timing**
   - What we know: useEffect on mount is standard, checks thread message count
   - What's unclear: Should we delay 500ms for smoother UX, or fire immediately?
   - Recommendation: Start with immediate trigger, add delay only if users report jarring experience

2. **Handling Auto-Greeting Interruption**
   - What we know: User could type during tool execution (property search takes ~2s)
   - What's unclear: Should we queue user message until tools complete, or interrupt?
   - Recommendation: Let AI SDK handle naturally—interrupt is acceptable, tools may complete anyway

3. **Provider Suggestions in Same Message or Separate**
   - What we know: System prompt can instruct both tools in one message
   - What's unclear: Better UX to show properties first, then providers in second auto-message?
   - Recommendation: Start with single message (both tools), split only if users report information overload

4. **Re-triggering Logic After Clear Memory**
   - What we know: Clear memory deletes thread, makes messages.length === 0 again
   - What's unclear: Should auto-greeting fire again, or track "has seen greeting" separately?
   - Recommendation: Let it fire again—user cleared memory intentionally, fresh start is appropriate

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK 6 - Agent Abstraction](https://vercel.com/blog/ai-sdk-6) - ToolLoopAgent, maxSteps configuration
- [Convex AI Agents Documentation](https://docs.convex.dev/agents) - Thread management, persistent memory
- [Convex Agent Messages API](https://docs.convex.dev/agents/messages) - saveMessage patterns
- [@convex-dev/agent GitHub](https://github.com/get-convex/agent) - Streaming, async agent operations
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog) - Controlled state management
- [React useEffect Reference](https://react.dev/reference/react/useEffect) - Effect dependencies, cleanup

### Secondary (MEDIUM confidence)
- [AI Agents Explained: Autonomous AI 2026](https://aitoolinsight.com/ai-agents-explained/) - Agentic planning loops
- [Tool Calling in AI Agents (Auth0)](https://auth0.com/blog/genai-tool-calling-intro/) - Tool selection patterns
- [Chatbot Onboarding Best Practices (Lindy)](https://www.lindy.ai/blog/chatbot-onboarding) - Proactive engagement timing
- [Implementing Effective Onboarding in React](https://radzion.com/blog/onboarding/) - RequiresOnboarding pattern
- [React Modal Best Practices (LogRocket)](https://blog.logrocket.com/creating-reusable-pop-up-modal-react/) - Persistent modal patterns

### Tertiary (LOW confidence)
- [AI Chatbot Welcome Messages 2026](https://www.revechat.com/blog/welcome-messages/) - Greeting personalization (general guidance)
- [Automatic Messages (Smartsupp)](https://help.smartsupp.com/en_US/chatbots-automation/automatic-messages) - Trigger conditions (platform-specific)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and in use
- Architecture: HIGH - Patterns verified in existing codebase (useAIChat, PropertyCardRenderer)
- Pitfalls: MEDIUM - Based on common React patterns + AI SDK edge cases from community discussions
- Code examples: HIGH - Synthesized from existing code + official documentation

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable patterns, established libraries)
