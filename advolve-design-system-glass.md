# Advolve — Design System

> Single source of truth for the Advolve web application. Tokens listed here match the CSS implementation in `src/styles/globals.css`.

---

## 1. Brand Essence

| Attribute | Value |
|---|---|
| **Brand** | Advolve (by iFood / Prosus ecosystem) |
| **Tone** | Premium-tech, confident, data-driven |
| **Mood** | Dark futuristic, sophisticated, high-performance |
| **Tagline style** | Short, bold claims — "Dados viram inteligência. Inteligência vira performance." |

---

## 2. Color Palette

### Background

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-primary` | `#0b0916` | Main background |
| `--color-bg-secondary` | `#100e20` | Sidebar, secondary surfaces |
| `--color-bg-elevated` | `#17152b` | Modals, elevated panels |

### Accent — Purple Spectrum

| Token | Hex | Usage |
|---|---|---|
| `--color-accent-light` | `#C4B5FD` | Headings, highlighted text, labels, active nav |
| `--color-accent` | `#8B5CF6` | Primary buttons, active states, links |
| `--color-accent-vivid` | `#7C3AED` | Hover states, gradients |
| `--color-accent-deep` | `#5B21B6` | Gradient endpoints, deep shadows |

### Highlight

| Token | Hex | Usage |
|---|---|---|
| `--color-highlight` | `#A3E635` | CTAs, success states, lime-green emphasis (tags, key metrics) |

### Text

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#F4F4F5` | Headlines, primary text |
| `--color-text-secondary` | `#A1A1AA` | Body text, descriptions |
| `--color-text-muted` | `#63637A` | Captions, footnotes, placeholders |

### Borders

| Token | Value | Usage |
|---|---|---|
| `--border-color-default` | `rgba(255,255,255,0.08)` | Default borders |
| `--border-color-subtle` | `rgba(255,255,255,0.05)` | Barely-visible dividers |
| `--border-color-emphasis` | `rgba(255,255,255,0.12)` | Slightly stronger borders |
| `--border-color-interactive` | `rgba(255,255,255,0.15)` | Hover/focus borders |
| `--border-color-accent` | `rgba(139,92,246,0.28)` | Purple accent borders |
| `--border-default` | `1px solid var(--border-color-default)` | Shorthand — default border |
| `--border-subtle` | `1px solid var(--border-color-subtle)` | Shorthand — subtle border |
| `--border-emphasis` | `1px solid var(--border-color-emphasis)` | Shorthand — emphasis border |
| `--border-interactive` | `1px solid var(--border-color-interactive)` | Shorthand — interactive border |

### Glass System

| Token | Value | Usage |
|---|---|---|
| `--gl-surface` | `rgba(255,255,255,0.035)` | Glass card background |
| `--gl-surface-accent` | `rgba(139,92,246,0.07)` | Accent-tinted glass background |
| `--gl-border` | `rgba(255,255,255,0.08)` | Glass card border |
| `--gl-border-accent` | `rgba(139,92,246,0.24)` | Accent glass border |
| `--gl-blur` | `blur(40px) saturate(180%)` | Backdrop filter value |

### Gradients

```css
/* Hero / page background gradient */
--gradient-bg: radial-gradient(
  ellipse at 30% 50%,
  rgba(59, 30, 150, 0.4) 0%,
  rgba(10, 10, 15, 1) 70%
);

/* Accent gradient (buttons, cards, highlights) */
--gradient-accent: linear-gradient(
  135deg,
  #7C3AED 0%,
  #C4B5FD 100%
);

/* Atmospheric glow — blue-to-purple wave */
--gradient-wave: linear-gradient(
  180deg,
  rgba(59, 130, 246, 0.15) 0%,
  rgba(139, 92, 246, 0.25) 40%,
  rgba(236, 72, 153, 0.15) 70%,
  transparent 100%
);
```

---

## 3. Typography

### Font Stack

| Token | Font | Fallback | Weight | Usage |
|---|---|---|---|---|
| `--font-display` | `"Plus Jakarta Sans"` | `system-ui, sans-serif` | 700–800 | Headings, titles, KPI values |
| `--font-body` | `"DM Sans"` | `system-ui, sans-serif` | 400–600 | Body, labels, navigation |
| `--font-mono` | `"JetBrains Mono"` | `monospace` | 400–500 | Code, IDs, EANs, data cells |

