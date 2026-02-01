# Phase 63: Multi-Role Agent + Auth Enforcement - Research

**Researched:** 2026-02-01
**Domain:** Role-based AI agent behavior, tool scoping, server-side auth enforcement in LLM systems
**Confidence:** HIGH

## Summary

Phase 63 transforms the REOS AI assistant from investor-only to a multi-role platform assistant serving all five roles (investor, broker, mortgage_advisor, lawyer, admin) with role-appropriate behavior, tools, and permissions. The critical security requirement is that authorization enforcement happens server-side in every tool handler, never trusting the LLM's output.

The existing architecture is well-positioned for this change. The `sendMessage` action in `convex/ai/chat.ts` already accepts an optional `role` parameter (lines 30, 95), the `@convex-dev/agent` package supports dynamic tool selection per invocation, and the codebase has a consistent auth pattern using `ctx.auth.getUserIdentity()` and `effectiveRole` calculation (used in 32+ files). The current `platformAssistant` in `convex/ai/agent.ts` is already a single agent -- it just needs role-specific instructions and tools injected at runtime.

The 2026 security landscape for AI agents emphasizes a critical principle: **never trust the LLM for authorization**. The OWASP Top 10 for Agentic Applications 2026 specifically addresses autonomous action security, requiring strict server-side enforcement. Tool handlers must independently verify the calling user's identity and role via `ctx.auth`, treating the LLM's tool invocation as untrusted input requiring validation.

**Primary recommendation:** Inject role-specific system prompts at runtime in `sendMessage` (already has role-based prompt logic at lines 96-111), create separate tool sets per role (investor tools vs. broker tools vs. admin tools), enforce auth in every tool handler by checking `ctx.auth.getUserIdentity()` and calculating `effectiveRole` (handling `viewingAsRole` for admins), and reject unauthorized tool invocations with clear error messages. The single agent model is correct -- no need for separate agents per role.

## Standard Stack

The REOS platform already has the complete stack needed for multi-role agent implementation:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@convex-dev/agent` | 0.3.2 | AI agent framework with tool support | Already integrated, supports dynamic tool selection |
| `ai` (Vercel AI SDK) | 5.0.123 | LLM streaming and tool calling | Locked version (AI SDK 6 breaks agent package) |
| `@ai-sdk/anthropic` | 2.0.57 | Claude integration | Current version for Claude Sonnet 4 |
| `zod` | ^3.x | Tool argument validation | Already used in existing tools |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Convex built-in auth | N/A | `ctx.auth.getUserIdentity()` | Every tool handler for user identification |
| Convex schema unions | N/A | Role type definitions | Already defined as `userRoles` in schema.ts |

### No New Dependencies Required

Phase 63 requires zero new packages. All functionality is achieved through configuration and code organization within the existing stack.

## Architecture Patterns

### Pattern 1: Single Agent with Dynamic Role Injection

**What:** One `platformAssistant` agent definition with role-specific instructions and tools selected per message, not separate agents per role.

**When to use:** This is the only pattern for REOS multi-role support.

**Why:** The `@convex-dev/agent` package supports sharing threads across agents, but switching agents mid-thread creates confusing context (the new agent inherits the old agent's messages which may reference the old agent's tools). Since REOS is one user, one conversation, multiple roles, the conversation must be continuous.

**Example:**
```typescript
// convex/ai/agent.ts - Single agent definition
export const platformAssistant = new Agent(components.agent, {
  name: "REOS Assistant",
  languageModel: anthropic("claude-sonnet-4-20250514"),
  instructions: `You are the REOS AI assistant...`, // Base instructions
  tools: {}, // Base tools (none) -- added per invocation
  maxSteps: 5,
  contextOptions: CONTEXT_OPTIONS,
});

// convex/ai/chat.ts - Role-specific invocation
const roleTools = getRoleTools(userRole); // Different tools per role
const roleInstructions = getRoleInstructions(userRole); // Different prompts per role

