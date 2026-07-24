# Design System — AWS Student Builder Group JRU

> Tokens, patterns, and conventions extracted from the existing project.
> Copy this file into a new project to replicate the design DNA.
> Font files, SVGs, and raster assets are **not** included — only styles and techniques.

---

## 1. Colors

### Brand Palette

```yaml
colors:
  navy:
    base:     "#1c3466"
    dark:     "#003678"
    darker:   "#182b58"
    ink:      "#1E376C"
    deep:     "#00075D"
    ultradeep:"#01164a"
  orange:
    cta:      "#ff6f08"
    label:    "#ff8400"
    warm:     "#fbb515"
  gold:
    base:     "#ffb700"
    warm:     "#f2af00"
    bright:   "#fafe00"
    light:    "#ffc72c"
    pale:     "#fffde8"
    soft:     "#ffe38d"
    button:   "#fff200"
  blue:
    meta:     "#3868cc"
    aws:      "#006AFF"
    deep:     "#1500FF"
    light:    "#2563eb"
    sky:      "#60b8e4"
    midsky:   "#6cabdd"
    softsky:  "#b9d2df"
    pagebg:   "#e0f1fd"
    soft:     "#78a2ff"
    mid:      "#084a8d"
    accent:   "#83b5f9"
    card:     "#4363a6"
  neutrals:
    white:       "#ffffff"
    offwhite:    "#f5f5f5"
    lightgray:   "#e8e8e8"
    darkgray:    "#333333"
    textprimary: "#111111"
    glass:       "rgba(237, 244, 255, 0.74)"
    glasssoft:   "rgba(237, 244, 255, 0.38)"
    glassedge:   "rgba(255, 255, 255, 0.56)"
  semantic:
    error_red:    "#f93c40"
    error_dark:   "#932426"
    error_border: "#ff750b"
    success_green:"#04990c"
    badge_red:    "#b42318"
    green_emerald:"#10b981"
    green_light:  "#6ee7b7"
```

### CSS Custom Properties

```css
:root {
  /* Navy */
  --clr-navy-base:     #1c3466;
  --clr-navy-dark:     #003678;
  --clr-navy-darker:   #182b58;
  --clr-navy-ink:      #1E376C;
  --clr-navy-deep:     #00075D;
  --clr-navy-ultradeep:#01164a;

  /* Orange */
  --clr-orange-cta:    #ff6f08;
  --clr-orange-label:  #ff8400;
  --clr-orange-warm:   #fbb515;

  /* Gold */
  --clr-gold-base:     #ffb700;
  --clr-gold-warm:     #f2af00;
  --clr-gold-bright:   #fafe00;
  --clr-gold-light:    #ffc72c;
  --clr-gold-button:   #fff200;

  /* Blue */
  --clr-blue-meta:     #3868cc;
  --clr-blue-aws:      #006AFF;
  --clr-blue-deep:     #1500FF;
  --clr-blue-light:    #2563eb;
  --clr-blue-sky:      #60b8e4;
  --clr-blue-midsky:   #6cabdd;
  --clr-blue-softsky:  #b9d2df;
  --clr-blue-pagebg:   #e0f1fd;

  /* Neutrals */
  --clr-white:         #ffffff;
  --clr-offwhite:      #f5f5f5;
  --clr-lightgray:     #e8e8e8;
  --clr-darkgray:      #333333;
  --clr-text-primary:  #111111;

  /* Glass */
  --glass-bg:          rgba(237, 244, 255, 0.74);
  --glass-bg-soft:     rgba(237, 244, 255, 0.38);
  --glass-edge:        rgba(255, 255, 255, 0.56);

  /* Semantic */
  --clr-error:         #f93c40;
  --clr-error-border:  #ff750b;
  --clr-success:       #04990c;
}
```

---

## 2. Gradients

### 2.1 Background Gradients

