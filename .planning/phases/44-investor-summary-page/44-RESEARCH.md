# Phase 44: Investor Summary Page - Research

**Researched:** 2026-01-22
**Domain:** Two-panel investor dashboard with profile summary and integrated AI assistant
**Confidence:** HIGH

## Summary

Phase 44 creates the post-onboarding destination for investors: a two-panel page combining profile management (left) with AI assistance (right). This replaces the current flow where investors are redirected to `/properties` after onboarding completion.

The technical foundation exists: questionnaire data lives in `investorQuestionnaires` table, AIChatPanel is fully built (Phase 41), and shadcn/ui Accordion/Popover/Progress components are installed. The key challenge is composing these into a cohesive summary page with inline editing that feels integrated, not bolted-on.

The standard approach uses shadcn Accordion for collapsible questionnaire sections, Popover for inline field editing, Progress for completeness tracking, and the existing AIChatPanel for chat. Profile edits save immediately to Convex, triggering AI context refresh via the agent's profile context builder. Quick reply buttons use simple Button chips that inject prompts into chat.

**Primary recommendation:** Create accordion-based ProfileSummaryPanel showing questionnaire data grouped by step, use Popover with controlled state for inline editing, compute completeness from existing ProfileCompletenessCard logic, mount AIChatPanel in right panel, add QuickReplyButtons above chat input, and route investors to `/profile/investor/summary` after onboarding completes.

## Standard Stack

The established libraries/tools for two-panel profile + AI layout:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui Accordion | latest | Collapsible questionnaire sections | Already installed, Radix primitive with animation |
| shadcn/ui Popover | latest | Inline editing popovers | Already installed, controlled positioning, ARIA support |
| shadcn/ui Progress | latest | Completeness indicator | Already installed, accessible progress bar |
| AIChatPanel | custom | Right panel chat interface | Already built (Phase 41), full streaming support |
| Convex mutations | 1.31.3+ | Save profile edits | Already in use (`investorQuestionnaires.saveAnswers`) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ProfileCompletenessCard | custom | Completeness calculation logic | Already exists, reuse calculation function |
| QuestionnaireWizard steps | custom | Form components for each section | Already built (Phases 11-14), reuse in popovers |
| react-confetti | ^6.1.0 | 100% completion celebration | Optional enhancement (if choosing confetti over checkmark) |

### Already Installed
| Library | Version | Notes |
|---------|---------|-------|
| shadcn/ui Input | latest | Text field editing |
| shadcn/ui Select | latest | Dropdown editing |
| shadcn/ui Badge | latest | Incomplete section indicators |
| shadcn/ui Button | latest | Quick reply chips, save/cancel actions |
| shadcn/ui Label | latest | Field labels in popovers |

**Installation:**
```bash
# All components already installed
# Optional: if choosing confetti celebration
npm install react-confetti
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/[locale]/(app)/
    profile/investor/
      summary/
        page.tsx              # Two-panel layout page
  components/
    profile/
      ProfileSummaryPanel.tsx     # Left panel: accordion + editing
      ProfileSection.tsx          # Single accordion section
      InlineFieldEditor.tsx       # Popover editor for a field
      ProfileCompletenessBar.tsx  # Progress bar (extract from Card)
      QuickReplyButtons.tsx       # Chat prompt shortcuts
```

### Pattern 1: Two-Panel Desktop Layout
**What:** Side-by-side profile and chat panels on desktop
**When to use:** Dashboard-style pages combining data display and interaction

**Example:**
```typescript
// Source: Standard responsive grid pattern
// app/[locale]/(app)/profile/investor/summary/page.tsx

export default function InvestorSummaryPage() {
  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Left panel: Profile summary */}
      <div className="border-r overflow-y-auto">
        <ProfileSummaryPanel />
      </div>

      {/* Right panel: AI assistant */}
      <div className="flex flex-col h-full">
        <AIChatPanel className="flex-1" />
      </div>
    </div>
  );
}
```

### Pattern 2: Accordion Sections from Questionnaire Data
**What:** Display questionnaire answers grouped by step in collapsible sections
**When to use:** Present structured data with logical groupings

