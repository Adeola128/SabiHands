# Ralvo Technical SEO Audit and Search-Growth Plan

**Prepared by:** Manus AI**Audit date:** 24 August 2026**Website:** [ralvo.com.ng](https://www.ralvo.com.ng/)**Scope:** Technical SEO, indexation, JavaScript rendering, public gig discoverability, structured data, Nigerian search intent, content architecture, performance, and measurement.

## Executive summary

Ralvo has a clear and potentially valuable search position: it can connect Nigerian volunteers with verified NGO opportunities, skills-based gigs, remote service opportunities, certificates, and eventually paid work. The strongest search opportunity is not a single broad keyword such as “jobs.” It is the intersection of **Nigerian volunteer opportunities, NGO volunteer jobs, remote volunteering, graduate/NYSC experience, skills-based service, and verifiable certificates**.

The immediate problem is technical rather than merely editorial. The public site is delivered as a client-rendered single-page application. In a raw HTTP audit, the homepage, gig URLs, organization URLs, volunteer pages, policy pages, and verification pages all returned the same 4,320-byte application shell, the same homepage title, and the same homepage canonical URL. The raw HTML contained no extracted headings or crawlable links. The public gig became readable only after JavaScript ran in a browser. This architecture can work, but it is a weak foundation for a marketplace that needs every public gig and organization page to be independently discoverable.

The second critical issue is that `https://www.ralvo.com.ng/sitemap.xml` currently returns only `Error generating sitemap`. Robots.txt correctly points to that URL, but Google cannot use an error page as a URL inventory. The third critical issue is canonical leakage: the selected gig’s raw and rendered audit returned `https://www.ralvo.com.ng/` as its canonical instead of the gig URL. The client bundle contains route-specific metadata and `JobPosting` JSON-LD code, but the runtime audit still exposed the homepage canonical/description and a site-wide entity graph alongside the gig markup.

The correct order is therefore **indexable foundations first, content architecture second, AI/search enhancements third**. Do not spend heavily on backlinks or large content production until the sitemap, SSR/ISR, canonical tags, live/expired posting rules, and public internal linking are repaired.

## Do you need an extension or connector?

You do not need a connector for the initial technical diagnosis; the public site exposed enough evidence to identify major blockers. You do need first-party measurement access before making claims about rankings, impressions, click-through rate, search queries, or Core Web Vitals.

| Tool or access | Need | Why |
| --- | --- | --- |
| Google Search Console for the verified Ralvo property | **Essential** | Query/page/country performance, coverage, canonical selection, sitemap errors, enhancements, manual actions, URL Inspection, and Core Web Vitals |
| Google PageSpeed Insights or Lighthouse run under the owner’s property | **Essential** | Numeric mobile performance and accessibility baselines; the public API attempt was blocked by a zero/exhausted quota |
| Google Analytics 4 | Strongly recommended | Organic landing pages, signup/apply funnel, volunteer/organization conversion, and engagement by landing template |
| Microsoft Clarity or PostHog | Recommended | Session recordings, rage clicks, scroll depth, form abandonment, and evidence for SEO landing-page UX improvements |
| DataForSEO | Recommended for keyword research | Search volume, competition, SERP features, local/Nigeria keyword variants, and competitor visibility; it is present in the current connector configuration but disabled |
| Ahrefs or Semrush | Optional | Backlink gap, competitor content gap, and rank tracking; not necessary for the first technical repair cycle |

The most useful next access is **Google Search Console**. If you add only one integration, add or connect Search Console. If you want properly quantified keyword research, enable **DataForSEO** after confirming the account and budget. Do not enable several overlapping SEO tools until Search Console is producing reliable first-party data.

## Verified baseline

### Technical evidence collected

| Check | Result | Assessment |
| --- | --- | --- |
| Homepage HTTP status | 200 over HTTP/2 through Vercel | Good baseline |
| HTTPS/security headers | HSTS, `x-content-type-options: nosniff`, and `x-frame-options: DENY` present | Positive security baseline |
| `robots.txt` | Allows `/`; disallows `/dashboard/`, `/admin/`, `/onboarding/`; points to sitemap | Directionally correct |
| `sitemap.xml` | Body is `Error generating sitemap` | **Critical failure** |
| Homepage title | `Ralvo — Find Volunteer Opportunities & NGO Gigs in Nigeria` | Good homepage starting point |
| Homepage description | Unique and relevant to volunteers/NGOs | Good starting point |
| Homepage canonical | Homepage URL | Correct for homepage |
| Public gig raw HTML | Same SPA shell as homepage; generic title/canonical | **Critical indexability weakness** |
| Public gig rendered DOM | Gig content visible after JavaScript; canonical remained homepage in console audit | **Critical canonical problem** |
| Raw headings/links | No extracted H1/H2/H3 or anchor links in raw shell | **High crawlability weakness** |
| JSON-LD | Homepage Organization/WebSite graph plus dynamic JobPosting template in bundle | Incomplete/fragile until rendered and validated |
| Dynamic gig metadata | Bundle contains route-specific title/description/OG/canonical code, but raw HTML does not | Move to server-rendered metadata |
| Gig application URL | `/signup` rather than a gig-specific apply route | High conversion and tracking problem |
| Mobile viewport | Includes `maximum-scale=1.0, user-scalable=no` | Accessibility problem |
| Performance measurement | PageSpeed API returned HTTP 429 quota error | Numeric performance score not asserted |

Google states that JavaScript pages can be rendered, but recommends crawlable links, meaningful titles and snippets, canonical URLs that agree with the original HTML, correct status codes, and testing through URL Inspection and the Rich Results Test.[1] Ralvo’s current raw responses do not yet meet that standard reliably for public marketplace pages.

## Critical technical repairs

### 1. Build a real dynamic sitemap

Replace the error response with a valid UTF-8 XML sitemap or sitemap index. It should contain only canonical public URLs that Ralvo wants indexed: the homepage, useful category/location/skill landing pages, verified organization pages, active public opportunities, and selected evergreen guides. It should not contain dashboard pages, login/signup pages, search-result pages, empty filter combinations, expired gigs, or duplicate query-string URLs.

Use absolute URLs and accurate `lastmod` values. Google’s sitemap guidance states that sitemaps should contain canonical absolute URLs and that the sitemap is a hint rather than a guarantee of indexing.[2] Google’s job guidance additionally recommends the Indexing API for notifying Google about new or changed job-posting URLs, while retaining a sitemap for broader site coverage.[3]

Recommended sitemap structure:

```
/sitemap.xml                 sitemap index
/sitemaps/static.xml         homepage, about, FAQ, privacy, terms, guides index
/sitemaps/opportunities.xml  active public gig URLs
/sitemaps/organizations.xml  verified organization URLs with public pages
/sitemaps/guides.xml         evergreen volunteer and NGO guidance
```

Add a CI test that fetches the production sitemap and checks that it returns HTTP 200, valid XML, canonical URLs only, no dashboard URLs, no duplicate URLs, and no expired opportunities.

### 2. Move public SEO metadata to SSR, ISR, or reliable prerendering

The current site behaves like a Vite/React SPA from raw HTTP. For public routes, migrate to a framework or rendering layer that emits complete HTML per route. Since the product is React-based, **Next.js App Router with server components and ISR** is the most practical option if a migration is feasible. If a full migration is not feasible immediately, add a prerendering service for public gig and organization pages while keeping the authenticated app as an SPA.

Each public gig response should contain, before JavaScript runs:

```html
<title>Content Manager Volunteer Opportunity in Nigeria | Ralvo</title>
<meta name="description" content="Apply for a remote Content Manager volunteer opportunity with Ralvo. Build practical experience and earn a verified certificate on completion.">
<link rel="canonical" href="https://www.ralvo.com.ng/gig/content-manager-8a8dd91b">
<h1>Content Manager Volunteer Opportunity</h1>
```

The same route-specific values must also be present after JavaScript renders. There should be exactly one title, one description, and one canonical link. Google’s JavaScript guidance specifically recommends setting canonical and metadata consistently and verifying the final rendered page.[1]

### 3. Repair canonical URLs and route identity

The audit found that the Content Manager gig’s canonical was the homepage URL, both in the raw response and in the rendered DOM inspection. This tells search engines that the gig is a duplicate of the homepage. It can prevent the gig from appearing as an individual result even if Google successfully renders its content.

Use readable slugs plus a short immutable ID, for example:

```
/opportunities/content-manager-8a8dd91b
/organizations/ralvo
/organizations/rootline-foundation
/skills/content-management
/locations/lagos/volunteer-opportunities
```

Keep UUIDs internally, but expose stable, human-readable URLs publicly. Redirect old UUID URLs to the slug URL with a permanent redirect when the slug changes. Do not create separate indexable pages for every combination of filters.

### 4. Handle expired gigs correctly

The inspected gig’s generated `JobPosting` JSON-LD had `validThrough` set to 12 August 2026, while the audit date was 24 August 2026, yet the page remained an open-looking application page. Google states that expired job postings should be removed, return 404/410, or have their job markup removed/expired, and warns that stale postings can lead to manual action.[3]

Implement this state machine:

| Gig state | Public page | Indexing | JobPosting markup |
| --- | --- | --- | --- |
| Draft | Private | Noindex/private | None |
| Published/open | 200 | Indexable | Present and complete |
| Paused | 200 with clear paused message, or 404 if temporary pause is not useful | Usually noindex | Removed or not eligible |
| Closed/expired | 410/404, or useful archive page without JobPosting | Remove from active sitemap | Remove JobPosting |
| Filled | 200 only if useful archive content remains | No active-job markup | Remove active JobPosting |

When a gig closes, update the sitemap, remove active markup, and notify Google through the Indexing API if available. Do not let a single database date decide the visible state while another page shows the gig as active.

### 5. Make the application URL contextual

The inspected Content Manager page’s Apply Now link went to generic `/signup`, losing the selected gig. Use a route such as `/apply?gig=<id>` or `/opportunities/<slug>/apply`. If the visitor is logged out, preserve the gig ID through signup and login and return them to the same application form after authentication.

This also improves analytics. Track `gig_view → apply_click → signup_start → signup_complete → application_submit` with the gig ID, organization, skill, location, and acquisition source. Google may not rank an application funnel directly, but search traffic is wasted if the page cannot preserve intent.

## Public-page template and structured data

Google recommends putting structured data on the most detailed leaf page, ensuring it describes visible content, and validating it using the Rich Results Test and URL Inspection.[4] Ralvo’s public gig pages should use a consistent template:

```
Breadcrumbs
H1: [Role] Volunteer Opportunity in [Location or Remote]
Organization and verification summary
One-sentence purpose
Responsibilities
Required skills
Preferred skills
Commitment and hours
Date range and timezone
Location/work mode
Openings/capacity
Supervisor/contact or response-time expectation
Application requirements
Certificate/completion terms
Related opportunities
FAQ or practical next steps
Apply button
```

The inspected Content Manager listing had a dense concatenated description, no visible deliverables, no supervisor, no hours, no capacity, no deadline, no timezone, and all résumé/LinkedIn/portfolio evidence marked optional. Google’s JobPosting documentation expects a complete description containing responsibilities, qualifications, skills, hours, education, and experience information where relevant.[3]

### Recommended schema set

| Page | Primary schema | Supporting schema |
| --- | --- | --- |
| Homepage | Organization + WebSite | SearchAction only if the search endpoint actually works and is crawlable |
| Individual active gig | JobPosting only if the page meets Google’s job-posting policies | BreadcrumbList, Organization reference |
| Organization page | Organization | BreadcrumbList, ItemList of active opportunities |
| Skill/location landing page | CollectionPage or ItemList | BreadcrumbList, FAQPage only for visible genuine FAQs |
| Certificate verification page | WebPage or CreativeWork/Certificate model where appropriate | BreadcrumbList; avoid misleading job markup |
| Guide/article | Article | BreadcrumbList, FAQPage only when the FAQ is visible and genuinely useful |

The `JobPosting` object should use a complete HTML description with `<p>`, `<ul>`, and `<li>` breaks; accurate `datePosted`; accurate `validThrough`; the real hiring organization; correct remote/location information; and an application path that a user can actually follow. The current `employmentType: VOLUNTEER` should be validated against Google’s supported expectations and the page’s real semantics. If the volunteer opportunity does not satisfy Google’s job-posting policies, use suitable general schema and focus on organic web search rather than forcing eligibility.

Do not output an empty `addressLocality` for remote listings if the page can instead rely on `jobLocationType: TELECOMMUTE` plus an accurate applicant-location requirement. Do not retain JobPosting markup on expired, filled, or incomplete listings. Do not mark up list pages with JobPosting items for every card.

## Search-intent strategy for Nigeria

Current Nigerian search pages show that users search by **role, location, experience level, education, organization type, remote status, closing date, and practical benefits**. Indeed exposes keyword/location/type/date filters, job alerts, salary snippets, and easy apply. MyJobMag exposes states, categories, experience, education, pagination, alerts, and career advice. ReliefWeb adds job type, career category, experience, theme, country, organization, closing-date, posting-date, remote/roster, RSS, and API patterns.[6][7]

Ralvo should build around the following clusters without claiming search volumes until Search Console/DataForSEO is connected.

| Cluster | Example intent | Recommended asset |
| --- | --- | --- |
| Core volunteer | volunteer opportunities in Nigeria; volunteer jobs in Nigeria | `/volunteer-opportunities/nigeria` |
| NGO | NGO volunteer jobs in Nigeria; NGO volunteer opportunities Lagos | `/volunteer-opportunities/ngo/nigeria` |
| Remote | remote volunteer opportunities Nigeria; virtual volunteering Nigeria | `/volunteer-opportunities/remote` |
| Graduate/NYSC | NYSC volunteer opportunities; graduate volunteer jobs Nigeria | `/volunteer-opportunities/graduate` and `/nysc-volunteer-opportunities` |
| Local | volunteer opportunities Lagos, Abuja, Ibadan, Oyo, Port Harcourt | `/locations/{state-or-city}/volunteer-opportunities` |
| Content/marketing | content writing, social media, SEO, communications volunteer Nigeria | `/skills/content`, `/skills/social-media`, `/skills/seo` |
| Design/technology | graphic design, UI/UX, web developer, data volunteer Nigeria | `/skills/design`, `/skills/ui-ux`, `/skills/web-development`, `/skills/data` |
| NGO functions | grants, fundraising, community outreach, M&E, education volunteer | `/skills/{function}` |
| No experience | volunteer opportunities with no experience | `/guides/volunteer-in-nigeria-with-no-experience` |
| Certificate/proof | volunteer certificate Nigeria; community service certificate | `/guides/volunteer-certificates` and `/verify` |
| Organization acquisition | post volunteer opportunity Nigeria; recruit volunteers for NGO | `/for-organizations` and `/organizations` |
| Safety/trust | verify an NGO in Nigeria; safe volunteering Nigeria | `/guides/verify-ngo` and `/guides/safe-volunteering` |

### Programmatic SEO rules

Programmatic pages are valuable only when each page has real inventory and distinct usefulness. Create a state page only when there are active, quality opportunities in that state or a substantial local guide. Create a skill page only when there are multiple relevant listings and a useful description of the skill in volunteer work. Add an introductory paragraph, current count, live opportunities, practical FAQ, organization links, related skills, and an obvious next step.

Do not generate thousands of thin pages such as every skill × city × work mode combination. Keep filter parameters out of the sitemap. Canonicalize or noindex empty and near-duplicate combinations. A landing page should never promise a category with zero current opportunities unless it is an evergreen guide with a clear explanation and alternative links.

## Content moat

Ralvo needs a maintained resource hub that helps people before they are ready to apply. Long-form pages from local organizations show that practical details matter: duties, frequency, hours, onboarding, certificates, age, attendance, dress, transport, communication, repeat participation, and safety questions are all part of the volunteer decision.[8]

Recommended first twelve guides:

| Guide | Search and conversion purpose |
| --- | --- |
| How to volunteer in Nigeria with no experience | Capture entry-level intent and link to starter opportunities |
| How to find legitimate NGO volunteer opportunities in Nigeria | Build trust and link to verified organizations |
| Remote and virtual volunteering opportunities for Nigerians | Clarify country eligibility, timezone, tools, and commitment |
| Volunteer opportunities for NYSC members and graduates | Own a high-intent early-career segment |
| How volunteer experience improves your CV | Connect service records to career outcomes |
| What to include in a volunteer profile | Improve profile completion and matching data |
| How Ralvo verifies organizations and certificates | Explain trust and reduce application anxiety |
| Volunteer roles in communications, content, and SEO | Support current skills taxonomy and listings |
| Volunteer roles in grants, fundraising, and partnerships | Support NGO-function searches |
| Volunteer roles in design, technology, and data | Support skills-based discovery |
| Safe volunteering: what to check before accepting a role | Strengthen safeguarding and trust |
| How organizations can recruit and manage volunteers | Acquire NGO/company customers and explain ATS workflows |

Each guide should include an author or organization identity, update date, Nigeria-specific examples, source links, practical steps, related live opportunities, and a clear distinction between volunteering, internships, stipended roles, and paid employment. Avoid writing generic AI-generated articles with no local evidence or first-hand detail.

## Internal linking architecture

Google says links are a discovery and relevance signal, and generally expects crawlable `<a href>` links with descriptive anchor text.[4] Build a controlled link graph:

```
Homepage
 ├── Volunteer opportunities in Nigeria
 │    ├── State/city pages
 │    ├── Remote opportunities
 │    ├── Graduate/NYSC opportunities
 │    └── Skill pages
 ├── Verified organizations
 ├── Volunteer certificates and verification
 └── Guides
      ├── Link to relevant opportunity/category pages
      └── Link back to profiles and applications

Organization page
 ├── Active opportunities
 ├── Verification details
 ├── Organization guide/mission
 └── Related organizations or skills

Gig page
 ├── Organization page
 ├── Skill page
 ├── Location/remote page
 ├── Related opportunities
 └── Guide related to the role
```

Replace generic anchors such as “Apply Now” when a more descriptive nearby context is possible. Keep the button text for usability, but add surrounding copy such as “Apply for this remote Content Manager volunteer opportunity.” Ensure every important public page is linked from at least one other public page, not only reachable through JavaScript route events.

## Mobile and performance plan

Google’s Core Web Vitals guidance uses LCP, INP, and CLS to assess loading performance, responsiveness, and visual stability, with good targets of LCP within 2.5 seconds, INP below 200 ms, and CLS below 0.1.[9] Ralvo’s numeric performance score is still unknown because the public PageSpeed API request returned a quota error. Measure each template separately: homepage, gig, organization, category/location landing page, guide, signup, and application form.

Immediate performance tasks are to remove the no-zoom viewport restriction, reserve image dimensions to prevent layout shifts, compress and appropriately size cover images, lazy-load below-the-fold media, preload only the true hero asset, split authenticated dashboard code from public pages, reduce third-party chat/widget cost, and avoid loading map or community functionality on pages that do not need it.

The most important performance win is likely rendering and data architecture: an indexable public gig should receive HTML and critical content quickly, while noncritical widgets, animations, maps, and support chat load later. Do not let a large client bundle be required before the title, H1, description, organization, date, location, and apply route exist.

## Measurement setup

### Search Console

Verify both `https://ralvo.com.ng` and `https://www.ralvo.com.ng` if both have ever been used, select the preferred host, submit the fixed sitemap, inspect one homepage, one gig, one organization, one location page, and one guide, and review canonical selection. Monitor pages excluded as “Google chose a different canonical,” “Crawled—currently not indexed,” “Discovered—currently not indexed,” soft 404, blocked resources, structured-data errors, manual actions, and Core Web Vitals.

### Analytics events

Track route template, landing page, query parameters, country/state, device, organization/volunteer role, CTA click, signup start, signup completion, login return, application start, application submission, and certificate verification. Do not put résumé content, phone numbers, or other sensitive personal information into analytics parameters.

### SEO dashboard

| Weekly measure | Why it matters |
| --- | --- |
| Indexed public gig URLs / live public gig URLs | Coverage and stale-page control |
| Organic clicks/impressions by template | Identify winners and blockers |
| CTR by title pattern | Improve titles/descriptions without guesswork |
| Applications per organic session | Connect SEO to product value |
| Indexing latency for new gigs | Marketplace freshness |
| Organic signup and application conversion | Business outcome |
| CWV pass rate by template | Performance quality |
| Canonical and sitemap errors | Technical trust |
| Expired gigs still receiving impressions | Operational cleanup |
| Top queries by state/skill/role | Content and inventory planning |

## 90-day implementation roadmap

### Days 1–14: Repair indexability and trust

Fix the sitemap endpoint, canonical generation, route-specific titles/descriptions, public route status handling, expired-gig rules, application context preservation, and raw HTML rendering for homepage/gig/organization pages. Remove no-zoom viewport restrictions. Add automated tests for sitemap XML, one canonical per route, unique titles, live/expired schema, noindex dashboard pages, and application URL preservation.

### Days 15–30: Build a discoverable public information architecture

Introduce stable slugs, public organization pages, category/skill pages, state/city pages where inventory justifies them, breadcrumbs, related opportunities, and crawlable anchor links. Create a verified organization template and a complete gig template with responsibilities, requirements, commitment, dates, hours, supervisor, capacity, response expectation, certificate terms, and direct application.

### Days 31–60: Build the content and conversion layer

Publish the first six practical guides, add guide-to-opportunity and opportunity-to-guide internal links, implement structured data, create route-aware Open Graph images, add Search Console verification, submit the sitemap, and instrument the organic application funnel. Fix all stale or contradictory opportunity content before expanding inventory.

### Days 61–90: Improve relevance and scale carefully

Connect DataForSEO if quantified keyword data is needed, expand the strongest state/skill/graduate pages, add editorial calendars and content refresh rules, implement organization response-time and verification details, measure CWV by template, and test title/description variants. Add AI-assisted metadata and content suggestions only with human review and duplicate/thin-content checks.

## Recommended SEO acceptance criteria

| Area | Release criterion |
| --- | --- |
| Sitemap | `sitemap.xml` returns 200 valid XML and contains only canonical indexable public URLs |
| Public rendering | Gig and organization raw responses contain the correct H1, title, description, canonical, primary text, and important links |
| Canonicals | Every indexable route has exactly one self-referencing canonical unless intentionally canonicalized elsewhere |
| Gig status | Expired/filled gigs cannot remain active JobPosting pages or active sitemap entries |
| Structured data | Rich Results Test passes representative active gig, organization, and breadcrumb pages; markup matches visible content |
| Application | Apply preserves gig ID/title across signup and login and returns to the correct application form |
| Internal links | Every indexable gig is linked from at least one crawlable category, organization, location, or related page |
| Accessibility | Users can zoom; headings, labels, image alt text, keyboard focus, and mobile controls are tested |
| Performance | Mobile CWV is measured by template; LCP/INP/CLS targets are tracked and regressions block release |
| Analytics | Organic landing-to-application funnel events are visible without exposing personal data |
| Governance | A close/expire workflow updates page status, sitemap, schema, and indexing notifications together |

## Final recommendation

Ralvo should pursue **technical SEO for a trusted Nigerian volunteer and early-career opportunity index**, not generic “rank for jobs” SEO. The highest-return sequence is:

> **Make every live public opportunity a real, fast, canonical, crawlable page; make every expired opportunity disappear correctly; then build state, skill, graduate, remote, certificate, and practical-guide clusters around verified inventory.**

The single most important engineering project is a **public SEO rendering layer** for gigs and organizations. The single most important infrastructure fix is a **valid sitemap**. The single most important product improvement is a **context-preserving application route**. The single most important measurement integration is **Google Search Console**. The single most important content principle is **useful, local, verifiable information rather than mass-produced keyword pages**.

## References

[1]: # "Google Search Central: Understand JavaScript SEO basics — JavaScript rendering, crawlable content, canonical URLs, titles, snippets, status codes, and testing."

[2]: # "Google Search Central: Build and submit a sitemap — sitemap formats, absolute canonical URLs, root placement, size, lastmod, and submission."

[3]: # "Google Search Central: JobPosting structured data — required/recommended properties, remote jobs, complete descriptions, expiry, Indexing API, and job-posting policies."

[4]: # "Google Search Central: Link best practices — crawlable anchors, descriptive anchor text, internal linking, and discovery."

[5]: # "Indeed Nigeria: NGO volunteer jobs in Nigeria — keyword/location filters, job alerts, easy apply, job type, salary snippets, and Nigerian role language."

[6]: # "MyJobMag: Volunteer jobs in Nigeria — Nigerian state, category, experience, education, alerts, pagination, and career-advice architecture."

[7]: # "ReliefWeb: Nigeria jobs — closing-soon/remote views, filters, RSS, and API patterns for humanitarian/NGO work."

[8]: # "Lagos Food Bank: Become a volunteer — practical volunteer duties, programs, schedules, hours, onboarding, certificates, attendance, safety, transport, and FAQ content."

[9]: # "Google Search Central: Core Web Vitals — LCP, INP, CLS, good-user-experience targets, and Search Console monitoring."

*This audit is based on public HTTP inspection, rendered browser inspection, publicly available competitor/reference pages, and the previously authorized Ralvo product review. Search volumes, rankings, impressions, and real-user performance scores are not asserted until Search Console and a valid performance measurement source are connected.*