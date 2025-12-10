# 🎨 Admin Dashboard - Visual Reference Card

## Color Palette

```
BACKGROUND GRADIENT
┌─────────────────────────────────────┐
│ from-blue-50                        │
│ via-purple-50                       │
│ to-pink-50                          │
└─────────────────────────────────────┘

PRIMARY COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
█ #3b82f6 ← Blue (Primary accent)
█ #a855f7 ← Purple (Secondary accent)
█ #ec4899 ← Pink (Tertiary accent)

STATUS COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
█ #10b981 ← Green (Success/In Stock)
█ #f59e0b ← Amber (Warning/Low Stock)
█ #ef4444 ← Red (Danger/Out of Stock)

GRAYSCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
█ #111827 ← Gray-900 (Darkest text)
█ #1f2937 ← Gray-800 (Primary text)
█ #374151 ← Gray-700 (Secondary text)
█ #4b5563 ← Gray-600 (Muted text)
█ #6b7280 ← Gray-500 (Labels)
█ #9ca3af ← Gray-400 (Placeholders)
█ #d1d5db ← Gray-300 (Borders)
█ #e5e7eb ← Gray-200 (Light backgrounds)
█ #f3f4f6 ← Gray-100 (Very light bg)
█ #ffffff ← White
```

## Typography System

```
HEADINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
text-3xl font-bold           (Page title)
text-2xl font-bold           (Section heading)
text-lg font-bold            (Card title)
text-base font-semibold      (Subtitle)
text-sm font-semibold        (Label/small heading)

BODY TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
text-base font-normal        (Body text)
text-sm font-normal          (Secondary text)
text-xs font-normal          (Meta text/timestamps)

EMPHASIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
text-sm font-medium          (Medium emphasis)
text-xs font-semibold        (Small emphasis)
font-bold                    (Strong emphasis)

LINE HEIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
leading-tight    (1.25)      (Headings)
leading-normal   (1.5)       (Body text)
leading-relaxed  (1.625)     (Long form)
```

## Spacing System

```
BASE UNIT: 4px (Tailwind default)

PADDING/MARGINS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
p-2   = 8px     (Small elements)
p-3   = 12px    (Buttons, inputs)
p-4   = 16px    (Cards, sections)
p-6   = 24px    (Large sections)
p-8   = 32px    (Page padding)

GAPS (Between elements)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gap-2 = 8px
gap-3 = 12px    (Small spacing)
gap-4 = 16px    (Regular spacing)
gap-6 = 24px    (Large spacing)

ROUNDED CORNERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
rounded-lg      = 8px       (Small elements)
rounded-xl      = 12px      (Medium elements)
rounded-2xl     = 16px      (Cards, buttons)
rounded-3xl     = 24px      (Large containers)
rounded-full    = 50%       (Circular)
```

## Shadow System

```
ELEVATION LEVELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
shadow         (Subtle)         (Base elevation)
shadow-lg      (Medium)         (Cards, modals)
shadow-xl      (Large)          (Hover states)
shadow-2xl     (Extra large)    (Dropdowns, top)

USAGE PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Regular card:              shadow-lg
Hovered element:           shadow-xl
Notification dropdown:     shadow-2xl
Top navbar:               shadow-lg
Sidebar:                  shadow (subtle)
```

## Border System

```
BORDER STYLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
border              (1px solid)
border-white/30     (Subtle white border)
border-white/20     (Very subtle border)

USAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Card borders:          border border-white/30
Input borders:         border border-white/30 focus:border-blue-300
Divider lines:         border-b border-white/10
```

## Component Height Reference

```
NAVBAR / HEADERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Top navbar:         h-20 (80px)
Sidebar nav item:   py-3 (12px vert padding)

FORM ELEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input fields:       h-auto (py-3)
Buttons:            h-auto (px-4 py-3)
Search bar:         py-3 (48px total)

CARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stat cards:         p-6 (min-height auto)
Chart containers:   h-80 (320px)
Table rows:         py-4 (16px vert)

ICONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Small:              size={16} (16x16)
Normal:             size={18} (18x18)
Medium:             size={20} (20x20)
Large:              size={24} (24x24)
```

## Animation Timing

```
SPRING PHYSICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type: "spring"
stiffness: 300         (Responsiveness)
damping: 30            (Bounciness)
Result: Smooth, bouncy feel

DELAYS (For stagger)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
delayChildren: 0.2     (Start after 200ms)
staggerChildren: 0.1   (100ms between items)

HOVER TRANSFORMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
whileHover={{ scale: 1.05 }}    (5% scale)
whileTap={{ scale: 0.95 }}      (5% shrink)
```

## Component Grid Layout

```
GRID COLUMNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mobile:         grid-cols-1         (Single column)
Tablet:         md:grid-cols-2      (2 columns at 768px+)
Desktop:        lg:grid-cols-3      (3 columns at 1024px+)
Large cards:    lg:grid-cols-4      (4 columns at 1024px+)

SPECIFIC LAYOUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Statistics:     lg:grid-cols-4      (4 stat cards side-by-side)
Charts:         lg:grid-cols-2      (2 charts side-by-side)
Main content:   lg:grid-cols-3      (Table 2/3, Activity 1/3)
```

## Responsive Breakpoints

```
DEVICE SIZES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mobile:         < 768px   (default styles)
Tablet:         768px+    (md: prefix)
Desktop:        1024px+   (lg: prefix)
Large Desktop:  1280px+   (xl: prefix)

SIDEBAR BEHAVIOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mobile:         Fixed overlay (w-72, z-50)
Desktop:        Static (lg:static lg:w-72)

GRID SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mobile:         1 column (full width)
Tablet:         2-3 columns (split)
Desktop:        4 columns (optimized)
```

## Opacity & Transparency

```
BACKDROP EFFECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
backdrop-blur-md         (12px blur)
backdrop-blur-lg         (16px blur)
backdrop-blur-xl         (20px blur)

WHITE OVERLAYS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bg-white/10    (10% opacity)  - Very subtle
bg-white/20    (20% opacity)  - Subtle
bg-white/30    (30% opacity)  - Moderate
bg-white/40    (40% opacity)  - Prominent
bg-white/50    (50% opacity)  - Semi-transparent

BLACK OVERLAYS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bg-black/30    (Sidebar overlay)
bg-black/50    (Modal backdrop)

TEXT OPACITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
text-white/80  (Primary text on dark bg)
text-white/70  (Secondary text)
text-white/60  (Muted text)
```

## Hover States

```
BUTTON HOVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hover:scale-105         (5% larger)
hover:shadow-xl         (Enhanced shadow)
hover:bg-white/40       (Brighter background)

CARD HOVERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
group-hover:opacity-100 (Reveal hidden content)
group-hover:shadow-xl   (Enhanced shadow)
hover:bg-white/20       (Slight highlight)

TRANSITION DURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
transition              (150ms default)
transition-all          (All properties)
duration-200            (200ms)
duration-300            (300ms)
```

## Focus States

```
INPUT FOCUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
focus:outline-none
focus:ring-2
focus:ring-blue-200
focus:border-blue-300

BUTTON FOCUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
focus:outline-none
focus:ring-2
focus:ring-offset-2
focus:ring-blue-400
```

## Accessibility Checklist

```
✓ Color contrast (WCAG AA minimum)
✓ Focus states visible
✓ Keyboard navigation support
✓ Icon + text labels
✓ ARIA attributes where needed
✓ Touch targets 44px+ (mobile)
✓ Semantic HTML
✓ Reduced motion support
✓ Alt text for images
✓ Form labels associated
```

---

*Quick reference for implementing and customizing the admin dashboard design system.*
