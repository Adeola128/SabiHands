# Ralvo UI Audit and Visual Improvement Specification

**Prepared by:** Manus AI**Review date:** 25 August 2026**Scope:** User interface only: layout, typography, spacing, color, visual hierarchy, components, cards, imagery, responsive structure, interactive states, and visual polish across public, volunteer, and organization screens.

## Executive summary

Ralvo has a strong public-facing visual idea. The indigo-and-mint palette, editorial serif headline, rounded CTA language, curved hero edge, and illustration-led storytelling create a recognizable identity. The public homepage is the strongest part of the interface and feels more distinctive than a generic job board.

The authenticated interface is functional-looking but visually feels like a separate product. It uses a pale administrative canvas, small serif section headings, thin borders, muted labels, repeated card shells, and a large amount of empty space. The most serious UI problem is the organization overview: a floating blue Getting Started widget overlaps the Action Required area while duplicating a different checklist above it. This looks like a development overlay and damages product credibility immediately.

The second major UI issue is the inconsistent treatment of opportunity cards. The volunteer dashboard and Browse Gigs screens use mixed image ratios, placeholder initials, cropped editorial text, inconsistent card heights, and weak metadata grouping. For a marketplace, cards are the primary product surface; their visual anatomy should be standardized before adding more features.

My recommendation is not to discard the current brand. **Keep the public visual identity, but build a shared product design system underneath it.** Use the same token set for public, authentication, volunteer, and organization templates, then allow each template to have its own composition. Prioritize removal of visible overlays, standardized cards, clearer authenticated hierarchy, consistent interactive states, better form composition, and intentional compact layouts.

## Review method and visual benchmarks

The review covered the public homepage and login, volunteer dashboard, Browse Gigs, gig detail, profile, Applications, Certificates, Messages, Community, and Settings, plus organization Overview, Manage Gigs, New Gig, applicant review, Team, Settings, Impact, Messages, and Community. Screens were inspected at the available desktop-like viewport and captured for visual review. Objective live measurements were also taken on Community at a 1280×1100 CSS viewport: there was no horizontal overflow, the document width matched the viewport, and the site used a responsive viewport meta tag. A narrow mobile viewport was not directly available in this browser session, so compact behavior must be validated in a real 320–600px pass.

The benchmark uses Nielsen Norman Group’s visual hierarchy principles: guide attention by scale, contrast, color, spacing, and grouping; avoid too many competing contrasts; and ensure the most important element is visually dominant.[1] It also uses Material Design 3’s adaptive-layout guidance: design across breakpoints and intentionally reveal, resize, reposition, or swap components as available space changes.[2] Material’s interaction-state guidance is used for enabled, disabled, hover, focus, pressed, and selected states.[3] Accessibility concerns are aligned to WCAG 2.2, especially visible focus, labels, contrast, reflow, and non-text alternatives.[4]

## Visual strengths to preserve

The homepage’s brand expression is a real asset. The dark indigo background, mint highlighted word, large serif hero, clear two-audience CTA pair, and asymmetric illustration create a memorable first impression. The hero is balanced at desktop width and establishes a clear emotional proposition before explaining the product.

The volunteer milestone card is the strongest authenticated component. It uses a dark gradient, a small overline, a large milestone title, explanatory text, progress bar, and a single focal illustration. The visual hierarchy is clear and the card is easy to recognize as a progress object.

The public gig detail has a good structural composition. Breadcrumbs, title region, white content area, summary/details block, CTA, and organization card create a sensible sequence. The certificate empty state is also well composed: its icon, title, explanatory copy, and discovery action form a clear center of gravity.

The organization New Gig wizard has a useful underlying visual concept: a four-step progress rail paired with a form canvas. The concept should be simplified rather than removed. The visual design needs to become calmer, lighter, more legible, and more responsive.

## Screen-by-screen UI findings

### Public homepage

The homepage is visually distinctive and has the clearest hierarchy in the product. Its main weakness is not the hero but the length and repetition of the lower page. Large claims, statistics, two audience sections, four steps, a quote, and a final CTA all compete for attention. The page would benefit from a compact section navigator or sticky CTA on long scrolls. On smaller screens, the hero headline, illustration, and CTA pair must be rebalanced rather than simply scaled down.

