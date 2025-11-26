# Design Guidelines: Do'kon - O'zbekcha E-Commerce Platform

## Design Approach

**Reference-Based**: Modern e-commerce aesthetic inspired by Shopify's clean product grids + Etsy's discovery experience + contemporary SaaS minimalism. Focus on seamless shopping flow with professional, trustworthy presentation.

**Core Principle**: Frictionless commerce - every interaction guides toward confident purchase decisions.

---

## Color System

**Light Mode**:
- Primary Purple: #8B5CF6 (violet-500) - CTAs, active states, links
- Purple Accent: #A78BFA (violet-400) - hover states, badges
- Dark Purple: #6D28D9 (violet-700) - text on purple backgrounds
- Background: #FFFFFF
- Surface: #F9FAFB (gray-50) - cards, alternate sections
- Text Primary: #111827 (gray-900)
- Text Secondary: #6B7280 (gray-500)
- Border: #E5E7EB (gray-200)
- Success: #10B981 (emerald-500) - in stock, order success
- Warning: #F59E0B (amber-500) - low stock alerts
- Error: #EF4444 (red-500) - out of stock, validation

**Dark Mode**:
- Primary Purple: #A78BFA (violet-400)
- Purple Accent: #C4B5FD (violet-300)
- Background: #111827 (gray-900)
- Surface: #1F2937 (gray-800)
- Text Primary: #F9FAFB (gray-50)
- Text Secondary: #9CA3AF (gray-400)
- Border: #374151 (gray-700)

---

## Typography System

**Primary Font**: Inter (Google Fonts CDN)
- Hero Headlines: 5xl to 7xl, font-weight 800
- Page Headers: 3xl to 4xl, font-weight 700
- Product Titles: xl to 2xl, font-weight 600
- Section Titles: 2xl, font-weight 700
- Pricing: 3xl, font-weight 800 (primary), lg font-weight 500 (crossed out)
- Body Text: base, font-weight 400, line-height relaxed
- Labels/Meta: sm, font-weight 500
- Buttons: base, font-weight 600

**Number Display** (for pricing): Tabular numbers for alignment

---

## Layout & Spacing

**Tailwind Units**: 4, 6, 8, 12, 16, 20, 24
- Card padding: p-6
- Section padding: py-20 (desktop), py-12 (mobile)
- Product grid gaps: gap-6
- Form spacing: space-y-6

**Containers**:
- Full-width: max-w-7xl mx-auto px-6
- Product grids: max-w-7xl
- Content: max-w-4xl

---

## Page Structures

### Homepage

**Hero Section** (80vh):
- Full-width lifestyle product photography (2-3 hero products in styled setting)
- Centered headline: "Sifatli Mahsulotlar, Ishonchli Xizmat" (Quality Products, Trusted Service)
- Subheadline highlighting unique value proposition
- Primary CTA button "Xarid Qilish" (Shop Now) with blurred background
- Trust badges: Free shipping, secure checkout, 24/7 support

**Featured Categories** (4-column grid, 2 mobile):
- Large category cards with product photography
- Overlay text with category name + item count
- Hover zoom effect on images

**Popular Products Grid** (4-column, scrollable mobile):
- Product cards with image, title, price, rating, "Add to Cart" button
- Quick view icon overlay on hover

**Benefits Section** (3-column):
- Icon + title + description: Fast Delivery, Secure Payment, Quality Guarantee
- Each card p-8 with subtle border

**Featured Collections** (2-column asymmetric):
- Large image blocks showcasing curated collections
- Overlay CTA buttons with blur backgrounds

**Newsletter CTA**:
- Centered form with email input + subscribe button
- Supporting text: "Yangi mahsulotlar va chegirmalar haqida birinchi bo'lib bilib oling"

### Product Listing Page

**Top Bar**:
- Breadcrumbs navigation
- Result count + sort dropdown (right-aligned)
- View toggle: grid/list icons

**Sidebar Filters** (280px, drawer mobile):
- Search input
- Collapsible groups: Category, Price Range (slider), Brand (checkboxes), Rating, Availability
- "Filtrlarni Tozalash" button at bottom

**Product Grid** (4-column lg, 3 md, 2 sm, 1 mobile):
- Product cards: square image (1:1), title, price (current + crossed old if sale), rating stars + count
- Sale badge (top-right corner)
- Quick "Savatga" button on hover
- Wishlist heart icon (top-right)

**Pagination**: Centered with prev/next + page numbers

### Product Detail Page

**Layout** (2-column above md):

Left Column:
- Main product image (large, 1:1 ratio)
- Thumbnail gallery below (4-5 images, horizontal scroll)
- Zoom on hover/click

