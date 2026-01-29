# Phase 58 Research: Client Management & Process Timeline

## Goal

Approved vendors can view all their clients, access per-client documents, and see a visual timeline of each client's deal progress.

## Key Findings

### 1. Existing Deal Schema & Queries

**deals table (schema.ts:440-473):**
- `investorId`: The client (investor) user ID
- `stage`: Current deal stage (interest → broker_assigned → mortgage → legal → closing → completed | cancelled)
- `brokerId`, `mortgageAdvisorId`, `lawyerId`: Service provider assignments
- `stageHistory`: Array of stage transitions with timestamps and notes
- `createdAt`, `updatedAt`: Deal timestamps
- Indexes: `by_broker`, `by_mortgage_advisor`, `by_lawyer`

**deals.ts queries:**
- `list`: Role-based deal listing (lines 19-92)
  - Switches on user role (investor, broker, mortgage_advisor, lawyer, admin)
  - Uses appropriate index (by_broker, by_mortgage_advisor, by_lawyer)
  - Returns deals sorted by `createdAt` descending
- `listWithProperties`: Enriched deals with property data (lines 95-185)
  - Same role-based filtering as `list`
  - Populates property: title, address, city, priceUsd, featuredImage, images
- `get`: Single deal access check (lines 188-225)
  - Verifies user is participant or admin
- `getActivityLog`: Deal activity history (lines 778-841)
  - Returns dealActivity entries for a deal
  - Enriched with actor name/image

**7-stage deal flow:**
1. `interest` - Investor expressed interest (initial)
2. `broker_assigned` - Broker is working with investor
3. `mortgage` - With mortgage advisor
4. `legal` - With lawyer
5. `closing` - In final closing process
6. `completed` - Deal closed (terminal)
7. `cancelled` - Deal cancelled (terminal)

### 2. Deal Files Schema

**dealFiles table (schema.ts:502-527):**
- `dealId`: Reference to deal
- `uploadedBy`: User who uploaded the file
- `storageId`: Convex file storage ID
- `fileName`, `fileType`, `fileSize`: File metadata
- `category`: contract | id_document | financial | legal | other
- `description`: Optional description
- `visibility`: all | providers_only
- `createdAt`: Upload timestamp
- Index: `by_deal`

### 3. Users Schema

**users table (schema.ts:209-239):**
- `name`, `email`, `imageUrl`: User display info
- `customImageStorageId`: Custom profile photo (Phase 57)
- `role`: User role (investor, broker, mortgage_advisor, lawyer, admin)

### 4. Deal Constants

**DEAL_STAGES (deal-constants.ts:2-10):**
- Maps stage keys to display labels and colors
- Example: `broker_assigned: { label: "With Broker", color: "bg-purple-100 text-purple-800" }`

## Implementation Strategy

### Plan 58-01: Client List & Document Access

**Backend (Convex):**
1. New query: `getMyClients` (in deals.ts)
   - Use existing role-based indexes (by_broker, by_mortgage_advisor, by_lawyer)
   - Return deals with enriched investor data (name, email, imageUrl)
   - Include: investorName, currentStage, dealStartDate, dealId
   - Sort by most recent first

2. New query: `getClientDocuments` (new file: clientManagement.ts)
   - Args: `{ clientId: v.id("users") }` (investor user ID)
   - Get all deals for current provider where investorId matches
   - For each deal, get dealFiles via `by_deal` index
   - Group files by deal, return with deal context (property, stage)
   - Access check: only return docs for deals where user is assigned provider

**Frontend (Next.js):**
3. Client list page: `/dashboard/clients`
   - Table with columns: Client Name, Property, Current Stage, Start Date, Actions
   - Filter/search by client name
   - Click row → view client details with documents

4. Client documents view: `/dashboard/clients/[clientId]`
   - List all deals for this client (grouped)
   - For each deal: property info + stage + document list
   - Document download via Convex storage URL
   - Categorized by file category (contract, financial, legal, etc.)

### Plan 58-02: Process Timeline Visualization

**Timeline Component Requirements:**
1. Visual representation of 7-stage deal flow
2. Current stage highlighted
3. Stage transition dates displayed
4. Past stages marked as complete
5. Future stages marked as pending
6. Responsive design (mobile-friendly)

**Implementation:**
1. New component: `ProcessTimeline.tsx`
   - Props: `{ deal: Deal }` (includes stageHistory)
   - Parse stageHistory to extract transition dates
   - Map DEAL_STAGES to timeline steps
   - Use Tailwind for styling (stepper pattern)
   - Icons for completed/current/pending states

2. Integration:
   - Add to client detail page below documents
   - Reusable on deal detail pages
   - Show for each active deal in client list

**Data requirements:**
- Deal stage (current)
- Stage history array (transitions with timestamps)
- Stage labels and colors (from deal-constants.ts)

## Dependencies

**Phase 57 (Vendor Onboarding & Admin Approval) - COMPLETE:**
- Approval workflow ensures only approved vendors can access client management
- Profile photos for vendor display
- Grandfathering: existing providers are auto-approved

**Convex schema:**
- No schema changes needed (all required fields exist)
- Leverage existing indexes and queries

**Frontend patterns:**
- Use existing dashboard layout
- Follow existing table/list patterns from provider dashboard
- Reuse file download patterns from deal files

## Technical Decisions

1. **Client identification:** Use `investorId` from deals table (investor = client in vendor context)
2. **Query pattern:** Extend deals.ts with vendor-facing queries (similar to `list` and `listWithProperties`)
3. **Document access:** Leverage existing dealFiles table and `by_deal` index
4. **Timeline visualization:** Pure client-side component (no new backend logic)
5. **Route structure:** `/dashboard/clients` (list) and `/dashboard/clients/[clientId]` (detail)
6. **Access control:** Server-side checks ensure provider only sees their assigned deals

## Edge Cases

1. **Investor with multiple deals:** Group documents by deal, show all deals in client view
2. **No documents:** Display empty state with prompt to add documents
3. **Deal cancelled:** Show in timeline but with cancelled styling
4. **Provider not assigned yet:** Should not see client until assigned (query filters)
5. **Deal with no stage history:** Use `createdAt` as initial timestamp

## Performance Considerations

1. **Client list:** Paginate if >50 clients (unlikely in early MVP)
2. **Document queries:** Index on `by_deal` ensures fast lookups
3. **Timeline rendering:** Memoize component to avoid re-renders
4. **File downloads:** Use Convex storage URLs (pre-signed, efficient)

## Testing Plan

1. **Backend queries:**
   - Broker sees only their deals' clients
   - Mortgage advisor sees only their deals' clients
   - Lawyer sees only their deals' clients
   - Cannot access another provider's clients
   - Returns empty for investor/admin roles

2. **Document access:**
   - Provider can download files from their deals
   - Cannot access files from deals they're not assigned to
   - Files grouped correctly by deal

3. **Timeline rendering:**
   - All 7 stages displayed
   - Current stage highlighted
   - Dates formatted correctly
   - Mobile-responsive layout

## Success Metrics

- Vendor can see list of all their clients (investors)
- Each client shows current deal stage and start date
- Vendor can view all documents for a client's deals
- Visual timeline displays 7-stage flow with dates
- Access control: vendor only sees their assigned deals