The public page should become the visual reference for the rest of Ralvo. Preserve its deep indigo, mint accent, warm off-white canvas, illustration quality, and editorial headline style, but define smaller product-scale variants for dashboard screens.

### Login and authentication

The split login layout is polished: the image/brand panel and white form panel create a strong focus area. The authentication form is visually simple and understandable. The main issue is that it introduces a visual language that does not smoothly transition into the dashboard. The login panel’s large editorial content and image treatment should be connected to the dashboard through shared brand tokens, not through identical layouts.

The password visibility button, Google button, Forgot password link, and Sign up link need a documented state system. At present, small secondary links and icon controls can look like decorative text. Primary, secondary, destructive, disabled, focus, and loading states should be visibly distinct.

### Volunteer dashboard

The dashboard has a good main split: impact summary on the left and action/recommendation content on the right. The top greeting is friendly but oversized relative to practical tasks. The three equal pill actions—Volunteer in-person, Volunteer virtually, Donate—give Donate the same visual weight as the core discovery actions. Make volunteer discovery primary and move Donate into a quiet secondary treatment.

The recommendation cards are the biggest visual defect on this screen. One card uses a large bright orange initials block; another uses a cropped editorial image where text is cut off and competes with the card title. Card heights and visual density vary. Adopt a fixed cover ratio, consistent crop/fallback logic, consistent metadata rows, a save action, and a stable match-reason footer. The match score should look like an informational badge, not the main headline.

### Volunteer Browse Gigs

The browse screen has a sound marketplace structure, with filters on the left and results on the right. The filter panel is visually dense because all controls are expanded and the state list is long. Convert filter groups into collapsible sections on desktop and a filter drawer/sheet on compact screens. Use selected filter chips near the result heading so users can see the active query without reopening the panel.

The result cards need one shared anatomy: cover image, role title, organization with verification mark, location/work-mode row, date/closing status, commitment, match/reason area, and primary action. The current cards use mixed image treatments and low-contrast small metadata. Standardize the visual rhythm before adding more search features.

### Public gig detail

The detail screen’s overall composition is good, but the hero image can contain oversized cropped editorial text behind the gig title. This creates an accidental second headline. Use a neutral branded cover or an image crop that never contains competing text. The Share Gig button is too low contrast and can look disabled. The title, role type, work mode, location, commitment, and date need stronger grouping and more generous separation. Replace the dense body paragraph with short sections or scannable bullets.

### Volunteer profile

The profile header is clean: avatar, name, location, tier, Edit Profile, and metric circles are easy to identify. The metrics are visually attractive but too detached from the identity and too small in label size. The Professional Background is a text wall because headings are embedded in the paragraph rather than separated into sections. Split the content into Background, Experience, Public Speaking, Causes, and Proof. Use a profile-completeness indicator and a stronger proof action.

### Volunteer Applications

The empty Applications layout is clean but sparse. The filter rail uses radio rows with weak selected-state emphasis, and the main panel leaves a large blank canvas around a generic magnifying-glass illustration. Use a segmented tab treatment with clear selected state, a compact empty illustration, and one primary discovery action. The populated state should use consistent application cards with stage, date, organization, next action, and a simple timeline.

### Volunteer Certificates

Certificates has one of the better empty-state compositions. The impact summary, filter card, sharing card, and My Certificates panel form a coherent grid. The main improvement is to reduce repeated discovery actions and make certificate sharing more visual. Add a sample certificate preview, certificate status badge, and one primary action. The filter panel should use compact chips or a dropdown at narrower widths.

### Volunteer Messages

The master-detail pattern is familiar, but the thread panel has too much blank space and the composer is crowded by the floating support widget. The conversation list is visually thin, with small role labels and minimal row separation. Add a richer selected-thread header with opportunity, application stage, participant, and last activity. Give the composer a clear container, visible attachment/send states, and enough bottom padding so the support widget never competes with it.

### Volunteer Community

