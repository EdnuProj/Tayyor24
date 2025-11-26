# Design Guidelines: Art Services Comparison Platform

## Design Approach

**Hybrid Approach**: Clean, scannable comparison interface inspired by modern SaaS platforms (Linear, Notion) combined with gallery-inspired aesthetics for art context. Prioritizing clarity and usability while maintaining visual sophistication appropriate for art enthusiasts.

**Core Principle**: Information hierarchy over decoration - every visual element serves the comparison experience.

---

## Typography System

**Primary Font**: Inter or Archivo (Google Fonts)
- Hero/H1: 4xl to 6xl, font-weight 700
- Section Headers/H2: 3xl to 4xl, font-weight 600
- Card Titles/H3: xl to 2xl, font-weight 600
- Body Text: base to lg, font-weight 400
- Pricing: 2xl to 3xl, font-weight 700
- Small Details/Meta: sm, font-weight 500

**Secondary Font** (for artistic accents): Playfair Display or Cormorant
- Use sparingly for hero tagline or section accents

---

## Layout & Spacing System

**Tailwind Units**: Consistently use 4, 6, 8, 12, 16, 20, 24 for spacing
- Component padding: p-6 to p-8
- Section padding: py-16 to py-24 (desktop), py-12 (mobile)
- Card gaps: gap-6 to gap-8
- Element margins: mb-4, mb-6, mb-8 for vertical rhythm

**Container Strategy**:
- Full-width sections with inner max-w-7xl
- Comparison tables: max-w-6xl
- Text content: max-w-4xl

---

## Page Structure

### Homepage

**Hero Section** (70-80vh):
- Large hero image: Abstract art installation or curated gallery space with subtle overlay
- Centered headline + subheadline
- Primary CTA button with blur background effect
- Secondary "How it Works" link
- Trust indicator: "Comparing 50+ art services" with subtle stat display

**Quick Compare Preview** (2-column on desktop):
- Featured comparison cards showing 2-3 popular services side-by-side
- Quick-glance pricing + key features
- "View Full Comparison" CTA

**Features Grid** (3-column on desktop, stack mobile):
- Icons + titles + descriptions for: Easy Filtering, Side-by-Side Comparison, Regular Updates, Curated Reviews
- Each card with subtle border, generous padding (p-8)

**How It Works** (alternating 2-column layout):
- Step 1: Browse Services (left text, right visual)
- Step 2: Compare Features (right text, left visual)
- Step 3: Make Decision (left text, right visual)

**CTA Section**:
- Centered heading "Start Comparing Art Services"
- Primary button + supporting text
- No floating elements - grounded with py-20 padding

### Comparison Page (Main Interface)

**Filter Sidebar** (fixed left, 280px width on desktop, drawer on mobile):
- Search input at top
- Collapsible filter groups: Service Type, Price Range, Features, Rating
- Checkbox/radio inputs with clear hierarchy
- "Clear Filters" button at bottom

**Comparison Grid** (main content area):
- Horizontal scroll cards (3-4 visible on desktop)
- Each service card contains:
  - Service logo/image (16:9 ratio)
  - Service name (text-2xl, font-semibold)
  - Star rating + review count
  - Pricing tiers table
  - Feature checklist with icons
  - "Learn More" + "Visit Website" CTAs
- Sticky header row showing categories

**Floating Compare Bar** (sticky bottom when items selected):
- Shows selected services (2-4 items)
- "Compare Now" button
- Clear selections option

### Admin Dashboard

**Simple Card-Based Layout**:
- Top navigation: Services, Pricing, Features, Settings
- Main content area with data table showing all services
- Action buttons: Add New, Edit, Delete (icon buttons)
- Inline editing where possible
- Form overlays for adding/editing (not full pages)

**Add/Edit Form** (modal overlay):
- Simple vertical form layout
- Input groups with clear labels
- File upload for images (drag-drop area)
- Rich text editor for descriptions
- "Save" + "Cancel" buttons

---

## Component Library

### Cards
- Service Cards: Rounded corners (rounded-lg), subtle shadow, p-6, hover lift effect
- Feature Cards: Border style, no shadow, p-8
- Pricing Cards: Highlighted border for featured tier

### Tables
- Comparison Table: Alternating row treatment, sticky header, responsive horizontal scroll
- Pricing Tiers: Vertical layout in cards, clear tier differentiation

### Forms
- Input Fields: Rounded borders, consistent height (h-12), focus states
- Select Dropdowns: Custom styled with chevron icons
- Checkboxes/Radio: Custom styled with proper hit areas
- Labels: text-sm, font-medium, mb-2

### Buttons
- Primary: Rounded-md, px-8, py-3, text-base, font-semibold
- Secondary: Ghost style with border
- Icon Buttons: Square (w-10 h-10), centered icons
- Hero Buttons: Blur background effect when over images

### Navigation
- Top Nav: Logo left, links center, CTA right (desktop)
- Mobile: Hamburger menu, drawer navigation
- Footer: 4-column grid (About, Services, Resources, Connect) + social links + newsletter signup

### Icons
- Use Heroicons (outline style for most, solid for emphasis)
- Consistent sizing: w-5 h-5 for inline, w-8 h-8 for feature cards

---

## Images

**Hero Image**: High-quality photo of modern art gallery interior or abstract art installation with museum-quality lighting - 1920x1080 minimum, positioned center

**How It Works Section**: 3 conceptual images showing comparison process (can be illustrations or screenshots) - 600x400 each

**Service Cards**: Placeholder for service logos/images - 400x225 (16:9 ratio)

---

## Accessibility

- Proper heading hierarchy (h1 → h2 → h3)
- All interactive elements keyboard accessible
- Form labels properly associated
- Sufficient contrast ratios
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons

---

## Responsive Breakpoints

- Mobile: base (stack all columns)
- Tablet: md (2-column grids)
- Desktop: lg (3-4 column grids, sidebar layout)
- Wide: xl (optimal comparison table viewing)