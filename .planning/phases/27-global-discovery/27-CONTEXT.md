# Phase 27: Global Discovery - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Search posts/users globally, surface trending content, and provide personalized recommendations. Users can find any content across the platform, see what's hot, and get suggestions tailored to their role and activity.

</domain>

<decisions>
## Implementation Decisions

### Search Experience
- **Unified search** — Single search bar returns posts, users, properties, and hashtags in combined results
- **Header search bar** — Always-visible search in the app header
- **Autocomplete** — Shows matching users + recent searches as user types
- **Debounce** — 300-400ms delay after typing stops before searching
- **Minimum characters** — 1 character triggers search
- **Searchable content:**
  - Post content (text/descriptions)
  - User names & bios
  - Properties (city, address, title)
  - Hashtags/topics
- **Result flow:**
  - Dropdown shows top results as you type
  - Full search page (/search?q=query) for all results
- **Search history** — Server-side (syncs across devices), shown in autocomplete
- **Empty results** — "No results" message + suggestions (trending content, popular users)

### Search Results Page
- **Layout** — Categorized sections by default, tabs to filter to one type (All/Posts/Users/Properties)
- **Default sort** — Relevance (best match first)
- **Filters available:**
  - Content type (posts/users/properties)
  - Date range (past week, month, etc.)
  - User role (investors, brokers, lawyers, etc.)
  - Location (city or area)
  - Sort order (relevance, date, popularity)
- **Card density** — Varies by type (users compact, posts/properties richer with images)
- **Pagination** — Infinite scroll
- **Property results** — Show links to both property detail page and feed post

### Trending Content
- **What can trend:** Posts, properties, topics/hashtags (not users)
- **Time windows:** Multiple — "Today" and "This Week" sections
- **Items shown:** 10 per section
- **Appears in:**
  - Home/discover page
  - Search page (when empty)
  - Feed sidebar widget
  - Dedicated Trending tab/page

### Recommendations
- **Types provided:**
  - People to follow
  - Posts you might like
  - Properties for you
  - Similar to what you viewed ("More like this")
- **Personalization signals:**
  - User role (investor vs broker vs lawyer)
  - Questionnaire answers (budget, location, goals)
  - Engagement history (likes, saves, views)
  - Following network activity
- **"People to follow" locations:**
  - Feed sidebar ("Suggested for you")
  - Profile pages ("Similar profiles")
  - Onboarding flow
  - Empty following feed state
- **Refresh strategy** — Fresh recommendations on every page load

### Claude's Discretion
- Search ranking algorithm implementation
- Trending score calculation (engagement velocity, time decay)
- Recommendation scoring/ranking logic
- Exact debounce timing within 300-400ms range
- Loading states and skeleton designs
- Error handling for search failures

</decisions>

<specifics>
## Specific Ideas

- Hybrid search result flow: dropdown for quick results while typing, full page when submitted
- Property search should feel connected to both marketplace (detail page) and social feed (post context)
- Trending should show momentum (what's gaining traction) not just total popularity

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-global-discovery*
*Context gathered: 2026-01-19*