const result = await agentThread.streamText(
  {
    prompt: message,
    system: roleInstructions + profileContext + pageContext + summary,
    // ... other args
  },
  {
    saveStreamDeltas: true,
    tools: roleTools, // Override tools per invocation
  }
);
```

**Source:** [@convex-dev/agent GitHub](https://github.com/get-convex/agent) - Thread sharing, tool override patterns (HIGH confidence, verified in ARCHITECTURE-PLATFORM-AI.md)

### Pattern 2: Effective Role Calculation

**What:** Compute the user's effective role by handling the `viewingAsRole` admin feature, used in every auth check.

**When to use:** At the start of every query, mutation, action, and tool handler that performs role-based logic.

**Example from codebase:**
```typescript
// Used in 32+ files across the codebase
const effectiveRole = user.role === "admin" && user.viewingAsRole
  ? user.viewingAsRole
  : user.role;
```

**Why this matters:** Admins can switch their viewing perspective to test different role experiences. All auth logic must respect `viewingAsRole` when present, otherwise admins can't use the feature.

**Source:** Verified in `convex/deals.ts` lines 38-39, `convex/dashboard.ts` lines 23-24, `convex/clients.ts` lines 27-28, and 29 other files (HIGH confidence, verified).

### Pattern 3: Server-Side Tool Authorization (Critical Security Pattern)

**What:** Every tool handler independently verifies the calling user's identity and role before executing any action, never trusting the LLM's decision to invoke the tool.

**Why critical:** The OWASP Top 10 for Agentic Applications 2026 emphasizes that tool calls represent a **critical trust boundary**. If a tool contains malicious parameters (injected via prompt injection) and the server blindly executes them without validation, control is handed to whoever crafted that payload.

**Security principles from research:**

1. **Brokered Credentials Pattern**: The LLM never sees API keys or tokens. A secure service (the tool handler) makes calls on the agent's behalf. This is exactly how `@convex-dev/agent` works -- tools run server-side with `ActionCtx`, not client-side.

2. **Policy-Based Access Control**: Tool handlers should query authorization rules before every action. In REOS, this means checking `effectiveRole` and verifying the user has permission to access/modify the entity.

3. **Treat Tool Calls as Privileged Interfaces**: Tools exposed to LLMs must have explicit controls, auditing, and enforcement independent of the model's output.

**Example pattern:**
```typescript
// CORRECT: Tool enforces auth independently
export const savePropertyTool = createTool({
  description: "Save a property to the user's favorites",
  args: z.object({
    propertyId: z.string().describe("The property ID to save"),
  }),
  handler: async (ctx, args) => {
    // 1. Get authenticated user identity (NEVER skip this)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user record and calculate effective role
    const user = await ctx.runQuery(api.users.getByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) {
      throw new Error("User not found");
    }

    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    // 3. Enforce role-based permission
    if (effectiveRole !== "investor") {
      throw new Error("Only investors can save properties");
    }

    // 4. Execute the action
    await ctx.runMutation(api.favorites.toggleFavorite, {
      propertyId: args.propertyId as Id<"properties">,
    });

    return { saved: true, message: "Property saved to favorites" };
  },
});

// WRONG: Trusting the LLM to only invoke this for investors
export const savePropertyTool = createTool({
  description: "Save a property to favorites (ONLY for investors)", // ❌ LLM instructions are not security
  handler: async (ctx, args) => {
    // ❌ No auth check -- assumes LLM followed instructions
    await ctx.runMutation(api.favorites.toggleFavorite, {
      propertyId: args.propertyId as Id<"properties">,
    });
  },
});
```

**Why the wrong pattern fails:**
- Prompt injection can make the LLM ignore instructions
- A malicious user can craft prompts to trick the LLM into invoking restricted tools
- The LLM's "decision" to call a tool is not a security guarantee

**Sources:**
- [OWASP Top 10 for Agentic Applications 2026](https://www.practical-devsecops.com/owasp-top-10-agentic-applications/) (HIGH confidence)
- [Access Control and Permission Management for AI Agents](https://www.cerbos.dev/blog/permission-management-for-ai-agents) (HIGH confidence)
- [From Auth to Action: Secure AI Agent Infrastructure 2026](https://composio.dev/blog/secure-ai-agent-infrastructure-guide) (HIGH confidence)

### Pattern 4: Role-Specific Tool Sets

**What:** Different tools available to different roles, enforced both at invocation time (which tools the LLM can see) and in tool handlers (double-check auth).

**Implementation:**
```typescript
// convex/ai/roles/toolSets.ts
import { searchPropertiesTool } from "../tools/propertySearch";
import { searchProvidersTool } from "../tools/providerSearch";
import { savePropertyTool } from "../tools/saveProperty";
import { manageClientTool } from "../tools/manageClient";
import { adminToolsTool } from "../tools/adminTools";

