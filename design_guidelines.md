# Design Guidelines: Quiz & Skill Assessment Platform

## Design Approach
**Selected Framework:** Material Design with Modern Dashboard Patterns (inspired by Notion, Linear, Khan Academy)

**Justification:** Educational productivity tool requiring clear information hierarchy, data visualization, and intuitive navigation between complex user flows (quiz-taking, performance tracking, admin management).

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 239 84% 48% (Vibrant blue for CTAs, active states)
- Surface: 0 0% 100% (White backgrounds)
- Surface Variant: 220 14% 96% (Card backgrounds, subtle sections)
- Text Primary: 220 13% 18% (Main content)
- Text Secondary: 220 9% 46% (Supporting text)
- Border: 220 13% 91% (Dividers, card outlines)
- Success: 142 71% 45% (Correct answers, high scores)
- Warning: 38 92% 50% (Skill gaps, attention areas)
- Error: 0 84% 60% (Incorrect answers, low scores)

**Dark Mode:**
- Primary: 239 84% 67% (Lighter blue for contrast)
- Surface: 222 47% 11% (Deep navy background)
- Surface Variant: 217 33% 17% (Elevated cards)
- Text Primary: 210 40% 98% (High contrast text)
- Text Secondary: 215 20% 65% (Muted text)
- Border: 217 19% 27% (Subtle dividers)

### B. Typography

**Font Families:**
- Primary: 'Inter' (UI, body text, navigation)
- Monospace: 'JetBrains Mono' (code snippets, quiz IDs, scores)

**Scale & Usage:**
- Hero/Page Titles: text-4xl font-bold (Quiz results, Dashboard headers)
- Section Headers: text-2xl font-semibold (Skill categories, Report sections)
- Card Titles: text-lg font-medium (Quiz cards, Question headers)
- Body Text: text-base font-normal (Quiz questions, descriptions)
- Captions/Metadata: text-sm text-secondary (Timestamps, user info)
- Small Labels: text-xs font-medium uppercase tracking-wider (Table headers, badges)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of **4, 6, 8, 12, 16, 24** for consistent rhythm
- Component padding: p-6 (cards), p-4 (compact elements)
- Section gaps: gap-8 (dashboard grids), gap-6 (lists)
- Page margins: px-6 md:px-12 (mobile to desktop)
- Vertical rhythm: space-y-8 (major sections), space-y-4 (related content)

**Grid Patterns:**
- Dashboard: 3-column grid (lg:grid-cols-3) for stats cards
- Quiz Questions: Single column max-w-3xl centered
- Admin Tables: Full-width with max-w-7xl container
- Reports: 2-column split (lg:grid-cols-2) for charts + data

### D. Component Library

**Navigation:**
- Top navbar: Sticky header with logo, main nav links, user avatar dropdown
- Admin sidebar: Fixed left sidebar (w-64) with collapsible menu groups
- Breadcrumbs: For deep admin navigation (Users > John Doe > Quiz History)

**Cards & Containers:**
- Quiz Cards: Rounded-xl with subtle shadow, hover:shadow-lg transition
- Dashboard Stats: Compact cards with large numbers, trend indicators (↑↓)
- Question Cards: Border-l-4 with skill color coding
- Report Cards: White/dark surface with subtle border

**Forms:**
- Input Fields: Rounded-lg border with focus:ring-2 ring-primary/20
- Select Dropdowns: Custom styled with chevron icons
- Radio/Checkbox: Large touch targets (min-h-12) for quiz options
- Submit Buttons: Primary color, w-full on mobile, auto width desktop

**Data Display:**
- Tables: Striped rows, sticky headers, sortable columns with icons
- Progress Bars: Skill proficiency indicators (0-100%), gradient fills
- Charts: Line charts for score trends, bar charts for skill comparison
- Badges: Pill-shaped for skill levels (Beginner/Intermediate/Expert)

**Feedback Elements:**
- Success Toast: Green banner with checkmark icon (quiz submitted)
- Error Alert: Red border-l-4 with warning icon (validation errors)
- Loading States: Skeleton screens for tables, spinner for button actions
- Empty States: Centered illustration + helpful text + CTA

**Quiz-Specific Components:**
- Question Card: Large readable text, clearly numbered (1/10)
- Answer Options: Full-width buttons with radio indicator, hover state
- Timer Display: Prominent countdown in corner (if timed)
- Result Summary: Large score display with confetti animation on pass
- Skill Breakdown: Visual grid showing performance per category

### E. Animations

**Essential Only:**
- Page transitions: Simple fade-in (200ms)
- Button clicks: Scale down slightly (95%) on active
- Card hover: Subtle lift (translateY(-2px))
- Chart reveals: Smooth data loading animation
- Success states: Confetti burst on quiz completion (high scores only)
- Tab switches: Slide transition for content panels

---

## Screen-Specific Guidelines

### Login/Register
- Centered card (max-w-md) on gradient background
- Clean form with social login options
- "Remember me" checkbox, "Forgot password" link
- Role indicator for admin vs user login

### User Dashboard
- 3-stat overview cards (Quizzes Taken, Avg Score, Skills Mastered)
- "Start New Quiz" prominent CTA button
- Recent quiz history table (5 rows, "View All" link)
- Skill progress bars with "Practice" quick action

### Quiz Taking Interface
- Clean, distraction-free layout
- Progress indicator at top (5/10 questions)
- Large question text with skill badge
- Answer options with clear selection state
- Navigation: "Previous" / "Next" / "Submit Quiz" buttons
- Timer (if applicable) in top-right corner

### Performance Reports
- Date range selector (This Week/Month/All Time)
- Score trend line chart (full width)
- Skill breakdown cards in 2-3 column grid
- Skill gap highlights with "Practice Now" CTAs
- Downloadable report button (PDF icon)

### Admin Panel
- Split layout: Sidebar + main content area
- Question Bank: Filterable table with inline edit
- User Management: Searchable table with action menu
- Bulk actions toolbar (Select all, Delete, Export)
- "Add New" floating action button (bottom-right)

---

## Images

**Hero Image:** No traditional hero - this is a utility dashboard application

**Illustrations:**
- Empty states: Use simple line illustrations from unDraw or similar (quiz icon, report icon)
- Success states: Achievement badges, trophy icons for milestones
- Error states: Friendly error illustrations (404, connection issues)

**User Elements:**
- Avatar placeholders: Colorful initials on solid backgrounds
- Skill icons: Simple monochrome icons per category (code, design, business)

---

## Key Design Principles

1. **Clarity First:** Information hierarchy guides users through complex flows (quiz → results → insights)
2. **Feedback Loop:** Immediate visual feedback for all actions (answer selection, form submission, score calculation)
3. **Data Readability:** Tables and charts prioritize scanability over decoration
4. **Educational Context:** Design supports learning journey with progress indicators and encouraging messaging
5. **Admin Efficiency:** Bulk actions, keyboard shortcuts, and quick filters for power users