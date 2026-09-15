---
name: ui-ux-pro-max
description: AI design intelligence for building professional, high-conversion UI/UX across web and mobile apps. Enforces design systems, color harmony, typography pairing, responsive patterns, accessibility, and eliminates amateur anti-patterns.
---

# UI/UX Pro Max - Design Intelligence System

A comprehensive design intelligence engine for creating modern, professional, high-conversion user interfaces and eliminating amateur UI anti-patterns.

---

## CRITICAL ANTI-PATTERNS (Must Avoid)

1. **No AI Gradient Blobs**: Never use muddy, rotating multi-color gradient blobs, purple/pink cosmic overlays, or neon glows behind content. Use clean warm whites, subtle glassmorphism, or soft organic off-whites.
2. **No Emojis as System Icons**: Never use raw emojis as functional UI icons in buttons, inputs, or navigation. Always use clean vector SVG icons (Lucide React / Heroicons). Emojis may only appear in conversational review text.
3. **No Bad Typography / Inconsistent Fonts**: Avoid overly rounded, cartoonish fonts on e-commerce stores. Use clean, high-legibility geometric sans-serifs (Plus Jakarta Sans, Be Vietnam Pro, Inter) paired with elegant serif accents for editorial headings.
4. **No Cramped Product Cards**: Do not cram badges, stock numbers, ratings, and oversized action buttons into tight card borders. Provide ample breathing room (8px grid spacing, clean aspect ratios).
5. **No Low Contrast / Illegible Text**: Ensure minimum 4.5:1 contrast ratio for body text against backgrounds. Avoid light gray text on white.
6. **No Clashing Border Radii**: Maintain unified border radii across the application (e.g., rounded-2xl for cards, rounded-xl for inputs/buttons, rounded-full for pills).

---

## DESIGN SYSTEM FOR HANDMADE / LIFESTYLE / ACCESSORIES (Omachi Studio)

### 1. Color Palette (Warm Pastel & Organic Studio)
- **Base Background**: #FAF9F6 (Warm Linen / Off-White)
- **Card Background**: #FFFFFF (Pure White with subtle border border-stone-200/70)
- **Primary Accent**:
  - Matcha Green: #3A6B29 (Primary), #EBF4E5 (Soft Tint)
  - Blush Rose: #9E2B54 (Primary), #FDF2F6 (Soft Tint)
  - Fairy Lavender: #613CA8 (Primary), #F5F0FF (Soft Tint)
  - Warm Honey: #8E5A13 (Primary), #FFF8EC (Soft Tint)
- **Text System**:
  - Primary Heading: #1C1917 (Stone 900)
  - Body Text: #44403C (Stone 700)
  - Muted Subtext: #78716C (Stone 500)
  - Border: #E7E5E4 (Stone 200)

### 2. Typography Scale
- **Headings**: Modern, clean font with tight letter-spacing (tracking-tight, font-extrabold).
- **Accent Badges**: Uppercase with letter spacing (tracking-wider, font-bold, text-[10px] or text-[11px]).
- **Prices**: Bold, prominent with VND symbol (font-black text-lg sm:text-xl).
- **Body**: Regular/medium weight, 1.6 line-height for readability.

### 3. Product Card Architecture (Shopee Mall / Pinterest Standard)
- **Aspect Ratio**: 1:1 square or 4:5 vertical portrait.
- **Image Treatment**:
  - Crisp, high-quality photograph with subtle warm lighting.
  - Smooth zoom transition on hover (group-hover:scale-105 duration-500 ease-out).
  - Secondary image swap on hover if multiple images exist.
- **Badges**: Minimalist pills in top corner (bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs).
- **Content Area**:
  - Clean category text in muted accent color.
  - 2-line clamped product title with generous line-height.
  - Clean star rating with count in soft muted gray.
  - Price row with current price prominent and crossed-out original price.
  - Clean interactive action button with smooth hover feedback.

### 4. Spacing & Rhythm
- Utilize an 8px grid: 8px (p-2), 12px (p-3), 16px (p-4), 24px (p-6), 32px (p-8).
- Ensure section padding has breathing room (py-12 to py-16).

---

## PRE-DELIVERY QUALITY CHECKLIST
- [ ] All clickable elements have cursor-pointer and hover/active states.
- [ ] No raw emojis used as system icons (use Lucide SVG icons).
- [ ] No neon or muddy gradient overlays on backgrounds.
- [ ] Responsive across mobile (375px), tablet (768px), and desktop (1024px+).
- [ ] Color contrast passes WCAG AA (4.5:1 minimum).
- [ ] Buttons and interactive chips have clear active/selected visual indicators.
- [ ] Loading and empty states are gracefully handled.
