# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# DecisionLogr - Development Blueprint

DecisionLogr is a lightweight architectural decision tracker enabling architects to create concise decision cards with context, 1–3 option choices (images, specs, cost impact), a required-by date, and a secure shareable client-facing link. Clients use the link (no login) to ask questions, request changes, or confirm choices. Architects manage decisions in a simple dashboard with status columns, activity history, and export capabilities. The app prioritizes auditability, fast client interaction, and minimal friction.

## 1. Pages (UI Screens)

- Landing Page
  - Purpose: Public marketing and conversion (signup/demo).
  - Key sections/components: Hero (headline, subheadline, primary/secondary CTA), Feature Highlights (4–6 cards), How It Works (3-step flow), Pricing Teaser, Social Proof, Footer (About, Help, Privacy, Terms, Contact).

- Signup / Login
  - Purpose: Create accounts and authenticate architects/PMs.
  - Key sections/components: Signup form (name, company, email, password, TOS checkbox, role/company size dropdown), Login form (email/password, magic link button, social/SSO buttons), inline validation, password strength meter, footer links.

- Email Verification
  - Purpose: Confirm email via token link.
  - Key sections/components: Spinner state, success/failure message, resend button (cooldown), CTAs to login or complete profile, error guidance.

- Password Reset
  - Purpose: Request and complete password resets.
  - Key sections/components: Request Reset form (email), tokenized Reset form (new password, confirm), validation and security notes.

- Cookie Policy + Consent Banner
  - Purpose: Explain cookies and capture preferences.
  - Key sections/components: Policy text listing cookies (usage/purpose/duration), Consent controls (accept all, reject non-essential, manage preferences), persistent preferences UI.

- Landing: Cookie-controlled Consent Banner
  - Purpose: Present consent choices on public pages.
  - Key sections/components: Brief copy, primary Accept, secondary Manage Preferences, link to Cookie Policy.

- Create Decision (multi-section form)
  - Purpose: Create or edit decision cards.
  - Key sections/components: Header (title, save draft, cancel), Project & context fields, Title & description (rich text limited), Options Section (1–3 repeating option cards with image upload, specs, cost delta, pros/cons, default toggle), Required-by date picker, Visibility & share settings (link generation, expiry, passcode, allow-comments), Assignee & notifications, Autosave/draft list, Preview Client View, Create/Save CTA.

- Decision Detail — Architect View
  - Purpose: Full management of a single decision.
  - Key sections/components: Header (title, breadcrumb, status badge, required-by, copy share link), Options panel (side-by-side option cards with edits), Activity & history feed, Comments & Q&A (threaded), Actions bar (Edit, Export PDF, Archive, Mark Decided, Send Reminder, Resend Link), Audit details (final choice, timestamps, confirmer identity), attachments area.

- Decision Detail — Client View (Share Link)
  - Purpose: No-login client interaction and confirmation.
  - Key sections/components: Header (project, area, required-by, optional firm logo), Option choice panel (large option cards, images, specs, cost delta, radio select), Client actions (Ask Question modal, Request Change form, Choose & Confirm dialog with optional name/email), Comment thread, Download PDF button, Security notice (expiry/passcode), Confirmation state (timestamp, assigned architect, print/save).

- Architect Dashboard
  - Purpose: Workspace for architects/PMs to manage decisions.
  - Key sections/components: Top nav (logo, global search, New Decision, notifications, user menu), Project selector, Kanban-style status columns (Pending, Waiting for Client, Decided, Overdue) with decision card previews, Filters & search panel, Bulk actions toolbar, Pagination/infinite scroll, Empty state prompt.

- Project Page / Project Settings
  - Purpose: Project-level configuration and team management.
  - Key sections/components: Project details form, team & permissions list, templates management, branding upload (logo/color override for client view), retention & export settings.

- Admin Dashboard
  - Purpose: System-level user/org management and monitoring.
  - Key sections/components: User management table, org overview metrics, audit logs, billing & plan management, moderation tools (revoke links, remove flagged attachments).

- Export / PDF Preview
  - Purpose: Configure and run exports (PDF/CSV).
  - Key sections/components: Export options (format, range, include history/images), PDF preview, download button, background job status.

