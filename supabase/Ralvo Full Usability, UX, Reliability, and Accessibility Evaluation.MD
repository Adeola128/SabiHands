# Ralvo Full Usability, UX, Reliability, and Accessibility Evaluation

**Prepared by:** Manus AI**Test date:** 25 August 2026**Product:** [Ralvo](https://www.ralvo.com.ng/)**Scope:** Public website, volunteer experience, organization experience, shared messaging/community surfaces, reliability, accessibility, data consistency, and end-to-end workflow usability.

## Executive conclusion

Ralvo has a promising product concept and several good interaction foundations. The public proposition is understandable, the navigation is role-oriented, volunteer opportunity filtering works, no-result recovery is clear, the authenticated gig application preserves context, organization applicant filters exist, team invitations have a straightforward dialog, and volunteer matching has begun to show percentage scores with explanations. These are real strengths.

However, the product is not yet reliable enough for users to trust it with real volunteer coordination. The dominant issue is not visual polish; it is **system truthfulness**. The same user, gig, or organization can appear with conflicting states, dates, counts, and actions depending on the page. A volunteer can see no applications and no certificates while also seeing an active gig and, in earlier runs, notifications claiming approvals, completed gigs, check-ins, and certificates. An organization can see one completed gig and two applicants in Manage Gigs while Impact shows zero. An accepted applicant’s profile link returns “Volunteer not found or profile is incomplete.” A check-in page can show a past event as open. These defects undermine trust, create operational risk, and make every AI or ATS feature less useful because recommendations depend on accurate underlying records.

The current observed test matrix contains **36 non-destructive test cases**: 10 passed, 10 were partial, and 16 failed. This equates to approximately **27.8% pass, 27.8% partial, and 44.4% fail**. These are evaluator observations, not a SUS score and not a claim about a statistically representative user population. A formal SUS score requires real participants completing tasks and answering the validated questionnaire.[3]

The recommended sequence is: **repair the lifecycle/data model; make loading, error, and date states truthful; fix broken applicant/profile and application routes; then improve accessibility, matching, ATS, communication, and reporting.** Do not prioritize new surface features above these foundations.

## Method and safety boundary

The evaluation used a structured matrix across public, volunteer, organization, and cross-cutting surfaces. The supplied volunteer and organization test accounts were used for authorized inspection. The review opened pages, searched and filtered lists, inspected forms, opened dialogs, checked deep links, and triggered safe client-side validation. It did not submit an application, check in attendance, send a message, create or publish a gig, invite a team member, upload a file, issue a certificate, change settings, or alter production records.

The review used four complementary lenses. Nielsen’s ten usability heuristics were used for visibility of system status, real-world language, user control, consistency, error prevention, recognition, efficiency, minimalist design, error recovery, and help/documentation.[1] WCAG 2.2 was used as the accessibility reference, particularly the perceivable, operable, understandable, and robust principles.[2] The System Usability Scale was treated as a future measurement instrument rather than a score that can be inferred from inspection.[3] Core Web Vitals were treated as technical targets: LCP within 2.5 seconds, INP below 200 milliseconds, and CLS below 0.1.[4]

## Benchmark summary

| Dimension | Observed assessment | Benchmark interpretation | Priority |
| --- | --- | --- | --- |
| Public discoverability and conversion | Public pages are understandable after JavaScript loads, but route identity and deep-link semantics are fragile | Critical public pages should render correct content, title, route, CTA, and recovery state consistently | Critical |
| Volunteer discovery | Search, location, type, date, sort, and no-result recovery worked | Core discovery is usable, but saved searches, commitment filters, transparent matching, and data freshness are missing | Medium |
| Volunteer application | Selected gig context now reaches the application form; fields and expectations are visible | Critical conversion path should preserve role, prevent stale listings, expose requirements, and confirm next steps | High |
| Volunteer lifecycle | Applications, My Gigs, notifications, certificates, and check-in state can disagree | One lifecycle source of truth is required; no contradictory user-visible states should ship | Critical |
| Organization onboarding | Dashboard loads and core actions are visible, but progress labels conflict | Users should always see one accurate next step and one progress definition | Critical |
| Organization recruiting | Applicant filters and accepted cards exist, but candidate profile links can fail | A recruiter must be able to open evidence, compare candidates, message, and progress a candidate without broken links | Critical |
| Organization reporting | Impact page loads but shows zero while operational pages show activity | Reporting must reconcile with fixture data and define every metric | Critical |
| Collaboration | Team invite dialog is simple and understandable | Invitation lifecycle, permissions, auditability, and notification preferences are incomplete | Medium |
| Accessibility | Zoom restriction and systematic keyboard/focus/label testing gaps were observed | Target WCAG 2.2 AA; remove zoom restriction immediately and automate checks | High |
| Performance and resilience | Several routes show transient Loading states; one wizard click timed out | Use skeletons, timeouts, retries, and telemetry; measure CWV by template | High |
| Trust and localization | Seed-like content, wrong-role copy, inconsistent currency/date/location, and unclear verification evidence | Data and copy must be truthful, localized, and auditable | Critical |

### Observed outcome counts

| Result | Count | Share of 36 observations |
| --- | --- | --- |
| Pass | 10 | 27.8% |
| Partial | 10 | 27.8% |
| Fail | 16 | 44.4% |

The pass/partial/fail counts are a transparent summary of the observed test matrix. They should not be interpreted as a formal population-level usability score. The next stage should recruit Nigerian volunteers and NGO coordinators for moderated task sessions and collect a formal SUS baseline.

## What already works well

The public and authenticated navigation has a sensible role split. Volunteer navigation includes Browse Gigs, Applications, My Gigs, Certificates, Messages, and Community. Organization navigation includes Overview, Manage Gigs, Impact, Team, Settings, Messages, and Community. This is a good foundation for role-based information architecture.

Volunteer discovery is one of the strongest current flows. Browse Gigs exposes gig type, Nigerian-state/Remote location, date range, sorting, and title/skill/organization search. Selecting Remote reduced the result count correctly, an impossible search produced a clear “No Gigs Found” state, and clearing filters restored the inventory. These patterns meet the basic recognition and recovery expectations of a marketplace.

The authenticated gig application path has improved. Opening a public gig while logged in now routes to `/dashboard/volunteer/gigs/{id}/apply`, and the application page preserves the selected gig’s title, type, location, commitment, description, and volunteer identity. The form explains that it takes about three minutes and that organizations usually review within a few days. This is good conversion and expectation-setting work.

The organization applicant queue has a useful initial shape. It shows total applicants, accepted, pending, and declined states and provides filters, candidate cards, skill tags, message actions, and profile actions. The organization Team view also makes Owner, Admin, and Manager permissions visible and opens a simple invitation dialog with email, role, cancel, and send controls.

The matching experience has moved beyond a completely opaque recommendation list. The volunteer dashboard displayed 70% and 30% match badges and reasons such as “Open to all skill levels” and “Matches your location preference.” The next improvement is to make the scoring formula, missing evidence, and user feedback controls transparent rather than removing the score.

## Critical findings and evidence

### R01 — Cross-surface lifecycle and data integrity is not trustworthy

This is the most important product defect. During the volunteer review, Applications showed no applications and Certificates showed zero certificates, while My Gigs showed one upcoming/active Beach Cleanup Drive. Earlier same-account observations showed six notifications, including an approved React Developer application, five completed gigs, a check-in reminder, a recommended React/Node gig, a declined application, and an issued certificate. During the organization review, Manage Gigs showed one completed UI/UX Design gig and two applicants, while Impact showed zero gigs, zero volunteers, zero hours, and zero certificates.

**Why it matters:** A volunteer cannot know whether they are accepted, expected at an event, or eligible for a certificate. An organization cannot report impact or trust its applicant pipeline. AI recommendations and ATS ranking will be built on unreliable state.

**Fix:** Define a canonical lifecycle model and event ledger. A gig should have explicit states such as draft, published, paused, closed, filled, completed, and archived. An application should have pending, shortlisted, accepted, declined, withdrawn, and completed states. Attendance should have eligible, check-in-open, checked-in, absent, and verified states. Certificates should be issued only from a verified completion event. Every dashboard card, notification, count, badge, and CTA should derive from these records and server-side authorization.

**Acceptance test:** Seed one complete fixture and verify that Overview, Manage Gigs, Applicants, Impact, Notifications, My Gigs, Certificates, and Messages all show the same gig ID, organization, status, dates, applicant state, attendance state, and certificate state.

### R02 — Dates and event windows are inconsistent or stale

The product has displayed `1/1/1970`, `Date TBD`, ambiguous `8/12/2026`, and a past event that still presents as Check-In Open. The check-in page showed Sat, Aug 15, 8:00 AM–2:00 PM and a window closing at 9:00 AM while the current audit date was 25 August 2026. Date display is also inconsistent between list, detail, profile, and check-in views.

**Fix:** Store timestamps in UTC, carry an explicit timezone, validate dates at write time, and render using a single Nigeria-aware formatter such as `en-NG` and `Africa/Lagos`, with a clear year and timezone when needed. Server-side rules should close an opportunity and check-in window automatically. Reject epoch-zero and missing dates from publishable records.

**Acceptance test:** An event in the past cannot appear open; an event spanning timezones shows the same local date/time everywhere; a missing timestamp produces a controlled “Date to be confirmed” state rather than 1/1/1970; all date labels include an unambiguous format.

### R03 — Accepted applicant profile links are broken

From Accepted Review, the Fintrack Solutions profile link opened `/volunteer/fintrack-solutions-...` and returned “Volunteer not found or profile is incomplete,” with only Return Home. This blocks recruiter decision-making after the applicant has already reached an accepted state.

**Fix:** Resolve profiles by the same stable user/profile ID used by the applicant record and enforce organization-scoped access. If the public profile is incomplete, show a recruiter-only applicant snapshot containing the submitted name, skills, application answers, attachments, stage history, and safe contact action. Keep a “Back to Applicants” return path.

**Acceptance test:** Every candidate card opens either the correct complete profile or an in-context fallback; no applicant link sends a recruiter to a dead end.

### R04 — Organization onboarding progress is contradictory

The organization Overview page displayed `1 of 3 complete`, while a separate Getting Started card displayed `3/4` and listed three items as complete or nearly complete. The page also showed verification as completed while settings and contact data still suggested incomplete onboarding.

**Fix:** Create one checklist service that returns item ID, label, status, blocker, route, and next action. The UI should render one count and one next step. Use “Complete profile,” “Add contact details,” “Verify organization,” “Create first gig,” and “Invite team” as explicit states, with a different definition for “verified” and “profile complete.”

**Acceptance test:** Progress count equals checked items in every component and is preserved after refresh, login, and navigation.

### R05 — New Gig wizard validation and reliability are weak

The empty Basic Info step did not expose clear inline validation when Next was triggered. Add Question did not visibly add a question row during the inspection. A later Next click on the Requirements step timed out, and the browser became unavailable afterward. The wizard contains useful fields—date, time, duration, volunteers needed, location, remote mode, skills, résumé, LinkedIn, portfolio, pitch, and custom questions—but it does not yet provide the guardrails needed to publish complete roles.

**Fix:** Add field-level validation, focus the first invalid field, preserve entered values, provide autosave for drafts, make dynamic question rows immediately visible and removable, and wrap every request in timeout/retry/error handling. Add an “AI assist” step only after the deterministic fields and validation are reliable. The assistant can generate a draft description, suggest skills, flag missing hours/deliverables, and propose screening questions, but the organization must approve every field before publishing.

**Acceptance test:** Empty submission stays on the current step, announces errors in plain language, and focuses the first invalid field. Add Question creates a visible editable row. A network timeout shows retry and does not lose data. No test action can hang indefinitely.

### R06 — Public and authenticated application routing must remain contextual

The current logged-in gig page routes to the selected application form, which is positive. However, earlier public testing showed Apply Now going to generic `/signup` with no selected gig title or ID. This needs regression protection across logged-out, logged-in, and newly created gigs.

**Fix:** Use a stable route such as `/opportunities/{slug}/apply`; preserve gig ID, title, organization, and acquisition source through signup/login; return to the application form after authentication; and prevent applications to closed gigs.

**Acceptance test:** Logged-out and logged-in users always return to the correct opportunity; closed and filled gigs replace Apply with a truthful state; analytics can attribute the application to the originating gig.

### R07 — Role-inappropriate empty states reduce comprehension

Organization Messages says “Apply to a gig to start chatting,” even though organizations do not apply to gigs. The correct message should explain that conversations begin after an application, shortlist, acceptance, or organization-initiated contact, depending on policy.

**Fix:** Make empty states role- and stage-aware. Include a concise explanation, one next action, and a link to the relevant queue. Do the same for certificates, impact, team, community, and notifications.

### R08 — Seed-like or disconnected content damages trust

The product has displayed a `Test Organization`, a gig titled `hii` with description `hiii j`, a conversation containing `hii`, and an empty community feed alongside large trending counts such as 1.2k, 840, 532, and 215 posts. Earlier profiles also contained malformed merged text and placeholder contact/social data.

**Fix:** Separate development fixtures from production data at the database and deployment level. Add a content-quality gate that rejects short placeholder titles/descriptions, invalid dates, impossible contact data, and duplicate generated sections. If the community has no real posts, show no trending counts rather than synthetic-looking numbers.

### R09 — Match scores need explanation and control

The volunteer dashboard showed 70% and 30% match scores, but the reasons were incomplete. A 30% match was described as matching the location preference with no exact skill match but being good for broad impact. The volunteer cannot see the weights, missing profile data, or feedback control.

**Fix:** Explain the score as weighted factors: skills, cause, work mode, location, availability, commitment, experience, and evidence completeness. Show positive reasons, missing factors, and “Not relevant” or “Improve my matches” controls. Keep a human-readable explanation log for recruiters and volunteers.

### R10 — Security and notification settings are incomplete

Volunteer Security says “Password and security settings coming soon.” Organization notification settings say “Email and SMS notification preferences coming soon.” These are high-risk omissions for an application and attendance system.

**Fix:** Provide password change/reset, session/device management, sign-out-all, MFA roadmap, account deletion/data export request, notification channel preferences, and mandatory critical alerts for acceptance, check-in changes, and certificate issuance. Make preferences explicit rather than silently assuming delivery.

## Volunteer experience findings

### Discovery and matching

The Browse Gigs page is usable for basic inventory discovery. It provides filters for gig type, Nigerian states/Remote, date range, sort order, and keyword search. The no-result state is good: it says no gigs match the filters and offers Clear and Clear All Filters. The next improvement is to turn this into a repeatable job-search experience with saved searches, email/WhatsApp alerts, commitment-hours, weekend, travel-radius, cause, skill-evidence, stipend, certificate, and closing-soon filters.

The dashboard recommendation cards are visually understandable, but they mix strong and weak inventory. The `Test Organization` and generic beach-cleanup card should not appear in production unless they are genuine. Recommendation cards should always show closing date, commitment hours, location precision, organization verification, number of openings, expected response time, and a direct Apply/Save action.

### Application and readiness

The application form is short and clear, and it preserves the selected role. It includes motivation, portfolio, LinkedIn, résumé, consent, and a submit action. The form does not yet surface required versus preferred evidence from the organization’s configuration, extract skills from the résumé, show an application readiness score, or explain how the application will be evaluated. The consent statement should identify the actual receiving organization and distinguish Ralvo’s platform processing from organization-level screening.

### Profile and proof

The volunteer profile has a useful starting structure—headline, background, skills, causes, résumé, LinkedIn, portfolio, and certificates—but the observed profile was malformed, used third-person wording, had lowercase `lagos`, and exposed placeholders. Add a profile completeness score with a small number of actionable tasks, preview exactly what organizations see, normalize skills into structured records, and distinguish self-declared, résumé-extracted, organization-endorsed, and Ralvo-verified skills.

### Lifecycle and attendance

My Gigs displayed one upcoming/active opportunity and a Check-In Open state, while Applications showed zero. The check-in page exposed a GPS verification distance but no clear consent, denied-location fallback, duplicate prevention history, or privacy explanation. Attendance must be treated as a high-integrity workflow because it determines certificates and reputation. A volunteer should see event date/time, local timezone, meeting point, contact, what to bring, check-in window, GPS policy, fallback code/manual verification, and a clear record after check-in.

## Organization experience findings

### Overview and onboarding

The organization dashboard has a sensible information hierarchy and quick actions, but the conflicting progress cards make the first-run experience unreliable. Replace multiple cards with one task-oriented onboarding panel. Each task should have a single action, clear completion criteria, estimated time, and a status reason.

### Manage Gigs and ATS

Manage Gigs shows a total count, active/draft/completed filters, applicants, certificate status, and actions. This is a good skeleton for an ATS-like workflow, but it currently lacks a recruiter queue, candidate search, bulk actions, saved views, score explanations, notes, reminders, tags, stage history, SLA timers, and structured screening answers.

Recommended ATS pipeline:

```
New application → Eligibility check → AI-assisted review → Shortlist →
Interview or clarification → Accepted → Scheduled → Checked in →
Submission review → Completed → Certificate issued → Alumni/rehire
```

AI should rank and summarize, not silently decide. Every score must show the evidence used, missing evidence, potential uncertainty, and an override control. Store the model version and reason codes so an organization can audit why a candidate was ranked.

### Gig creation

The four-step wizard—Basic Info, Requirements, Submission, Review & Publish—is directionally correct. Step 2’s date, duration, volunteer count, location, remote mode, skills, standard application requirements, and custom questions are valuable ATS inputs. The wizard needs structured role templates, AI-assisted drafting with approval, completeness scoring, preview, autosave, safe publish confirmation, and consistent error recovery.

A strong role template should require purpose, responsibilities, deliverables, skills, hours, dates, timezone, work mode, location, openings, supervisor, expected response time, safety information, completion evidence, certificate rules, and application requirements. Prevent an organization from publishing an attractive but operationally incomplete role.

### Applicant review

The Accepted Review cards have useful basics—name, applied date, status, skills, message, and profile link—but candidate profile access is currently broken for at least one accepted applicant. Add a stable recruiter workspace with filter chips, keyword search, stages, fit reasons, document preview, notes, activity timeline, message context, and bulk actions. The recruiter should never need to open several unrelated pages to answer “Who is a good fit, what evidence supports that, what is missing, and what do I do next?”

### Impact and certificates

The Impact dashboard has date-range filtering, top skills, gigs, volunteers, hours, certificates, and Ralvo Coins. The visual presentation is simple, but the values do not reconcile to operational data. Define every metric, show its source and date range, and provide a “Why this number?” detail view. Treat Ralvo Coins as an optional engagement layer, not the primary impact metric, and explain its baseline to avoid confusion with money.

### Team and communications

Team invitation is easy to understand at a basic level. To make it operationally reliable, add invitation expiry, resend, revoke, role change, audit history, least-privilege permissions, and a clear distinction between organization team members and volunteers engaged through gigs.

Messages should be attached to a gig and, where appropriate, an application stage. Organization empty states should not say “Apply to a gig.” Each conversation should show the opportunity, participant role, stage, last action, attachments, reporting/blocking controls, and a clear distinction between an organization-initiated conversation and a volunteer application conversation.

## Accessibility evaluation

The product should target WCAG 2.2 AA. The observed viewport metadata includes `maximum-scale=1.0` and `user-scalable=no`, which prevents users from zooming and should be removed immediately. The audit also found a need for systematic checks of semantic headings, input labels, alt text, keyboard focus, button names, error announcements, live status updates, touch target size, and reflow.

| Accessibility area | Current risk | Required action |
| --- | --- | --- |
| Zoom and reflow | No-zoom viewport restriction | Remove restriction and test at 200–400% zoom |
| Loading states | Loading text is visible but may not announce status or provide timeout recovery | Use semantic status/live regions, skeletons, timeout errors, and retry |
| Forms | Empty wizard navigation did not show clear inline errors | Associate errors with fields, focus first invalid field, preserve values |
| Icon controls | Some buttons are exposed mainly by hints | Add accessible names and visible tooltips where needed |
| Images | Generic avatars and cover images reduce meaning | Provide accurate alt text or mark decorative images appropriately |
| Keyboard use | Not fully validated | Test tab order, focus visibility, dialog focus trap, escape/cancel, and enter/space behavior |
| Status changes | Accepted/complete/check-in/certificate states may change without clear explanation | Announce changes and show timestamps/next actions |
| Language and labels | `RC`, `gig`, `skilled`, and role-specific terms can be unclear | Add plain-language explanations and consistent terminology |

## Reliability and resilience findings

A repeated public HTTP probe made three requests to eight routes. All returned HTTP 200, but `/not-a-real-route` also returned HTTP 200 with the application shell, creating a soft-404 risk. The homepage, gig, organization, login, signup, and sitemap index showed approximate raw response times between 1.0 and 2.0 seconds in this probe; these are network observations, not Core Web Vitals. The PageSpeed API was not usable for a numeric score because its quota returned 429, so no performance score is asserted.

The current sitemap index is valid and points to four children, but `sitemaps/opportunities.xml` returned `Error generating sitemap` during the probe. This makes the live opportunity inventory unreliable for discovery. The raw HTML for public routes also remains a common application shell with generic title/canonical/headings before client rendering. While the visible browser page can render content, public pages should server-render their route identity and primary content.

Reliability acceptance targets should be explicit. Every core route should return a useful state or actionable error, not indefinite loading. All asynchronous actions should have a timeout, retry, idempotency protection, and telemetry. Deep links should return a real 404/410 when invalid. Counts and state should be derived from the same fixtures and API responses. The system should record correlation IDs for failed data loads and expose a support reference to the user.

## Severity-ranked remediation catalog

| Priority | Issues | Why it comes first | Owner area |
| --- | --- | --- | --- |
| P0 — before wider launch | R01 lifecycle/data integrity; R02 date/check-in truth; R03 broken applicant profiles; R04 onboarding progress; R05 wizard validation/timeouts; R15 impact reconciliation; R17 seed/disconnected content | These defects can cause wrong decisions, missed attendance, false certificates, broken recruiting, and loss of trust | Backend/data, QA, product |
| P1 — next release | R06 contextual application routing; R07 role-aware empty states; R09 matching transparency; R10 security/notifications; R11 verification evidence; R12 profile quality; R20 accessibility basics | These improve conversion, safety, user confidence, and ability to operate the platform | Frontend, identity, product |
| P2 — scale operations | R08 ATS queue; R18 messaging context; R19 team governance; R21 structured role templates; R23 contextual help; R24 localization | These reduce manual workload and support organization growth | Product, frontend, backend |
| P3 — growth and optimization | R22 public SEO rendering/URL quality; content guides; route-aware social previews; performance tuning; advanced AI assistance | These create acquisition and efficiency gains after trust foundations are fixed | Web platform, growth, AI |

## Implementation approach

### Sprint 1: Make the system truthful

Create the canonical lifecycle and event model, remove production fixtures, repair date handling, enforce server-side status transitions, reconcile Impact with gig/application/completion records, fix check-in windows, and add database/API contract tests. This sprint should produce a single fixture that flows from gig publication to certificate and renders consistently on every surface.

### Sprint 2: Make core tasks recoverable

Repair applicant profile routing, add wizard validation and timeouts, implement skeleton/loading/error/retry states, add soft-404 handling, preserve application context through authentication, and replace contradictory onboarding cards with one checklist service. Add telemetry for route load, API failures, retry, and abandoned forms.

### Sprint 3: Make the product accessible and local

Remove no-zoom behavior, audit keyboard and screen-reader semantics, improve form errors and focus, normalize Nigeria date/time/currency/location formatting, validate phone and website fields, and rewrite role-inappropriate empty states. Add accessibility checks to CI.

### Sprint 4: Make volunteer matching useful

Add profile completion, structured skills, availability windows, commitment hours, travel radius, causes, preferred work modes, saved searches, alerts, and transparent match reasons. The match model should use deterministic factors first and provide a feedback loop before adding more advanced AI.

### Sprint 5: Make organization recruiting efficient

Build a recruiter queue with search, filters, saved views, stages, notes, reminders, evidence preview, bulk actions, stage history, response SLAs, and message context. Add AI summarization and ranking only with visible evidence, confidence, model/version traceability, and human override.

### Sprint 6: Make proof and reporting dependable

Define completion evidence, supervisor approval, attendance verification, certificate issuance, public verification, volunteer profile proof, and impact metric definitions. Give organizations an exportable impact report and volunteers a shareable proof page.

## Recommended measurement program

Before recruiting external participants, instrument task-level analytics. Measure first content/rendered state, route error, filter use, no-result recovery, gig detail view, apply click, signup start, signup completion, application start, application submission, application abandonment, organization publish completion, applicant profile open, shortlist/accept action, check-in attempt, check-in success/failure, certificate issuance, and message initiation. Do not place résumé content, phone numbers, or sensitive profile text into analytics events.

For a formal usability study, recruit at least five volunteers and five organization coordinators for the first qualitative round, then a larger sample for confidence around metrics. Give both roles realistic tasks and record task success, time-on-task, critical errors, assistance requests, confidence, and post-task ease. Administer SUS after the full session and report it as a score with confidence intervals; use it for trend tracking, not diagnosis.[3]

### Proposed task benchmark targets

These are internal product targets, not external standards.

| Task | Target after P0/P1 fixes |
| --- | --- |
| Find a relevant opportunity using search/filter | At least 90% task completion without assistance |
| Understand whether a gig is still open | 100% of tested participants identify status and deadline correctly |
| Apply to a selected opportunity | At least 90% completion with no context loss |
| Organization publishes a complete gig | At least 85% completion; zero silent validation failures |
| Recruiter opens a candidate profile | 100% correct profile resolution |
| Recruiter identifies next applicant action | At least 90% correct action without help |
| Check in to an eligible event | 100% of invalid/past/duplicate attempts blocked clearly |
| Find certificate status | At least 90% can explain requirements and next step |
| Recover from no results or network error | At least 90% recover without leaving the task |
| SUS | Establish baseline; target above the commonly used 68 average, then improve toward 80+ for strong perceived usability.[3] |
| Core Web Vitals | LCP <2.5s, INP <200ms, CLS <0.1 on key mobile templates.[4] |

## Product design principles for Ralvo

Ralvo should optimize for **confidence before complexity**. Users need to know what is real, what is next, what is required, and what happens after an action. Every screen should answer: “What state am I in?”, “What can I do now?”, “What evidence supports this?”, and “What happens if I make a mistake?”

The organization experience should become a **volunteer operations workspace**, not just a gig-posting dashboard. The center of gravity should be a Today queue: applicants needing review, upcoming check-ins, late submissions, certificates waiting for approval, and messages requiring response. The volunteer experience should become a **personal opportunity and proof workspace**, with relevant opportunities, application readiness, commitments, attendance, certificates, and profile evidence.

AI should reduce repetitive work without hiding decisions. Appropriate early uses include gig-description drafting, structured-field extraction, skill normalization, duplicate/placeholder detection, candidate résumé summarization, missing-evidence prompts, interview-question suggestions, match explanations, and notification drafting. Inappropriate early uses include silent rejection, unreviewable ranking, invented organization facts, fabricated certificate evidence, or automatic publication of generated descriptions.

## Final priority list

1. **Fix the single source of truth for gig, application, attendance, certificate, notification, and impact states.**

1. **Fix all date/time/status logic, especially expired gigs and check-in windows.**

1. **Repair broken candidate profile links and ensure every recruiter action returns to the correct queue.**

1. **Make the New Gig wizard validate clearly, autosave safely, and recover from network failures.**

1. **Replace contradictory onboarding progress with one accurate checklist.**

1. **Remove production seed/demo content and validate contact, profile, community, and opportunity quality.**

1. **Preserve application context through public, signup, login, and authenticated routes.**

1. **Remove the no-zoom restriction and complete WCAG 2.2 AA basics.**

1. **Make matching explainable and preference-driven.**

1. **Then build the ATS queue, operational notifications, advanced AI, proof, and reporting layers.**

## References

[1]: # "Nielsen Norman Group — 10 Usability Heuristics for User Interface Design — heuristic principles for visibility, consistency, error prevention, recognition, recovery, and help."

[2]: # "W3C — How to Meet WCAG 2.2: Quick Reference — WCAG 2.2 success criteria and techniques for perceivable, operable, understandable, and robust experiences."

[3]: # "MeasuringU — Measuring Usability with the System Usability Scale — SUS questionnaire, scoring, the commonly used 68 average benchmark, and limits of SUS as a diagnostic measure."

[4]: # "Google Search Central — Understanding Core Web Vitals and Google Search Results — LCP, INP, CLS definitions and good-user-experience targets."

[5]: # "Indeed Nigeria — NGO volunteer jobs in Nigeria — reference pattern for search, location, type, alerts, and easy-apply behavior."

[6]: # "MyJobMag — Volunteer jobs in Nigeria — reference pattern for Nigerian states, categories, experience, education, pagination, alerts, and career content."

[7]: # "ReliefWeb — Nigeria jobs — reference pattern for closing-soon, remote, category, experience, organization, RSS, and API workflows."

[8]: # "Lagos Food Bank — Become a volunteer — reference pattern for practical volunteer information about duties, schedules, hours, onboarding, certificates, attendance, transport, safety, and FAQs."

*This evaluation is based on direct non-destructive inspection of the live site, the supplied test accounts, prior authorized Ralvo role tests, repeated public route probes, and benchmark research. It is not a formal penetration test, load test, legal accessibility certification, or statistically representative user study. The live deployment may change; rerun the acceptance matrix after each release.*