Right Column:
- Product title (text-3xl)
- Rating + review count link
- Price (large, prominent)
- Short description
- Variant selectors (Size, Color) as button groups
- Quantity selector (- input +)
- "Savatga Qo'shish" primary button (full-width)
- "Xarid Qilish" secondary button
- Delivery info + return policy accordion
- Share icons

**Below Fold**:
- Tabs: Description, Reviews, Specifications
- Related Products carousel (6 items)

### Shopping Cart Page

**Cart Items** (main column):
- Table layout: Product (image + name), Price, Quantity (stepper), Subtotal, Remove icon
- Each row with generous padding (py-6)
- Update quantity triggers auto-save

**Order Summary** (sticky sidebar, 360px):
- Subtotal, Shipping (calculated/estimate), Tax
- Promo code input + apply button
- Total (emphasized, text-3xl)
- "Buyurtma Berish" primary button (full-width)
- Continue shopping link

**Empty State**: Centered icon + message + "Xaridni Boshlash" CTA

### Checkout Page

**Progress Indicator** (top):
- 3 steps: Shipping → Payment → Confirm
- Visual stepper with completed/active states

**Form Layout** (single column, max-w-2xl):
- Grouped sections: Contact Info, Shipping Address, Payment Method
- Clear labels, proper input types
- Auto-complete friendly
- Save address checkbox
- Order summary (collapsible mobile, sidebar desktop)

**Payment Section**:
- Radio buttons for methods: Card, Cash on Delivery
- Card input fields (number, expiry, CVV) with proper masking
- Security badges

### Admin Dashboard

**Sidebar Navigation** (240px):
- Logo + collapse toggle
- Menu items: Dashboard, Products, Orders, Customers, Analytics, Settings
- Icons from Heroicons

**Main Content**:

Dashboard Overview:
- Stats cards (4-column): Revenue, Orders, Products, Customers
- Recent orders table
- Sales chart (line graph placeholder)

Products Management:
- Action bar: Search, "Add Product" button, filters
- Data table: Image, Name, Category, Price, Stock, Status, Actions (edit/delete icons)
- Pagination

Add/Edit Product (modal overlay):
- Two-column form: Left (basic info, description), Right (images, inventory, pricing)
- Rich text editor for description
- Image upload: drag-drop zone with preview grid
- Variant builder for sizes/colors
- Save + Cancel buttons

Orders List:
- Table: Order ID, Customer, Date, Total, Status badge, View link
- Status filters: All, Pending, Processing, Shipped, Delivered, Cancelled

---

## Component Library

### Cards
- Product: rounded-lg, hover shadow-lg transition, border in light mode
- Category: rounded-xl, overflow-hidden (for image fills)

### Buttons
- Primary: bg-purple, rounded-lg, px-8 py-3, hover brightness
- Secondary: border purple, text purple, bg transparent
- Icon buttons: w-10 h-10, rounded-full for wishlist/actions
- Cart badge: absolute top-right, small circle with count

### Forms
- Inputs: h-12, rounded-md, border, px-4, focus:ring purple
- Quantity stepper: grouped buttons with input center
- Checkboxes/Radio: custom purple accent

### Badges
- Sale: bg-red, text-white, rounded-md, px-2 py-1, text-xs
- Stock status: color-coded (green/amber/red)
- Order status: colored backgrounds with dark text

### Navigation
- Top nav: Logo left, search center (expandable), icons right (wishlist, cart with badge, account)
- Mobile: bottom tab bar (home, categories, cart, account)
- Footer: 4-column (Company, Customer Service, Categories, Follow Us) + payment icons

### Icons
- Heroicons (outline primary, solid for filled states)
- Sizing: w-5 h-5 inline, w-6 h-6 buttons, w-12 h-12 feature cards

---

## Images

**Hero**: Lifestyle product photography showing 2-3 featured items in styled environment (modern home setting or clean studio). 1920x1080, center-focused composition.

**Category Cards**: High-quality product group photography, 800x800 square format.

**Product Images**: Clean white background or lifestyle context, 1000x1000 minimum, consistent lighting.

**Collections**: Lifestyle banners showing products in use, 1200x600 horizontal format.

---

## Accessibility

- Uzbek language proper text rendering (Cyrillic script support)
- All interactive elements min 44x44px touch targets
- Keyboard navigation throughout
- ARIA labels for icon buttons, cart count, wishlist status
- Form validation with clear error messages
- Focus indicators on all interactive elements
- Sufficient contrast in both light/dark modes
- Screen reader friendly product announcements

---

## Responsive Strategy

- Mobile: Single column, bottom nav, drawer filters, collapsible cart summary
- Tablet (md): 2-3 column grids, sidebar filters visible
- Desktop (lg): 4 column grids, persistent sidebars, hover states active
- Product detail: Stack on mobile, 2-column above md