The Community sidebar is clear and the composer has a reasonable structure. The empty feed, however, leaves most of the screen blank while the Trending Topics card suggests large activity. Visually, this feels disconnected. When there are no posts, use a deliberate empty illustration, starter prompts, and fewer or truthful topic counts. The Post button should be the clear action; Photo and Video can be secondary controls.

### Organization overview

This is the highest-priority UI fix. The screenshot shows a well-structured main checklist and a second blue Getting Started 3/4 overlay that covers the Action Required panel. The overlay’s struck-through items are hard to read and the two progress values disagree. Visually it resembles an unfinished development component. Remove the overlay, keep one checklist, and turn the Action Required panel into a real operational queue.

The organization dashboard also repeats Post a Gig, Manage Gigs, and View Impact across the top pills, left Quick Actions, and empty-state card. Repetition wastes visual attention. Make Post a Gig the primary action and put secondary destinations into one consistent action row. Use the recovered space for Today’s Queue: new applicants, upcoming check-ins, submissions waiting for review, and certificates to issue.

### Organization Manage Gigs

Manage Gigs is too sparse for an operational product. One wide row, small status text, and a large blank cover area make the page look unfinished. Introduce a stronger page header, a compact status segmented control, a list/grid toggle, consistent cover placeholders, clear status hierarchy, and an overflow menu for secondary actions. The applicant count and certificate action should be visually grouped with the gig lifecycle rather than separated from it.

### Organization New Gig

The stepper is visually interesting but too dark, image-heavy, and decorative for a task-heavy flow. The form field labels are small uppercase text and the Gig Type cards dominate the page. Cover thumbnails are tiny and use different crops, with ambiguous selected state. Move toward a lighter stepper, sentence-case labels, clearer section containers, fixed thumbnail frames, and a sticky bottom action bar. On compact screens, the stepper should collapse to “Step 1 of 4 — Basic information” with a progress indicator.

### Organization applicant review

The applicant review layout has a logical left summary rail and main candidate panel. The visual hierarchy is too weak for recruiter work. Candidate cards show names, applied dates, skill pills, status, message, and profile actions, but not the evidence that matters most. There is no clear primary action, no match score, no evidence preview, and no stage timeline. Use a table/list hybrid with stronger row hierarchy, a leading fit summary, a prominent stage badge, and an obvious Open Profile action. Bulk-selection and saved filters should have clear visual affordances when added.

### Organization Settings

Settings is orderly but visually under-signaled. The active sidebar tab is only lightly tinted, and the profile form has large empty gaps between fields. Upload Logo and Upload Cover Image look like small links rather than upload controls. Add section cards, stronger active-tab treatment, upload dropzones/previews, required-field marks, dirty-state indication, and a sticky Save bar with a visible saved confirmation.

### Organization Impact

Impact has consistent KPI cards and a tidy filter, but its visual balance is weak. Large zero cards and a large empty canvas make the screen look incomplete, while the Ralvo Coins banner receives more visual emphasis than the actual impact metrics. Reduce the gamification banner and give the primary metrics and trends more space. An empty state should show a purposeful illustrative chart placeholder and one action; a populated state should use simple bars/lines with labels and comparisons.

### Organization Team

The Team screen is clean but visually sparse. The Invite Member button is clear, while the Role Permissions panel is text-only and the empty active-member area is a large blank card. Add a small team illustration, an invitation count/state, and a scannable role comparison. The invitation dialog should use the same field/button styles as the New Gig form and provide visible success/error states.

## Cross-product design-system assessment

### Typography

The public homepage uses a strong Fraunces serif display face with Inter for body and navigation. Authenticated screens continue to use serif headings, but without a sufficiently defined scale. Define display, page title, section title, body, metadata, label, caption, and button tokens. Use serif for display/page titles and Inter for operational content. Avoid making every section heading look like a miniature marketing headline.

### Color

The indigo and mint palette is ownable, but authenticated screens introduce multiple pale lavender, green, yellow, blue, and orange surfaces without a clear semantic map. Define indigo for primary action and brand, mint for positive/impact, amber for attention, red for destructive/error, blue for informational, and neutral surfaces for layout. Do not use bright colors on decorative card art if they compete with primary actions.