- Settings / Account Preferences
  - Purpose: Personal and org settings, integrations.
  - Key sections/components: Profile info, password & security (2FA toggle, sessions), notifications, API & integrations (API keys, connected OAuth), organization defaults (link expiry, passcode requirements), email templates, billing link.

- Help / About
  - Purpose: Documentation and support.
  - Key sections/components: FAQ, quick start guide, contact support form (attachment optional), changelog, legal links.

- Terms of Service / Privacy Policy
  - Purpose: Legal pages referenced in signup and footer.
  - Key sections/components: Full legal text, accept checkbox on signup (TOS link), PDF download/print.

- 404 Not Found / 500 Server Error
  - Purpose: Friendly error handling for missing pages and server issues.
  - Key sections/components: Clear explanation, CTAs (home, support), retry button (500), optional authenticated actions (request new share link).

- Loading / Success / Empty States (reusable)
  - Purpose: UX states across app.
  - Key sections/components: Accessible spinner and skeletons, success toasts, empty state illustrations and CTAs.

## 2. Features

- Decision Card CRUD
  - Technical details: REST/GraphQL endpoints for create/read/update/archive; DB schema tables: Projects, Decisions, Options (1..3), Users, Activities, Comments, Attachments. Enforce max 3 options, required title and ≥1 option, required-by >= today.
  - Implementation notes: Soft-delete/archive flag; versioning or re-open flow if Decided; index by project, status, required-by.

- Shareable Client Link (no-login)
  - Technical details: Link tokens table: token (cryptographically random), expiresAt, passcodeHash (optional), allowedActions, createdBy, revoked flag.
  - Implementation notes: Signed tokens or UUIDs stored server-side; optional passcode protected; temporary signed URLs for images; server middleware validates token and actions; logging of IP/user-agent.

- Client Interaction Actions
  - Technical details: API endpoints: createComment, createRequestChange, confirmChoice. Payloads include linkTokenId, optional name/email, IP, user-agent. Immutability for confirmation record.
  - Implementation notes: When anonymous confirmation is allowed, capture name/email and record token id; prevent double-confirmation conflicts via transactional DB checks; optimistic UI with server validation; email + in-app notifications to assignee.

- Activity History & Audit Trail
  - Technical details: Append-only Activity table with actorId (nullable for guest), actorMeta (email/linkTokenId), actionType, payload JSON, timestamp. Optionally hash/sign entries for tamper-evidence.
  - Implementation notes: Include Activity export in PDF/CSV; retention configurable per org.

- Authentication & Authorization
  - Technical details: Email/password (bcrypt), emailVerified flag, magic link tokens, optional OAuth/SSO (Auth0/Okta) for enterprise, JWT access + refresh tokens with secure HTTP-only cookies or token store.
  - Implementation notes: Rate limiting on auth endpoints, CSRF protection, account lockout after failed attempts, RBAC with roles Owner/Admin/Editor/Viewer. Project-scoped permissions enforced by middleware.

- File Upload & Image Processing
  - Technical details: Client-side file validation and preview; server-side virus scanning (ClamAV/VirusTotal), image resizing and optimization, store in S3-compatible storage, generate thumbnails and signed temporary URLs for originals.
  - Implementation notes: Enforce max file size; store metadata (mime, dimensions) in DB; CDN for serving; lifecycle policies for retention.

- Export / PDF & CSV Generation
  - Technical details: Server-side rendering using Puppeteer or wkhtmltopdf for PDF including images and audit trail; CSV generator using streaming for large exports.
  - Implementation notes: Exports run as background jobs (queue), notify via email when ready, include optional signed timestamp/digital signature for legal use.

- Notifications & Email
  - Technical details: Integrate with SendGrid/Mailgun; send transactional emails (verification, magic link, share link, reminders, client actions). In-app notifications stored in DB with read/unread flags.
  - Implementation notes: Templating editable in project settings; retry/backoff and logging; unsubscribe/preferences stored per user.

- Scheduling & Reminders
  - Technical details: Background scheduler/worker (cron/queue) to run reminder jobs based on required-by date and configurable cadence.
  - Implementation notes: Support customizable templates and opt-out links. Retry strategies for failed sends.