```yaml
gradients:
  background:
    body_about:         "linear-gradient(180deg, #ddf2ff 0%, #aadbff 50%, #98d7ff 100%)"
    body_register:      "linear-gradient(180deg, #f2af00 61.541%, #ff6f08 100%)"
    footer:             "linear-gradient(76.24deg, #1c3466 16.65%, #1c3466 26.31%, #3868cc 88.12%)"
    footer_bottombar:   "linear-gradient(186.43deg, #f2af00 46.54%, #ff6f08 96.04%)"
    vision_mission:     "linear-gradient(176deg, #00aeff, #0244d3)"
    skillbuilder:       "linear-gradient(180deg, #8fbeff 0%, #1a79ff 50%, #040a50 94.71%)"
    offices:            "linear-gradient(180deg, rgba(255,183,0,0.95) 0%, rgba(242,175,0,0.95) 30.29%, rgba(255,111,8,0.95) 78.37%)"
    pda_container:      "linear-gradient(180deg, #ffd500, #ff9100)"
    sponsorship_desktop:"linear-gradient(180deg, #050c09 0%, transparent 15%, transparent 85%, #030806 100%)"
    cloud_expertise:    "linear-gradient(180deg, #13517d 0%, #0f3e5e 32%, #102f25 70%, #0f281e 100%)"
    parallax_wrapper:   "linear-gradient(to bottom, #00075d 0%, #00075d 75%, #0a2f28 100%)"
    members_mobile:     "linear-gradient(180deg, #182b58 33%, #02184b 100%)"
    button_register:    "linear-gradient(180deg, #fff200, #fbb515)"
    button_error:       "linear-gradient(180deg, #f93c40, #932426)"
    button_accent:      "linear-gradient(180deg, #ff8400 0%, #fbb515 100%)"
```

```css
.bg-gradient-body-about {
  background: linear-gradient(180deg, #ddf2ff 0%, #aadbff 50%, #98d7ff 100%);
}
.bg-gradient-footer {
  background: linear-gradient(76.24deg, #1c3466 16.65%, #1c3466 26.31%, #3868cc 88.12%);
}
.bg-gradient-card-vision {
  background: linear-gradient(176deg, #00aeff, #0244d3);
}
.bg-gradient-card-skillbuilder {
  background: linear-gradient(180deg, #8fbeff 0%, #1a79ff 50%, #040a50 94.71%);
}
```

### 2.2 Text Gradients (background-clip: text)

```yaml
gradients:
  text:
    events_title:       "linear-gradient(180deg, #fffde8 0%, #fbb515 54%, #ff8a1d 100%)"
    sponsorship_title:  "linear-gradient(180deg, #ffe38d 0%, #f1a317 100%)"
    sponsor_spotlight:  "linear-gradient(135deg, #ffe082 0%, #ffb300 100%)"
    event_archive_cta:  "linear-gradient(135deg, #ff6f08 0%, #fbb515 100%)"
    hero_subtitle:      "linear-gradient(88.81deg, #00075D 11.56%, #000FC3 88.48%)"
    events_hero_title:  "linear-gradient(180deg, #ffb700 0%, #ff6f08 105%)"
    about_goal_header:  "linear-gradient(to bottom, #4363a6 0%, #1c3466 100%)"
    about_hero_bottom:  "linear-gradient(to top, rgba(255,111,9,1) 0%, rgba(255,183,0,1) 100%)"
    skillbuilder_h1:    "linear-gradient(186.43deg, #f2af00 46.54%, #ff6f08 96.04%)"
    loading_title:      "linear-gradient(180deg, #003678, #0026ff)"
    members_founders:   "linear-gradient(180deg, #ffb700 0%, #ff6f08 100%)"
    members_role:       "linear-gradient(180deg, #0064de, #003678)"
    cta_highlight:      "linear-gradient(90deg, #ff8400, #ffb700)"
    office_title:       "linear-gradient(to right, #24468f 0%, #0a183d 100%)"
```

```css
.gradient-text {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent; /* fallback */
}
```

### 2.3 Conic Gradients (Card Borders)

```yaml
gradients:
  conic:
    card_border: "conic-gradient(from 93deg, #fafe00 3%, #ff6f08 14%, #006aff 31%, #1500ff 42%, #006aff 50%, #1500ff 59%, #006aff 71%, #fafe00 98%)"
    waw_border:  "conic-gradient(from 90deg at 50% 50%, #FAFE00 3%, #FF6F08 14%, #006AFF 31%, #1500FF 42%, #006AFF 50%, #1500FF 59%, #006AFF 71%, #FF6F08 89%, #FAFE00 98%)"
```