export function getRoleTools(role: string) {
  const toolSets: Record<string, any> = {
    investor: {
      searchProperties: searchPropertiesTool,
      searchProviders: searchProvidersTool,
      saveProperty: savePropertyTool,
      // Investors can search and save, but not manage
    },
    broker: {
      manageClient: manageClientTool,
      // Brokers manage clients, but can't see investor-only tools
    },
    mortgage_advisor: {
      manageClient: manageClientTool,
      // Similar to broker
    },
    lawyer: {
      manageClient: manageClientTool,
      // Similar to broker
    },
    admin: {
      searchProperties: searchPropertiesTool,
      searchProviders: searchProvidersTool,
      saveProperty: savePropertyTool,
      manageClient: manageClientTool,
      adminToolsTool: adminToolsTool,
      // Admins see all tools (but viewingAsRole affects their invocation permissions)
    },
  };

  return toolSets[role] ?? {};
}
```

**Why this is defense-in-depth:**
1. **First layer**: LLM doesn't see tools for other roles in the function list
2. **Second layer**: Even if a tool is somehow invoked (e.g., via prompt injection), the handler checks auth

### Pattern 5: Role-Specific System Prompts

**What:** Different instructions for different roles, injected at runtime into the system prompt.

**Current implementation (from chat.ts lines 96-111):**
```typescript
// Build role-specific system prompt
const userRole = role ?? "investor";
let rolePrompt = "";
if (userRole === "investor") {
  rolePrompt = `## Your Role

You are assisting an investor looking to invest in Israeli real estate.
Focus on: property discovery, investment analysis, provider recommendations, and deal guidance.

`;
} else {
  rolePrompt = `## Your Role

You are assisting a ${userRole} on the REOS platform.
Help them with their specific needs and tasks.

`;
}
```

**Expansion needed for Phase 63:**
```typescript
// convex/ai/roles/instructions.ts
export function getRoleInstructions(role: string): string {
  const instructions: Record<string, string> = {
    investor: `## Your Role

You are assisting an investor looking to invest in Israeli real estate.
Focus on: property discovery, investment analysis, provider recommendations, and deal guidance.

Your tools:
- searchProperties: Find real properties matching criteria
- searchProviders: Find brokers, mortgage advisors, lawyers
- saveProperty: Save properties to favorites

Never invent data. Always use tools to fetch real information.`,

    broker: `## Your Role

You are assisting a real estate broker managing clients and deals on the REOS platform.
Focus on: client management, deal progression, communication with investors.

Your tools:
- manageClient: View and update client information
- progressDeal: Move deals through stages

Help them prioritize tasks and manage their pipeline.`,

    mortgage_advisor: `## Your Role

You are assisting a mortgage advisor managing clients and financing on the REOS platform.
Focus on: mortgage applications, client communication, deal financing.

Similar to broker but with financing expertise.`,

    lawyer: `## Your Role

You are assisting a real estate lawyer managing legal processes on the REOS platform.
Focus on: legal documentation, contract review, closing procedures.

Similar to broker but with legal expertise.`,

    admin: `## Your Role

You are assisting a platform administrator.
Focus on: platform operations, user management, data verification.

You have access to all tools. Use viewingAsRole awareness to adapt behavior.`,
  };

  return instructions[role] ?? instructions.investor;
}
```

## Role System Overview (Existing Implementation)

### 5 Platform Roles

| Role | Stored In | Purpose | Access Pattern |
|------|-----------|---------|----------------|
| `investor` | `users.role` | Finds and invests in properties | Owns deals, saves properties, requests providers |
| `broker` | `users.role` | Real estate agent connecting investors with properties | Assigned to deals, manages clients |
| `mortgage_advisor` | `users.role` | Handles financing for deals | Assigned to deals, manages clients |
| `lawyer` | `users.role` | Handles legal process for closing | Assigned to deals, manages clients |
| `admin` | `users.role` | Platform administrator with role-switching capability | Can access everything, uses `viewingAsRole` for testing |

**Source:** `convex/schema.ts` lines 10-16 (HIGH confidence, verified)

### Admin `viewingAsRole` Feature

Admins have a special field `viewingAsRole` (optional) that overrides their effective role for UI and data access. This allows admins to test the platform as if they were an investor, broker, etc., without changing their actual role.

**Implementation pattern (used in 32+ files):**
```typescript
const effectiveRole = user.role === "admin" && user.viewingAsRole
  ? user.viewingAsRole
  : user.role;