**Example:**
```typescript
// Source: shadcn Accordion with controlled state
// components/profile/ProfileSummaryPanel.tsx

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const QUESTIONNAIRE_SECTIONS = [
  { id: "basics", title: "Investor Basics", fields: ["citizenship", "residencyStatus", "experienceLevel"] },
  { id: "financial", title: "Financial Context", fields: ["budgetMin", "budgetMax", "investmentHorizon"] },
  { id: "preferences", title: "Property Preferences", fields: ["preferredPropertyTypes", "preferredLocations"] },
  { id: "services", title: "Services & Timeline", fields: ["purchaseTimeline", "servicesNeeded"] },
];

export function ProfileSummaryPanel() {
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);

  if (!questionnaire) return <Skeleton />;

  // First incomplete section for auto-expand on click
  const firstIncomplete = QUESTIONNAIRE_SECTIONS.find(section =>
    section.fields.some(field => !questionnaire[field])
  );

  return (
    <div className="p-6 space-y-4">
      {/* Completeness bar at top */}
      <ProfileCompletenessBar questionnaire={questionnaire} />

      {/* Accordion sections */}
      <Accordion type="single" collapsible defaultValue="basics">
        {QUESTIONNAIRE_SECTIONS.map(section => (
          <ProfileSection
            key={section.id}
            section={section}
            questionnaire={questionnaire}
            isIncomplete={section === firstIncomplete}
          />
        ))}
      </Accordion>
    </div>
  );
}
```

### Pattern 3: Inline Editing with Popover
**What:** Click field to edit in-place, save/cancel explicitly
**When to use:** Edit individual fields without leaving context

**Example:**
```typescript
// Source: shadcn Popover with controlled state
// components/profile/InlineFieldEditor.tsx

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InlineFieldEditorProps {
  label: string;
  value: string | number | undefined;
  fieldName: string;
  onSave: (value: any) => Promise<void>;
  renderInput: (value: any, onChange: (val: any) => void) => ReactNode;
}

export function InlineFieldEditor({ label, value, fieldName, onSave, renderInput }: InlineFieldEditorProps) {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value); // Reset to original
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-left hover:bg-muted px-2 py-1 rounded transition-colors">
          <span className="text-xs text-muted-foreground">{label}</span>
          <p className="font-medium">{value || "Not set"}</p>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold">{label}</h4>

          {renderInput(editValue, setEditValue)}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Pattern 4: Completeness Indicator with Click Action
**What:** Progress bar shows completion percentage, click jumps to first incomplete
**When to use:** Guide users through multi-step data entry

**Example:**
```typescript
// Source: Existing ProfileCompletenessCard logic
// components/profile/ProfileCompletenessBar.tsx

import { Progress } from "@/components/ui/progress";
import { useCallback } from "react";

interface ProfileCompletenessBarProps {
  questionnaire: any;
  onJumpToIncomplete?: (sectionId: string) => void;
}

export function ProfileCompletenessBar({ questionnaire, onJumpToIncomplete }: ProfileCompletenessBarProps) {
  const { percent, missingFields } = calculateCompleteness(questionnaire);
  const isComplete = percent === 100;

  const handleClick = useCallback(() => {
    if (!isComplete && onJumpToIncomplete) {
      // Find first incomplete section
      const firstIncomplete = QUESTIONNAIRE_SECTIONS.find(section =>
        section.fields.some(field => !questionnaire[field])
      );
      if (firstIncomplete) {
        onJumpToIncomplete(firstIncomplete.id);
      }
    }
  }, [isComplete, questionnaire, onJumpToIncomplete]);

  return (
    <div
      className={cn(
        "sticky top-0 bg-background z-10 p-4 border-b",
        !isComplete && "cursor-pointer hover:bg-muted/50 transition-colors"
      )}
      onClick={handleClick}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Profile Completeness</span>
          <span className="text-sm text-muted-foreground">{percent}%</span>
        </div>

        <Progress value={percent} className="h-2" />

        {!isComplete && missingFields.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Missing: {missingFields.slice(0, 3).join(", ")}
            {missingFields.length > 3 && ` +${missingFields.length - 3} more`}
          </p>
        )}

        {isComplete && (
          <p className="text-xs text-green-600">✓ Profile complete</p>
        )}
      </div>
    </div>
  );
}
```

### Pattern 5: Quick Reply Buttons
**What:** Contextual prompt shortcuts above chat input
**When to use:** Guide users to common AI actions

**Example:**
```typescript
// Source: Button chip pattern
// components/profile/QuickReplyButtons.tsx

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface QuickReplyButtonsProps {
  onPromptSelect: (prompt: string) => void;
  profileComplete: boolean;
}