### 2.4 Radial Glows

```yaml
gradients:
  radial:
    events_glow:      "radial-gradient(circle at 50% 28%, rgba(179,234,255,0.2) 0%, rgba(179,234,255,0.08) 25%, rgba(179,234,255,0) 54%)"
    sponsorship_glow: "radial-gradient(circle at 50% 18%, rgba(255,228,151,0.28), transparent 28%)"
    goal_container:   "radial-gradient(circle at 10% 10%, #d0f4f0 0%, transparent 50%), radial-gradient(circle at 90% 90%, #9bc5f1 0%, transparent 50%), radial-gradient(circle at 50% 50%, #b2e6d4 0%, transparent 50%), #bce0f4"
```

---

## 3. Typography

### 3.1 Font Families

```yaml
typography:
  families:
    primary:   "'Poppins', sans-serif"
    headings:  "'Montserrat', sans-serif"
    body:      "'Lexend', sans-serif"
    forms:     "'Inter', sans-serif"
```

```css
:root {
  --font-primary:   'Poppins', sans-serif;
  --font-headings:  'Montserrat', sans-serif;
  --font-body:      'Lexend', sans-serif;
  --font-forms:     'Inter', sans-serif;
}
```

**Google Fonts import:**

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Lexend:wght@300;400;500;600;700&family=Inter:wght@400;600;700;900&display=swap');
```

### 3.2 Font Weights

| Font | Weights Used |
|------|-------------|
| Poppins | 200, 300, 400, 500, 600, 700, 800, 900 |
| Montserrat | 400, 500, 600, 700, 800, 900 |
| Lexend | 300, 400, 500, 600, 700 |
| Inter | 400, 600, 700, 900 |

### 3.3 Type Scale

```yaml
typography:
  scale:
    hero_desktop:    { size: 74px,  weight: 900, style: italic, lh: 1.18 }
    hero_mobile:     { size: 52px,  weight: 800, lh: 1.2 }
    hero_subtitle:   { size: 42px,  weight: 300, lh: 63px }
    section_title:   { size: 72-82px, weight: 800-900 }
    event_kicker:    { size: 18px,  weight: 800, lh: 1 }
    about_hero:      { size: 110px, weight: 800, lh: 1 }
    about_desc:      { size: 26px,  weight: 600, lh: 1.4 }
    members_hero:    { size: 61px,  weight: 700, lh: 1 }
    events_hero:     { size: 60px,  weight: 900, lh: 0.85 }
    register_title:  { size: 32px,  weight: 600 }
    dept_label:      { size: 28px,  weight: 900 }
    pills:           { size: 24-28px, weight: 600 }
    loading_title:   { size: 69px,  weight: 900 }
    loading_sub:     { size: 24px,  weight: 200 }
    event_card_title:{ size: 25px,  lh: 1.12 }
    event_card_desc: { size: 14px,  weight: 600, lh: 1.45 }
    footer_brand:    { size: 26px,  weight: 400 }
    footer_nav:      { size: 20px,  weight: 400 }
    chatbot_label:   { size: 13px,  weight: 600 }
```

---

## 4. Conic Gradient Card Border (Implementation)

This technique creates a gradient border that wraps around the card corners using a pseudo-element overlay.

```css
.conic-border-card {
  position: relative;
  border-radius: 20px;
  z-index: 0;
}