// Use effectiveRole for all data filtering and permission checks
```

**Critical for Phase 63:** The AI assistant must respect `viewingAsRole`. If an admin is viewing as an investor, they should get investor tools and prompts, NOT admin tools.

**Source:** `convex/users.ts` lines 506-542, `convex/schema.ts` line 224 (HIGH confidence, verified)

### Role Storage and Access

- **User's role:** `users.role` (required after onboarding)
- **Admin's viewing role:** `users.viewingAsRole` (optional, admin-only)
- **Effective role calculation:** `effectiveRole = user.role === "admin" && user.viewingAsRole ? user.viewingAsRole : user.role`

### Existing Role-Based Queries

The codebase has extensive examples of role-based data filtering:

**Example from `convex/deals.ts` (lines 19-91):**
```typescript
export const list = query({
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    let deals;
    switch (effectiveRole) {
      case "investor":
        deals = await ctx.db.query("deals")
          .withIndex("by_investor", (q) => q.eq("investorId", user._id))
          .collect();
        break;

      case "broker":
        deals = await ctx.db.query("deals")
          .withIndex("by_broker", (q) => q.eq("brokerId", user._id))
          .collect();
        break;

      case "mortgage_advisor":
        deals = await ctx.db.query("deals")
          .withIndex("by_mortgage_advisor", (q) => q.eq("mortgageAdvisorId", user._id))
          .collect();
        break;

      case "lawyer":
        deals = await ctx.db.query("deals")
          .withIndex("by_lawyer", (q) => q.eq("lawyerId", user._id))
          .collect();
        break;

      case "admin":
        deals = await ctx.db.query("deals").collect();
        break;

      default:
        return [];
    }

    return deals;
  },
});
```

**This pattern must be replicated in every AI tool handler.**

## Tool Handler Context (ctx)

Based on `@convex-dev/agent` documentation and verified in existing tools:

### Available Methods on `ctx` (ActionCtx)

| Method | Purpose | Security Note |
|--------|---------|---------------|
| `ctx.auth.getUserIdentity()` | Get authenticated user from JWT | Returns `null` if not authenticated |
| `ctx.runQuery(api.*, args)` | Execute database queries | Queries still enforce their own auth |
| `ctx.runMutation(api.*, args)` | Execute database mutations | Mutations still enforce their own auth |
| `ctx.storage` | File storage access | For future file-based tools |

### Critical Security Points

1. **`ctx.auth` is the source of truth for user identity**
   - Never accept a `userId` as a tool parameter
   - Always call `ctx.auth.getUserIdentity()` to get the real authenticated user
   - `ctx.auth` is `null` in scheduled functions and workflows (not applicable to agent tools)

2. **Tool handlers run in action context (ActionCtx)**
   - Actions have full access to `runQuery` and `runMutation`
   - Actions can call other actions
   - Actions do NOT have direct database access (`ctx.db` is not available)

3. **Query/Mutation auth is independent**
   - Even if a tool calls a mutation, the mutation's own auth still runs
   - This is defense-in-depth: tool checks role, mutation checks role
   - Tools should check role BEFORE calling mutations to provide better error messages

**Example from existing `propertySearch.ts` (lines 55-82):**
```typescript
handler: async (ctx, args): Promise<{...}> => {
  // This tool is read-only, calls a query
  // The query itself is public (searches available properties)
  // BUT: in a role-aware world, we'd check role here before returning data

  const properties = await ctx.runQuery(
    api.ai.tools.propertyQueries.searchProperties,
    { /* args */ }
  );

  return { properties, count: properties.length, /* ... */ };
},
```

**Enhanced for Phase 63:**
```typescript
handler: async (ctx, args): Promise<{...}> => {
  // 1. Verify auth
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // 2. Get user and calculate effective role
  const user = await ctx.runQuery(api.users.getByClerkId, {
    clerkId: identity.subject,
  });
  if (!user) {
    throw new Error("User not found");
  }

  const effectiveRole = user.role === "admin" && user.viewingAsRole
    ? user.viewingAsRole
    : user.role;

  // 3. Check if this role can use this tool
  if (effectiveRole !== "investor" && effectiveRole !== "admin") {
    throw new Error("Only investors can search properties");
  }

  // 4. Execute the query
  const properties = await ctx.runQuery(
    api.ai.tools.propertyQueries.searchProperties,
    { /* args */ }
  );

  return { properties, count: properties.length, /* ... */ };
},
```

**Source:** [Convex Agent Tools Documentation](https://docs.convex.dev/agents/tools) (HIGH confidence, verified in WebFetch)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth token verification | Custom JWT parsing | `ctx.auth.getUserIdentity()` | Convex handles it, verified and secure |
| Role-based tool selection | Complex runtime conditionals | Map of role -> tools object | Clear, testable, maintainable |
| System prompt injection | String concatenation without structure | Structured prompt builder function | Prevents injection, easier to test |
| Tool result formatting | Ad-hoc JSON serialization | Typed return values with Zod | Type safety, auto-validated |

**Key insight:** The codebase already has 32+ examples of the `effectiveRole` pattern. Don't invent a new auth pattern -- replicate the existing one.

## Common Pitfalls

### Pitfall 1: Trusting the LLM for Authorization

**What goes wrong:** Developer assumes that because the tool's description says "only for investors," the LLM will never invoke it for other roles.

**Why it happens:** Misunderstanding of LLM reliability. LLMs are probabilistic and can be manipulated via prompt injection.

**How to avoid:** Always enforce auth in the tool handler. The tool description is for the LLM's understanding, NOT for security.

**Warning signs:**
- Tool handler has no `ctx.auth.getUserIdentity()` call
- Tool description includes phrases like "ONLY for X role" without code enforcement
- Tool assumes the calling user matches a role without checking

**Example:**
```typescript
// ❌ BAD: Trusting LLM instructions
export const deleteAllDataTool = createTool({
  description: "Delete all data (ADMINS ONLY - NEVER invoke for other roles)",
  handler: async (ctx, args) => {
    // No auth check -- trusts LLM to only invoke for admins
    await ctx.runMutation(api.admin.deleteEverything, {});
  },
});

