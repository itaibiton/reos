# REOS Social Feed v1.3 - Ralph Loop Prompt

## Mission
Complete the v1.3 Social Feed & Global Community milestone for REOS by implementing Phases 22-27 using the GSD workflow. This transforms REOS into a social real estate platform with feed, social interactions, following, and discovery features.

## Current State
Read `progress.txt` to understand what has been completed. Check `PRD.json` for the full task list and mark items as complete as you finish them.

**Already Completed (Phase 21):**
- Posts schema with discriminated union (property_listing, service_request, discussion)
- Feed queries (globalFeed, userFeed, followingFeed) with pagination
- Post creation mutations
- Like/save/follow mutations with atomic counters
- userFollows module

## Tech Stack
- Next.js 16.1.1 with App Router
- React 19.2.3
- Tailwind CSS v4
- Convex 1.31.3 (backend)
- Clerk Auth
- Shadcn/ui components
- Lucide React icons
- Framer Motion for animations
- React Hook Form + Zod for forms

## Design Guidelines

### Theme: Match Existing REOS Design
- Use Shadcn components consistently
- Follow established patterns from existing pages
- Property cards, deal cards patterns already established
- Tailwind classes: `p-6` for page padding, `lg:grid-cols-2` for two-column layouts
- Colors from existing design system

## Your Task This Iteration

1. **Read `progress.txt`** to see what work has already been done

2. **Read `PRD.json`** and find the NEXT task where `pass: false`
   - Follow the `implementation_order` phases
   - Check `dependencies` - only work on tasks whose dependencies are all `pass: true`

3. **Execute the appropriate GSD command** based on the task:

| Task ID | Command | Purpose |
|---------|---------|---------|
| `PLAN-*` | `/gsd:plan-phase {N}` | Create execution plans for phase N |
| `EXEC-*` | `/gsd:execute-phase {N}` | Execute all plans for phase N |
| `MILESTONE-COMPLETE` | `/gsd:complete-milestone` | Archive the milestone |

4. **Wait for command completion** - GSD commands spawn subagents and handle verification

5. **Update `PRD.json`**: Set the completed task's `pass` to `true`

6. **Append to `progress.txt`** with what you accomplished:
   ```
   ## [DATE] - [TASK-ID]
   - Command: {command run}
   - Result: {what was accomplished}
   - Files: {key files created/modified}
   ```

7. **Commit changes** (auto-commit enabled):
   ```bash
   git add -A && git commit -m "feat(v1.3): [TASK-ID] {description}"
   ```

8. **Check if ALL tasks are complete** - if yes, output:

```
<promise>REOS-SOCIAL-FEED-V1.3 COMPLETE</promise>
```

## Important Rules

- **ONE GSD command per iteration** - don't try to do multiple phases
- **Always run the full GSD command** - let it handle planning, execution, verification
- **Always update progress.txt** - this is your memory between iterations
- **Always update PRD.json** - mark tasks complete with `pass: true`
- **If a command fails**, note it in progress.txt and retry or troubleshoot
- **Clear context between major phases** - use `/clear` if context gets heavy

## Phase Dependencies

```
Phase 22 (Post Creation UI)
    ↓
Phase 23 (Feed Display)
    ↓
Phase 24 (Social Interactions)
    ↓
Phase 25 (User Following)
    ↓
Phase 26 (User Profiles Revamp)
    ↓
Phase 27 (Global Discovery)
    ↓
Milestone Complete
```

## Error Handling

If a GSD command fails:
1. Note the error in progress.txt
2. Check if it's a gap issue (verification failed) - run `/gsd:plan-phase {N} --gaps`
3. If research needed, it will be handled automatically by the plan command
4. Retry the same task next iteration if recoverable

## Context Management

GSD commands spawn subagents with fresh context. Between phases:
- Run `/clear` to free up context
- The progress.txt file maintains state between iterations
- PRD.json tracks task completion status