### Scale

| Token | Size | Line Height | Usage |
|---|---|---|---|
| `--text-display` | `3.5rem` (56px) | 1.1 | Hero headlines |
| `--text-h1` | `2.5rem` (40px) | 1.15 | Page titles |
| `--text-h2` | `1.75rem` (28px) | 1.25 | Section titles |
| `--text-h3` | `1.25rem` (20px) | 1.35 | Card titles, subsections |
| `--text-body` | `1rem` (16px) | 1.6 | Body copy |
| `--text-small` | `0.875rem` (14px) | 1.5 | Captions, labels |
| `--text-xs` | `0.75rem` (12px) | 1.4 | Badges, fine print |

### Styling Rules

- Headlines are **white** (`#FFFFFF`) on dark backgrounds.
- Key words within headlines are tinted with `--color-accent-light` (lavender purple) or `--color-highlight` (lime green) for emphasis.
- Body text uses `--color-text-secondary` for comfortable readability on dark.
- Letter spacing on display text: `−0.02em` (slightly tight).
- Letter spacing on uppercase labels/badges: `0.08em` (tracked out).

---

## 4. Spacing & Layout

### Spacing Scale (8px base)

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `24px` |
| `--space-6` | `32px` |
| `--space-8` | `48px` |
| `--space-10` | `64px` |
| `--space-12` | `80px` |
| `--space-16` | `128px` |

### Layout Rules

- **Max content width**: `1280px`, centered.
- **Section padding**: `80px` vertical, `24px–48px` horizontal.
- **Grid**: 12-column grid with `24px` gap for dashboards; free-form for marketing pages.
- **Cards**: generous internal padding (`24px–32px`).
- **Asymmetric layouts**: the presentation frequently uses 40/60 or 50/50 splits with text on one side and a visual element on the other.

---

## 5. Effects & Surfaces

### Glassmorphism (Core Visual Pattern)

The presentation heavily uses frosted-glass cards on dark backgrounds.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.glass-card--elevated {
  background: rgba(139, 92, 246, 0.06);
  border: 1px solid rgba(139, 92, 246, 0.15);
}
```

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Buttons, badges, inputs |
| `--radius-md` | `12px` | Small cards, dropdowns |
| `--radius-lg` | `16px` | Cards, panels |
| `--radius-xl` | `24px` | Hero sections, modals |
| `--border-radius-sm` | `6px` | Tight UI elements |
| `--border-radius-md` | `10px` | Medium radius variant |
| `--border-radius-lg` | `14px` | Larger radius variant |

### Shadows & Glows

```css
/* Subtle card shadow */
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);

/* Purple glow (used behind key elements) */
--glow-accent: 0 0 80px rgba(139, 92, 246, 0.2);

/* Ambient purple blob (decorative) */
.glow-blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.25) 0%,
    transparent 70%
  );
  filter: blur(80px);
  pointer-events: none;
}
```

### Background Textures

The presentation uses vertical-line wave patterns (like an audio waveform / equalizer) as atmospheric backgrounds. Implement these as:

- A subtle SVG noise overlay at `opacity: 0.03`
- Animated vertical gradient bars via CSS or canvas for the "wave" effect
- Or a static background image with the wave pattern

---

## 6. Components

### Buttons

```css
/* Primary */
.btn-primary {
  background: var(--gradient-accent);
  color: #FFFFFF;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: var(--radius-sm);
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
}

