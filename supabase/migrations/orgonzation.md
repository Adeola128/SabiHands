# Making Organization-Side Volunteer Management Easy in Ralvo

**Prepared by:** Manus AI**Research date:** 24 August 2026**Product:** [ralvo.com.ng](https://www.ralvo.com.ng/)**Focus:** Organization-side volunteer recruitment, onboarding, scheduling, attendance, communication, certificates, impact reporting, AI assistance, and ATS-style applicant management.

## Executive conclusion

Ralvo should not try to become a more complicated job board. It should become a **volunteer operations workspace** that helps an NGO answer five questions quickly:

> **Who is available? Who is suitable? What must happen today? Who has not completed the next step? What impact can we prove?**

Research across Microsoft Volunteer Management, VolunteerHub, Better Impact, CiviVolunteer, OpenVolunteerPlatform, 4Water-Flow, Libelle, VolunTrack, and The Volunteer Hub shows a consistent pattern: the most useful systems connect the full lifecycle—opportunity design, recruitment, eligibility, onboarding, scheduling, attendance, communication, completion, recognition, and reporting—rather than treating applications as the end of the workflow.[2][4][6][8][9]

The best product strategy for Ralvo is therefore:

1. **Repair trust and data consistency first.** During the previous organization-side review, the same gig appeared as completed in one view and active in another; the organization impact dashboard showed zero while other pages showed a posted gig and engaged volunteers; a date rendered as 1/1/1970; notifications appeared to contain activity unrelated to the account; and one gig contained malformed seed/generated text.[11][13]

1. **Build a single organization command center.** Replace scattered pages with a “Today / This week / Needs attention” workspace.

1. **Add a structured volunteer directory and ATS-like pipeline.** Organizations need one searchable record for every volunteer, applicant, qualification, conversation, shift, attendance record, and certificate.

1. **Make scheduling and attendance self-service.** Let volunteers state availability, claim or exchange open shifts, check in, submit hours, and receive reminders.

1. **Use AI as a coordinator copilot, never as an invisible rejection engine.** AI should draft, summarize, recommend, detect missing information, and explain its reasoning while leaving the final decision with an authorized human.

## Research framework

The research evaluated each pattern against six questions: Does it reduce coordinator workload? Does it make volunteer actions obvious? Does it support the full lifecycle? Does it create trustworthy records? Does it handle permissions and privacy safely? Can it integrate with Ralvo’s existing React/TypeScript/Supabase direction?

| Dimension | What “easy” should mean for an organization |
| --- | --- |
| Recruitment | Create a high-quality opportunity in minutes and reach suitable volunteers without spreadsheet work |
| Review | See the right applicants, their evidence, missing requirements, and next action in one place |
| Onboarding | Assign required forms, training, waivers, and verification with visible completion status |
| Scheduling | Define shifts, avoid double-booking, handle availability, and fill gaps with minimal coordination |
| Day-of operations | Check people in, record attendance/hours, identify no-shows, and communicate changes quickly |
| Follow-up | Move volunteers through completion, feedback, certificates, recognition, and future opportunities |
| Reporting | Produce trustworthy hours, participation, skills, certificate, and impact reports without manual reconciliation |
| Governance | Enforce role permissions, consent, document access, audit history, safeguarding, and data retention |

## What mature systems do well

### 1. They organize around the volunteer lifecycle

Microsoft’s volunteer-management model explicitly separates a workplace dashboard, engagement opportunities, volunteers and groups, onboarding, and configuration. It supports qualifications, preferences, attendance, automated messages, and insights into registrations, no-shows, and repeat contribution.[1] NCVO guidance similarly treats volunteering as a lifecycle that includes planning, role descriptions, safe recruitment, induction, support, retention, recognition, development, and ending the relationship well.[14]

Ralvo should adopt the same lifecycle instead of centering the product on a single “Manage Gigs” page. An organization should be able to move a person from **interested → applied → screened → accepted → onboarding → scheduled → checked in → completed → certified → returning volunteer** with every step visible.

### 2. They reduce repetitive coordination through self-service and automation

VolunteerHub emphasizes self-managed shifts, centralized volunteer records, automated email and text communication, fast check-in, configurable forms, group management, branded landing pages, recognition, and standard reports.[2] Better Impact adds online applications, role assignments, hour tracking, training modules, e-waivers, automated shift reminders, mass and individual messaging, location-based permissions, cross-department reporting, and an API.[3]

The practical implication for Ralvo is that an organization should not need to message ten volunteers individually to fill a shift, manually reconcile attendance, or rebuild the same form for every gig. The platform should provide templates, rules, bulk actions, reminders, and a clean audit trail.

### 3. They treat attendance and hours as first-class records

Volunteer management becomes operationally valuable when the organization can see who registered, who was approved, who arrived, how long they contributed, what work they completed, and whether a certificate was issued. GivePulse’s model emphasizes opportunity discovery, attendance verification, communication with one or many volunteers, and impact reporting.[4] VolunTrack’s repository offers a useful code-level reference for organization-scoped volunteer timesheets and administrative timesheet actions.[8]

Ralvo’s current “Impact” concept should therefore be rebuilt from event records rather than displayed as a manually inferred score. A certificate should be generated from verified attendance and completion evidence, not merely from an accepted application.

### 4. They make trust, safety, and recognition part of the workflow

NCVO’s guidance includes safeguarding, volunteer agreements, insurance, health and safety, inclusion, complaints, support, training, accreditation, and ending volunteering well.[14] Points of Light emphasizes leadership development, recognition, trust, listening, and open communication.[15] Better Impact documents background-check integration, electronic waivers, online training, certifications, recognition badges, permissions, and encrypted file storage.[3]

For Ralvo, trust should include verified organizations, clear opportunity information, consent, reporting and blocking, incident escalation, transparent certificate issuance, organization reputation, volunteer feedback, and recognition that is tied to real contribution—not only gamified points.

## The ideal organization workspace

The organization dashboard should become an action-oriented workspace rather than a set of disconnected counters.

### Primary navigation

| Navigation area | Purpose |
| --- | --- |
| Today | Immediate actions: upcoming shifts, pending reviews, missing onboarding items, unread messages, no-shows, and expiring tasks |
| Opportunities | Create, duplicate, publish, pause, fill, complete, and report on gigs/events |
| Volunteers | Search the organization’s volunteer directory, groups, skills, availability, history, and documents |
| Applications | ATS-style pipeline with filters, scores, notes, interviews, and bulk actions |
| Schedule | Calendar and shift board showing capacity, assignments, availability, attendance, and gaps |
| Communications | Templates, announcements, reminders, group messages, and delivery history |
| Training & onboarding | Requirements, waivers, learning steps, screening, and completion tracking |
| Certificates | Completion verification, certificate issuance, revocation, public links, and export |
| Impact | Hours, attendance, completion, skills, outcomes, repeat participation, and reports |
| Team & permissions | Owners, admins, coordinators, reviewers, and location/program access |
| Settings | Organization profile, verification, integrations, privacy, notification rules, and templates |

### The first screen should answer “what needs attention?”

The top of the organization home should display four panels: **Needs attention**, **Today**, **Upcoming**, and **Program health**. Needs attention should include pending applicants, incomplete onboarding, unfilled shifts, missing attendance, draft opportunities, failed notifications, and certificates waiting for approval. Today should include scheduled volunteers, check-in status, contact actions, and day-of notes. Program health should include active opportunities, fill rate, attendance rate, completion rate, repeat-volunteer rate, and hours verified.

Every card should be clickable and lead directly to the action. A counter without a next action is not useful operationally.

## Core organization workflows

### Opportunity creation

Ralvo’s existing wizard already separates Basic Info, Requirements, Submission, and Review/Publish, and it supports skilled or physical gigs, categories, location, remote work, skills, résumé/LinkedIn/portfolio/pitch requirements, and custom questions.[16] The next version should make the wizard more intelligent and safer.

| Step | Required experience |
| --- | --- |
| Describe | Title, one-sentence purpose, detailed responsibilities, expected outcome, location/work mode, dates, and organizer contact |
| Define fit | Required skills, preferred skills, experience level, language, availability, safeguarding requirements, and accessibility needs |
| Define commitment | Time estimate, shift structure, number of volunteers, supervisor, check-in method, deliverables, and completion criteria |
| Define application | Résumé, portfolio, screening questions, consent, references, documents, and automatic-approval rules |
| Review | Quality checks, missing fields, AI suggestions, preview, publish status, and audience visibility |

The AI assistant should be optional and reviewable. It can transform a rough description into a structured opportunity, suggest skills and screening questions, detect contradictions such as Remote versus On-Site, identify missing dates or capacity, and generate a plain-language preview. It must never publish without an authorized human confirmation.

### Volunteer directory

The organization needs a first-party volunteer record that is richer than an application row. It should include identity, contact, location, skills, causes, availability, preferred work mode, experience evidence, résumé, portfolio, training, waivers, safeguarding checks, attendance history, applications, assignments, messages, feedback, certificates, and consent.

A volunteer directory should support saved views such as **Available this week**, **Has Figma**, **Completed a similar gig**, **Needs onboarding**, **No-show risk**, **Certificate-ready**, and **Returning volunteers**. Each saved view should be explainable and exportable with permission controls.

### Application and ATS pipeline

The organization should review applicants in a board or table with stages such as **New, Needs review, Shortlisted, Clarification, Interview, Accepted, Waitlisted, Declined, Withdrawn, Onboarding, and Scheduled**. A candidate card should show the reason they match, relevant evidence, missing requirements, availability, prior contribution, organization-specific history, and the next action.

Bulk actions should include request information, assign a reviewer, move stage, invite to interview, send a template message, add to a group, assign onboarding, accept, waitlist, decline with reason, and export a permitted report. Bulk actions should require confirmation and write an audit event.

### Onboarding

Onboarding should be a configurable checklist attached to a program, opportunity, group, or organization. A coordinator should be able to require a profile completion step, consent, waiver, training video, quiz, document upload, identity verification, safeguarding check, orientation, or supervisor approval.

Each onboarding item needs an owner, due date, status, reminder policy, evidence, and completion timestamp. The volunteer should see the same checklist from their side. This removes the current problem where the organization dashboard can show inconsistent progress labels such as “3/4” and “1 of 3 complete.”[10]

### Scheduling and shifts

Scheduling should support recurring opportunities, multiple shifts, capacity, role requirements, location, remote links, supervisors, waitlists, self-service signup, shift exchange, and reminders. Organizations should be able to publish open slots without manually assigning every volunteer.

The strongest code pattern found is in 4Water-Flow. Its eligibility rule is defined once and reused by the volunteer board, claim guard, planner, and auto-roster. It checks open status, active roster status, capability, role, availability, and double-booking, and it returns reason codes explaining why an assignment is not possible.[17] This is directly applicable to Ralvo.

Ralvo should implement a shared eligibility service such as:

```
type EligibilityResult = {
  eligible: boolean;
  reasons: Array<
    | "missing_skill"
    | "not_available"
    | "already_assigned"
    | "missing_training"
    | "organization_rule"
    | "capacity_reached"
  >;
  evidence: Array<{ type: string; label: string; value: string }>;
};
```

The same service must power the search result, applicant score, assignment suggestion, and claim/booking guard. Otherwise the interface may offer a shift that the backend later rejects.

### Auto-roster and coordinator approval

4Water-Flow’s auto-roster does not merely show suggestions. It writes provisional assignments that a planner can discard or lock in, clears only provisional proposals when rerun, and leaves confirmed assignments untouched.[18] Ralvo should adopt this exact safety model for AI scheduling and matching:

1. Generate provisional suggestions.

1. Show the candidate, shift, score, reason, and conflicts.

1. Let the coordinator adjust or discard suggestions.

1. Confirm selected assignments explicitly.

1. Notify volunteers only after confirmation.

1. Preserve the proposal and confirmation history.

This prevents a model from silently changing a real volunteer schedule.

### Attendance and completion

Attendance should work through several low-friction modes: coordinator mark-in, volunteer self-check-in, QR code, geolocation-assisted check-in where appropriate, manual correction, and offline capture for poor connectivity. The system should record arrival, departure, hours, supervisor, correction reason, and attendance evidence.

Completion should be a controlled transition with deliverables, supervisor confirmation, feedback, hours approval, certificate eligibility, and outcome tags. A volunteer should not remain indefinitely in an ambiguous state such as “accepted” when the activity has already ended.

### Communications

Organizations need message templates tied to events: application received, application approved, onboarding incomplete, shift reminder, location change, check-in reminder, no-show follow-up, completion thank-you, certificate ready, and re-engagement invitation. Microsoft documents automated messages for sign-up completed, sign-up approved, and engagement completed.[1]

Every message should show delivery status, recipient count, failure reason, and linked opportunity/application. Group messaging should be permission-controlled and auditable. Ralvo’s existing message UI should not display a generic empty-state instruction such as “Apply to a gig to start chatting” to an organization account.[13]

### Certificates and recognition

Certificates should be generated from verified completion records. The certificate payload should contain issuer, volunteer, opportunity, dates, hours, skills demonstrated, supervisor, verification ID, issue date, and revocation status. Recognition can include badges, recommendations, public service records, leadership progression, and invitations to advanced opportunities.

Points of Light’s guidance suggests that recognition and leadership development help volunteers feel valued and grow into greater responsibility.[15] Ralvo can turn this into a practical workflow: when a volunteer repeatedly completes work reliably, the organization can nominate them as a team lead, mentor, reviewer, or returning volunteer ambassador.

## Recommended data model

Ralvo should treat volunteer management as a set of connected records rather than a collection of page-specific counters.

| Entity | Important fields |
| --- | --- |
| `organizations` | name, type, verification status, location, contacts, policies, reputation |
| `organization_members` | organization ID, user ID, role, program/location scope, active status |
| `volunteers` | user ID, profile, availability, preferences, consent, privacy state |
| `volunteer_skills` | skill, proficiency, evidence, verification source, last used |
| `opportunities` | title, description, category, mode, location, dates, capacity, supervisor, status |
| `opportunity_requirements` | skill/qualification, required flag, evidence rule, screening question |
| `shifts` | opportunity ID, start/end, capacity, location, supervisor, status |
| `applications` | volunteer ID, opportunity ID, stage, consent, source, submitted data |
| `application_events` | application ID, old/new stage, actor, reason, timestamp |
| `onboarding_tasks` | assignment, type, owner, due date, status, evidence, completed timestamp |
| `assignments` | shift ID, volunteer ID, provisional/confirmed state, assignment reason |
| `attendance_records` | assignment ID, check-in/out, hours, method, correction audit |
| `submissions` | assignment ID, deliverable, review state, feedback, completion evidence |
| `certificates` | volunteer, opportunity, hours, skills, verification ID, issued/revoked state |
| `message_threads` | participants, organization, opportunity/application link, privacy scope |
| `notifications` | recipient user ID, organization scope, type, entity link, read/delivery state |
| `audit_events` | actor, organization, entity, action, before/after, reason, timestamp |
| `ai_runs` | provider, model, prompt/version, input references, output, reviewer decision |

### Status and aggregate rules

Use canonical enumerations and transition guards. Do not let each page invent its own interpretation of “active,” “completed,” or “pending.” Every aggregate should declare the included statuses and period. A zero result should be distinguishable from missing data, not enough data, or an unavailable integration.

For example, an impact dashboard should explain: “Verified hours from completed assignments between 1 January and 31 March, excluding withdrawn and declined applications.” This is more trustworthy than displaying a zero without a formula.

### Permissions and tenant isolation

Every organization-scoped query should enforce organization membership at the database and API layers. Use row-level security or equivalent policies for opportunities, applications, messages, documents, attendance, certificates, notifications, and audit records. Do not rely only on hidden UI buttons.

Libelle is a useful reference here: it separates public volunteer intake from a protected internal reviewer dashboard, uses backend-mediated resume access, derives internal actor identity for write actions, and keeps credentials out of the public repository.[9] OpenVolunteerPlatform similarly emphasizes secure APIs with role-based authorization, forms, maps, reports, live updates, and rules-based scheduling.[5]

## AI opportunities that genuinely reduce administrative work

| AI feature | User value | Guardrail |
| --- | --- | --- |
| Opportunity drafting | Turn a rough brief into a complete gig with duties, skills, schedule, and screening questions | Human review before publish; show changes and missing fields |
| Applicant summarization | Give a coordinator a concise summary with evidence and risks | Link every claim to source text; never invent experience |
| Explainable matching | Rank applicants by required/preferred skills, availability, evidence, and fit | Show components and allow override; do not auto-reject by default |
| Missing-information detection | Identify missing résumé, waiver, training, availability, or contact details | Ask the volunteer for correction rather than penalizing silently |
| Shift suggestion | Propose assignments that respect eligibility, capacity, availability, and conflicts | Provisional suggestions only; coordinator confirms |
| Communication copilot | Draft reminders, acceptance, decline, thank-you, and re-engagement messages | Show recipient list and message preview; human sends or approves |
| Volunteer re-engagement | Suggest past volunteers for similar opportunities | Respect opt-outs and explain why they were selected |
| Impact narrative | Turn verified hours/outcomes into a grant or donor-ready summary | Use only verified records and show source metrics |
| Support assistant | Answer organization questions about how to use Ralvo | Retrieval from Ralvo documentation and organization policy; no privileged data leakage |

### Matching formula

Start with a transparent hybrid score rather than a single black-box embedding:

```
match_score =
  0.35 * required_skill_fit
+ 0.20 * availability_and_schedule_fit
+ 0.15 * location_or_remote_fit
+ 0.10 * relevant_experience_evidence
+ 0.10 * volunteer_preference_fit
+ 0.05 * reliability_and_completion_history
+ 0.05 * application_quality
```

The weights should be configurable per opportunity and visible to the organization. Required skills should operate as hard constraints only when the organization explicitly marks them as mandatory. Transferable skills should be shown separately from exact matches.

### AI evaluation and fairness

Create a labeled evaluation set containing entry-level candidates, nontraditional experience, Nigerian location and language variations, incomplete résumés, transferable skills, physical and remote roles, and different education backgrounds. Measure shortlist precision, false negatives, recruiter overrides, interview/acceptance conversion, volunteer satisfaction, and explanations judged understandable by coordinators.

Store the model/provider version, input references, score components, explanation, reviewer decision, and eventual outcome. This makes the AI auditable and lets Ralvo detect when a model is systematically excluding candidates with less polished résumés.

## Codebase research and reuse recommendations

| Codebase | What it contributes | Recommendation for Ralvo | Reuse caution |
| --- | --- | --- | --- |
| [JobHorizons](https://github.com/NiepresJohn/jobhorizons-freelancing-marketplace) | React/Next.js/TypeScript marketplace with jobs, proposals, contracts, milestones, messaging, payments, admin, and AI proposal analysis | Use as a marketplace architecture reference if Ralvo expands beyond volunteering | MIT verified, but project is new; audit thoroughly |
| [Libelle](https://github.com/The-Chamber-of-Us/libelle) | React/Vite frontend, FastAPI backend, intake, résumé parsing, reviewer inbox, notes, statuses, secure document proxy, audit | Best reference for Ralvo’s organization inbox and structured volunteer intelligence | AGPL-3.0; use patterns or obtain legal approval before code reuse |
| [The Volunteer Hub](https://github.com/jwmojwmojwmojwmo/the-volunteer-hub) | Organization events, capacity, applicant review, attendance, AI event drafting, service records | Best product/UX reference for the desired Ralvo workflow | README says internal project; no permissive license verified |
| [4Water-Flow](https://github.com/joergensentroels/4Water-Flow) | Phone-first availability, shift exchange, auto-roster, eligibility, explanations, audit, calendar feeds, privacy | Best reference for shift logic and safe AI/rules assignment | AGPL-3.0-or-later; not a React marketplace |
| [VolunTrack](https://github.com/GTBitsOfGood/VolunTrack) | React/Next.js nonprofit event platform, org-scoped timesheets, admin actions, email | Borrow timesheet and operational patterns | Verify exact license and dependencies; setup references team-secret tooling |
| [OpenVolunteerPlatform](https://github.com/aerogear/OpenVolunteerPlatform) | RBAC API, forms, maps, GraphQL subscriptions, reports, automatic scheduling | Borrow role/access and real-time patterns | MIT; older stack and activity, not a drop-in modern foundation |
| [CiviVolunteer](https://github.com/civicrm/org.civicrm.volunteer) | Mature volunteer sign-up, role, schedule, participation, CRM model | Use as domain-model validation | PHP/CiviCRM extension; not React; verify license for any reuse |
| [Resume-Matcher](https://github.com/srbhr/Resume-Matcher) | Resume builder, application tracker, LLM providers, interview preparation, local/self-hosted workflows | Borrow resume/profile intelligence and application tracking ideas | Apache-2.0; integrate selectively, do not treat as the marketplace |
| [CloudGigs AI Blueprint](https://github.com/binary-exe/cloudgigs-ai-blueprint) | React/Supabase AI proposal screening, explainable matching, gig recommendations, escrow concepts | Borrow AI screening and explainability ideas only after review | License was not verified; do not copy into a commercial product without permission |

The most valuable technical patterns are not whole repositories. They are **shared eligibility logic, provisional assignments, structured intake, reviewer inboxes, org-scoped timesheets, auditable status transitions, secure document access, configurable templates, and explainable recommendations**.

## How the current Ralvo organization experience should change

The previous organization review showed that Ralvo already has Overview, Manage Gigs, Impact, Team, Settings, Messages, Community, verification, profile, applicant review, certificates, and a multi-step gig wizard.[11][16] The issue is that these surfaces do not yet behave like one operational system.

| Current Ralvo signal | Product implication |
| --- | --- |
| Dashboard shows active gigs, pending applicants, pending submissions, and engaged volunteers | Keep these metrics, but make each one a live action queue with a defined source and date range |
| Manage Gigs supports All, Active, Draft, and Completed | Add a canonical status machine, owner, deadline, next action, and publish state |
| Applicant review supports pending, accepted, and declined | Expand to an ATS pipeline with notes, screening, onboarding, interview, waitlist, and bulk actions |
| Gig wizard includes résumé, LinkedIn, portfolio, pitch, and custom questions | Turn these into structured application requirements and scorecard inputs |
| Settings includes CAC verification and organization profile | Surface verification state consistently in every opportunity and application view |
| Impact view has skills, volunteers, hours, certificates, and economic value | Rebuild from verified attendance/completion events with transparent formulas |
| Team has Owner/Admin/Manager permissions | Extend permissions to program, location, opportunity, applicant, messaging, and report scopes |
| Messages and Community exist | Link communications to opportunities/applications and prioritize operational messages over generic social feeds |

## Prioritized implementation roadmap

### P0: Trust and data integrity

Fix the defects that make organizations doubt the system: notification scoping, status inconsistency, epoch-zero dates, conflicting location/work mode, malformed opportunity content, stale onboarding progress, placeholder contact information, seeded community counts, and inconsistent impact aggregates.[11][13]

Create a test fixture that represents one organization, two volunteers, one opportunity, two shifts, one application, one accepted assignment, one attendance record, and one certificate. Assert that every page and API returns the same status, date, count, and organization scope.

### P1: Organization command center

Build the “Needs attention / Today / Upcoming / Program health” dashboard. Add quick actions for Create opportunity, Review applicants, Fill open shifts, Send reminder, Mark attendance, Issue certificates, and Export report. Replace passive counters with task queues.

### P1: Volunteer directory and ATS

Implement the canonical volunteer record, structured skills, availability, saved views, application pipeline, reviewer notes, screening questions, bulk actions, consent, and audit events. Keep AI out of the critical path initially so the organization can use the workflow reliably without a model.

### P1: Onboarding and communication automation

Add configurable onboarding checklists, waivers, training, reminders, group messaging, and event-linked message templates. Show completion status to both organization and volunteer.

### P2: Scheduling, attendance, and completion

Add shift calendars, capacity, availability, self-service signup, waitlists, shift exchange, check-in, hour approval, completion evidence, and certificate eligibility. Use one eligibility service for listing, claiming, planning, and assignment.

### P2: AI coordinator copilot

Add opportunity drafting, skill extraction, screening-question suggestions, applicant summaries, explainable rankings, schedule proposals, and message drafting. Require human review before publishing, assigning, declining, or sending.

### P3: Intelligence and network effects

Add re-engagement, leadership progression, verified skill evidence, organization reputation, volunteer feedback, cross-opportunity history, semantic search, program benchmarking, impact narratives, and integrations such as email, calendar, WhatsApp/SMS providers, spreadsheets, and accounting/reporting systems.

## Suggested technical architecture

Keep the existing React/TypeScript/Supabase direction, but reorganize the domain into clear modules:

```
Organization Workspace
├── Today / Needs Attention
├── Opportunities
├── Volunteers
├── Applications / ATS
├── Onboarding & Training
├── Schedule & Attendance
├── Communications
├── Certificates
├── Impact & Reports
└── Team / Permissions / Settings

Domain Services
├── Eligibility and matching
├── Status transition service
├── Notification and message outbox
├── Attendance and hours service
├── Certificate service
├── Document access and scanning
├── Audit-event service
└── AI run and human-review service
```

Use an outbox for email/SMS/WhatsApp notifications so a failed provider does not make an organization believe a message was sent. Use idempotency keys for application, assignment, attendance, certificate, and notification operations. Use database constraints for capacity, duplicate applications, and organization scope. Keep AI runs asynchronous for résumé parsing and bulk ranking, with a visible processing state and retry path.

A practical Supabase arrangement would include organization-scoped tables, RLS policies, private storage buckets for résumé and verification documents, public signed or proxy links for certificates, Edge Functions for privileged operations, and an append-only audit table. Do not put résumé URLs or provider credentials directly into public client code.

## Product metrics that matter

| Metric | Definition |
| --- | --- |
| Time to publish | Median time from starting an opportunity to publishing a complete, quality-checked listing |
| Review time | Median time from application receipt to first organization action |
| Fill rate | Confirmed volunteer slots divided by published capacity |
| Onboarding completion | Accepted volunteers completing all required onboarding items before the shift |
| Attendance rate | Checked-in assignments divided by confirmed assignments |
| No-show rate | Confirmed assignments without valid attendance or withdrawal |
| Completion rate | Started assignments reaching verified completion |
| Certificate turnaround | Time from verified completion to certificate issuance |
| Repeat participation | Volunteers completing another opportunity within a defined period |
| Communication delivery | Delivered reminders/messages divided by attempted messages |
| Admin hours saved | Coordinator-reported or activity-derived time reduction after automation |
| Match quality | Recruiter acceptance, override, interview, completion, and volunteer feedback by recommendation tier |
| Data integrity | Rate of records with conflicting status, dates, counts, scope, or missing required fields |

Do not optimize only for applications. A large number of low-quality applications increases coordinator workload. Optimize for **qualified applications, fast review, completed participation, verified impact, and repeat contribution**.

## Acceptance criteria for the next major release

| Area | Acceptance criterion |
| --- | --- |
| Data integrity | The same opportunity has the same status, location, date, applicant count, and organization on every relevant screen |
| Security | A volunteer never receives an organization’s private notifications, notes, documents, or applicant data; an organization sees only its own records |
| Opportunity quality | Publishing is blocked or clearly warned when title, description, location, dates, capacity, or supervisor information is missing or contradictory |
| ATS | A coordinator can move an applicant through a complete pipeline with notes, reasons, timestamps, and bulk messaging |
| Onboarding | A coordinator can define required steps and see exactly who is blocked and why |
| Scheduling | The system prevents double-booking and explains why a volunteer is ineligible or a shift is unfillable |
| Attendance | An organization can record, correct, approve, and audit attendance and hours |
| Communication | Every automated message has a trigger, recipient scope, delivery state, and linked entity |
| Certificates | Certificates are issued only from verified completion records and have a public verification state |
| AI | Every AI recommendation exposes evidence, score components, model/version, and human override; no silent auto-rejection |
| Reporting | Impact reports explain their date range, included statuses, formulas, and source records |

## Final recommendation

The fastest route to a much easier organization experience is to build **Ralvo Operations** as the product’s center of gravity. Start with a trustworthy command center, canonical volunteer directory, ATS-style application pipeline, onboarding checklists, and operational scheduling. Then add AI where it reduces repetitive work: drafting, extraction, summarization, recommendations, reminders, and impact narratives.

Use [Libelle](https://github.com/The-Chamber-of-Us/libelle) for reviewer-inbox, structured-intake, parsing, secure-document, and audit patterns; [4Water-Flow](https://github.com/joergensentroels/4Water-Flow) for availability, eligibility, shift exchange, and provisional roster logic; [VolunTrack](https://github.com/GTBitsOfGood/VolunTrack) for organization-scoped timesheets; [OpenVolunteerPlatform](https://github.com/aerogear/OpenVolunteerPlatform) for RBAC, real-time updates, forms, and maps; and [The Volunteer Hub](https://github.com/jwmojwmojwmojwmo/the-volunteer-hub) for product-level event, attendance, service-record, and AI-drafting ideas. Reuse code only where the license and security review permit it.

The core design principle is simple: **every organization action should have one obvious next step, every volunteer record should be reusable across opportunities, every recommendation should be explainable, and every impact number should be traceable to verified events.**

## References

[1]: # "Microsoft Volunteer Management: Manage volunteers — opportunity publishing, qualifications, onboarding, attendance, automated messages, dashboards, groups, and insights."

[2]: # "VolunteerHub platform — recruitment, self-managed scheduling, hours, reports, check-in, groups, communications, recognition, forms, and integrations."

[3]: # "Better Impact features — applications, role assignment, hour tracking, training, waivers, reminders, communications, permissions, reporting, API, security, and recognition."

[4]: # "GivePulse volunteer management — opportunity discovery, attendance verification, communication, and impact workflow signals."

[5]: # "OpenVolunteerPlatform repository — RBAC API, forms, maps, GraphQL subscriptions, reports, automatic scheduling, and field feedback."

[6]: # "4Water-Flow repository — phone-first availability, shift exchange, auto-rostering, GDPR, SQLite, and self-hosting."

[7]: # "CiviVolunteer documentation — mature volunteer signup, scheduling, role, tracking, and CRM concepts."

[8]: # "VolunTrack repository — React/Next.js event management and organization-scoped timesheet patterns."

[9]: # "Libelle repository — privacy-first volunteer intake, structured records, parsing, reviewer dashboard, notes, secure resume access, and audit patterns."

[10]: # "Ralvo organization dashboard — authenticated organization overview, metrics, onboarding, and action areas observed during testing."

[11]: # "Ralvo Manage Gigs and gig detail — gig list, status, displayed dates, applicants, and detail workflow observed during testing."

[12]: # "Ralvo organization impact dashboard — impact metrics and zero-value reporting observed during testing."

[13]: # "Ralvo organization messages — organization messaging empty state observed during testing."

[14]: # "NCVO: Involving volunteers — lifecycle guidance covering planning, recruitment, induction, support, retention, development, safeguarding, inclusion, and ending volunteering well."

[15]: # "Points of Light: Volunteer management best practices — leadership development, recognition, trust, listening, and communication."

[16]: # "Ralvo new-gig wizard — current opportunity-creation steps and application requirements observed during testing."

[17]: # "4Water-Flow query source — shared eligibility gates, availability resolution, reason codes, and double-booking prevention."

[18]: # "4Water-Flow roster source — provisional auto-roster, discard/lock-in behavior, fairness, and unfillable-gap reporting."

*This report is a product and technical research study, not legal advice, a security audit, or a production-readiness certification. License terms must be rechecked against the exact commit before code reuse.*