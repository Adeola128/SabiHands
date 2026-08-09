# Ralvo — QA Scorecard

The living record described in Section 4 of the QA & Testing Roadmap.

**Readiness score** = Pass ÷ (Pass + Fail).  
Blocked and Not yet planned are excluded from the denominator — they are expected at this build stage, not failures.

**Status key**
- ✅ Pass — tested, does what it is supposed to do
- ❌ Fail — tested, does not
- 🚧 Blocked — cannot be meaningfully tested yet; dependency not built
- ⬜ Not yet planned — not yet scoped as a test

---

## Pass 1 — 2026-08-04

### Lens 3.4 — Routing

| Test | File | Status | Notes |
|---|---|---|---|
| Hero "Find a gig" → `/signup?role=volunteer` | `Home.test.tsx` | ✅ | Was routing to `/signup/volunteer` (404) — fixed |
| Hero "Post a gig" → `/signup?role=org` | `Home.test.tsx` | ✅ | Was routing to `/signup/organization` (404) — fixed |
| Volunteer audience card CTA → `/signup?role=volunteer` | `Home.test.tsx` | ✅ | Same dead-route fix |
| Org audience card CTA → `/signup?role=org` | `Home.test.tsx` | ✅ | Same dead-route fix |
| Final-CTA "Find a gig" → `/signup?role=volunteer` | `Home.test.tsx` | ✅ | Same dead-route fix |
| Final-CTA "Post a gig" → `/signup?role=org` | `Home.test.tsx` | ✅ | Same dead-route fix |
| No bare `#` CTA links on Home | `Home.test.tsx` | ✅ | |
| "Back to home" → `/` | `Signup.test.tsx` | ✅ | Already correct |
| "Log in" → `/login` | `Signup.test.tsx` | ✅ | Already correct |
| "Terms of Service" → `/terms` | `Signup.test.tsx` | ✅ | Was `#` — fixed |
| "Privacy Policy" → `/privacy` | `Signup.test.tsx` | ✅ | Was `#` — fixed |
| No bare `#` links on Signup page | `Signup.test.tsx` | ✅ | |
| Nav logo → `/` | `Header.test.tsx` | ✅ | |
| Nav "Get started" → `/login` | `Header.test.tsx` | ✅ | |
| Nav "How it works" is `#how` anchor | `Header.test.tsx` | ✅ | Intentional in-page scroll |
| Nav "For volunteers" is `#audiences` anchor | `Header.test.tsx` | ✅ | Intentional in-page scroll |
| Nav "For NGOs & companies" is `#audiences` anchor | `Header.test.tsx` | ✅ | Intentional in-page scroll |
| Nav "The certificate" is `#certificate` anchor | `Header.test.tsx` | ✅ | Intentional in-page scroll |
| No bare `#` in nav links | `Header.test.tsx` | ✅ | |

### Lens 3.4 — ?role param pre-selection

| Test | File | Status | Notes |
|---|---|---|---|
| `?role=volunteer` opens volunteer tab | `Signup.test.tsx` | ✅ | |
| `?role=org` opens org tab | `Signup.test.tsx` | ✅ | |
| No param defaults to volunteer tab | `Signup.test.tsx` | ✅ | |

### Lens 3.2 — Logic

| Test | File | Status | Notes |
|---|---|---|---|
| Role toggle: volunteer → org reveals org fields | `Signup.test.tsx` | ✅ | |
| Role toggle: org → volunteer hides org fields | `Signup.test.tsx` | ✅ | |
| Sign-up submits with `role: "volunteer"` metadata | `Signup.test.tsx` | ✅ | |
| Sign-up submits with `role: "organization"` metadata | `Signup.test.tsx` | ✅ | |
| Duplicate email shows "already registered" error | `Signup.test.tsx` | ✅ | |
| "Continue with Google" calls `signInWithOAuth` with `provider: "google"` | `Signup.test.tsx` | ✅ | |
| Volunteer onboarding upserts with correct location + interests | `VolunteerOnboarding.test.tsx` | ✅ | Pre-existing test; mock corrected from `.update()` to `.upsert()` |
| Org onboarding upserts with correct org_type + cac_number | `OrganizationOnboarding.test.tsx` | ✅ | Pre-existing test; mock corrected from `.update()` to `.upsert()` |

### Lens 3.1 — User Flow

| Test | Status | Notes |
|---|---|---|
| Landing → sign-up page (volunteer path) | ✅ | Routing fixed; path now traversable |
| Landing → sign-up page (org path) | ✅ | Routing fixed; path now traversable |
| Sign-up form → OTP verification (`/verify-contact`) | 🚧 | Requires live Supabase connection; not a unit-test concern |
| OTP → volunteer onboarding → dashboard | 🚧 | Requires auth session |
| OTP → org onboarding → verification pending | 🚧 | Requires auth session |
| Full volunteer gig journey (browse → apply → accepted → check-in → certificate) | 🚧 | Requires back-end logic (Phase B3+) |
| Full org gig journey (post → review → confirm attendance → issue certificate) | 🚧 | Requires back-end logic (Phase B3+) |

### Lens 3.5 — Authentication

| Test | Status | Notes |
|---|---|---|
| Sign-up creates real account | 🚧 | Supabase auth implemented; manual testing needed against live instance |
| Google OAuth flow | 🚧 | Requires browser + OAuth callback; not unit-testable |
| Volunteer session cannot read another volunteer's data (RLS) | 🚧 | Phase B2 RLS policies not yet applied |
| Org cannot read another org's verification documents | 🚧 | Phase B2 RLS policies not yet applied |

### Lens 3.2 — Logic (back-end rules, blocked)

| Test | Status | Notes |
|---|---|---|
| Certificate cannot exist without a confirmed attendance record | 🚧 | Phase B3 not built |
| Application cannot skip from "pending" to "attended" | 🚧 | Phase B3 not built |
| Volunteer session returns only that volunteer's data | 🚧 | Phase B2 RLS not applied |

### Lens 3.6 — System / Overall

| Test | Status | Notes |
|---|---|---|
| End-to-end gig → certificate (all services live) | 🚧 | Phase B8+ |
| Load test | 🚧 | Phase B9 |

### Lens 3.3 — Page Coverage

| Test | Status | Notes |
|---|---|---|
| All 57 routes registered and component-filed | ✅ | See `page-coverage.md` |

---

## Readiness score — Pass 1

| Category | Pass | Fail | Blocked | Not yet planned |
|---|---|---|---|---|
| Routing | 19 | 0 | 0 | 0 |
| ?role param | 3 | 0 | 0 | 0 |
| Logic (front-end) | 8 | 0 | 0 | 0 |
| User flow | 2 | 0 | 5 | 0 |
| Authentication | 0 | 0 | 4 | 0 |
| Logic (back-end) | 0 | 0 | 3 | 0 |
| System | 0 | 0 | 2 | 0 |
| Page coverage | 1 | 0 | 0 | 0 |
| **Total** | **33** | **0** | **14** | **0** |

**Readiness score: 33 ÷ (33 + 0) = 100%** of what is currently testable passes.  
14 items are legitimately Blocked — the back-end roadmap (Phases B2–B9) is what unblocks them, one phase at a time.

---

## How to update this scorecard

1. When a new page or feature ships, add a row under the relevant lens.
2. Run `npm test` — new tests should fail first, then pass after the implementation.
3. Update the status column and the summary table at the bottom.
4. If an item moves from Blocked to testable, move it to the appropriate lens section and run the loop (Section 2 of the roadmap).

