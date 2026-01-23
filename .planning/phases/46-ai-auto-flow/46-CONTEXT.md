# Phase 46: AI Auto-Flow Context

## User Requirements

### Flow After Questionnaire Completion

1. **Questionnaire Completion** → User finishes all steps
2. **Redirect to Summary Page** → Two-panel (desktop) or tabbed (mobile) layout
3. **AI Initiates Conversation** → AI speaks first, not the user
4. **Automatic Property Suggestions** → AI triggers property search based on profile
5. **Property Cards Display** → Show as interactive cards (not plain text)
   - Each card has individual "Save" button
   - Batch "Save All" button at the bottom
6. **Automatic Provider Suggestions** → After properties, AI suggests providers
   - Grouped by role (Broker, Mortgage Advisor, Lawyer)
   - Each card has "Add to Team" button
7. **Quick Replies Remain** → Keep buttons for follow-up queries

### Questionnaire Persistence

- On first sign up/sign in → investor gets questionnaire
- Can skip, but popup keeps appearing on subsequent visits
- Questionnaire wizard: can go back, but forward is sequential only
- After completion → never show popup again

## Current State

### What Exists (from Phase 42-44)

1. **Property Search Tool** - `searchProperties` in `convex/ai/tools/propertySearch.ts`
2. **Provider Search Tool** - `searchProviders` in `convex/ai/tools/providerSearch.ts`
3. **PropertyRecommendationCard** - Card component with match reasons
4. **ProviderRecommendationCard** - Card with role badge and match reasons
5. **SaveAllButton** - Batch save for properties
6. **PropertyCardRenderer** - Renders property tool results
7. **ProviderCardRenderer** - Renders provider tool results with accordion grouping
8. **Quick Reply Buttons** - "Show me properties", "Build my team"
9. **AIChatPanel** - Main chat container with streaming support

### What Needs to Change

1. **AI Auto-Greeting** - Trigger on first page load after questionnaire
2. **Auto Property Search** - AI calls tool without user prompt
3. **Auto Provider Search** - AI calls tool after properties shown
4. **Card Rendering** - Ensure cards render (not just text)
5. **Questionnaire Popup Persistence** - Show until completed, not just once

## Key Files to Modify

- `src/app/[locale]/(app)/profile/investor/summary/page.tsx` - Trigger auto-flow
- `convex/ai/chat.ts` - Support auto-initiated messages
- `convex/ai/agent.ts` - Auto-trigger tool calls
- `src/components/ai/AIChatPanel.tsx` - Handle auto-greeting state
- Questionnaire popup component - Persistence logic

## Success Criteria

1. After questionnaire → AI sends greeting automatically
2. AI shows properties as cards with Save + Save All buttons
3. AI shows providers as cards grouped by role with Add to Team buttons
4. Questionnaire popup persists until completed
5. Quick reply buttons remain after auto-suggestions

## Design Decisions Needed

1. **Auto-greeting trigger** - How to detect "first visit after questionnaire"?
   - Option A: Store flag in questionnaire record
   - Option B: Check if AI thread has messages
   - Option C: New `hasSeenAutoGreeting` field on user

2. **Auto tool calls** - How should AI chain property → provider suggestions?
   - Option A: Two separate messages (property greeting, provider greeting)
   - Option B: Single message that calls both tools
   - Option C: Wait for user acknowledgment between

3. **Card rendering reliability** - Why might cards show as text?
   - Need to investigate current tool call rendering logic
   - Ensure tool results are properly extracted and rendered