/* Secondary / Ghost */
.btn-secondary {
  background: transparent;
  color: var(--color-accent-light);
  border: 1px solid rgba(139, 92, 246, 0.3);
  padding: 12px 28px;
  border-radius: var(--radius-sm);
}
```

### Tags / Badges

Used in the presentation for capability labels (e.g. "Textos gerados por IA", "Alocação de budget").

```css
.tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-secondary);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: var(--text-small);
  font-weight: 500;
}
```

### Metric Cards

Used for KPI display (e.g. "27% CAC reduzido", "40% redução de desperdício").

```css
.metric-card {
  /* glass surface */
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
}
.metric-card__value {
  font-size: var(--text-display);
  font-weight: 800;
  color: var(--color-accent-light);
}
.metric-card__label {
  font-size: var(--text-small);
  color: var(--color-text-secondary);
  margin-top: 8px;
}
```

### Data Table / Grid Cards

For the data categories grid (Comportamento de compra, Recência, Categoria, etc.):

```css
.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.data-grid__cell {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.data-grid__cell h4 {
  color: var(--color-accent-light);
  font-weight: 700;
  margin-bottom: 12px;
}
.data-grid__cell p {
  color: var(--color-text-muted);
  font-size: var(--text-small);
  line-height: 1.6;
}
```

### Flow / Timeline

For the operational flow (steps 1→6):

- Use a horizontal stepper with numbered circles connected by lines.
- Numbers sit inside `32px` circles with `--color-accent` background.
- Connecting lines use `--color-border` with a dashed style.
- Each step lives in a glass card below its number.

---

## 7. Iconography

| Style | Details |
|---|---|
| **Type** | Line icons, 1.5px stroke |
| **Library** | Lucide React or Phosphor Icons |
| **Size** | 20px (inline), 24px (standalone), 32px (feature) |
| **Color** | `--color-text-secondary` default, `--color-accent-light` for active |

Platform logos (Google Ads, Meta, TikTok, etc.) should use their official marks at consistent height (`28px–32px`).

---

## 8. Motion & Animation

| Type | Duration | Easing |
|---|---|---|
| **Hover transitions** | `200ms` | `ease-out` |
| **Page enters** | `500–700ms` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **Stagger delay** | `80ms` per item | — |
| **Glow pulse** | `4s` loop | `ease-in-out` |

### Key Animations

```css
/* Fade-up entrance */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ambient glow pulse */
@keyframes glowPulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.05); }
}
```

---

## 9. Responsive Breakpoints

| Token | Width | Target |
|---|---|---|
| `--bp-sm` | `640px` | Mobile landscape |
| `--bp-md` | `768px` | Tablet |
| `--bp-lg` | `1024px` | Small desktop |
| `--bp-xl` | `1280px` | Desktop |
| `--bp-2xl` | `1536px` | Wide screens |

### Mobile Adaptations

- Glass cards stack vertically.
- Display text scales down to `2rem`.
- Metric cards switch to a 2-column grid, then single column.
- The wave background becomes a static gradient on mobile for performance.

---

## 10. Do's & Don'ts

### Do

- Use dark backgrounds everywhere — the brand lives in darkness.
- Apply purple-tinted glass surfaces for content containers.
- Use the lime-green highlight sparingly for maximum impact.
- Let large numbers (KPIs) breathe with generous whitespace.
- Create depth with layered glows and blurred blobs behind content.

### Don't

- Use light/white backgrounds for main layouts.
- Overuse the lime-green — it's a punctuation mark, not a paragraph.
- Apply heavy drop-shadows — prefer subtle glows.
- Use rounded-playful aesthetics — the tone is sharp and professional.
- Clutter layouts — the presentation favors clean, spacious compositions.

---

## 11. CSS Variables — Quick Copy

```css
:root {
  /* Backgrounds */
  --color-bg-primary: #0A0A0F;
  --color-bg-secondary: #111118;
  --color-bg-elevated: #1A1A24;

  /* Accent */
  --color-accent-light: #C4B5FD;
  --color-accent: #8B5CF6;
  --color-accent-vivid: #7C3AED;
  --color-accent-deep: #5B21B6;
  --color-highlight: #A3E635;

  /* Text */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A1A1AA;
  --color-text-muted: #71717A;

  /* Borders */
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-active: rgba(139, 92, 246, 0.4);

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
  --glow-accent: 0 0 80px rgba(139, 92, 246, 0.2);

  /* Typography */
  --font-display: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --text-display: 3.5rem;
  --text-h1: 2.5rem;
  --text-h2: 1.75rem;
  --text-h3: 1.25rem;
  --text-body: 1rem;
  --text-small: 0.875rem;
  --text-xs: 0.75rem;
}
```

---

*Generated from the Advolve "Audiência Estendida" confidential presentation.*