- Search & Filters
  - Technical details: Use PostgreSQL full-text search initially; optional Algolia/Elasticsearch for scale. DB indices on title, specs, project, status, required-by, assignee.
  - Implementation notes: Debounced search on UI, saved filters, paginated server endpoints.

- Exports/Reporting & Admin Metrics
  - Technical details: Aggregate queries for overdue counts, avg time-to-decision, active links. Admin export endpoints for CSV.
  - Implementation notes: Cache heavy metrics in Redis and refresh on schedule.

- Security & Abuse Mitigation
  - Technical details: Rate limiting, link access logging, token revocation, CSRF/XSS protections, signed URLs, content-type enforcement on uploads.
  - Implementation notes: Optional passcodes and expiring tokens for client links; admin ability to revoke/regenerate.

- Performance & CDN
  - Technical details: CDN (CloudFront/Cloudflare) for static assets and images; Redis caching for heavy queries; HTTP caching headers for public client pages; APM monitoring.
  - Implementation notes: Optimize DB queries, paginate results, lazy-load images, skeleton screens for UX.

- Admin & Organization Controls
  - Technical details: Admin UI for user/org management, audit logs, retention policies, billing plans (stripe integration).
  - Implementation notes: Export logs, ability to revoke links and remove content flagged for policy violations.

- Analytics & Telemetry
  - Technical details: Track activation, engagement and conversion metrics; instrument key events (decision created, link shared, client confirmation).
  - Implementation notes: Hook into analytics provider and store minimal privacy-safe telemetry.

## 3. User Journeys

- Architect (Create → Share → Track)
  1. Sign up or log in (email/password or magic link/SSO).
  2. Create or select a Project.
  3. Click New Decision → fill title, area/context, required-by date.
  4. Add 1–3 options (upload images, add specs, enter cost delta, mark default).
  5. Configure share settings (generate link, optional expiry/passcode, allow-comments).
  6. Save decision (autosave drafts while editing).
  7. Copy share link and send to client.
  8. Monitor Architect Dashboard: decision appears in Pending.
  9. Receive notifications for client comments/requests/confirmation.
  10. Use Actions to mark Decided, export PDF, or archive; audit trail populated automatically.

- Client (Access via Share Link → Confirm)
  1. Open secure link (optionally enter passcode).
  2. View project/context and 1–3 option cards with images/specs/cost impact.
  3. Ask Question via modal or Request Change (structured form) — sends message to architect and appends to activity.
  4. Choose option → confirm dialog (enter name/email if anonymous required) → confirm.
  5. Confirmation recorded immutably and triggers email/in-app notification to assignee.
  6. Client sees confirmation timestamp and printable PDF; can download export.

- Project Manager (Monitor & Act)
  1. Log in and select Project from Project Selector.
  2. Use filters (status, required-by range, assignee) and search to surface decisions.
  3. Bulk select overdue decisions → send reminder or assign owner.
  4. Use metrics/exports to report time-to-decision and overdue counts.

- Admin (Manage Platform)
  1. Log in to Admin Dashboard.
  2. Manage users/orgs (suspend, reset password), view org metrics, manage retention settings.
  3. Review audit logs and moderate flagged attachments/links.
  4. Manage billing and subscriptions; configure SSO/enterprise settings.

## 4. UI Guide