// ✅ GOOD: Enforcing auth in handler
export const deleteAllDataTool = createTool({
  description: "Delete all data (admin operation)",
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getByClerkId, {
      clerkId: identity.subject,
    });
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    await ctx.runMutation(api.admin.deleteEverything, {});
  },
});
```

**Source:** [OWASP Top 10 for Agentic Applications](https://www.practical-devsecops.com/owasp-top-10-agentic-applications/), [AI Agent Security 2026](https://www.uscsinstitute.org/cybersecurity-insights/blog/what-is-ai-agent-security-plan-2026-threats-and-strategies-explained) (HIGH confidence)

### Pitfall 2: Separate Agents Per Role

**What goes wrong:** Creating 5 different Agent instances (investorAgent, brokerAgent, etc.) and switching between them.

**Why it happens:** Seems logical -- each role gets its own agent with its own tools.

**How to avoid:** Use a single agent with dynamic tool/instruction selection. The `@convex-dev/agent` architecture supports tool override at invocation time.

**Warning signs:**
- Creating multiple `new Agent()` instances
- Storing agent selection in thread metadata
- Switching agents mid-thread

**Why this is wrong:**
- Threads can be shared across agents, but the new agent inherits the old agent's messages
- Messages may reference tools from the old agent that the new agent doesn't have
- Conversation context breaks when switching agents

**Correct pattern:**
```typescript
// Single agent definition
export const platformAssistant = new Agent(/* ... */);

