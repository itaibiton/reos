---
phase: 06-deal-flow
plan: 03
subsystem: api
tags: [convex, file-storage, drag-drop, upload]

# Dependency graph
requires:
  - phase: 06-01
    provides: deals schema and CRUD
  - phase: 06-02
    provides: service provider request flow
provides:
  - dealFiles table with Convex storage
  - File upload/download mutations and queries
  - FileUpload component with drag-drop
affects: [06-04, 06-05, dashboards]

# Tech tracking
tech-stack:
  added: []
  patterns: [Convex file storage, drag-drop upload]

key-files:
  created:
    - convex/dealFiles.ts
    - src/components/deals/FileUpload.tsx
  modified:
    - convex/schema.ts

key-decisions:
  - "File categories: contract, id_document, financial, legal, other"
  - "Visibility options: all participants vs providers_only"
  - "10MB max file size limit"

patterns-established:
  - "Convex storage pattern: generateUploadUrl → POST file → saveFile with storageId"
  - "Visibility-based access control for deal files"

issues-created: []

# Metrics
duration: 3min
completed: 2026-01-15
---

# Phase 6 Plan 03: File Storage Per Deal Summary

**Convex file storage for deals with drag-drop upload, visibility controls, and participant-based access**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-15T12:21:28Z
- **Completed:** 2026-01-15T12:25:19Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- dealFiles table with file metadata and Convex storage references
- Complete file CRUD operations with participant access control
- Visibility filtering (all vs providers_only) for sensitive documents
- Drag-and-drop FileUpload component with validation and progress

## Task Commits

Each task was committed atomically:

1. **Task 1: Add dealFiles table to schema** - `26a2dc0` (feat)
2. **Task 2: Create dealFiles.ts with storage operations** - `e8c5dfb` (feat)
3. **Task 3: Create FileUpload component** - `88692df` (feat)

**Plan metadata:** `94d73b5` (docs: complete plan)

## Files Created/Modified
- `convex/schema.ts` - Added dealFiles table with fileCategory and fileVisibility unions
- `convex/dealFiles.ts` - Storage operations (generateUploadUrl, saveFile, deleteFile, listForDeal, getDownloadUrl)
- `src/components/deals/FileUpload.tsx` - Drag-drop upload with category, description, visibility controls

## Decisions Made
- File categories defined: contract, id_document, financial, legal, other
- Visibility options: "all" (all participants) or "providers_only" (service providers only)
- File size limit: 10MB
- Allowed file types: PDF, Word docs, JPEG, PNG

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - execution was smooth.

## Next Step
Ready for 06-04-PLAN.md (Deal transitions & handoffs)

---
*Phase: 06-deal-flow*
*Completed: 2026-01-15*
