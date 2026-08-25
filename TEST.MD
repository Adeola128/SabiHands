# Ralvo Volunteer-Side Test Report

**Website:** [ralvo.com.ng](https://www.ralvo.com.ng/)**Test date:** 24 August 2026**Test account:** Authorized volunteer account supplied by the owner**Test mode:** Non-destructive functional and UX review

## Executive summary

The volunteer experience has a coherent navigation structure and a promising value proposition. After authentication, the account can access Home, Browse Gigs, Applications, My Gigs, Certificates, Messages, Community, profile settings, and notifications.[1] Opportunity discovery includes useful filters for gig type, Nigerian state, remote work, date range, sorting, and title/skill/organization search.[2] The application form also supports a short motivation response, portfolio, LinkedIn, résumé upload, and consent.[3]

The most serious problem is **account-data consistency**. The volunteer dashboard shows zero gigs, zero certificates, and zero applications, while the notification center displays an approved React Developer application, five completed gigs, a check-in reminder, a gig recommendation, a declined application, and an issued certificate.[5][6] This is likely seeded/demo data leakage or incorrect account scoping and should be treated as a high-priority trust defect.

The second major issue is **opportunity quality and matching transparency**. The account was recommended a gig titled “hii” with description “hiii j,” and the gig itself contradicts its location: the header says Remote while the details say On-Site.[2][7] Ralvo has the foundation for AI matching, but the volunteer sees no match score, explanation, profile-completeness guidance, saved preferences, or feedback controls. The Preferences page explicitly says notification and matching preferences are “coming soon.”[8]

## Test coverage

| Area | Result | Notes |
| --- | --- | --- |
| Login | Passed | Authorized volunteer credentials redirected to the volunteer dashboard |
| Dashboard | Passed with data-quality issues | Main navigation and recommendations loaded; currency and recommended-content concerns observed |
| Browse Gigs | Passed with content issues | Filters and two open gigs loaded; one gig appears to be placeholder content |
| Public gig detail | Passed with contradictions | Remote/on-site conflict; public Apply Now route points to signup |
| Authenticated application form | Passed | Prefilled identity, motivation, links, résumé upload, consent, and submit controls loaded; not submitted |
| Applications | Passed | Empty state loaded; no applications shown |
| My Gigs | Passed | Empty state loaded; no active or completed gigs shown |
| Certificates | Passed | Empty certificate wallet loaded; filters and public-profile prompt present |
| Volunteer profile | Passed with content issues | Profile loaded but bio formatting, location, and missing profile fields need improvement |
| Messages | Passed | Existing “hii” conversation loaded; no message sent |
| Notifications | Passed with severe data mismatch | Six notifications visible, including activity inconsistent with every other volunteer page |
| Settings/preferences | Passed with feature gap | Public profile fields exist; matching preferences are not implemented |

## Findings by severity

| ID | Severity | Finding | Evidence observed | Recommended action |
| --- | --- | --- | --- | --- |
| V-01 | Critical | Volunteer account data does not match notification data | Applications, My Gigs, and Certificates each show zero records, but notifications describe an approved application, five completed gigs, a check-in, an application decline, and an issued certificate.[4][5][6] | Audit notification queries and row-level access. Scope every notification by authenticated user ID and role. Remove or label fixtures. Add automated cross-account isolation tests. |
| V-02 | High | Gig location is contradictory | The “hii” gig is marked Remote in the hero/header and application page, but its detail metadata says Location On-Site.[3][7] | Define one canonical location/work-mode field and render it everywhere from the same API object. Add regression tests for Remote, On-Site, Hybrid, and missing location. |
| V-03 | High | Low-quality or placeholder opportunities are published/recommended | The recommended gig title is “hii” and its description is “hiii j.”[1][2][7] | Add minimum title/description validation, content-quality checks, organization moderation, draft status, and an admin review queue. Do not include low-quality or incomplete gigs in recommendations. |
| V-04 | High | Volunteer sees no explanation for recommendations | “Recommended for You” shows gigs but no match percentage, matched skills, missing requirements, or reason for recommendation.[1] | Add explainable match cards showing matched skills, transferable skills, missing requirements, location/work-mode fit, and confidence. Allow “not relevant” feedback. |
| V-05 | High | Matching preferences are unavailable | Volunteer Preferences displays “Notification and matching preferences coming soon.”[8] | Add preferences for causes, skills, gig type, remote/in-person, location radius, availability, duration, notification channels, and frequency. Use these as deterministic constraints before AI ranking. |
| V-06 | Medium | Currency localization is inconsistent | Volunteer dashboard shows `$0` for impact while the organization impact view uses `₦0`; Ralvo is positioned as Nigeria-focused.[1][9] | Introduce a currency/locale service, default to NGN for Nigerian users, and show the basis for any monetary impact estimate. Do not display dollar values unless the user selects another currency. |
| V-07 | Medium | Volunteer profile is not structured enough for reliable matching | Profile has comma-separated skills, missing/placeholder headline, phone, state, LinkedIn, and portfolio values, and no profile-completion score.[10] | Use structured skills with proficiency and evidence, availability, preferred work mode, location, education, portfolio, résumé, certifications, and profile-completion prompts. |
| V-08 | Medium | Volunteer bio has formatting and tone defects | Bio displays merged labels such as “digital media.Profile OverviewProfessional Background” and uses third-person wording (“He”).[10][11] | Store section fields separately, render with controlled spacing, provide a preview, and use direct first-person or neutral copy. Add sanitization and content-length validation. |
| V-09 | Medium | Public authenticated-user application path is confusing | Public gig detail shows Apply Now leading to `/signup` and a Log In link, even though the volunteer is already authenticated in the dashboard flow.[7] | Detect authentication state on public routes. Route authenticated volunteers directly to the application form and unauthenticated users to login, preserving the gig ID after login. |
| V-10 | Medium | Consent language is ambiguous | Application consent says “I agree to let Ralvo share this application with Ralvo,” which does not clearly identify the receiving organization.[3] | Display the receiving organization’s verified name, the purpose of data sharing, retention period, contact, and withdrawal/deletion options. |
| V-11 | Low | Empty My Gigs state lacks a lifecycle explanation | My Gigs shows zero items and a Find one today link but does not explain how an application becomes accepted, active, checked in, submitted, and certified.[5] | Add a simple lifecycle guide and contextual links to applications, check-in, submissions, and certificates. |
| V-12 | Low | Messaging contains probable seed content and weak context | Conversation with Adebambo Adeola contains only “hii” and is not visibly linked to a gig or application.[12] | Link each conversation to a gig/application, show participants’ roles, add system events, and isolate test messages from production accounts. |

## What is working well

The top-level volunteer navigation is easy to understand. Browse Gigs, Applications, My Gigs, Certificates, Messages, and Community are separated into recognizable tasks, reducing the need for a volunteer to learn a complex workflow.[1]

The Browse Gigs page already contains several of the deterministic filters required for a useful marketplace: skilled versus physical/event work, Nigerian state, remote status, date range, sort order, and keyword search.[2] These can become the constraint layer beneath semantic AI matching rather than being replaced by an opaque model.

The application form is appropriately lightweight for early-stage volunteer opportunities. It pre-fills identity information and allows a motivation response, portfolio, LinkedIn, résumé, and consent.[3] A future ATS can reuse these fields while adding structured screening questions and evidence extraction.

Certificates are presented as public proof and are connected to completed gigs and attendance verification.[6] This is a strong differentiator for Ralvo because it turns volunteer activity into a portable record of experience.

## Recommended volunteer experience

Ralvo should evolve the volunteer dashboard from a static list of recommendations into a **personal opportunity workspace**.

| Experience layer | Recommended design |
| --- | --- |
| Profile readiness | Show a profile-completion percentage, missing fields, and the effect of each field on matching quality |
| Preferences | Let volunteers define causes, skills, locations, remote/in-person preference, availability, time commitment, and notification frequency |
| Recommendations | Show match score, matched requirements, missing requirements, evidence, organization verification, and reason for recommendation |
| Application | Show required and optional inputs clearly, identify the receiving organization, offer résumé parsing preview, and explain how information will be used |
| Application tracking | Provide a timeline from submitted to screening, shortlisted, accepted, in progress, submitted, completed, and certificate issued |
| Trust | Display verified organization information, gig quality signals, reviews, expected response time, and reporting controls |
| Certificates | Provide a certificate wallet with skills demonstrated, issuer, date, verification URL, and share/export options |
| Notifications | Allow per-category preferences and ensure every item is linked to the correct account, gig, organization, and action |

## AI matching roadmap

### Stage 1: Deterministic profile and preference matching

Before using an LLM, normalize location, gig type, skills, availability, duration, and remote status. Treat explicit must-have constraints as filters. A volunteer should never be recommended an On-Site gig when they selected Remote-only, and a gig with an empty description should never pass the quality threshold.

### Stage 2: Explainable semantic ranking

Embed the structured volunteer profile, résumé, portfolio, application pitch, and gig description. Combine semantic similarity with exact skills, location, availability, work mode, and organization trust. The result should provide a transparent breakdown: matched skills, transferable skills, missing requirements, evidence snippets, and confidence. It should also allow the volunteer to correct extracted skills.

### Stage 3: Feedback and outcome learning

Add controls such as “Not relevant,” “Already applied,” “Too far,” “Wrong skill,” and “Show fewer like this.” Use feedback to improve future ranking, but retain human-readable reasons. Measure recommendation click-through, application conversion, acceptance rate, completion rate, and certificate issuance—not only clicks.

### Stage 4: Resume and profile intelligence

Allow a volunteer to upload a résumé or build a profile without one. Extract skills and experience into editable fields, detect missing evidence, suggest a headline, and propose suitable opportunities. Make it clear when a recommendation is based on résumé text, profile skills, stated preferences, or activity history.

## ATS-connected volunteer workflow

The volunteer does not need to see the entire recruiter ATS, but should see a clear and respectful status timeline. Each application should have a stable ID and show the receiving organization, gig, submitted information, current status, last update, next expected action, and withdrawal/privacy controls.

A recommended status sequence is **Submitted, Screening, Shortlisted, Interview or Clarification, Accepted, In Progress, Submission Review, Completed, Certificate Issued, Declined, or Withdrawn**. Each transition should record the timestamp and responsible party. This will make notifications trustworthy and allow the organization-side ATS to remain synchronized with the volunteer experience.

## Priority roadmap

| Priority | Work item | Expected result |
| --- | --- | --- |
| P0 | Fix account scoping for notifications and test/demo data | Volunteer sees only their own real activity |
| P0 | Normalize gig status, work mode, location, and timestamps | Same facts appear across browse, detail, application, profile, and notifications |
| P0 | Remove or moderate placeholder gigs and seed messages | Recommendations and public pages become trustworthy |
| P1 | Add profile completion, structured skills, preferences, and availability | Better matching inputs and higher-quality applications |
| P1 | Make public and authenticated apply routes authentication-aware | Logged-in volunteers reach the application form directly |
| P1 | Correct NGN/USD localization and consent wording | Clearer Nigerian context and safer data-sharing expectations |
| P2 | Add explainable matching and recommendation feedback | Volunteers understand and improve their recommendations |
| P2 | Add application timeline and linked notifications | Volunteer and organization ATS states remain synchronized |
| P2 | Expand certificate wallet and evidence-based portfolio | Completed work becomes portable, verifiable proof |

## Retest checklist

The next volunteer test should use a staging database with one clearly labeled test account and one clearly labeled test gig. Verify that a newly submitted application appears only in that volunteer’s Applications page and in the correct organization’s applicant pipeline. Move it through every test status and confirm that the status, timestamps, notifications, messages, and My Gigs view agree.

Then test Remote and On-Site opportunities, Nigerian state filters, profile changes, résumé upload, recommendation feedback, and certificate issuance. Confirm that deleting or withdrawing an application removes or anonymizes the correct data according to the product’s retention policy. Finally, log in simultaneously as an organization and volunteer in separate browser contexts to verify role and tenant isolation.

## Conclusion

The volunteer-side product has the essential marketplace surfaces, but its current trust layer is not reliable enough for AI matching or ATS analytics. The correct sequence is **data isolation and consistency first, structured profile and application workflow second, explainable AI matching third**. Once those foundations are fixed, Ralvo can turn volunteer activity into a credible, searchable, and verifiable professional track record.

## References

[1]: # "Ralvo volunteer dashboard — volunteer navigation, impact, milestones, and recommendations."

[2]: # "Ralvo Browse Gigs — volunteer discovery filters and visible opportunities."

[3]: # "Ralvo authenticated application form — prefilled identity, motivation, links, résumé upload, consent, and submit flow."

[4]: # "Ralvo volunteer Applications — zero applications shown for the tested account."

[5]: # "Ralvo volunteer My Gigs — zero active/completed gigs shown for the tested account."

[6]: # "Ralvo volunteer Certificates — zero certificates and certificate-wallet empty state."

[7]: # "Ralvo public gig detail — public gig description, Remote/On-Site contradiction, and Apply Now behavior."

[8]: # "Ralvo volunteer settings — profile fields and “notification and matching preferences coming soon.”"

[9]: # "Ralvo organization impact dashboard — Nigerian naira impact display used for comparison."

[10]: # "Ralvo volunteer profile — profile content, skills, location, impact, and certificate sections."

[11]: # "Ralvo volunteer public-profile settings — editable bio, skills, causes, links, and profile fields."

[12]: # "Ralvo messages — existing volunteer conversation and messaging controls."

*This report describes observed behavior during a non-destructive review. It is not a penetration test, source-code audit, legal opinion, or production-readiness certification.*