- Global Layout
  - Top navigation (black #141414) with logo left, global search center-left and actions (new decision, notifications, user menu) right.
  - Three-column grid layout where applicable: main content center, left sidebar for filters/project selector, right column for recent events/quick actions.
  - Wide gutters and generous padding (24–32px). Left-aligned text and vertical centering within cards.

- Typography
  - Font family: Rounded geometric sans-serif (Inter/Nunito).
  - Weights: 400 (regular), 500 (medium), 700 (bold).
  - Headings: large, bold, generous spacing. Body: regular, high legibility.

- Color & Accent Usage
  - Primary background: #F7FAFC; card background: #FFFFFF.
  - Accent backgrounds for status/cards: #F6FDF6, #F4F0FF, #FFFBE6, #F0F8FF.
  - Primary text: #1A1A1A; secondary: #7A7A7A.
  - Badges/status accents: green #5FD37B, lavender #9D79F9, yellow #F6C96B, salmon #FF7A7A, sky blue #6AD8FA.
  - Borders/shadows: subtle #E5E7EB; faint drop shadows for elevation.

- Card Design
  - Rounded corners 18–24px, soft low-opacity shadow, minimal borders.
  - Alternating soft accent fills for status differentiation.
  - Hover: slight elevation increase and gentle background shift.
  - Visual hierarchy: bold title, smaller subtitle/body, actions grouped bottom-right.

- Navigation
  - Top nav black (#141414) with white/grey icons; sidebar uses rounded pill-shaped buttons with clear active state (filled accent, inverted icon color).
  - No collapsible sections: all major sections visible.

- Forms & Inputs
  - Rounded input fields, soft border, clear focus state using accent color.
  - Buttons: rounded pill shapes, filled with accent color, white text.
  - Inline validation and accessible helper text; password strength meter on signup.

- Data & Status Elements
  - Info counters: pill-shaped with soft backgrounds; large numbers and clear labels.
  - Status badges color-coded for quick scanning (green completed, yellow upcoming, salmon overdue).
  - Activity feed: chronological with actor avatar, timestamp, and concise message; separate client vs. architect messages visually.

- Interactive Patterns
  - Modal dialogs for Ask Question, Request Change, Confirm Choice; accessible focus management and keyboard close.
  - Copy-to-clipboard for share link with success toast.
  - Preview Client View button opens the share link in a new tab with same UI as client page.
  - Skeleton loaders for lists and cards while fetching.

- Accessibility
  - Ensure color contrast meets WCAG AA for primary text and actionable elements.
  - Keyboard navigable modals and forms; aria labels for key actions.
  - Announce toasts and validation errors via ARIA live regions.

- Micro-interactions
  - Small icon animations on hover/click (share, copy).
  - Smooth transitions on card hover elevation and badge status changes.
  - Toasts for success with brief auto-dismiss and manual close.

Implementation Notes (apply consistently)
- Strictly apply the Color Palette, Typography & Layout, Key Design Elements and Design Philosophy across components and pages.
- Use the three-column layout as a responsive baseline; collapse to single-column on mobile with tabbed or stacked sections.
- After each development step, validate UI components against this UI Guide and project context.

Instructions to AI Development Tool
- After every development step, refer back to this blueprint to ensure correct implementation. Verify pages, features, and UI adhere to the spec before marking steps complete. Pay special attention to share link security, audit trail immutability, image handling, and consent/cookie flows.

Appendix: Minimal Data Models (start point)
- users(id, name, email, passwordHash, role, companyId, emailVerified, createdAt, updatedAt)
- organizations(id, name, billingPlan, retentionPolicy, createdAt, updatedAt)
- projects(id, orgId, name, description, timezone, defaultRequiredByOffset, createdAt, updatedAt)
- decisions(id, projectId, title, area, description, requiredBy, status, assigneeId, visibilitySettings(JSON), archived, createdBy, createdAt, updatedAt)
- options(id, decisionId, title, specs(JSON), costDeltaNumeric, imageRefs(JSON), prosConsText, isDefault, createdAt)
- activities(id, decisionId, actorId nullable, actorMeta(JSON), actionType, payload(JSON), createdAt, hashSignature nullable)
- comments(id, decisionId, authorId nullable, authorMeta(JSON), body, attachments(JSON), createdAt)
- share_tokens(id, decisionId, token, expiresAt, passcodeHash nullable, allowedActions(JSON), revoked boolean, createdAt)
- attachments(id, decisionId nullable, commentId nullable, url, mime, width, height, size, storageKey, createdAt)

Deliverables Checklist
- All pages listed implemented per UI and accessibility requirements.
- API endpoints for decision CRUD, client actions, share token validation, comments, exports, and admin tasks.
- Background worker for exports, reminders, and virus scanning pipeline.
- Integrations: S3-compatible storage, SendGrid/Mailgun, optional Auth0/Okta, CDN and APM.
- Tests: unit tests for core services, integration tests for auth and share links, end-to-end flows for create→share→confirm.
- Deployment: infra IaC with staging/production, environment secrets, CI pipelines, monitoring, alerting, and backup policies.

This blueprint contains the implementation-ready requirements and UI guidance necessary to build DecisionLogr v1 with the specified scope, UI style, and security/operational considerations.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