.conic-border-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px; /* border thickness */
  background: conic-gradient(
    from 93deg,
    #fafe00 3%,
    #ff6f08 14%,
    #006aff 31%,
    #1500ff 42%,
    #006aff 50%,
    #1500ff 59%,
    #006aff 71%,
    #fafe00 98%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}
```

**How it works:**

1. The `::before` pseudo-element covers the full card area (`inset: 0`)
2. `padding: 2px` on the pseudo creates the visible border thickness
3. The background is set to the conic gradient on the full element
4. **Mask technique:** Two mask layers — one clipped to `content-box` (the inner area), one full. With `mask-composite: exclude`, only the border ring remains visible
5. `pointer-events: none` ensures clicks pass through to the card content
6. `border-radius: inherit` keeps the border matching the card's border-radius

**Alternative (simpler, but `border-image` doesn't support border-radius):**

DO NOT use `border-image` — it ignores `border-radius`. The mask-composite approach above is the required technique.

---

## 5. Glassmorphism

A core visual pattern used across the project.

```css
:root {
  --glass-bg:    rgba(237, 244, 255, 0.74);
  --glass-soft:  rgba(237, 244, 255, 0.38);
  --glass-edge:  rgba(255, 255, 255, 0.56);
  --glass-blur:  12px;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-edge);
  border-radius: 20px;
  box-shadow: 0 28px 90px rgba(0, 38, 87, 0.18);
}
```

**Variations:**

| Property | Value |
|----------|-------|
| Blur strength | `12px` (most common), `8px`, `16px` |
| Background alpha | `0.74` (opaque glass), `0.38` (subtle glass) |
| Edge highlight | `1px solid rgba(255,255,255,0.56)` |
| Inner shadow (inset) | `inset 0 1px 0 rgba(255,255,255,0.4)` |

---

## 6. Shadows

### 6.1 Box Shadows

```yaml
shadows:
  box:
    panel:          "0 28px 90px rgba(0, 38, 87, 0.18)"
    event_card:     "0 24px 54px rgba(1, 11, 9, 0.44)"
    sponsor_card:   "0 24px 48px rgba(1, 12, 10, 0.45)"
    expertise_card: "0 26px 54px rgba(8, 20, 31, 0.45)"
    desc_box:       "0 18px 60px rgba(0, 30, 50, 0.24)"
    register_card:  "0 8px 32px rgba(0, 0, 0, 0.15)"
    chatbot_window: "0 12px 60px rgba(28, 52, 102, 0.15)"
    chatbot_btn:    "0 4px 20px rgba(242, 175, 0, 0.25)"
    search_bar:     "0 4px 4px 0 rgba(0, 0, 0, 0.25)"
    register_btn:   "0 9px 5.15px rgba(0, 0, 0, 0.25)"
    inset_highlight:"inset 0 1px 0 rgba(255, 255, 255, 0.4)"
```

### 6.2 Text Shadows

```yaml
shadows:
  text:
    hero_title:    "14.419px 9.012px 3.605px #031844, 8.11px 3.605px 3.605px #315D8A"
    section_title: "0 14px 28px rgba(3, 19, 15, 0.42)"
    event_kicker:  "0 3px 12px rgba(5, 18, 15, 0.86)"
    about_title:   "0 4px 6px 0 rgba(0, 0, 0, 0.15)"
    members_title: "0 4px 10px rgba(0, 54, 120, 0.5)"
```

---

## 7. Border Radius

```yaml
border_radius:
  circular:      50%
  pill:          999px
  chatbot_btn:   50px
  search_bar:    32.8px
  parallax_panel:31.3px
  about_hero:    30px
  back_button:   25px
  event_detail:  24px
  partner_logo:  22px
  hero_card:     20px
  register_card: 16px
  chatbot_window:16px
  dept_card:     12px
  event_card:    10px
  small:         4px 6px 7px 8px
```

```css
:root {
  --radius-pill:     999px;
  --radius-lg:       24px;
  --radius-card:     20px;
  --radius-md:       16px;
  --radius-sm:       12px;
  --radius-xs:       8px;
  --radius-round:    50%;
}
```

---

## 8. Spacing & Layout

### 8.1 Section Max-Widths

```
1150px, 1260px, 1280px, 1400px, 1560px, 1920px
```

### 8.2 Section Padding

| Context | Horizontal Padding |
|---------|-------------------|
| Desktop sections | 100–140px |
| Mobile sections | 16–22px |
| Footer top | 60px |
| Footer sides | 100px |

### 8.3 Grid Gaps

| Context | Gap |
|---------|-----|
| Events grid | 28px |
| Office grid | 25px |
| Partners grid | 24px |
| Department cards | 16px |

### 8.4 Common Heights / Widths

| Element | Size |
|---------|------|
| Header sidebar | 302px wide |
| Hero button | 280px × 50px |
| Parallax button | 295.7px × 83.58px |
| Members button | 299.83px × 38.98px |
| Footer brand logo | 150px |
| Sponsor logo | 200px |

---

## 9. Animations

### 9.1 Transition Easing Curves

```yaml
easing:
  material_default: "cubic-bezier(0.25, 0.8, 0.25, 1)"
  reveal:           "cubic-bezier(0.25, 1, 0.5, 1)"
  overshoot:        "cubic-bezier(0.34, 1.56, 0.64, 1)"
  smooth_out:       "cubic-bezier(0.2, 0.8, 0.2, 1)"
  card_hover:       "cubic-bezier(0.16, 1, 0.3, 1)"
  future_card:      "cubic-bezier(0.165, 0.84, 0.44, 1)"