### Spacing and containers

Dashboard screens use generous whitespace but inconsistent density. Adopt a 4/8px spacing scale, one maximum content width, consistent page gutters, and a limited set of card paddings. Use proximity intentionally: labels should be closer to their fields, section headers closer to their content, and unrelated blocks separated more strongly.

### Cards

Cards are currently the dominant container but vary too much in radius, border, shadow, imagery, and padding. Define Card, MetricCard, OpportunityCard, EmptyStateCard, FormSection, and ActivityItem variants. Each variant should have a fixed anatomy and responsive rules. Avoid using a card when a simple grouped section would be clearer.

### Buttons and interactive states

Define Primary, Secondary, Outline, Tonal, Text, Icon, and Destructive button variants. Every variant needs enabled, hover, focus-visible, pressed, disabled, loading, and success states. Use one icon size scale and never let icons replace labels for important actions. Material’s interaction-state guidance is a useful baseline.[3]

### Images and assets

Create an asset policy: opportunity covers should use a fixed ratio, focal-point-aware crop, and safe fallback; avatars should use a consistent circular frame; organization logos should use a consistent square frame; decorative illustrations should not dominate operational screens. The current mixed cover imagery is the most visible sign of design-system drift.

### Responsive behavior

Use adaptive breakpoints rather than a desktop layout that merely shrinks. Material Design 3 recommends compact single-pane layouts and expanded two-pane layouts where content density permits.[2] For Ralvo, the compact plan should be: top bar with menu/profile, one-column content, filter drawer, stacked cards, full-screen or bottom-sheet dialogs, and a bottom action bar for form steps. The expanded plan can use the existing two-column rails. Validate at 320, 375, 600, 840, 1200, and 1600px widths.

## Prioritized UI backlog

| Priority | Fix | Visual impact | Recommended implementation |
| --- | --- | --- | --- |
| P0 | Remove duplicated onboarding overlay | Eliminates the most visible “unfinished product” signal | One checklist component, no overlap, one progress count |
| P0 | Standardize opportunity cards and cover images | Improves the main volunteer marketplace surface | Fixed aspect ratio, crop/fallback rules, shared metadata anatomy |
| P0 | Introduce shared product design tokens | Stops public/dashboard visual drift | Tokenize colors, type, spacing, radius, shadows, controls |
| P1 | Rebuild organization dashboard hierarchy | Makes the operational product easier to scan | Today’s Queue, one primary CTA, compact KPIs, no duplicated actions |
| P1 | Simplify New Gig wizard visual treatment | Reduces perceived complexity and makes progress clear | Lighter stepper, section cards, sticky actions, responsive step header |
| P1 | Strengthen applicant review visual hierarchy | Makes ATS work feel professional | Candidate evidence summary, stage badge, fit indicator, primary open-profile action |
| P1 | Improve form and settings composition | Increases perceived quality and confidence | Sentence-case labels, grouped sections, upload previews, dirty/saved state |
| P1 | Fix public gig hero and share treatment | Improves conversion and polish | Remove competing background text, stronger Share state, scannable details |
| P1 | Prevent support widget overlap | Preserves content hierarchy | Safe-area positioning, dashboard-aware placement, dismiss/snooze |
| P1 | Establish interactive state system | Makes every control more predictable | Shared hover/focus/pressed/disabled/loading/success states |
| P2 | Improve empty states | Prevents blank/unfinished appearance | Task-specific illustration, one primary action, no contradictory counts |
| P2 | Rework profile and application cards | Improves scanning of proof and lifecycle | Sectioned profile, stage timeline, evidence blocks |
| P2 | Add compact/mobile layouts | Protects product quality on phones | Filter drawer, stacked cards, collapsed stepper, single-pane messaging |
| P2 | Add impact visualizations | Makes reporting feel like a finished product | Charts, comparisons, definitions, meaningful empty state |
| P3 | Refine public homepage long-scroll | Preserves brand while reducing fatigue | Section navigation, compressed proof blocks, sticky CTA |
| P3 | Add visual polish to team/community | Increases perceived maturity | Empty illustrations, role comparison, feed cards, topic chips |