// Dynamic invocation
const tools = getRoleTools(userRole);
const instructions = getRoleInstructions(userRole);

await agentThread.streamText(
  { prompt: message, system: instructions },
  { saveStreamDeltas: true, tools }
);
```

**Source:** REOS ARCHITECTURE-PLATFORM-AI.md lines 199-212 (HIGH confidence, verified)

### Pitfall 3: Forgetting Admin `viewingAsRole`

**What goes wrong:** Tool handler checks `user.role === "investor"` but doesn't handle admins viewing as investors.

**Why it happens:** Developer forgets that admins can impersonate other roles.

**How to avoid:** Always calculate `effectiveRole` first, then check against it.

**Warning signs:**
- Direct checks like `if (user.role === "investor")`
- No `viewingAsRole` handling in auth logic
- Admins can't test non-admin experiences

**Example:**
```typescript
// ❌ BAD: Ignores viewingAsRole
if (user.role !== "investor") {
  throw new Error("Investors only");
}

// ✅ GOOD: Handles viewingAsRole
const effectiveRole = user.role === "admin" && user.viewingAsRole
  ? user.viewingAsRole
  : user.role;

if (effectiveRole !== "investor") {
  throw new Error("Investors only");
}
```

**Source:** Verified in 32+ codebase files (HIGH confidence, verified)

### Pitfall 4: Role in Tool Description Instead of Enforcement

**What goes wrong:** Tool description says "(investors only)" but handler doesn't check role.

**Why it happens:** Developer thinks the description is enough to prevent misuse.

**How to avoid:** Descriptions are for the LLM's understanding. Enforcement is in the handler code.

**Warning signs:**
- Role restrictions only in description
- No auth check in handler
- Assumption that "the AI knows better"

**Example:**
```typescript
// ❌ BAD
export const investorOnlyTool = createTool({
  description: "Do investor things (investors only)",
  handler: async (ctx, args) => {
    // No auth check
  },
});

// ✅ GOOD
export const investorOnlyTool = createTool({
  description: "Do investor things",
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getByClerkId, {
      clerkId: identity.subject,
    });

    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    if (effectiveRole !== "investor" && effectiveRole !== "admin") {
      throw new Error("This tool is only available to investors");
    }

    // Execute tool
  },
});
```

### Pitfall 5: Accepting userId as Tool Parameter

**What goes wrong:** Tool accepts a `userId` parameter and uses it for auth decisions.

**Why it happens:** Seems convenient to let the LLM specify which user to operate on.

**How to avoid:** NEVER accept userId as a parameter. Always derive it from `ctx.auth.getUserIdentity()`.

**Warning signs:**
- Tool args include `userId: z.string()`
- Handler uses `args.userId` for permission checks
- Assumption that the LLM will only pass the correct userId

**Why this is catastrophic:**
- Prompt injection can make the LLM pass a different userId
- Attacker can manipulate LLM to perform actions as other users
- Complete auth bypass

**Example:**
```typescript
// ❌ CATASTROPHIC: Accepts userId from LLM
export const deleteUserDataTool = createTool({
  args: z.object({
    userId: z.string(),
  }),
  handler: async (ctx, args) => {
    // Uses args.userId without verification
    await ctx.runMutation(api.users.delete, { userId: args.userId });
  },
});

// ✅ CORRECT: Derives userId from ctx.auth
export const deleteMyDataTool = createTool({
  args: z.object({}), // No userId parameter
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getByClerkId, {
      clerkId: identity.subject,
    });

    // Uses authenticated user's ID, not LLM-provided ID
    await ctx.runMutation(api.users.delete, { userId: user._id });
  },
});
```

**Source:** [MCP Security: Protecting Infrastructure From Malicious AI Agents](https://datadome.co/agent-trust-management/mcp-security/) (HIGH confidence)

## Code Examples

Verified patterns from the existing REOS codebase and Convex Agent documentation:

### Tool Definition with Auth Enforcement

```typescript
// Source: Pattern derived from existing tools + security research
import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../../_generated/api";