```

### 9.2 Transition Durations

```
0.28s  (partner items, event cards)
0.3s   (buttons, general hovers — most common)
0.35s  (expertise cards)
0.4s   (chatbot, future cards)
0.42s  (events carousel)
0.5-0.6s  (queue cards, spotlight cards)
0.8s   (reveal animations)
```

### 9.3 Keyframe Animations

```yaml
keyframes:
  float_up:
    "0%, 100%": { transform: translateY(0) }
    "50%":      { transform: translateY(-15px) }
  mascot_float:
    "0%, 100%": { transform: scaleX(-1) translateY(0) }
    "50%":      { transform: scaleX(-1) translateY(-15px) }
  gentle_bob:
    "0%, 100%": { transform: translateY(0) }
    "50%":      { transform: translateY(-4px) }
  border_glow:
    "0%, 100%": { box-shadow: "0 0 20px rgba(16, 185, 129, 0.4)" }
    "50%":      { box-shadow: "0 0 40px rgba(16, 185, 129, 0.8)" }
  shimmer_sweep:
    "0%":   { transform: translateX(-100%) }
    "100%": { transform: translateX(100%) }
  marquee_scroll:
    "0%":   { transform: translateX(0) }
    "100%": { transform: translateX(-50%) }
  fade_slide_in:
    "0%":   { opacity: 0; transform: translateY(12px) }
    "100%": { opacity: 1; transform: translateY(0) }
  dot_pulse:
    "0%, 100%": { opacity: 0.3; transform: scale(0.8) }
    "50%":      { opacity: 1; transform: scale(1) }
```

**Animation durations:**

| Animation | Duration |
|-----------|----------|
| Chatbot bob, mascot float | 4s |
| Border glow, shimmer | 6s |
| Firefly float | 8s |
| Partner marquee | 36s |

### 9.4 Accessibility


```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 10. Responsive Breakpoints

```yaml
breakpoints:
  mobile:      "max-width: 768px"
  desktop:     "min-width: 769px"
  tablet_ls:   "min-width: 1024px"
  widescreen:  "min-width: 1400px"
```

> Note: The landing page uses **two separate implementations** — a mobile layout (default) and a desktop parallax layout (triggered at 769px+). This is a deliberate architectural choice, not a bug.

---

## 11. Reusable CSS Patterns

### Section Title (Gradient Text)

```css
.section-title {
  font-family: var(--font-headings);
  font-weight: 900;
  background: linear-gradient(180deg, #fffde8 0%, #fbb515 54%, #ff8a1d 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
```

### Glass Card

```css
.glass-card {
  background: rgba(237, 244, 255, 0.74);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.56);
  border-radius: 20px;
  box-shadow: 0 28px 90px rgba(0, 38, 87, 0.18);
}
```

### Gradient Pill

```css
.pill {
  display: inline-block;
  padding: 6px 18px;
  border-radius: 999px;
  font-family: var(--font-forms);
  font-weight: 600;
  background: linear-gradient(180deg, #ff8400 0%, #fbb515 100%);
  color: #ffffff;
}
```

---

## 12. Design Principles (Summary)

1. **Gradient text on every major heading** — gold-to-orange or multi-stop gradients
2. **Glassmorphism panels** — frosted glass with backdrop blur
3. **Conic gradient borders** on feature cards using the mask-composite technique
4. **Dual orange/gold + navy/blue palette** — warm CTAs against cool dark backgrounds
5. **Heavy font weights** — 800/900 for titles, 200/300 for subtitles (extreme contrast)
6. **No build step** — vanilla CSS custom properties, no preprocessor needed
7. **Dark-forest sections** (events, sponsors) contrast with bright sky/ocean sections (hero, about)
8. **Multiple hover effects** with consistent easing and subtle transforms