## Six-week UI implementation plan

### Week 1: Remove visible defects

Remove the floating onboarding overlay, eliminate overlapping content, fix card clipping, give the support widget safe placement, and remove decorative imagery that competes with headings. These changes provide the largest immediate visual credibility gain.

### Week 2: Build tokens and primitives

Create the shared color, typography, spacing, radius, shadow, container, Button, Badge, Chip, Card, EmptyState, FormField, Modal, Tabs, and Progress components. Document the visual states and use them across one volunteer and one organization screen first.

### Week 3: Rebuild marketplace surfaces

Standardize OpportunityCard, cover image behavior, metadata rows, match badges, saved action, and card responsive rules. Apply the same components to Volunteer Dashboard, Browse Gigs, and Gig Detail.

### Week 4: Rebuild organization operations surfaces

Redesign Organization Overview, Manage Gigs, Applicant Review, and Impact using a common operational shell. Establish one page header, one action row, one content grid, and consistent status/badge patterns.

### Week 5: Rebuild New Gig and settings forms

Apply the form system to New Gig, organization Settings, volunteer Profile, and volunteer Preferences. Add sticky action bars, visible selected states, upload previews, grouped sections, and compact responsive behavior.

### Week 6: Visual QA and responsive release gate

Capture every key route at compact, medium, and expanded widths. Run a screenshot-diff review for spacing, typography, card heights, alignment, overlay collision, focus-visible state, and empty/loading/error states. Do not ship a screen with placeholder artwork, duplicated checklist overlays, clipped headings, or floating widgets covering actions.

## Definition of done for the UI

| Category | Definition of done |
| --- | --- |
| Brand | Public and authenticated screens share one documented token system while retaining appropriate template differences |
| Hierarchy | Each screen has one visually dominant task, one primary CTA, and clear secondary actions |
| Cards | All opportunity, candidate, metric, empty, and form cards use documented variants and responsive rules |
| States | Enabled, hover, focus, pressed, disabled, loading, error, empty, and success states are visually distinct |
| Responsive | No horizontal overflow, clipping, overlap, or inaccessible controls at 320, 375, 600, 840, 1200, and 1600px |
| Forms | Labels, field groups, selected states, upload states, dirty states, and save confirmation are clear at a glance |
| Imagery | No cropped text competes with UI headings; every asset follows a consistent frame/fallback policy |
| Operational dashboard | Organization Overview prioritizes Today’s Queue and one next action rather than duplicated navigation cards |
| Marketplace | Volunteer cards are consistent, scannable, and visually credible in list and grid formats |
| Accessibility | Visual implementation supports WCAG 2.2 AA checks for contrast, reflow, focus, labels, and non-text content |

## Final recommendation

Ralvo should not undergo a complete visual rebrand. The current homepage identity is valuable. The necessary change is to carry that identity into a disciplined product UI system. Start with the organization overview overlay, opportunity cards, and shared tokens. These three changes will produce the largest visible improvement across the product. Then redesign the New Gig and Applicant Review surfaces so the organization side looks like a serious operations tool, while refining volunteer profiles, applications, certificates, messages, and community with the same component language.

The guiding visual principle should be: **editorial warmth in the brand, operational clarity in the product.** Ralvo can feel human and Nigerian without looking like a collection of unrelated prototype screens.

## References

[1]: # "Nielsen Norman Group — Visual Hierarchy in UX: Definition and 5 Principles of Visual Design in UX — scale, hierarchy, balance, contrast, grouping, and spacing."

[2]: # "Material Design 3 — Breakpoints — adaptive layouts, compact/medium/expanded breakpoints, pane changes, and intentional reveal/resize/reposition/swap behavior."

[3]: # "Material Design 3 — States — enabled, disabled, hover, focus, pressed, and dragged component states."

[4]: # "W3C — How to Meet WCAG 2.2: Quick Reference — accessibility success criteria and techniques."

*This report evaluates visual UI from direct inspection of the live website and captured screens. It is not a formal accessibility certification, user study, or design-file review. Compact-width behavior requires a dedicated narrow viewport pass before release.*