export const savePropertyTool = createTool({
  description: "Save a property to the user's favorites",
  args: z.object({
    propertyId: z.string().describe("The property ID to save"),
  }),
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user and calculate effective role
    const user = await ctx.runQuery(api.users.getByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) {
      throw new Error("User not found");
    }

    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    // 3. Authorize (role check)
    if (effectiveRole !== "investor") {
      throw new Error("Only investors can save properties");
    }

    // 4. Execute action
    await ctx.runMutation(api.favorites.toggleFavorite, {
      propertyId: args.propertyId as Id<"properties">,
    });

    return {
      success: true,
      message: "Property saved to favorites",
    };
  },
});
```

### Role-Based Tool Selection

```typescript
// Source: Derived from chat.ts pattern + architecture research
// convex/ai/roles/toolSets.ts
import { searchPropertiesTool } from "../tools/propertySearch";
import { searchProvidersTool } from "../tools/providerSearch";
import { savePropertyTool } from "../tools/saveProperty";

export function getRoleTools(role: string) {
  const toolSets: Record<string, Record<string, any>> = {
    investor: {
      searchProperties: searchPropertiesTool,
      searchProviders: searchProvidersTool,
      saveProperty: savePropertyTool,
    },
    broker: {
      // Broker-specific tools
    },
    mortgage_advisor: {
      // Mortgage advisor-specific tools
    },
    lawyer: {
      // Lawyer-specific tools
    },
    admin: {
      // All tools when viewing as admin
      // When viewingAsRole is set, return that role's tools instead
    },
  };

  return toolSets[role] ?? {};
}
```

### Effective Role Calculation in sendMessage

```typescript
// Source: Existing pattern in convex/deals.ts, applied to chat.ts
// convex/ai/chat.ts (enhancement to existing code)
export const sendMessage = action({
  args: {
    message: v.string(),
    role: v.optional(v.string()),
    pageContext: v.optional(v.object({
      pageType: v.string(),
      entityType: v.optional(v.string()),
      entityId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { message, role, pageContext }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) throw new Error("User not found");

    // Calculate effective role (respects viewingAsRole for admins)
    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    // Get role-specific tools and instructions
    const roleTools = getRoleTools(effectiveRole);
    const roleInstructions = getRoleInstructions(effectiveRole);

    // Build system context with role-specific prompt
    let systemContext = roleInstructions;
    if (profileContext) systemContext += profileContext + "\n\n";
    if (pageContextString) systemContext += pageContextString + "\n\n";
    if (summary) systemContext += `## Previous Conversation Summary\n\n${summary}\n\n`;

    // Stream response with role-specific tools
    const result = await agentThread.streamText(
      {
        prompt: message || "Begin our conversation",
        system: systemContext,
      },
      {
        saveStreamDeltas: true,
        tools: roleTools, // Only tools for this role
      }
    );

    const finalText = await result.text;

    // Update thread with last used role
    await ctx.runMutation(internal.ai.threads.updateThreadRole, {
      threadId,
      role: effectiveRole,
    });

    return { success: true, threadId, response: finalText };
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tool auth via LLM instructions | Server-side auth in every handler | 2026 OWASP guidelines | Required for production LLM systems |
| Separate agents per role | Single agent with dynamic tools | Convex Agent 0.3.x | Simpler, conversation continuity |
| Client-side role checking | Server-side effectiveRole calculation | REOS v1.0+ | Respects viewingAsRole, secure |
| Global tool access | Role-scoped tool sets | 2026 security best practices | Principle of least privilege |

**Deprecated/outdated:**
- **Trusting LLM output for auth**: Never was secure, now explicitly called out in OWASP Top 10 for Agentic Applications 2026
- **AI SDK 6**: Breaks `@convex-dev/agent@0.3.2` (GitHub issue #202), stay on AI SDK 5.0.123

## Open Questions

Things that require validation during implementation:

1. **Profile Context for Non-Investors**
   - What we know: `buildProfileContext` currently only loads investor questionnaires (lines 17-132 in context.ts)
   - What's unclear: Do brokers/lawyers/admins need profile context? If so, from where?
   - Recommendation: Phase 63 focuses on role-specific prompts and tools. Profile context expansion for providers can be Phase 64+. For now, return null for non-investor roles in `buildProfileContext`.

2. **Admin ViewingAsRole in Tool Context**
   - What we know: Admin can switch viewingAsRole, and all queries/mutations respect it
   - What's unclear: Should tool responses acknowledge when admin is viewing as another role?
   - Recommendation: Tools should respect effectiveRole silently. The admin knows they're viewing as another role -- no need for the AI to remind them in every response.

3. **Tool Error Messages and LLM Handling**
   - What we know: Tool handlers throw errors when auth fails
   - What's unclear: How does the LLM handle tool errors? Does it retry? Does it tell the user?
   - Recommendation: Test in Phase 63 implementation. The AI SDK typically surfaces tool errors to the LLM, which can explain them to the user. Ensure error messages are user-friendly ("You don't have permission to do that") not technical ("effectiveRole !== 'investor'").

4. **Thread Role Switching Mid-Conversation**
   - What we know: An admin could switch viewingAsRole while a thread is active
   - What's unclear: Does the thread need to know about role changes?
   - Recommendation: Add `lastRole` field to `aiThreads` table (already planned in ARCHITECTURE-PLATFORM-AI.md line 287). Update it on each `sendMessage`. If `lastRole !== effectiveRole`, the AI can acknowledge the switch naturally.

## Sources

### Primary (HIGH confidence)

- [OWASP Top 10 for Agentic Applications 2026](https://www.practical-devsecops.com/owasp-top-10-agentic-applications/) - Security framework for autonomous AI systems
- [Access Control and Permission Management for AI Agents | Cerbos](https://www.cerbos.dev/blog/permission-management-for-ai-agents) - Role-based access patterns for AI tools
- [Secure AI Agent Infrastructure Guide 2026 | Composio](https://composio.dev/blog/secure-ai-agent-infrastructure-guide) - Brokered credentials pattern, server-side enforcement
- [Convex Agent Tools Documentation](https://docs.convex.dev/agents/tools) - createTool, ActionCtx, auth methods
- [@convex-dev/agent GitHub](https://github.com/get-convex/agent) - Thread sharing, multi-agent patterns
- REOS Codebase: `convex/ai/agent.ts` - Existing platformAssistant definition (verified)
- REOS Codebase: `convex/ai/chat.ts` - Existing sendMessage with role parameter (verified)
- REOS Codebase: `convex/users.ts` - viewingAsRole implementation (verified)
- REOS Codebase: `convex/deals.ts` - effectiveRole pattern example (verified)
- REOS Codebase: `convex/schema.ts` - userRoles union definition (verified)

### Secondary (MEDIUM confidence)

- [LLM Security 2025: Risks, Examples, and Best Practices](https://www.oligo.security/academy/llm-security-in-2025-risks-examples-and-best-practices) - General LLM security principles
- [AI Agent Security Plan 2026](https://www.uscsinstitute.org/cybersecurity-insights/blog/what-is-ai-agent-security-plan-2026-threats-and-strategies-explained) - Threat landscape overview
- [MCP Security: Protecting Infrastructure From Malicious AI Agents](https://datadome.co/agent-trust-management/mcp-security/) - Tool security vulnerabilities

### Tertiary (LOW confidence, marked for validation)

- WebSearch results about LLM tool authorization - General patterns, not Convex-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, versions verified in package.json
- Architecture: HIGH - Patterns verified in existing codebase, 32+ files use effectiveRole pattern
- Pitfalls: HIGH - Based on 2026 OWASP research and verified Convex patterns
- Security: HIGH - OWASP 2026 guidelines + Convex auth patterns established

**Research date:** 2026-02-01
**Valid until:** 60 days (stable domain, but security best practices evolve)
