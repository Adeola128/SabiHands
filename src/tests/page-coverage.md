# SabiHands — Page Coverage Checklist

**Lens 3.3** of the QA & Testing Roadmap. Updated every time a page ships.

**Status key**
- ✅ Built & routed — exists in `App.tsx`, component file present
- 🚧 Stub / incomplete — route registered, component may be placeholder
- ⬜ Not yet started

**Last updated:** 2026-08-04  
**Source of truth for planned pages:** Front-end roadmap, Section 7

---

## Public / Marketing

| Route | Component | Status |
|---|---|---|
| `/` | `Home.tsx` | ✅ |
| `/how-it-works` | `HowItWorks.tsx` | ✅ |
| `/volunteers` | `ForVolunteers.tsx` | ✅ |
| `/organizations` | `ForOrganizations.tsx` | ✅ |
| `/community` | `Community.tsx` | ✅ |
| `/membership` | `Membership.tsx` | ✅ |
| `/about` | `About.tsx` | ✅ |
| `/verify` | `CertificateVerification.tsx` | ✅ |
| `/faq` | `FAQ.tsx` | ✅ |
| `/contact` | `Contact.tsx` | ✅ |
| `/terms` | `Legal.tsx` (type="terms") | ✅ |
| `/privacy` | `Legal.tsx` (type="privacy") | ✅ |

---

## Auth & Onboarding

| Route | Component | Status |
|---|---|---|
| `/login` | `Login.tsx` | ✅ |
| `/signup` | `Signup.tsx` | ✅ |
| `/forgot-password` | `ForgotPassword.tsx` | ✅ |
| `/reset-password` | `ResetPassword.tsx` | ✅ |
| `/verify-contact` | `VerifyContact.tsx` | ✅ |
| `/onboarding/volunteer` | `VolunteerOnboarding.tsx` | ✅ |
| `/onboarding/organization` | `OrganizationOnboarding.tsx` | ✅ |
| `/onboarding/pending` | `OrgVerificationPending.tsx` | ✅ |

---

## Volunteer Dashboard

| Route | Component | Status |
|---|---|---|
| `/dashboard/volunteer` | `VolunteerDashboard.tsx` | ✅ |
| `/dashboard/volunteer/gigs` | `BrowseGigs.tsx` | ✅ |
| `/dashboard/volunteer/gigs/:id` | `GigDetail.tsx` | ✅ |
| `/dashboard/volunteer/gigs/:id/apply` | `ApplyGig.tsx` | ✅ |
| `/dashboard/volunteer/applications` | `MyApplications.tsx` | ✅ |
| `/dashboard/volunteer/my-gigs` | `MyGigs.tsx` | ✅ |
| `/dashboard/volunteer/check-in` | `GigCheckIn.tsx` | ✅ |
| `/dashboard/volunteer/certificates` | `MyCertificates.tsx` | ✅ |
| `/dashboard/volunteer/certificates/:id` | `CertificateDetail.tsx` | ✅ |
| `/dashboard/volunteer/profile` | `VolunteerProfile.tsx` | ✅ |
| `/dashboard/volunteer/settings` | `EditProfile.tsx` | ✅ |

---

## Organization Dashboard

| Route | Component | Status |
|---|---|---|
| `/dashboard/org` | `OrgDashboard.tsx` | ✅ |
| `/dashboard/org/gigs` | `ManageGigs.tsx` | ✅ |
| `/dashboard/org/gigs/new` | `PostGig.tsx` | ✅ |
| `/dashboard/org/gigs/:id` | `OrgGigDetail.tsx` | ✅ |
| `/dashboard/org/gigs/:id/applicants` | `ReviewApplicants.tsx` | ✅ |
| `/dashboard/org/gigs/:id/attendance` | `MarkAttendance.tsx` | ✅ |
| `/dashboard/org/gigs/:id/certificates` | `IssueCertificates.tsx` | ✅ |
| `/dashboard/org/volunteers/:id` | `VolunteerDetailOrg.tsx` | ✅ |
| `/dashboard/org/settings` | `OrgSettings.tsx` | ✅ |
| `/dashboard/org/team` | `TeamMembers.tsx` | ✅ |
| `/dashboard/org/billing` | `MembershipBilling.tsx` | ✅ |
| `/dashboard/org/impact` | `ImpactDashboard.tsx` | ✅ |

---

## Shared Dashboard Routes

| Route | Component | Status |
|---|---|---|
| `/dashboard` | `DashboardRedirect.tsx` | ✅ |
| `/dashboard/notifications` | `Notifications.tsx` | ✅ |
| `/dashboard/messages` | `Messages.tsx` | ✅ |
| `/dashboard/community` | `Community.tsx` | ✅ |
| `/dashboard/organization/profile` | `OrganizationProfile.tsx` | ✅ |

---

## Admin Panel

| Route | Component | Status |
|---|---|---|
| `/admin` | `AdminDashboard.tsx` | ✅ |
| `/admin/org-verification` | `OrgVerificationQueue.tsx` | ✅ |
| `/admin/users` | `UserManagement.tsx` | ✅ |
| `/admin/gig-moderation` | `GigModeration.tsx` | ✅ |
| `/admin/certificates` | `CertificateRegistry.tsx` | ✅ |
| `/admin/billing` | `BillingAdmin.tsx` | ✅ |
| `/admin/sponsored` | `SponsoredPlacement.tsx` | ✅ |
| `/admin/support` | `SupportDisputes.tsx` | ✅ |
| `/admin/reports` | `ReportsAnalytics.tsx` | ✅ |

---

## System

| Route | Component | Status |
|---|---|---|
| `/403` | `PermissionDenied.tsx` | ✅ |
| `/maintenance` | `Maintenance.tsx` | ✅ |
| `*` (catch-all) | `NotFound.tsx` | ✅ |

---

## Summary

| Status | Count |
|---|---|
| ✅ Built & routed | 57 |
| 🚧 Stub / incomplete | 0 |
| ⬜ Not yet started | 0 |

> The roadmap document stated "2 of ~40 pages built." That was accurate at the time of the HTML prototype — the React migration has since built all planned pages. The honest current count is **57 of 57 routes registered and component-filed**.