const BASE_PROMPTS = [
  { label: "Show properties", prompt: "Show me properties that match my preferences" },
  { label: "Build my team", prompt: "Help me find service providers for my investment" },
  { label: "Explain my options", prompt: "What are my investment options based on my profile?" },
];

export function QuickReplyButtons({ onPromptSelect, profileComplete }: QuickReplyButtonsProps) {
  const [collapsed, setCollapsed] = useState(false);

  const prompts = profileComplete
    ? BASE_PROMPTS
    : [...BASE_PROMPTS, { label: "Complete profile", prompt: "What information am I missing in my profile?" }];

  if (collapsed) {
    return (
      <div className="px-3 py-2 border-t bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="text-xs"
        >
          Show suggestions...
        </Button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-t bg-muted/30">
      <div className="flex flex-wrap gap-2">
        {prompts.map(({ label, prompt }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            onClick={() => {
              onPromptSelect(prompt);
              setCollapsed(true); // Collapse after first use
            }}
            className="text-xs"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 6: Save Mutation with AI Context Refresh
**What:** Profile edits save immediately and notify AI of changes
**When to use:** Ensure AI has current profile data

**Example:**
```typescript
// Source: Existing investorQuestionnaires.saveAnswers mutation
// components/profile/ProfileSection.tsx

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useProfileUpdate() {
  const saveAnswers = useMutation(api.investorQuestionnaires.saveAnswers);
  const { refetchMessages } = useAIChat(); // If AI context needs refresh

  const updateField = async (fieldName: string, value: any) => {
    try {
      await saveAnswers({ [fieldName]: value });
      toast.success("Saved");
      // AI context updates automatically via agent's profile context builder
      // No manual refresh needed - next message will have updated context
    } catch (error) {
      toast.error("Failed to save");
      throw error;
    }
  };

  return { updateField };
}
```

### Pattern 7: Routing After Onboarding
**What:** Redirect investors to summary page after questionnaire completion
**When to use:** Control post-onboarding flow

**Example:**
```typescript
// Source: Existing onboarding flow patterns
// app/[locale]/(app)/onboarding/questionnaire/page.tsx

const handleComplete = async () => {
  setIsSubmitting(true);
  try {
    await markComplete();
    await completeOnboarding();

    // Redirect to summary page (new)
    router.push("/profile/investor/summary");
    // Old: router.push("/dashboard") → redirected to /properties
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    setIsSubmitting(false);
  }
};
```

### Anti-Patterns to Avoid

- **Auto-save on every keystroke:** Explicit save/cancel keeps intent clear, prevents accidental changes
- **Modal dialogs for editing:** Popovers keep context visible, feel lighter-weight
- **Separate edit mode:** Inline editing is more discoverable and requires fewer clicks
- **Custom progress calculation:** Reuse ProfileCompletenessCard logic for consistency
- **Quick replies that don't collapse:** Clutters chat after conversation starts
- **Hardcoded field labels:** Use translation keys for i18n compatibility

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Completeness calculation | New percentage logic | ProfileCompletenessCard calculation | Already tested, handles all field types, translation-aware |
| Questionnaire field rendering | Custom form builder | Reuse QuestionnaireWizard step components | Already built, validated, consistent UX |
| Two-panel responsive layout | Custom media queries | CSS Grid with `lg:grid-cols-2` | Standard Tailwind pattern, mobile-first |
| Accordion animation | Custom CSS transitions | shadcn Accordion (Radix) | ARIA labels, keyboard nav, smooth animation |
| Popover positioning | Absolute positioning logic | Radix Popover primitive | Collision detection, portal rendering, focus trap |
| Profile save mutations | New update function | `investorQuestionnaires.saveAnswers` | Atomic updates, timestamp management, validation |
| 100% celebration | Custom animation | react-confetti OR simple checkmark | Accessible, performant, delightful |

**Key insight:** Phase 44 is composition, not creation. Every piece exists (AIChatPanel, ProfileCompletenessCard, questionnaire fields, accordion, popover). The work is wiring them into a cohesive page, not building new primitives.

## Common Pitfalls

### Pitfall 1: Profile and Chat Panels Different Heights
**What goes wrong:** Panels scroll independently, creating disjointed UX
**Why it happens:** Forgetting to set fixed height on grid container
**How to avoid:**
- Set explicit height on parent: `h-[calc(100vh-64px)]` (accounting for header)
- Make each panel handle overflow: `overflow-y-auto` on left, `flex flex-col h-full` on right
- AIChatPanel already handles internal scrolling (ChatMessageList + fixed input)
**Warning signs:** Chat input scrolls out of view, panels not aligned

### Pitfall 2: Popover Closes Before Save Completes
**What goes wrong:** User clicks Save, popover closes, mutation still pending
**Why it happens:** Not awaiting save in handler
**How to avoid:**
```typescript
const handleSave = async () => {
  setIsSaving(true);
  try {
    await onSave(editValue); // AWAIT the mutation
    setOpen(false); // Only close after success
  } finally {
    setIsSaving(false);
  }
};
```
**Warning signs:** Popover closes but changes don't save, race conditions

### Pitfall 3: Accordion Sections Don't Expand on Click
**What goes wrong:** Clicking progress bar doesn't expand incomplete section
**Why it happens:** Not controlling accordion state externally
**How to avoid:**
- Use controlled accordion: `value={activeSection} onValueChange={setActiveSection}`
- Progress bar click sets active section: `setActiveSection(firstIncompleteId)`
- Alternatively, scroll to section and let user expand manually
**Warning signs:** Click does nothing, or scrolls but section stays collapsed

### Pitfall 4: Quick Reply Buttons Inject Prompt Wrong
**What goes wrong:** Clicking quick reply doesn't send message, or sends empty string
**Why it happens:** Not wiring to AIChatInput's sendMessage function
**How to avoid:**
```typescript
// In summary page
<QuickReplyButtons onPromptSelect={(prompt) => {
  sendMessage(prompt); // From useAIChat hook
}} />
```
- Pass sendMessage from useAIChat hook down
- Or expose controlled input value and trigger send
**Warning signs:** Buttons clickable but nothing happens in chat

### Pitfall 5: Completeness Percentage Wrong After Edit
**What goes wrong:** User edits field, saves, percentage doesn't update
**Why it happens:** Completeness calculation not reactive to questionnaire changes
**How to avoid:**
- Use `useQuery(api.investorQuestionnaires.getByUser)` - auto-updates on mutation
- Recalculate completeness in component render (cheap, pure function)
- Don't cache percentage in state
**Warning signs:** Percentage stuck at old value, requires page refresh

### Pitfall 6: Mobile Layout Breaks Two-Panel Design
**What goes wrong:** Panels overlap or scroll horizontally on mobile
**Why it happens:** Grid always shows two columns
**How to avoid:**
- Use responsive grid: `grid-cols-1 lg:grid-cols-2`
- On mobile, stack panels vertically (profile on top, chat below)
- Consider Phase 45 for mobile-optimized tabs
**Warning signs:** Horizontal scroll on mobile, panels too narrow

### Pitfall 7: AI Context Doesn't Update After Profile Edit
**What goes wrong:** User edits budget, AI still references old value
**Why it happens:** Misunderstanding how agent context works
**How to avoid:**
- Agent's profile context builder runs on EVERY message send
- No manual refresh needed - context is always fresh
- Changes available to AI immediately after mutation completes
- Can verify by asking AI "What's my budget?" after editing
**Warning signs:** AI references stale data (verify context builder is fetching fresh data)

## Code Examples

Verified patterns from official sources:

### Two-Panel Layout with Fixed Height
```typescript
// Source: Standard responsive grid with viewport height
// app/[locale]/(app)/profile/investor/summary/page.tsx

export default function InvestorSummaryPage() {
  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Left: Profile Summary */}
      <div className="border-r overflow-y-auto bg-background">
        <ProfileSummaryPanel />
      </div>

      {/* Right: AI Assistant */}
      <div className="flex flex-col h-full">
        <AIChatPanel className="flex-1" />
      </div>
    </div>
  );
}
```

### Completeness Calculation Reuse
```typescript
// Source: Existing ProfileCompletenessCard.tsx
// Extract and reuse the calculation function

// components/profile/ProfileCompletenessBar.tsx
import { calculateCompleteness } from "./ProfileCompletenessCard";

export function ProfileCompletenessBar({ questionnaire }: { questionnaire: any }) {
  const { percent, missing } = calculateCompleteness(questionnaire, t);

  return (
    <div className="space-y-2">
      <Progress value={percent} />
      <p className="text-xs text-muted-foreground">
        {percent}% complete
        {missing.length > 0 && ` • Missing: ${missing.slice(0, 3).join(", ")}`}
      </p>
    </div>
  );
}
```

### Inline Field Editor with Controlled Popover
```typescript
// Source: shadcn Popover controlled state pattern
// https://ui.shadcn.com/docs/components/popover

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function InlineFieldEditor({ value, onSave }) {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="hover:bg-muted px-2 py-1 rounded">
          {value || "Not set"}
        </button>
      </PopoverTrigger>

      <PopoverContent>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setOpen(false);
          }}
        />
        <div className="flex gap-2 mt-2">
          <Button onClick={async () => {
            await onSave(editValue);
            setOpen(false);
          }}>Save</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Quick Reply Integration with useAIChat
```typescript
// Source: Existing useAIChat hook
// components/profile/QuickReplyButtons.tsx

export function QuickReplyButtons({ onPromptSelect }: { onPromptSelect: (prompt: string) => void }) {
  const prompts = [
    { label: "Show properties", prompt: "Show me properties matching my preferences" },
    { label: "Build my team", prompt: "Help me find service providers" },
  ];

  return (
    <div className="flex gap-2 px-3 py-2 border-t">
      {prompts.map(({ label, prompt }) => (
        <Button
          key={label}
          variant="outline"
          size="sm"
          onClick={() => onPromptSelect(prompt)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

// In summary page:
const { sendMessage } = useAIChat();

<QuickReplyButtons onPromptSelect={sendMessage} />
```

### Post-Onboarding Routing Update
```typescript
// Source: Existing onboarding/questionnaire/page.tsx
// app/[locale]/(app)/onboarding/questionnaire/page.tsx

const handleComplete = async () => {
  setIsSubmitting(true);
  try {
    await markComplete();
    await completeOnboarding();

    // NEW: Redirect to summary page
    router.push("/profile/investor/summary");

    toast.success("Profile complete! Welcome to REOS.");
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    setIsSubmitting(false);
  }
};
```

### Accordion Section with Inline Editing
```typescript
// Source: shadcn Accordion with custom trigger content
// components/profile/ProfileSection.tsx

export function ProfileSection({ section, questionnaire }: ProfileSectionProps) {
  const { updateField } = useProfileUpdate();
  const incomplete = section.fields.some(field => !questionnaire[field]);

  return (
    <AccordionItem value={section.id}>
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <span>{section.title}</span>
          {incomplete && <Badge variant="destructive" className="text-xs">Incomplete</Badge>}
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-3">
          {section.fields.map(fieldName => (
            <InlineFieldEditor
              key={fieldName}
              label={t(`fields.${fieldName}`)}
              value={questionnaire[fieldName]}
              onSave={(value) => updateField(fieldName, value)}
              renderInput={(value, onChange) => (
                <Input value={value} onChange={(e) => onChange(e.target.value)} />
              )}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate edit page | Inline editing with popovers | Modern UX patterns (2024+) | Less navigation, faster edits, context preserved |
| Modal dialogs for editing | Popover with explicit save/cancel | Radix primitives adoption | Lighter weight, better mobile UX |
| Redirect to properties after onboarding | Summary page with AI | AI-first product strategy (2026) | Clearer next steps, AI onboarding |
| Profile page without AI | Integrated AI assistant | Phase 41-43 completion | Conversational profile management |
| Separate "build team" page | Quick reply prompts in chat | Conversational UI patterns | More discoverable, natural flow |
| Progress in separate card | Sticky progress bar | Dashboard UX patterns | Always visible, actionable |

**Deprecated/outdated:**
- **Full-page forms for profile editing:** Replaced by inline editing with popovers
- **Dashboard redirect for investors:** v1.6 introduces summary page as investor home
- **Static profile displays:** Now supports live editing and AI interaction

## Open Questions

Things that couldn't be fully resolved:

1. **Celebration Animation Choice**
   - What we know: Context specifies "confetti or checkmark animation" at 100%
   - What's unclear: Which provides better UX without feeling cheesy
   - Recommendation: Start with simple checkmark + "Profile Complete!" text, add confetti if user testing shows it's delightful (react-confetti is easy to add later)

2. **Quick Reply Button Persistence**
   - What we know: Buttons should "collapse to expandable icon after conversation starts"
   - What's unclear: Should this collapse after first message, or first button click?
   - Recommendation: Collapse after first button click (user engaged with suggestions), show "Show suggestions..." button to expand again

3. **Mobile Layout Strategy**
   - What we know: Phase 45 handles mobile-optimized experience
   - What's unclear: Should Phase 44 implement basic mobile stacking or wait for Phase 45 tabs?
   - Recommendation: Phase 44 uses simple `grid-cols-1 lg:grid-cols-2` stacking (profile top, chat bottom on mobile), Phase 45 enhances with tabs if needed

4. **Field-Specific Edit Components**
   - What we know: Different fields need different inputs (text, select, multi-select, number range)
   - What's unclear: Build generic InlineFieldEditor or field-specific components?
   - Recommendation: Generic InlineFieldEditor with `renderInput` prop - lets each field customize while sharing save/cancel logic

5. **Accordion Default Expand Behavior**
   - What we know: Context says "First section expanded by default, rest collapsed"
   - What's unclear: Should first *incomplete* section be expanded, or always the first section?
   - Recommendation: First incomplete section (guides user to what needs completion), falls back to first section if all complete

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Accordion](https://ui.shadcn.com/docs/components/accordion) - Radix primitive, controlled state, defaultValue
- [shadcn/ui Popover](https://ui.shadcn.com/docs/components/popover) - Controlled open state, positioning, portal rendering
- [shadcn/ui Progress](https://ui.shadcn.com/docs/components/progress) - Accessible progress bar, value prop
- convex/investorQuestionnaires.ts - Existing saveAnswers mutation (verified via file read)
- src/components/profile/ProfileCompletenessCard.tsx - Existing completeness calculation (verified via file read)
- src/components/ai/AIChatPanel.tsx - Existing chat panel component (verified via file read)

### Secondary (MEDIUM confidence)
- src/components/questionnaire/QuestionnaireWizard.tsx - Reusable step components (verified via file read)
- src/app/[locale]/(app)/onboarding/questionnaire/page.tsx - Post-completion routing (verified via file read)
- .planning/phases/43-dream-team-builder/43-CONTEXT.md - Accordion pattern with defaultValue (verified context consistency)
- .planning/phases/42-property-recommendations/42-RESEARCH.md - Inline card rendering patterns (verified approach)

### Tertiary (LOW confidence)
- None - All patterns verified via codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components already installed and verified in codebase
- Architecture: HIGH - Composition of existing components, patterns verified in similar phases
- Inline editing: HIGH - shadcn Popover documented, pattern common in modern dashboards
- AI integration: HIGH - AIChatPanel exists, useAIChat hook tested in Phase 41-43
- Routing: HIGH - Existing routing patterns clear, dashboard.tsx shows current investor redirect

**Research date:** 2026-01-22
**Valid until:** ~60 days (stable stack, mature patterns, no external dependencies changing)

**Note:** Phase 44 is pure composition. Zero new infrastructure needed - AIChatPanel (Phase 41), ProfileCompletenessCard (Phase 15), Accordion/Popover/Progress (shadcn), questionnaire steps (Phases 11-14), and saveAnswers mutation all exist. The work is layout, wiring, and UX polish.
