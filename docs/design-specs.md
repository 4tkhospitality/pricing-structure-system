# Design Specifications: Clean & Professional (Agoda Focused)

## 🎨 Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| **Backgrounds** | | |
| Bg Main | `#0f172a` (Slate 900) | App background |
| Bg Surface | `#1e293b` (Slate 800) | Cards, Panels, Sidebar |
| Bg Subtler | `#334155` (Slate 700) | Inputs, Hover states |
| **Text** | | |
| Text Primary | `#f8fafc` (Slate 50) | Headings, Primary actions |
| Text Secondary| `#94a3b8` (Slate 400) | Labels, Descriptions, Meta |
| **Accents** | | |
| Brand Agoda | `#ce3800` (Custom Darker Orange) | Primary Buttons, Active States (Reduced brightness for eye comfort) |
| Success | `#10b981` (Emerald 500) | Valid states, Profit |
| Error | `#ef4444` (Red 500) | Errors, Alerts |

## 📝 Typography
**Font Family:** `Inter`, sans-serif (System UI default)

| Element | Size (Mobile/Desktop) | Weight | Line Height | Usage |
|---------|-----------------------|--------|-------------|-------|
| H1 | 24px / 32px | 700 (Bold) | 1.25 | Page Titles |
| H2 | 20px / 24px | 600 (Semi) | 1.3 | Section Headers |
| H3 | 16px / 18px | 600 (Semi) | 1.4 | Card Titles |
| Body | 14px / 14px | 400 (Reg) | 1.5 | Standard text |
| Small | 12px / 12px | 400 (Reg) | 1.5 | Labels, Hints |
| Mono | 20px / 32px | 700 (Bold) | 1.2 | Prices, Calculated Values |

## 📐 Layout & Spacing
- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Grid Gap:** `gap-4` (Mobile) / `gap-6` (Desktop)
- **Card Padding:** `p-4` (Mobile) / `p-6` (Desktop)
- **Border Radius:** `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons/inputs.

## 📱 Mobile Responsiveness (Critical)
- **Sidebar:** Hidden on mobile (`hidden md:flex`). Replaced by **Hamburger Menu**.
- **Tables:** Horizontal scroll (`overflow-x-auto`) or Card View for small screens.
- **Inputs:** distinct height (`h-12`) for touch targets.
- **Font Scaling:** Headings shrink on mobile to prevent overflow.

## 🧱 Component Rules
1.  **Inputs:** Dark background (`bg-slate-900`), Light border (`border-slate-700`), Focus ring (`ring-orange-500`).
2.  **Buttons:**
    - Primary: Solid Agoda Orange (`bg-[#ce3800]`), White text.
    - Secondary: Outline (`border-slate-600`), Slate text.
    - Icon Buttons: `p-2`, `hover:bg-slate-700`.
3.  **Panels:** Flat background (`bg-slate-800`), Subtle border (`border-slate-700`), No excessive shadows.
